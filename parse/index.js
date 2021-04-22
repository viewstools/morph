import {
  CAPTURE_TYPES,
  // makeDidYouMeanBlock,
  // didYouMeanProp,
  getAnimation,
  getBlock,
  getComment,
  getData,
  getDataFormat,
  getDataValidate,
  getProp,
  getPropType,
  getUnsupportedShorthandExpanded,
  getValue,
  isBasic,
  isBlock,
  isCapture,
  isColumn,
  isComment,
  isFontable,
  isGroup,
  isList,
  isProp,
  isTable,
  isSystemScope,
  isUserComment,
  // makeDidYouMeanFontFamily,
  sortScopes,
} from './helpers.js'
import { isGoogleFont } from '../morph/fonts.js'
import getLoc from './get-loc.js'
import getTags from './get-tags.js'
import path from 'path'

export default ({
  convertSlotToProps = true,
  customFonts,
  enableSystemScopes = true,
  file,
  id,
  skipComments = true,
  skipInvalidProps = true,
  warnMissingDefaultValue = false,
  source,
  src,
  views,
}) => {
  // convert crlf to lf
  let text = source.replace(/\r\n/g, '\n')
  let rlines = text.split('\n')
  let lines = rlines.map((line) => line.trimRight())
  let ignoreIndex = lines.findIndex((line) => /# ignore/.test(line))
  if (ignoreIndex !== -1) {
    lines = lines.slice(0, ignoreIndex)
  }
  let fonts = []
  let isDefiningChildrenExplicitly = false
  let stack = []
  let slots = []
  let useIsBefore = false
  let useIsMedia = false
  let topBlockShouldBe = file.endsWith('.view') ? 'View' : 'Block'
  let view = null
  let viewsInView = new Set()
  let warnings = []

  // TODO revisit at a later stage, it was making longer files super slow to
  // parse so we're removing it for now
  // let didYouMeanBlock = makeDidYouMeanBlock([...views.keys()])
  // let didYouMeanFontFamily = makeDidYouMeanFontFamily(
  //   [...customFonts.keys()].map((id) => id.split('-')[0])
  // )

  let blockIds = []
  function getBlockId(node) {
    let maybeId = node.is || node.name

    if (!blockIds.includes(maybeId)) {
      blockIds.push(maybeId)
      return maybeId
    }

    let index = 1
    while (blockIds.includes(`${maybeId}${index}`)) {
      index++
    }
    let id = `${maybeId}${index}`
    blockIds.push(id)
    return id
  }

  function lookForFonts(block) {
    if (block.properties && (isFontable(block.name) || !block.isBasic)) {
      let fontFamilyProp = block.properties.find((p) => p.name === 'fontFamily')
      if (!fontFamilyProp) return

      let family = fontFamilyProp.value

      let fontWeightProp = block.properties.find((p) => p.name === 'fontWeight')
      let weight = fontWeightProp ? fontWeightProp.value.toString() : '400'

      let fontStyleProp = block.properties.find((p) => p.name === 'fontStyle')
      let style = fontStyleProp ? fontStyleProp.value.toString() : 'normal'

      if (
        !fonts.find(
          (font) =>
            font.family === family &&
            font.weight === weight &&
            font.style === style
        )
      ) {
        let font = {
          id: `${family}-${weight}${style === 'italic' ? '-italic' : ''}`,
          isGoogleFont: isGoogleFont(family),
          family,
          weight,
          style,
        }

        if (font.isGoogleFont || customFonts.has(font.id)) {
          fonts.push(font)

          // TODO revisit at a later stage, it was making longer files super slow to
          // parse so we're removing it for now
          // } else {
          //   let meant = didYouMeanFontFamily(family)
          //   if (meant && meant !== family) {
          //     warnings.push({
          //       loc: fontFamilyProp.loc,
          //       type: `The font "${family}" is missing. Did you mean "${meant}" instead?\nIf not, download the font files (eg, "${font.id}.woff2", "${font.id}.woff", "${font.id}.ttf", etc) and add the to the "Fonts" folder.`,
          //       line: lines[fontFamilyProp.loc.start.line - 1],
          //     })
          //   } else if (!font.weight.startsWith('props.')) {
          //     warnings.push({
          //       loc: fontFamilyProp.loc,
          //       type: `The font "${family}" is missing.\nDownload the font files (eg, "${font.id}.woff2", "${font.id}.woff", "${font.id}.ttf", etc) and add the to the "Fonts" folder.`,
          //       line: lines[fontFamilyProp.loc.start.line - 1],
          //     })
          //   }
        }
      }
    }
  }

  function lookForMultiples(block) {
    let freq = {}
    block.properties.forEach((prop) => {
      if (!(prop.name in freq)) {
        freq[prop.name] = 0
      }
      freq[prop.name]++
    })

    let multiples = Object.keys(freq).filter((name) => freq[name] > 1)

    if (multiples.length > 0) {
      multiples.forEach((name) =>
        warnings.push({
          loc: block.loc,
          type: `You have declared a value for ${name} ${freq[name]} times. Only the last value will be used. Delete the ones you don't use.`,
          line: lines[block.loc.start.line - 1],
        })
      )
    }
  }

  function end(block, endLine) {
    block.loc.end = {
      line: endLine + 1,
      column: Math.max(0, lines[endLine].length - 1),
    }

    if (!block.properties) {
      block.properties = []
    }

    if (
      block.name === 'List' &&
      !block.properties.some((prop) => prop.name === 'from')
    ) {
      warnings.push({
        loc: block.loc,
        type: `A List needs "from <" to work`,
        line: lines[block.loc.start.line - 1],
      })
    }

    if (stack.length === 0) {
      // if we're the last block on the stack, then this is the view!
      view = block
      return true
    }
    return false
  }

  function parseBlock(line, i) {
    let { block: name, is, level } = getBlock(line)
    let shouldPushToStack = false

    let isChildren = name === 'Children'
    if (isChildren) {
      isDefiningChildrenExplicitly = true
    }

    let block = {
      type: 'Block',
      name,
      animations: {},
      slots: [],
      isView: false,
      isAnimated: false,
      isBasic: isBasic(name),
      isCapture: isCapture(name),
      isColumn: isColumn(name),
      isGroup: false,
      isChildren,
      level,
      loc: getLoc(i + 1, 0),
      properties: [],
      scopes: [],
    }

    // TODO revisit at a later stage, it was making longer files super slow to
    // parse so we're removing it for now
    // let meant = didYouMeanBlock(name)
    // if (meant) {
    //   if (meant !== name) {
    //     warnings.push({
    //       loc: block.loc,
    //       type: `"${name}" doesn't exist and won't be morphed. Did you mean "${meant}" instead of "${name}"?`,
    //       line,
    //     })
    //     block.skip = true
    //   }
    // } else {
    //   warnings.push({
    //     loc: block.loc,
    //     type: `"${name}" doesn't exist and won't be morphed.\nCreate the view or rename the block to point to the right view.`,
    //     line,
    //   })
    //   block.skip = true
    // }

    if (!block.isBasic) {
      viewsInView.add(block.name)
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
            type: `${block.is || block.name} is inside a block ${
              last.is || last.name
            } but ${
              last.name
            } isn't a container and can't have blocks inside of it.\nIndent it one level less.`,
            line,
          })
        } else {
          warnings.push({
            loc: block.loc,
            type: `${
              block.is || block.name
            } is inside a view. While that's allowed for now, it may break in the future. Ideally, you'd refactor it into its specific own view.`,
            line,
          })
        }
      }
    } else if (view !== null) {
      warnings.push({
        loc: block.loc,
        type: `${
          block.is || block.name
        } is outside of the top block and it won't render. Views relies on indentation to nest child views within ${topBlockShouldBe} blocks\nTo fix it, either:\na) Indent ${
          block.is || block.name
        } within the top block and indent all nested views within ${
          block.is || block.name
        }, or\nb) remove it.`,
        line,
      })
    }

    if (isGroup(name)) {
      block.isGroup = true
      block.isList = isList(name)
      block.isTable = isTable(name)
      block.children = []
    }

    if (block.isBasic && (block.name === 'View' || block.name === 'Block')) {
      block.isFragment = true
      if (stack.length > 0) {
        warnings.push({
          type: `A view can only have one ${block.name} block. Maybe you want to split this block into another view?`,
          line,
          loc: block.loc,
        })
      }
    } else if (stack.length === 0) {
      warnings.push({
        type: `A view must start with a ${topBlockShouldBe} block. ${block.name} isn't valid.\nWrap everything within a ${topBlockShouldBe} block at the top.`,
        line,
        loc: block.loc,
      })
    }

    if (shouldPushToStack || stack.length === 0) {
      stack.push(block)
    }

    parseProps(i, block)
    lookForFonts(block)
    lookForMultiples(block)

    let data = []
    let index = 0
    while (index < block.properties.length) {
      let p = block.properties[index]
      if (p.name === 'data') {
        let currentData = getData(p)
        currentData.loc = p.loc
        data.push(currentData)

        do {
          index++
          if (index === block.properties.length) {
            break
          }

          p = block.properties[index]
          if (p.name === 'format') {
            currentData.format = getDataFormat(p)
          } else if (p.name === 'formatOut') {
            currentData.format.formatOut = p.value
          } else if (p.name === 'validate') {
            currentData.validate = getDataValidate(p)
          } else if (p.name === 'required') {
            currentData.validate.required = p.value
          }
        } while (
          index < block.properties.length &&
          ['format', 'formatOut', 'validate', 'required'].includes(p.name)
        )
      } else {
        index++
      }
    }

    block.data = data

    if (block.data.length > 0) {
      block.slots = block.slots.filter((item) => item.name !== 'value')
    }
    slots = [...slots, ...block.slots]
    delete block.slots

    let flowProp = block.properties.find((p) => p.name === 'is')
    if (flowProp) {
      block.isView = true
      block.flow = flowProp.value
      block.viewPath = path.dirname(file.replace(src.replace(/\\/g, '/'), ''))
      block.viewPathParent = path.dirname(block.viewPath)

      slots.push({
        name: 'viewPath',
        type: 'string',
        defaultValue: block.viewPath,
      })
    }
  }

  function parseProps(i, block) {
    let endOfBlockIndex = i
    while (
      endOfBlockIndex < lines.length - 1 &&
      !isBlock(lines[endOfBlockIndex + 1])
    ) {
      endOfBlockIndex++
    }

    let properties = []
    let scopes = []
    let scope
    let inScope = false

    for (let j = i; j <= endOfBlockIndex; j++) {
      let line = lines[j].trim()

      let propNode = null

      if (isProp(line)) {
        let { name, isSlot, slotName, slotIsNot, value } = getProp(line)
        let loc = getLoc(j + 1, line.indexOf(name), line.length - 1)

        let tags = getTags({
          name,
          isSlot,
          slotIsNot,
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

            // TODO revisit at a later stage, it was making longer files super slow to
            // parse so we're removing it for now
            // } else {
            //   let meant = didYouMeanProp(name)
            //   if (meant && meant !== name) {
            //     warnings.push({
            //       loc,
            //       type: `Did you mean "${meant}" instead of "${name}"?`,
            //       line,
            //     })
            //   }
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
          let isSystem = enableSystemScopes && isSystemScope(slotName)

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

          tags.scope = value
          inScope = true
          scope = {
            isSystem,
            defaultValue: getValue(value, name),
            value,
            name,
            slotName,
            slotIsNot: isSystem ? false : slotIsNot,
            properties: [],
          }

          if (convertSlotToProps) {
            scope.value = slotName

            if (slotName === 'isBefore') {
              useIsBefore = true
            } else if (/!?isMedia.+/.test(slotName)) {
              scope.value = `isMedia.${slotName
                .replace('isMedia', '')
                .toLowerCase()}`
              useIsMedia = true
            } else if (!isSystem) {
              scope.value = `${slotIsNot ? '!' : ''}props.${slotName || name}`
            }
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

        if (name === 'onWhen' && /!?isMedia.+/.test(slotName)) {
          useIsMedia = true
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

          let currentAnimation = getAnimation(value)
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
              block,
              animation: currentAnimation,
              props: {},
            }
          }
          propNode.animationIndexOnBlock =
            block.animations[currentAnimation.id].index

          if (!block.animations[currentAnimation.id].props[name]) {
            let baseValue = null
            let baseProp = properties.find((prop) => prop.name === name)
            if (baseProp) {
              baseValue = baseProp.value
            }

            block.animations[currentAnimation.id].props[name] = {
              name,
              propNode,
              scopes: [],
              value: baseValue,
            }
          }

          block.animations[currentAnimation.id].props[name].scopes.push({
            name: scope.value,
            value: currentAnimation.defaultValue,
            defaultValue: scope.defaultValue,
          })
        }

        if (scope) {
          propNode.scope = scope.slotName
        }

        if (tags.slot) {
          let needsDefaultValue = !tags.shouldBeSlot && /</.test(propNode.value)

          if (typeof propNode.value === 'string') {
            propNode.value = propNode.value.replace(/^</, '')
          }

          propNode.slotName = slotName

          // if (name !== 'when' || (name === 'when' && !scope.isSystem)) {
          propNode.defaultValue = propNode.value

          if (convertSlotToProps) {
            propNode.value = `${slotIsNot ? '!' : ''}props.${slotName || name}`
          }

          if (needsDefaultValue) {
            if (name === 'text' && block.name === 'Text') {
              propNode.defaultValue = ''
            } else {
              propNode.defaultValue = false

              if (
                warnMissingDefaultValue &&
                block.isBasic &&
                (propNode.tags.style ||
                  (block.name === 'Text' && propNode.name === 'text'))
              ) {
                warnings.push({
                  loc,
                  type: `Add a default value to "${name}" like: "${name} <${slotName} default value"`,
                  line,
                })
              }
            }
          }

          let existingDefaultValue =
            block.slots.find((vp) => vp.name === (slotName || name)) ||
            slots.find((vp) => vp.name === (slotName || name))
          if (
            // !inScope &&
            !propNode.tags.fragment &&
            (!existingDefaultValue || !existingDefaultValue.defaultValue)
          ) {
            if (existingDefaultValue) {
              existingDefaultValue.name = slotName || name
              existingDefaultValue.type = getPropType(block, name, value)
              existingDefaultValue.defaultValue = tags.shouldBeSlot
                ? false
                : propNode.defaultValue
            } else {
              block.slots.push({
                name: slotName || name,
                type: getPropType(block, name, value),
                defaultValue: tags.shouldBeSlot ? false : propNode.defaultValue,
              })
            }
          }
          // }
        }
      } else if (isComment(line) && !skipComments) {
        let [value] = getComment(line)

        let userComment = isUserComment(line)
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
            !properties.some((baseProp) => baseProp.name === propNode.name)
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
    block.scopes = sortScopes(scopes)

    if (block.name !== 'View' && block.isFragment) {
      let invalidProps = properties
        .filter((prop) => prop.name !== 'isFragment' || prop.name !== 'onWhen')
        .map((prop) => prop.name)

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

  if (!view) {
    view = {
      type: 'Block',
      name: id,
      animations: {},
      isView: false,
      isAnimated: false,
      isBasic: true,
      isCapture: false,
      isColumn: false,
      isGroup: false,
      isChildren: false,
      level: 0,
      loc: getLoc(1, 0),
      properties: [],
      scopes: [],
    }

    warnings.push({
      loc: view.loc,
      type: `The file for ${id} is empty and won't render! Add some blocks to it like:\n${topBlockShouldBe}\n  Text\n    text content`,
      line: '',
    })
  }

  view.isDefiningChildrenExplicitly = isDefiningChildrenExplicitly
  view.useIsBefore = useIsBefore
  view.useIsMedia = useIsMedia
  view.views = viewsInView

  return {
    fonts,
    slots,
    view,
    warnings,
  }
}
