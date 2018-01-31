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
  isValidCode,
  isEnd,
  isFontable,
  isGroup,
  isList,
  isProp,
  isSystemScope,
  isUserComment,
} from './helpers.js'
import getLoc from './get-loc.js'
import getMeta from './get-meta.js'
import getPropTypes from './get-prop-types.js'
import getTags from './get-tags.js'

export default (rtext, skipComments = true) => {
  // convert crlf to lf
  const text = rtext.replace(/\r\n/g, '\n')
  const fonts = []
  const lines = text.split('\n').map(line => line.trim())
  const props = []
  const stack = []
  const views = []
  const warnings = []
  let lastCapture

  const getChildrenProxyMap = block => {
    const childrenProxyMap = {}

    block.children.forEach((child, i) => {
      let maybeName = child.is || child.name
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
    if (block.properties && (isFontable(block.name) || !block.isBasic)) {
      const fontFamilyProp = block.properties.find(p => p.name === 'fontFamily')

      if (fontFamilyProp) {
        const fontFamily = getMainFont(fontFamilyProp.value)
        const fontWeightProp = block.properties.find(
          p => p.name === 'fontWeight'
        )
        const fontStyleProp = block.properties.find(p => p.name === 'fontStyle')
        const fontWeight = fontWeightProp
          ? fontWeightProp.value.toString()
          : '400'

        const fontStyle = fontStyleProp
          ? fontStyleProp.value.toString()
          : 'normal'

        if (
          !fonts.find(
            font =>
              font.family === fontFamily &&
              font.weight === fontWeight &&
              font.style === fontStyle
          )
        ) {
          fonts.push({
            id: `${fontFamily}-${fontWeight}${
              fontStyle === 'italic' ? '-italic' : ''
            }`,
            family: fontFamily,
            weight: fontWeight,
            style: fontStyle,
          })
        }
      }
    }
  }

  const end = (block, endLine) => {
    block.loc.end = {
      line: endLine,
      column: Math.max(0, lines[endLine].length - 1),
    }

    if (block.isGroup && !block.isBasic) {
      block.childrenProxyMap = getChildrenProxyMap(block)
    }

    if (!block.properties) {
      block.properties = []
    }

    if (stack.length === 0) {
      // if we're the last block on the stack, then this is the view!
      views.push(block)
      return true
    }
    return false
  }

  const parseBlock = (line, i) => {
    const { block: name, is } = getBlock(line)
    let shouldPushToStack = false

    const block = {
      type: 'Block',
      name,
      isBasic: isBasic(name),
      isGroup: false,
      loc: getLoc(i, 0),
      properties: [],
      scopes: [],
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
      if (last.isGroup) {
        if (last.isList) {
          if (block.isBasic) {
            warnings.push({
              loc: block.loc,
              type: `A basic block can't be inside a List.\nPut 1 empty line before.`,
              line,
            })

            shouldPushToStack = true
          } else if (last.children.length > 0) {
            warnings.push({
              loc: block.loc,
              type: `A List can only have one view inside. This block is outside of it.\nPut 1 empty line before.`,
              line,
            })
            shouldPushToStack = true
          } else {
            last.children.push(block)
          }
        } else {
          last.children.push(block)
        }
      } else {
        // the block is inside a block that isn't a group
        end(stack.pop(), i)

        if (views[0].isGroup) {
          warnings.push({
            loc: block.loc,
            type:
              lines[i - 1] === ''
                ? `Put 1 empty line before`
                : `Put 2 empty lines before`,
            line,
          })
        } else {
          warnings.push({
            loc: block.loc,
            type: `Add Vertical at the top`,
            line,
          })
        }
        shouldPushToStack = true
      }
    } else if (views.length > 0) {
      // the block is outside the top level block
      let newLinesBeforePreviousBlock = 1
      while (isEnd(lines[i - newLinesBeforePreviousBlock])) {
        newLinesBeforePreviousBlock++
      }

      const help = []
      if (!views[0].isGroup) {
        help.push(`Add Vertical at the top`)
      }
      if (newLinesBeforePreviousBlock > 2) {
        const linesToRemove = newLinesBeforePreviousBlock - 2
        help.push(
          `remove ${linesToRemove} empty line${
            linesToRemove > 1 ? 's' : ''
          } before`
        )
      }
      warnings.push({
        loc: block.loc,
        type: help.join(', '),
        line,
      })
    }

    if (isGroup(name)) {
      block.isGroup = true
      block.isList = isList(name)
      block.children = []

      shouldPushToStack = true
    }

    if (shouldPushToStack && name === 'FakeProps') {
      warnings.push({
        type:
          'FakeProps needs to be outside of any top block. Add new lines before it.',
        loc: block.loc,
        line,
      })
    }

    if (shouldPushToStack || stack.length === 0) {
      stack.push(block)
    }

    parseProps(i, block)
    lookForFonts(block)
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
    const scopes = []
    let scope
    let inScope = false

    for (let j = i; j <= endOfBlockIndex; j++) {
      const line = lines[j]

      let propNode = null

      if (isProp(line)) {
        const [name, value] = getProp(line)
        const loc = getLoc(j, line.indexOf(name), line.length - 1)
        const tags = getTags(name, value)

        if (tags.code) {
          props.push({ type: block.name, name, value })
        }

        if (
          (tags.code || tags.shouldBeCode) &&
          name !== 'when' &&
          !isValidCode(value)
        ) {
          warnings.push({
            loc,
            type: 'The code you used in the props value is invalid',
            line,
          })
        }

        if (tags.style && tags.code) {
          block.maybeAnimated = true
        }

        if (name === 'when') {
          const isSystem = isSystemScope(value)

          if (value === '') {
            warnings.push({
              loc,
              type: 'This when has no props, add some condition to it',
              line,
            })
          } else if (value === 'props') {
            warnings.push({
              loc,
              type: `You can't use the props shorthand in a when`,
              line,
            })
          } else if (
            !isSystem &&
            !isValidCode(value) &&
            block.name !== 'FakeProps'
          ) {
            warnings.push({
              loc,
              type: 'The code you used in the props value is invalid',
              line,
            })
          }

          tags.scope = value
          inScope = value
          scope = { isSystem, value, properties: [] }
          scopes.push(scope)
        }

        propNode = {
          type: 'Property',
          loc,
          name,
          tags,
          meta: getMeta(value, line, j),
          value: getValue(value),
        }
      } else if (isComment(line) && !skipComments) {
        let [value] = getComment(line)

        const userComment = isUserComment(line)
        if (userComment) {
          value = getComment(value)
        }

        propNode = {
          type: 'Property',
          loc: getLoc(j, 0, line.length - 1),
          value,
          tags: { comment: true, userComment },
        }
      }

      if (propNode) {
        block.loc.end = propNode.loc.end

        if (inScope) {
          if (
            propNode.name !== 'when' &&
            !propNode.tags.comment &&
            !properties.some(baseProp => baseProp.name === propNode.name)
          ) {
            warnings.push({
              loc: propNode.loc,
              type: `You're missing a base prop for ${
                propNode.name
              }. Add it before all whens on the block.`,
              line,
            })
          }

          scope.properties.push(propNode)
        } else {
          properties.push(propNode)
        }
      }
    }

    block.properties = properties
    block.scopes = scopes
  }

  lines.forEach((line, i) => {
    if (isBlock(line)) {
      parseBlock(line, i)
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
    warnings,
  }
}
