import {
  getBlock,
  getFontInfo,
  getProp,
  getSection,
  getTodo,
  getValue,
  isBasic,
  isBlock,
  isCapture,
  isEmptyList,
  isEnd,
  isFontable,
  isGroup,
  isItem,
  isList,
  isProp,
  isSection,
  isTodo,
  stemStylesFromProp,
  warn,
} from './helpers.js'
import getLoc from './get-loc.js'
import getMeta from './get-meta.js'
import getTags from './get-tags.js'

export default text => {
  const fonts = {}
  const lines = text.split('\n')
  const stack = []
  const todos = []
  const views = []
  let lastCapture

  const lookForFonts = block => {
    if (block.properties && (isFontable(block.name.value) || !block.isBasic)) {
      let fontFamily
      let fontWeight

      block.properties.list.forEach(p => {
        if (p.key.value === 'fontFamily') {
          fontFamily = p.value.value
        } else if (p.key.value === 'fontWeight') {
          fontWeight = p.value.value
        }
      })

      if (fontFamily) {
        const info = getFontInfo(fontFamily, fontWeight)

        info.forEach(font => {
          if (!fonts[font.family]) fonts[font.family] = []
          if (!fonts[font.family].includes(font.weight)) {
            fonts[font.family].push(font.weight)
          }
        })
      }
    }
  }

  const end = (block, maybeEndLine) => {
    let endLine = maybeEndLine
    while (lines[endLine] === '' && endLine > 0) {
      endLine--
    }

    const prevLine = lines[endLine - 1]

    block.loc.end = {
      line: endLine,
      column:
        (typeof prevLine === 'string' ? prevLine : lines[endLine]).length - 1,
    }
    // TODO review this
    // if we're past our line, use the previous line's end
    if (block.loc.end.column < 0) {
      block.loc.end = {
        line: endLine - 1,
        column: lines[endLine - 2].length - 1,
      }
    }

    // TODO define end location of blocks inside this
    // block.blocks.forEach(innerBlock => {
    //   innerBlock.loc.end = // ...
    // })
    // end this block's properties if any
    if (block.properties) {
      const last = block.properties.list[block.properties.list.length - 1]
      block.properties.loc.end = last.loc.end

      // look for fonts
      lookForFonts(block)
    }

    if (block.blocks) {
      block.blocks.list.forEach(lookForFonts)
    }

    if (stack.length > 0) {
      // // if there are more blocks, put this block as part of the last block on the stack's block
      // const nextLast = stack[stack.length - 1]
      // if (nextLast !== block && nextLast.blocks) {
      //   nextLast.blocks.list.push(block)
      // }
      return false
    } else {
      // if we're the last block on the stack, then this is the view!
      views.push(block)
      return true
    }
  }

  const parseBlock = (l, i, line, lineIndex) => {
    const { block: name, is } = getBlock(line)
    let shouldPushToStack = false

    const block = {
      type: 'Block',
      name: {
        type: 'Literal',
        value: name,
        loc: getLoc(lineIndex, l.indexOf(line), l.length - 1),
      },
      isBasic: isBasic(name),
      loc: getLoc(lineIndex, l.indexOf(line)),
      parents: stack
        .filter(b => b.type === 'Block')
        .map(b => b.is || b.name.value),
    }
    if (is) {
      block.is = is

      if (isCapture(name)) {
        if (lastCapture) {
          lastCapture.captureNext = is
        }
        lastCapture = block
      }
    }

    const last = stack[stack.length - 1]
    if (last) {
      if (last.blocks) {
        if (isList(last.name.value) && last.blocks.list.length > 0) {
          // the list already has a block
          let topLevelIsGroup = false
          if (stack.length - 2 >= 0) {
            topLevelIsGroup = isGroup(stack[stack.length - 2].name.value)
          } else if (views.length > 0) {
            topLevelIsGroup = !!views[0].blocks
          }

          if (topLevelIsGroup) {
            // tell how we can fix that
            warn(
              lines[i - 1] === ''
                ? `put 1 empty line before`
                : `put 2 empty lines before`,
              block
            )
          } else {
            warn(`add Vertical at the top`, block)
          }
          // shouldPushToStack = true
        }

        last.blocks.list.push(block)
      } else {
        // the block is inside a block that isn't a group
        end(stack.pop(), lineIndex - 1)
        const topLevelIsGroup = !!views[0].blocks

        if (topLevelIsGroup) {
          // tell how we can fix that
          warn(
            lines[i - 1] === ''
              ? `put 1 empty line before`
              : `put 2 empty lines before`,
            block
          )
        } else {
          warn(`add Vertical at the top`, block)
        }
        shouldPushToStack = true
      }
    } else if (views.length > 0) {
      // the block is outside the top level block
      const topLevelIsGroup = !!views[0].blocks
      let newLinesBeforePreviousBlock = 1
      while (isEnd(lines[i - newLinesBeforePreviousBlock])) {
        newLinesBeforePreviousBlock++
      }

      const help = []
      if (!topLevelIsGroup) {
        help.push(`add Vertical at the top`)
      }
      if (newLinesBeforePreviousBlock > 2) {
        const linesToRemove = newLinesBeforePreviousBlock - 2
        help.push(
          `remove ${linesToRemove} empty line${linesToRemove > 1
            ? 's'
            : ''} before`
        )
      }
      warn(help.join(', '), block)
    }

    if (isGroup(name)) {
      block.blocks = {
        type: 'Blocks',
        list: [],
        loc: getLoc(lineIndex + 1, 0),
      }
      shouldPushToStack = true
    }

    if (shouldPushToStack || stack.length === 0) {
      stack.push(block)
    }
  }

  const parseProps = (i, block) => {
    let endOfBlockIndex = i
    while (
      endOfBlockIndex < lines.length - 1 &&
      !isBlock(lines[endOfBlockIndex])
    ) {
      endOfBlockIndex++
    }

    const properties = []
    const nested = []

    for (let j = i; j <= endOfBlockIndex; j++) {
      const l = lines[j]
      const line = l.trim()
      const lineIndex = j + 1

      if (isSection(line)) {
        const prop = getSection(line)

        if (isItem(prop) && nested.length > 0) {
          const item = {
            type: 'ArrayItem',
            value: {
              type: 'ObjectExpression',
              properties: [],
              loc: getLoc(lineIndex + 1, 0),
            },
          }

          const last = nested[nested.length - 1]
          if (last.value.type === 'ObjectExpression') {
            last.value = {
              type: 'ArrayExpression',
              elements: [],
              item: prop,
              loc: last.value.loc,
            }
          }

          last.value.elements.push(item)
        } else {
          nested.push({
            type: 'Property',
            loc: getLoc(lineIndex, l.indexOf(prop), l.length - 1),
            key: {
              type: 'Literal',
              value: prop,
              loc: getLoc(
                lineIndex,
                l.indexOf(prop),
                l.indexOf(prop) + prop.length - 1
              ),
            },
            value: {
              type: 'ObjectExpression',
              properties: [],
              loc: getLoc(lineIndex + 1, 0),
            },
          })
        }
      } else if (isProp(line)) {
        const [propRaw, value] = getProp(line)
        const [prop, stemmedTag] = stemStylesFromProp(propRaw)
        const tags = getTags(prop, value)
        if (stemmedTag) {
          tags.push(stemmedTag)
        }

        let last = properties
        if (nested[nested.length - 1]) {
          const lastValue = nested[nested.length - 1].value

          if (lastValue.type === 'ObjectExpression') {
            last = lastValue.properties
          } else if (lastValue.type === 'ArrayExpression') {
            const lastElement =
              lastValue.elements[lastValue.elements.length - 1]
            if (
              lastElement &&
              lastElement.type === 'ArrayItem' &&
              !isItem(prop)
            ) {
              last = lastElement.value.properties
            } else {
              last = lastValue.elements
            }
          }
        }

        if (isItem(prop)) {
          // TODO FIXME cast last to array
          last.push({
            type: 'ArrayItem',
            value: {
              type: 'Literal',
              value: getValue(value),
              loc: getLoc(
                lineIndex,
                l.indexOf(value),
                l.indexOf(value) + value.length - 1
              ),
            },
          })
        } else {
          const propValue = isEmptyList(value)
            ? {
                type: 'ArrayExpression',
                elements: [],
              }
            : {
                type: 'Literal',
                value: getValue(value),
              }

          propValue.loc = getLoc(
            lineIndex,
            l.indexOf(value),
            l.indexOf(value) + value.length - 1
          )

          last.push({
            type: 'Property',
            loc: getLoc(lineIndex, l.indexOf(propRaw), l.length - 1),
            key: {
              type: 'Literal',
              // TODO should we use propRaw as value here?
              value: prop,
              loc: getLoc(
                lineIndex,
                l.indexOf(propRaw),
                l.indexOf(propRaw) + propRaw.length - 1
              ),
            },
            tags,
            meta: getMeta(value, l, lineIndex),
            value: propValue,
          })
        }
      } else if (isEnd(line)) {
        const prevLine = lines[j - 1]

        // TODO close item
        if (isEnd(prevLine)) {
          if (nested.length > 0) {
            const props = nested.pop()

            let last = properties
            if (nested.length > 0) {
              last = nested[nested.length - 1].value.properties
            }
            // TODO add warning
            if (last) {
              last.push(props)
            }
          }
        }
      }
    }

    const loc = getLoc(i + 1, 0, lines[endOfBlockIndex].length - 1)
    loc.end.line = endOfBlockIndex

    while (nested.length > 0) {
      const props = nested.pop()

      let last = properties
      if (nested.length > 0) {
        last = nested[nested.length - 1].value.properties
      }
      if (last) {
        last.push(props)
      }
    }

    if (properties.length > 0) {
      block.properties = {
        type: 'Properties',
        list: properties,
        loc,
      }
    }
  }

  lines.forEach((l, i) => {
    const line = l.trim()
    const lineIndex = i + 1

    if (isBlock(line)) {
      parseBlock(l, i, line, lineIndex)
    } else if (isProp(line) || isSection(line)) {
      let block = stack[stack.length - 1] || views[views.length - 1]
      // TODO add warning
      if (!block) return
      if (block.blocks && block.blocks.list.length > 0) {
        block = block.blocks.list[block.blocks.list.length - 1]
      }

      if (!block.properties) {
        parseProps(i, block)
      }
    } else if (isTodo(line)) {
      // eslint-disable-next-line
      const [_, to, message] = getTodo(line)

      const todo = {
        type: 'Todo',
        loc: getLoc(lineIndex, l.indexOf('#') + 1, l.length - 1),
        to,
        message: message.trim(),
      }

      todos.push(todo)
    } else if (isEnd(line) && stack.length > 0) {
      const prevLine = lines[i - 1]
      if (isEnd(prevLine)) {
        end(stack.pop(), lineIndex)
      }
    }
  })

  if (stack.length > 0) {
    while (!end(stack.pop(), lines.length)) {}
  }

  return {
    fonts,
    todos,
    views,
  }
}
