import {
  didYouMeanBlock,
  didYouMeanProp,
  getAnimation,
  getBlock,
  getComment,
  getProp,
  getPropType,
  getUnsupportedShorthandExpanded,
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
  isSystemScope,
  isUserComment,
} from './helpers.js'
import getLoc from './get-loc.js'
import getTags from './get-tags.js'

export default (
  { convertSlotToProps = true, skipComments = true, source } = {}
) => {
  // convert crlf to lf
  const text = source.replace(/\r\n/g, '\n')
  const rlines = text.split('\n')
  const lines = rlines.map(line => line.trim())
  const fonts = []
  const stack = []
  const slots = []
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
        const fontFamily = fontFamilyProp.value
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
            id: `${fontFamily}-${fontWeight}${fontStyle === 'italic'
              ? '-italic'
              : ''}`,
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

    if (
      block.name === 'List' &&
      !block.properties.some(prop => prop.name === 'from')
    ) {
      warnings.push({
        loc: block.loc,
        type: `A List needs "from <" to work`,
        line: lines[block.loc.start.line],
      })
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
      isAnimated: false,
      isBasic: isBasic(name),
      isGroup: false,
      loc: getLoc(i, 0),
      properties: [],
      scopes: [],
    }

    if (is && !block.isBasic) {
      const meant = didYouMeanBlock(name)
      if (meant && meant !== name) {
        warnings.push({
          loc: block.loc,
          type: `Did you mean "${meant}" instead of "${name}"?`,
          line,
        })
      }
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
      shouldPushToStack = true
      if (last.isGroup) {
        if (last.isList) {
          if (block.isBasic) {
            warnings.push({
              loc: block.loc,
              type: `A basic block "${block.name}" can't be inside a List. Use a view you made instead.`,
              line,
              blocker: true,
            })
          } else if (last.children.length > 0) {
            warnings.push({
              loc: block.loc,
              type: `A List can only have one view inside. "${block.name}" is outside of it. Put 1 empty line before.`,
              line,
            })
          } else {
            last.children.push(block)
          }
        } else {
          last.children.push(block)
        }
      } else {
        // the block is inside a block that isn't a group
        end(stack.pop(), i)

        if (last.isBasic) {
          warnings.push({
            loc: block.loc,
            type: `An empty line is required after every block. Put 1 empty line before`,
            line,
          })
        } else if (views[0] && views[0].isGroup) {
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
          `remove ${linesToRemove} empty line${linesToRemove > 1
            ? 's'
            : ''} before`
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
    block.animations = []

    for (let j = i; j <= endOfBlockIndex; j++) {
      const line = lines[j]

      let propNode = null

      if (isProp(line)) {
        const { name, isSlot, slotName, slotIsNot, value } = getProp(line)
        const loc = getLoc(j, line.indexOf(name), line.length - 1)
        const tags = getTags({
          name,
          isSlot,
          slotIsNot,
          slotName,
          value,
          block,
        })

        if (block.isBasic) {
          if (tags.unsupportedShorthand) {
            warnings.push({
              loc,
              type: `The shorthand ${name} isn't supported. You need to expand it like:\n${getUnsupportedShorthandExpanded(
                name,
                value
              ).join('\n')}`,
              line,
            })
          } else {
            const meant = didYouMeanProp(name)
            if (meant && meant !== name) {
              warnings.push({
                loc,
                type: `Did you mean "${meant}" instead of "${name}"?`,
                line,
              })
            }
          }
        }

        if (name === 'when') {
          const isSystem = isSystemScope(value)

          if (value === '' || value === '<' || value === '<!') {
            warnings.push({
              loc,
              type:
                'This when has no condition assigned to it. Add one like: when <isCondition',
              line,
            })
          } else if (!isSystem && !tags.validSlot) {
            warnings.push({
              loc,
              type: `The value you used in the slot "${name}" is invalid`,
              line,
            })
          }

          tags.scope = value
          inScope = true
          scope = {
            isSystem,
            value,
            name,
            properties: [],
          }

          if (!isSystem) {
            if (convertSlotToProps) {
              scope.value = `${slotIsNot ? '!' : ''}props.${slotName || name}`
            }
            scope.slotIsNot = slotIsNot
            scope.slotName = slotName
          }
          scopes.push(scope)
        } else if ((tags.slot || tags.shouldBeSlot) && !tags.validSlot) {
          warnings.push({
            loc,
            type: `The value you used in the slot "${name}" is invalid`,
            line,
          })
        }

        if (name === 'onWhen' && properties.length > 0) {
          warnings.push({
            type: `Put onWhen at the top of the block. It's easier to see it that way!`,
            line,
            loc,
          })
        }

        propNode = {
          type: 'Property',
          loc,
          name,
          tags,
          value: getValue(value),
        }

        if (tags.animation) {
          const currentAnimation = getAnimation(value)
          const existingScope =
            block.animations.length > 0 &&
            block.animations.some(animation => {
              return (
                animation.scope === scope.slotName &&
                animation.curve === currentAnimation.properties.curve
              )
            }, currentAnimation)
          propNode.value = currentAnimation.defaultValue
          propNode.animation = currentAnimation.properties
          propNode.scope = scope.slotName
          block.isAnimated = true
          if (!existingScope) {
            block.animations.push({
              ...currentAnimation.properties,
              scope: scope.slotName,
            })
          }
        }

        if (tags.slot) {
          const needsDefaultValue =
            block.isBasic && !tags.shouldBeSlot && /</.test(propNode.value)

          propNode.defaultValue = propNode.value
          propNode.slotName = slotName
          if (convertSlotToProps) {
            propNode.value = `${slotIsNot ? '!' : ''}props.${slotName || name}`
          }

          if (needsDefaultValue) {
            if (name === 'text' && block.name === 'Text') {
              propNode.defaultValue = ''
            } else {
              propNode.defaultValue = false
              warnings.push({
                loc,
                type: `Add a default value to "${name}" like: "${name} <${slotName} default value"`,
                line,
              })
            }
          }

          if (!inScope && !slots.some(vp => vp.name === name)) {
            slots.push({
              name: slotName || name,
              type: getPropType(block, name, value),
              defaultValue:
                tags.shouldBeSlot || !block.isBasic
                  ? false
                  : propNode.defaultValue,
            })
          }
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
              type: `You're missing a base prop for ${propNode.name}. Add it before all whens on the block.`,
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
    if (line !== rlines[i]) {
      warnings.push({
        type: `You have some spaces before or after this line. Clean them up.`,
        loc: {
          start: {
            line: i,
          },
        },
        line: rlines[i],
      })
    }

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
    slots,
    views,
    warnings,
  }
}
