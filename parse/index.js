import {
  getBlock,
  getComment,
  getMainFont,
  getProp,
  getValue,
  isBasic,
  isBlock,
  isCapture,
  isComment,
  isEnd,
  isFontable,
  isGroup,
  isList,
  isProp,
  isUserComment,
  stemStylesFromProp,
  warn,
} from './helpers.js'
import getLoc from './get-loc.js'
import getMeta from './get-meta.js'
import getPropTypes from './get-prop-types.js'
import getTags from './get-tags.js'

export default (rtext, skipComments = true) => {
  // convert crlf to lf
  const text = rtext.replace(/\r\n/g, '\n')
  const fonts = {}
  const lines = text.split('\n').map(line => line.trim())
  const props = []
  const stack = []
  const views = []
  let lastCapture

  const getChildrenProxyMap = block => {
    const childrenProxyMap = {}

    block.blocks.list.forEach((child, i) => {
      let maybeName = child.is || child.name.value
      let name = maybeName
      let next = 1
      while (name in childrenProxyMap) {
        name = `${maybeName}${next}`
        next++
      }
      childrenProxyMap[name] = i
    })

    return Object.keys(childrenProxyMap).length === 0 ? null : childrenProxyMap
  }

  const lookForFonts = block => {
    if (block.properties && (isFontable(block.name.value) || !block.isBasic)) {
      const fontFamilyProp = block.properties.list.find(
        p => p.key && p.key.value === 'fontFamily'
      )

      if (fontFamilyProp) {
        const fontFamily = getMainFont(fontFamilyProp.value.value)
        const fontWeightProp = block.properties.list.find(
          p => p.key && p.key.value === 'fontWeight'
        )
        const fontWeight = fontWeightProp
          ? fontWeightProp.value.value.toString()
          : '400'

        if (!fonts[fontFamily]) fonts[fontFamily] = []
        if (!fonts[fontFamily].includes(fontWeight)) {
          fonts[fontFamily].push(fontWeight)
        }
      }
    }
  }

  const end = (block, endLine) => {
    block.loc.end = {
      line: endLine,
      column: Math.max(0, lines[endLine].length - 1),
    }

    if (block.properties) {
      const last = block.properties.list[block.properties.list.length - 1]
      block.properties.loc.end = last.loc.end
    }

    if (block.blocks) {
      const last = block.blocks.list[block.blocks.list.length - 1]
      block.blocks.loc.end = last ? last.loc.end : block.loc.end

      if (!block.isBasic) {
        block.childrenProxyMap = getChildrenProxyMap(block)
      }
    }

    if (stack.length > 0) {
      return false
    } else {
      // if we're the last block on the stack, then this is the view!
      views.push(block)
      return true
    }
  }

  const parseBlock = (line, i) => {
    const { block: name, is } = getBlock(line)
    let shouldPushToStack = false

    const block = {
      type: 'Block',
      name: {
        type: 'Literal',
        value: name,
        loc: getLoc(i, 0, line.length - 1),
      },
      isBasic: isBasic(name),
      loc: getLoc(i, 0),
      parents: stack
        .filter(b => b.type === 'Block')
        .map(b => b.is || b.name.value),
      scoped: {},
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
        end(stack.pop(), i)
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
          `remove ${linesToRemove} empty line${
            linesToRemove > 1 ? 's' : ''
          } before`
        )
      }
      warn(help.join(', '), block)
    }

    if (isGroup(name)) {
      block.blocks = {
        type: 'Blocks',
        list: [],
        loc: getLoc(i + 1, 0),
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
      !isBlock(lines[endOfBlockIndex + 1])
    ) {
      endOfBlockIndex++
    }

    const properties = []
    const nested = []

    let inScope = false

    for (let j = i; j <= endOfBlockIndex; j++) {
      const line = lines[j]

      if (isProp(line)) {
        const [propRaw, value] = getProp(line)
        const [prop, stemmedTag] = stemStylesFromProp(block, propRaw)
        const tags = getTags(prop, value)
        if (stemmedTag) {
          tags[stemmedTag] = true
        }

        if (tags.code) {
          props.push({ type: block.name.value, prop, value })
        }

        if (tags.style && tags.code) {
          block.maybeAnimated = true
        }

        if (tags.scope) {
          inScope = tags.scope
        } else if (inScope) {
          if (!block.scoped[prop]) block.scoped[prop] = {}
          block.scoped[prop][inScope] = properties.length
        }

        properties.push({
          type: 'Property',
          loc: getLoc(j, line.indexOf(propRaw), line.length - 1),
          key: {
            type: 'Literal',
            // TODO should we use propRaw as value here?
            value: prop,
            valueRaw: propRaw,
            loc: getLoc(
              j,
              line.indexOf(propRaw),
              line.indexOf(propRaw) + propRaw.length - 1
            ),
          },
          inScope,
          tags,
          meta: getMeta(value, line, j),
          value: {
            loc: getLoc(
              j,
              line.indexOf(value),
              line.indexOf(value) + value.length - 1
            ),
            type: 'Literal',
            value: getValue(value),
          },
        })
      } else if (isEnd(line)) {
        const prevLine = lines[j - 1]

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
      } else if (isComment(line) && !skipComments) {
        let [value] = getComment(line)

        const userComment = isUserComment(line)
        if (userComment) {
          value = getComment(value)
        }

        properties.push({
          type: 'Property',
          loc: getLoc(j, 0, line.length - 1),
          value: {
            type: 'Literal',
            value,
            loc: getLoc(j, line.indexOf(value), line.length - 1),
          },
          tags: { comment: true, userComment },
        })
      }
    }

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
      const start = properties[0].loc.start
      const end = properties[properties.length - 1].loc.end

      block.properties = {
        type: 'Properties',
        list: properties,
        loc: {
          start,
          end,
        },
      }
    }
  }

  lines.forEach((line, i) => {
    if (isBlock(line)) {
      parseBlock(line, i)
    } else if (isProp(line) || isComment(line)) {
      let block = stack[stack.length - 1] || views[views.length - 1]
      // TODO add warning
      if (!block) return
      if (block.blocks && block.blocks.list.length > 0) {
        block = block.blocks.list[block.blocks.list.length - 1]
      }

      if (!block.properties) {
        parseProps(i, block)
        if (block.properties) {
          block.loc.end = block.properties.loc.end
        }
        lookForFonts(block)
      }
    } else if (isEnd(line) && stack.length > 0) {
      end(stack.pop(), i)
    }
  })

  if (stack.length > 0) {
    while (!end(stack.pop(), lines.length - 1)) {}
  }

  return {
    fonts,
    props: getPropTypes(props),
    views,
  }
}
