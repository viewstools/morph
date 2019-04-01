import {
  CAPTURE_TYPES,
  didYouMeanBlock,
  didYouMeanProp,
  getAnimation,
  getBlock,
  getComment,
  getFormat,
  getProp,
  getPropType,
  getUnsupportedShorthandExpanded,
  getValue,
  isBasic,
  isBlock,
  isCapture,
  isColumn,
  isComment,
  isEnd,
  isFontable,
  isGroup,
  isList,
  isProp,
  isTable,
  isLocalScope,
  isSystemScope,
  isUserComment,
} from './helpers.js'
import getLoc from './get-loc.js'
import getTags from './get-tags.js'

export default ({
  convertSlotToProps = true,
  enableLocalScopes = true,
  enableSystemScopes = true,
  skipComments = true,
  skipInvalidProps = true,
  source,
} = {}) => {
  // convert crlf to lf
  const text = source.replace(/\r\n/g, '\n')
  const rlines = text.split('\n')
  const lines = rlines.map(line => line.trimRight())
  const fonts = []
  const locals = []
  const stack = []
  const slots = []
  const views = []
  const warnings = []

  const blockIds = []
  const getBlockId = node => {
    let maybeId = node.is || node.name

    if (!blockIds.includes(maybeId)) {
      blockIds.push(maybeId)
      return maybeId
    }

    let index = 1
    while (blockIds.includes(`${maybeId}${index}`)) {
      index++
    }
    const id = `${maybeId}${index}`
    blockIds.push(id)
    return id
  }

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

  const lookForMultiples = block => {
    const names = block.properties.map(prop => prop.name)

    const occurences = names.reduce((prev, cur) => {
      prev[cur] = (prev[cur] || 0) + 1
      return prev
    }, {})

    const multiples = Object.entries(occurences).filter(
      ([key, value]) => value > 1
    )

    if (multiples.length > 0) {
      multiples.forEach(mulitple =>
        warnings.push({
          loc: block.loc,
          type: `You have declared a value for ${mulitple[0]} ${
            mulitple[1]
          } times. Only the last value will be used. You may want to delete the ones you don't use.`,
          line: lines[block.loc.start.line - 1],
        })
      )
    }
  }

  const end = (block, endLine) => {
    block.loc.end = {
      line: endLine + 1,
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
        line: lines[block.loc.start.line - 1],
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
    let { block: name, is, level } = getBlock(line)
    let shouldPushToStack = false

    const block = {
      type: 'Block',
      name,
      animations: {},
      isAnimated: false,
      isBasic: isBasic(name),
      isCapture: isCapture(name),
      isColumn: isColumn(name),
      isGroup: false,
      level,
      loc: getLoc(i + 1, 0),
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
    }
    block.id = getBlockId(block)

    let last = stack[stack.length - 1]
    while (last && last.level >= block.level) {
      end(stack.pop(), i)
      last = stack[stack.length - 1]
    }

    if (last) {
      shouldPushToStack = true

      if (last.isGroup) {
        if (last.isList) {
          if (block.isBasic) {
            warnings.push({
              loc: block.loc,
              type: `A basic block "${
                block.name
              }" can't be inside a List. Use a view you made instead.`,
              line,
              blocker: true,
            })
          } else if (last.children.length > 0) {
            warnings.push({
              loc: block.loc,
              type: `A List can only have one view inside. "${
                block.name
              }" is outside of it. Put 1 empty line before.`,
              line,
            })
          } else {
            last.children.push(block)
          }
        } else if (block.isColumn && !last.isTable) {
          warnings.push({
            loc: block.loc,
            type: `Only tables can contain columns. Put this column directly inside a table.`,
            line,
          })
        } else {
          last.children.push(block)
        }
      } else {
        end(stack.pop(), i)

        // inside a block that isn't a group
        if (last.isBasic) {
          warnings.push({
            loc: block.loc,
            type: `${block.is || block.name} is inside a block ${last.is ||
              last.name} but ${
              last.name
            } isn't a container and can't have blocks inside of it.\nIndent it one level less.`,
            line,
          })
        } else {
          warnings.push({
            loc: block.loc,
            type: `${block.is ||
              block.name} is inside a view. While that's allowed for now, it may break in the future. Ideally, you'd refactor it into its specific own view.`,
            line,
          })
        }
      }
    } else if (views.length > 0) {
      warnings.push({
        loc: block.loc,
        type: `${block.is ||
          block.name} is outside of the top block and it won't render.\nTo fix it, either:\na) add a Vertical at the top and indent all the code inside of it, or\nb) remove it.`,
        line,
      })
    }

    if (isGroup(name)) {
      block.isGroup = true
      block.isList = isList(name)
      block.isTable = isTable(name)
      block.children = []
    }

    if (shouldPushToStack || stack.length === 0) {
      stack.push(block)
    }

    parseProps(i, block, last)
    lookForFonts(block)
    lookForMultiples(block)
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
      const line = lines[j].trim()

      let propNode = null

      if (isProp(line)) {
        let { name, isSlot, slotName, slotIsNot, value } = getProp(line)
        const loc = getLoc(j + 1, line.indexOf(name), line.length - 1)
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

          if (tags.fragment && block.isGroup) {
            if (isSlot) {
              warnings.push({
                loc,
                type: `The isFragment prop can't be a slot. You need to change it to isFragment true. Treating it as true for now.`,
                line,
              })
            }
            block.isFragment = true
          }

          if (block.type === 'Capture' && !CAPTURE_TYPES.includes(value)) {
            if (/textarea/i.test(value)) {
              warnings.push({
                loc,
                type: `Invalid type ${value} for Capture. Perhaps you want to use a CaptureTextArea block instead? Using type text as a default.`,
                line,
              })
            } else {
              warnings.push({
                loc,
                type: `Invalid type ${value} for Capture. You can use ${CAPTURE_TYPES.join(
                  ', '
                )}. Using type text as a default.`,
                line,
              })
            }
            value = 'text'
          }
        } else {
          if (name === 'lazy') {
            block.isLazy = true
          }
        }

        if (name === 'when') {
          const isSystem = enableSystemScopes && isSystemScope(slotName)
          const isLocal = enableLocalScopes && isLocalScope(slotName)

          if (isLocal) {
            if (!locals.includes(value)) {
              locals.push(slotName)
            }
          }

          if (value === '' || value === '<' || value === '<!') {
            warnings.push({
              loc,
              type:
                'This when has no condition assigned to it. Add one like: "when <isCondition"',
              line,
            })
            if (skipInvalidProps) continue
          } else if (!tags.validSlot) {
            warnings.push({
              loc,
              type: `The slot name "${name}" isn't valid. Fix it like: "when <isCondition" `,
              line,
            })
            if (skipInvalidProps) continue
          }

          if (isSystem && slotIsNot) {
            warnings.push({
              loc,
              type: `"${slotName}" is a system slot and it can't take a "!" in its value. Replace the line for: "when <${slotName}".`,
            })
          }

          // TODO warning
          // if (isLocal && (name !== 'text' || name !== 'placeholder')) {
          // }

          tags.scope = value
          inScope = true
          scope = {
            isLocal,
            isSystem,
            value,
            name,
            slotName,
            slotIsNot: isSystem || isLocal ? false : slotIsNot,
            properties: [],
          }

          if (convertSlotToProps) {
            scope.value =
              isSystem || isLocal
                ? slotName
                : `${slotIsNot ? '!' : ''}props.${slotName || name}`
          }

          scopes.push(scope)
        } else if ((tags.slot || tags.shouldBeSlot) && !tags.validSlot) {
          if ((name === 'from' && block.name === 'List') || name !== 'from') {
            warnings.push({
              loc,
              type: `The value you used in the slot "${name}" is invalid`,
              line,
            })
            if (skipInvalidProps) continue
          }
        }

        if (name === 'onWhen' && properties.length > 0) {
          warnings.push({
            type: `Put onWhen at the top of the block. It's easier to see it that way!`,
            line,
            loc,
          })
        }

        if (name === 'format') {
          block.format = getFormat(value)
        }

        if (value === '' && name !== 'text') {
          warnings.push({
            loc,
            type: `"${name}" has no value. Please give it a value.`,
            line,
          })
          if (skipInvalidProps) continue
        }

        propNode = {
          type: 'Property',
          loc,
          name,
          tags,
          value: getValue(value, name),
        }

        if (tags.animation && scope) {
          block.isAnimated = true

          const currentAnimation = getAnimation(value)
          propNode.value = currentAnimation.defaultValue
          propNode.animation = currentAnimation.properties

          if (propNode.animation.curve === 'spring') {
            block.hasSpringAnimation = true
          } else {
            block.hasTimingAnimation = true
          }

          if (!block.animations[currentAnimation.id]) {
            block.animations[currentAnimation.id] = {
              index: Object.keys(block.animations).length,
              animation: currentAnimation,
              props: {},
            }
          }
          propNode.animationIndexOnBlock =
            block.animations[currentAnimation.id].index

          if (!block.animations[currentAnimation.id].props[name]) {
            let baseValue = null
            const baseProp = properties.find(prop => prop.name === name)
            if (baseProp) {
              baseValue = baseProp.value
            }

            block.animations[currentAnimation.id].props[name] = {
              name,
              scopes: [],
              value: baseValue,
            }
          }

          block.animations[currentAnimation.id].props[name].scopes.push({
            name: scope.slotName,
            value: currentAnimation.defaultValue,
          })
        }

        if (scope) {
          propNode.scope = scope.slotName
        }

        if (tags.slot) {
          const needsDefaultValue =
            !tags.shouldBeSlot && /</.test(propNode.value)

          if (typeof propNode.value === 'string') {
            propNode.value = propNode.value.replace(/^</, '')
          }

          propNode.slotName = slotName

          if (name !== 'when' || (name === 'when' && !scope.isSystem)) {
            propNode.defaultValue = propNode.value

            if (convertSlotToProps) {
              propNode.value = `${slotIsNot ? '!' : ''}props.${slotName ||
                name}`
            }

            if (needsDefaultValue) {
              if (name === 'text' && block.name === 'Text') {
                propNode.defaultValue = ''
              } else {
                propNode.defaultValue = false

                if (block.isBasic) {
                  warnings.push({
                    loc,
                    type: `Add a default value to "${name}" like: "${name} <${slotName} default value"`,
                    line,
                  })
                }
              }
            }

            if (
              !inScope &&
              !propNode.tags.fragment &&
              !slots.some(vp => vp.name === (slotName || name))
            ) {
              slots.push({
                name: slotName || name,
                type: getPropType(block, name, value),
                defaultValue: tags.shouldBeSlot ? false : propNode.defaultValue,
              })
            }
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
          loc: getLoc(j + 1, 0, line.length - 1),
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

    if (block.isFragment) {
      let invalidProps = properties
        .filter(prop => prop.name !== 'isFragment' || prop.name !== 'onWhen')
        .map(prop => prop.name)

      if (invalidProps.length > 0) {
        warnings.push({
          type: `A fragment can only have isFragment and onWhen props.\nEvery other prop will be dismissed.\nEither remove ${invalidProps.join(
            ', '
          )} or remove isFragment.`,
          loc: block.loc,
          line: rlines[i],
        })
      }
    }
  }

  lines.forEach((line, i) => {
    if (line !== rlines[i].trimRight()) {
      warnings.push({
        type: `You have some spaces before or after this line. Clean them up.`,
        loc: {
          start: {
            line: i + 1,
          },
        },
        line: rlines[i],
      })
    }

    if (isBlock(line)) {
      parseBlock(line, i)
    }
  })

  if (stack.length > 0) {
    while (!end(stack.pop(), lines.length - 1)) {}
  }

  // if (source.startsWith('Action Vertical')) {
  //   console.log('ACTION VERTICAL ->>>>>')
  // console.log(JSON.stringify(views, null, '  '))
  // }

  return {
    fonts,
    locals,
    slots,
    views,
    warnings,
  }
}
