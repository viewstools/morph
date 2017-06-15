'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex
}

var path = require('path')
var buble = _interopDefault(require('buble'))
var synesthesia = require('synesthesia')
var cssProperties = _interopDefault(require('css-properties'))
var toCamelCase = _interopDefault(require('to-camel-case'))
var babelCore = {
  transform: c => c,
}
var toSlugCase = _interopDefault(require('to-slug-case'))
var toPascalCase = _interopDefault(require('to-pascal-case'))
var getColor = _interopDefault(require('color'))
var prettier = {
  format: c => c,
}
// var prettier = _interopDefault(require('prettier'))

const BASIC = /^(CaptureEmail|CaptureFile|CaptureInput|CaptureNumber|CapturePhone|CaptureSecure|CaptureText|G|Horizontal|Image|Input|List|Select|Style|Svg|SvgDefs|SvgFeMerge|SvgFilter|Text|Vertical)$/i
const BLOCK = /^([A-Z][a-zA-Z0-9]*)(\s+[a-z\s]*([A-Z][a-zA-Z0-9]*))?$/
const BOOL = /^(false|true)$/i
const CAPTURE = /^(CaptureEmail|CaptureFile|CaptureInput|CaptureNumber|CapturePhone|CaptureSecure|CaptureText)$/i
const CODE_EXPLICIT = /^{.+}$/
const CODE_IMPLICIT = /(props|item)\./
const DATA = /^.+\.data$/
const EMPTY_LIST = /^is empty list$/i
const EMPTY_TEXT = /^is empty text$/i
const FLOAT = /^[0-9]+\.[0-9]+$/
const FONTABLE = /^(CaptureEmail|CaptureInput|CaptureNumber|CapturePhone|CaptureSecure|CaptureText|Input|Text)$/
const GROUP = /^(G|Horizontal|List|Svg|SvgDefs|SvgFeMerge|SvgFilter|Vertical)$/i
const LIST = /^List$/
const INT = /^[0-9]+$/
const ITEM = /^item[A-Z]*$/
const MARGIN = /^margin/
const PADDING = /^padding/
const PROP = /^([a-z][a-zA-Z0-9]*)\s+(.+)$/
const PROP_STYLE_STEMS = /^([a-z][A-Z0-9]*?)(Active|ActiveHover|Hover|Placeholder|Disabled|Print)?$/i
const SECTION = /^([a-z][a-zA-Z0-9]*)$/
const STYLE = new RegExp(
  `^(${cssProperties.map(toCamelCase).join('|')}|heightBlocked)$`
)
const TERNARY = /\?\s*['"]?\s*(.+)?\s*['"]?\s*:\s*['"]?\s*(.+)\s*['"]?\s*/
const TODO = /TODO\s*(@([a-z]+))?\s*(.+)/i
const TOGGLE = new RegExp(`^toggle (props|item).(.+)$`)
const TRUE = /^true$/i

const is = (thing, line) => thing.test(line)
const isBasic = line => is(BASIC, line)
const isBlock = line => is(BLOCK, line)
const isBool = line => is(BOOL, line)
const isCapture = line => is(CAPTURE, line)
const isData = line => is(DATA, line)
const isCode = line =>
  isCodeOneWord(line) || is(CODE_EXPLICIT, line) || is(CODE_IMPLICIT, line)
const isCodeOneWord = line =>
  line === 'props' || line === 'item' || line === 'i'
// TODO
const isCodeInvalid = line => {
  return getCodeData(line).find(
    l =>
      /\. /.test(l) || // props. x
      / \./.test(l) || // props .
      / \[/.test(l) || // props[
      /\]/.test(l) // props]
  )
}

const isColor = line => is(synesthesia.all, line)
const isEmptyList = line => is(EMPTY_LIST, line)
const isEmptyText = line => is(EMPTY_TEXT, line)
const isEnd = line => line === ''
const isFloat = line => is(FLOAT, line)
const isFontable = line => is(FONTABLE, line)
const isGroup = line => is(GROUP, line)
const isList = line => is(LIST, line)
const isInt = line => is(INT, line)
const isItem = line => is(ITEM, line)
const isMargin = line => is(MARGIN, line)
const isPadding = line => is(PADDING, line)
const isProp = line => is(PROP, line)

const isSection = line => is(SECTION, line)
const isStyle = line => is(STYLE, line)
const isTodo = line => is(TODO, line)
const isToggle = line => is(TOGGLE, line)
const isTrue = line => is(TRUE, line)

const get = (regex, line) => line.match(regex)

const getBlock = line => {
  const match = get(BLOCK, line)
  if (match[3]) {
    return {
      block: match[3],
      is: match[1],
    }
  } else {
    return {
      block: match[1],
      is: null,
    }
  }
}
const getCodeData = line => {
  if (isCodeOneWord(line)) return [line]

  return line
    .replace(/^{/, '')
    .replace(/}$/, '')
    .split(' ')
    .filter(l => isCodeOneWord(l) || /[.[]/.test(l))
}

const getColor$1 = line => get(synesthesia.all, line)
const getFontInfo = (fontFamily, fontWeight) => {
  const fonts = []

  const families = []
  const familyTernary = fontFamily.match(TERNARY)
  if (familyTernary) {
    families.push(getMainFont(familyTernary[1]), getMainFont(familyTernary[2]))
  } else {
    families.push(getMainFont(fontFamily))
  }

  const weights = []

  if (typeof fontWeight === 'string') {
    const weightTernary = fontWeight.match(TERNARY)
    if (weightTernary) {
      weights.push(weightTernary[1], weightTernary[2])
    } else {
      weights.push(fontWeight)
    }
  } else if (typeof fontWeight === 'number') {
    weights.push(`${fontWeight}`)
  } else if (typeof fontWeight === 'undefined') {
    // default to 400
    weights.push('400')
  }

  families.forEach(family => {
    if (weights.length) {
      weights.forEach(weight => {
        fonts.push({
          family,
          weight,
        })
      })
    } else {
      fonts.push({
        family,
      })
    }
  })

  return fonts
}
const getMainFont = line => line.split(',')[0].replace(/['"]/g, '')
const getProp = line => get(PROP, line).slice(1)
const getSection = line => get(SECTION, line)[1]
const getTodo = line => get(TODO, line).slice(1)
const getToggle = line => get(TOGGLE, line)[2]
const getValue$1 = value => {
  if (isFloat(value)) {
    return parseFloat(value, 10)
  } else if (isInt(value)) {
    return parseInt(value, 10)
  } else if (isEmptyText(value)) {
    return ''
  } else if (isBool(value)) {
    return isTrue(value)
  } else {
    return value
  }
}

const stemStylesFromProp = raw => {
  const [prop, tag] = get(PROP_STYLE_STEMS, raw).slice(1)

  return tag && !isStyle(prop)
    ? [raw]
    : [prop, typeof tag === 'string' ? toCamelCase(tag) : undefined]
}

const warn = (message, block) => {
  if (!Array.isArray(block.warnings)) {
    block.warnings = []
  }
  block.warnings.push(message)
}

var getLoc = (line, scolumn, ecolumn) => ({
  start: {
    line,
    column: scolumn,
  },
  end: {
    line,
    column: ecolumn,
  },
})

var getMeta = (value, line, startLine) => {
  const hasCode = isCode(value)
  const hasColor = isColor(value)

  if (!(hasCode || hasColor)) return null

  const ret = {
    type: 'ArrayExpression',
    elements: [],
    loc: getLoc(startLine, 0, line.length - 1),
  }

  const add = tag => value => {
    const column = line.indexOf(value)
    ret.elements.push({
      type: 'Literal',
      loc: getLoc(startLine, column, column + value.length - 1),
      tag,
      value,
    })
  }

  if (hasCode) {
    getCodeData(value).forEach(add('code'))
  }
  if (hasColor) {
    getColor$1(value).forEach(add('color'))
  }

  return ret
}

var getTags = (prop, value) => {
  const tags = {}

  if (isCode(value)) tags.code = isCodeInvalid(value) ? 'invalid' : true
  if (isData(value)) tags.data = true
  if (isMargin(prop)) tags.margin = true
  if (isPadding(prop)) tags.padding = true
  if (isStyle(prop)) tags.style = true
  if (isToggle(value)) tags.toggle = getToggle(value)

  return tags
}

var parse = text => {
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
    const { block: name, is: is$$1 } = getBlock(line)
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
    if (is$$1) {
      block.is = is$$1

      if (isCapture(name)) {
        if (lastCapture) {
          lastCapture.captureNext = is$$1
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
          tags[stemmedTag] = true
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
              value: getValue$1(value),
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
                value: getValue$1(value),
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

// source https://github.com/Rich-Harris/estree-walker
// with added nodeKeys to be able to define the order in which groups of properties will be called
function walk(ast, { enter, leave, nodeKeys }) {
  childKeys = Object.assign({}, nodeKeys)
  visit(ast, null, enter, leave)
}

const context = {
  skip: () => (context.shouldSkip = true),
  shouldSkip: false,
}

let childKeys = {}

const toString = Object.prototype.toString

function isArray(thing) {
  return toString.call(thing) === '[object Array]'
}

function visit(node, parent, enter, leave, prop, index) {
  if (!node) return

  if (enter) {
    context.shouldSkip = false
    enter.call(context, node, parent, prop, index)
    if (context.shouldSkip) return
  }

  const keys =
    childKeys[node.type] ||
    (childKeys[node.type] = Object.keys(node).filter(
      key => typeof node[key] === 'object'
    ))

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i]
    const value = node[key]

    if (isArray(value)) {
      for (let j = 0; j < value.length; j += 1) {
        // allow you to walk up the tree
        node.parent = parent
        visit(value[j], node, enter, leave, key, j)
      }
    } else if (value && value.type) {
      // allow you to walk up the tree
      node.parent = parent
      visit(value, node, enter, leave, key, null)
    }
  }

  if (leave) {
    leave(node, parent, prop, index)
  }
}

var morph$1 = (code, state, visitors) => {
  const parsed = parse(code)

  walk(parsed.views[0], {
    enter(node, parent) {
      const visitor = visitors[node.type]
      if (visitor && visitor.enter)
        visitor.enter.call(this, node, parent, state)
    },
    leave(node, parent) {
      const visitor = visitors[node.type]
      if (visitor && visitor.leave)
        visitor.leave.call(this, node, parent, state)
    },
    nodeKeys: {
      Block: ['properties', 'blocks'],
    },
  })

  if (visitors.Fonts) visitors.Fonts(parsed.fonts, state)
  if (visitors.Todos) visitors.Todos(parsed.todos, state)
}

var data = ({ view }) => {
  const state = {}

  const visitors = {
    Property,
  }

  morph$1(view, state, visitors)

  return `export default ${JSON.stringify(state.default || state)}`
}

const Property = {
  enter(node, parent, state) {
    state[node.key.value] = getValue(node)

    if (
      node.value.type === 'ArrayExpression' ||
      node.value.type === 'ObjectExpression'
    )
      this.skip()
  },
}

// TODO relations
// eg
// Data
// name Dario
// addresses
// from addresses.data
const getValue = property => {
  switch (property.value.type) {
    case 'Literal':
      return property.value.value

    case 'ArrayExpression':
      return property.value.elements.map(getValue)

    case 'ObjectExpression':
      let value = {}

      property.value.properties.forEach(pr => {
        value[pr.key.value] = getValue(pr)
      })

      return value

    default:
      return null
  }
}

var wrap = s => `{${s}}`

const getObjectAsString = obj =>
  wrap(
    Object.keys(obj)
      .map(k => {
        const v = typeof obj[k] === 'object' && hasKeys(obj[k])
          ? getObjectAsString(obj[k])
          : obj[k]
        return `${JSON.stringify(k)}: ${v}`
      })
      .join(',')
  )

const getProp$1 = (node, key) => {
  const finder = typeof key === 'string'
    ? p => p.key.value === key
    : p => key.test(p.key.value)

  return node.properties && node.properties.list.find(finder)
}

const styleStems = [
  'active',
  'hover',
  'activeHover',
  'placeholder',
  'disabled',
  'print',
]
const getStyleType = node => styleStems.find(tag => isTag(node, tag)) || 'base'

const hasKeys = obj => Object.keys(obj).length > 0
const hasKeysInChildren = obj => Object.keys(obj).some(k => hasKeys(obj[k]))

const hasProp = (node, key, match) => {
  const prop = getProp$1(node, key)
  if (!prop) return false
  return typeof match === 'function' ? match(prop.value.value) : true
}

const isCode$1 = node =>
  typeof node === 'string' ? /props|item/.test(node) : isTag(node, 'code')
const isData$1 = node => isTag(node, 'data')
const isStyle$1 = node => isTag(node, 'style')
const isToggle$1 = node => isTag(node, 'toggle')

const isTag = (node, tag) => node.tags[tag]

var safe = value =>
  typeof value === 'string' && !/props|item/.test(value)
    ? JSON.stringify(value)
    : wrap(value)

const enter = (node, parent, state) => {
  if (node.goTo) {
    const goTo = getProp$1(node, 'goTo')
    state.render.push(` target='_blank' href=${safe(goTo.value.value, goTo)}`)
  }
}

const enter$1 = (node, parent, state) => {
  if (node.teleport) {
    let to = getProp$1(node, 'teleportTo').value.value

    if (to.startsWith('/') || to === '..') {
      to = safe(to)
    } else {
      to = isCode$1(to) ? `\${${to}}` : to
      to = `{\`\${props.match.url === '/' ? '' : props.match.url}/${to}\`}`
      state.withRouter = true
    }

    state.render.push(` to=${to}`)
  }
}

// https://raw.githubusercontent.com/threepointone/glam/master/src/hash.js
// murmurhash2 via https://gist.github.com/raycmorgan/588423

var hash = (arr, prefix = 'h') => `h${hash$1(arr)}`
function hash$1(arr) {
  let str = (Array.isArray(arr)
    ? arr
    : Object.keys(arr).map(k => `${k}:${JSON.stringify(arr[k])}`)).join(',')
  return murmur2(str, str.length).toString(36)
}

function murmur2(str, seed) {
  let m = 0x5bd1e995
  let r = 24
  let h = seed ^ str.length
  let length = str.length
  let currentIndex = 0

  while (length >= 4) {
    let k = UInt32(str, currentIndex)

    k = Umul32(k, m)
    k ^= k >>> r
    k = Umul32(k, m)

    h = Umul32(h, m)
    h ^= k

    currentIndex += 4
    length -= 4
  }

  switch (length) {
    case 3:
      h ^= UInt16(str, currentIndex)
      h ^= str.charCodeAt(currentIndex + 2) << 16
      h = Umul32(h, m)
      break

    case 2:
      h ^= UInt16(str, currentIndex)
      h = Umul32(h, m)
      break

    case 1:
      h ^= str.charCodeAt(currentIndex)
      h = Umul32(h, m)
      break
  }

  h ^= h >>> 13
  h = Umul32(h, m)
  h ^= h >>> 15

  return h >>> 0
}

function UInt32(str, pos) {
  return (
    str.charCodeAt(pos++) +
    (str.charCodeAt(pos++) << 8) +
    (str.charCodeAt(pos++) << 16) +
    (str.charCodeAt(pos) << 24)
  )
}

function UInt16(str, pos) {
  return str.charCodeAt(pos++) + (str.charCodeAt(pos++) << 8)
}

function Umul32(n, m) {
  n = n | 0
  m = m | 0
  let nlo = n & 0xffff
  let nhi = n >>> 16
  let res = (nlo * m + (((nhi * m) & 0xffff) << 16)) | 0
  return res
}

const leave = (node, parent, state) => {
  if (hasKeysInChildren(node.style.static)) {
    const id = hash(node.style.static)
    state.styles[id] = node.style.static
    parent.styleId = id
    const isActive = getProp$1(parent, 'isActive')

    let className = [
      `styles.${id}`,
      isActive && `${isActive.value.value} && 'active'`,
    ].filter(Boolean)

    if (className.length > 0) {
      className = className.map(k => `\${${k}}`).join(' ')
      className = `\`${className}\``
    }

    state.render.push(` className=${wrap(className)}`)
  }
  // TODO needs to be different, it should also be a classname here too
  if (hasKeysInChildren(node.style.dynamic)) {
    const dynamic = getObjectAsString(node.style.dynamic.base)
    state.render.push(` style={${dynamic}}`)
  }
}

var getBlockName = node => {
  switch (node.name.value) {
    case 'CaptureEmail':
    case 'CaptureFile':
    case 'CaptureInput':
    case 'CaptureNumber':
    case 'CapturePhone':
    case 'CaptureSecure':
    case 'CaptureText':
      return 'input'

    case 'Horizontal':
    case 'Vertical':
      return getGroupBlockName(node)

    case 'Image':
      return 'img'

    case 'Text':
    case 'List':
      return 'div'

    case 'Proxy':
      return getProxyBlockName(node)
    // TODO SvgText should be just Text but the import should be determined from the parent
    // being Svg

    case 'SvgText':
      return 'text'

    case 'Svg':
    case 'Circle':
    case 'Ellipse':
    case 'G':
    case 'LinearGradient':
    case 'RadialGradient':
    case 'Line':
    case 'Path':
    case 'Polygon':
    case 'Polyline':
    case 'Rect':
    case 'Symbol':
    case 'Use':
    case 'Defs':
    case 'Stop':
      return node.name.value.toLowerCase()

    default:
      return node.name.value
  }
}

const getGroupBlockName = node => {
  let name = 'div'

  if (hasProp(node, 'teleportTo')) {
    name = 'Link'
    node.teleport = true
  } else if (hasProp(node, 'goTo')) {
    name = 'a'
    node.goTo = true
  } else if (hasProp(node, 'onClick')) {
    name = 'button'
  } else if (hasProp(node, 'overflowY', v => v === 'auto' || v === 'scroll')) {
    name = 'div'
  }

  return name
}

const getProxyBlockName = node => {
  const from = getProp$1(node, 'from')
  return from && from.value.value
}

const interpolateCode = s => (/props|item/.test(s) ? '${' + s + '}' : s)

var safe$1 = s => '`' + s.split(' ').map(interpolateCode).join(' ') + '`'

var getStyleForProperty = (node, parent, code) => {
  const key = node.key.value
  const value = node.value.value

  switch (key) {
    case 'backgroundImage':
      return {
        backgroundImage: code ? `\`url(\${${value}})\`` : `url("${value}")`,
        backgroundSize: 'cover',
      }

    case 'zIndex':
      return {
        zIndex: code ? value : parseInt(value, 10),
      }

    default:
      return {
        [key]: code && !/(.+)\?(.+):(.+)/.test(value) ? safe$1(value) : value,
      }
  }
}

/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule CSSProperty
 */

// https://raw.githubusercontent.com/facebook/react/3b96650e39ddda5ba49245713ef16dbc52d25e9e/src/renderers/dom/shared/CSSProperty.js

/**
 * CSS properties which accept numbers but are not in units of "px".
 */
var isUnitlessNumber = {
  animationIterationCount: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,

  // SVG-related properties
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true,
}

/**
 * @param {string} prefix vendor-specific prefix, eg: Webkit
 * @param {string} key style name, eg: transitionDuration
 * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
 * WebkitTransitionDuration
 */
function prefixKey(prefix, key) {
  return prefix + key.charAt(0).toUpperCase() + key.substring(1)
}

/**
 * Support style names that may come passed in prefixed by adding permutations
 * of vendor prefixes.
 */
const prefixes = ['Webkit', 'ms', 'Moz', 'O']

// Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
// infinite loop, because it iterates over the newly added props too.
Object.keys(isUnitlessNumber).forEach(function(prop) {
  prefixes.forEach(function(prefix) {
    isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop]
  })
})

var getStyles = ({ file, inlineStyles, styles }, name) => {
  if (!hasKeys(styles)) return ''

  const obj = Object.keys(styles)
    .filter(k => hasKeysInChildren(styles[k]))
    .map(k => `${JSON.stringify(k)}: css\`${toNestedCss(styles[k])}\``)
    .join(',')

  const code = transformGlam(`const styles = {${obj}}`, inlineStyles, file.raw)
  const maybeImport = inlineStyles ? '' : `import '${file.relative}.css'\n`
  return `${maybeImport}${code}`
}

const getValue$2 = (key, value) =>
  typeof value === 'number' &&
    !(isUnitlessNumber.hasOwnProperty(key) && isUnitlessNumber[key])
    ? `${value}px`
    : `${value}`

const toCss = obj =>
  Object.keys(obj)
    .map(k => `${toSlugCase(k)}: ${getValue$2(k, obj[k])};`)
    .join('\n')

const toNestedCss = ({
  base,
  hover,
  active,
  activeHover,
  disabled,
  placeholder,
  print,
}) => {
  const baseCss = toCss(base)
  const hoverCss = toCss(hover)
  const activeCss = toCss(active)
  const activeHoverCss = toCss(activeHover)
  const disabledCss = toCss(disabled)
  const placeholderCss = toCss(placeholder)
  const printCss = toCss(print)

  const ret = [
    baseCss,
    hoverCss && `&:hover {${hoverCss}}`,
    activeCss && `&.active {${activeCss}}`,
    activeHoverCss && `&.active:hover {${activeHoverCss}}`,
    disabledCss && `&:disabled {${disabledCss}}`,
    placeholderCss && `&::placeholder {${placeholderCss}}`,
    printCss && `@media print {${printCss}}`,
  ]
    .filter(Boolean)
    .join('\n')

  return ret
}

const transformGlam = (code, inline, filename) =>
  babelCore.transform(code, {
    babelrc: false,
    filename,
    plugins: [[require.resolve('glam/babel'), { inline }]],
  }).code

var getValueForProperty = (node, parent) => {
  const key = node.key.value
  const value = node.value.value

  switch (node.value.type) {
    case 'Literal':
      return {
        [key]: typeof value === 'string' && !isCode$1(node)
          ? JSON.stringify(value)
          : wrap(value),
      }
    // TODO lists
    case 'ArrayExpression':
    // TODO support object nesting
    case 'ObjectExpression':
    default:
      return false
  }
}

const blacklist = ['backgroundSize', 'teleportTo', 'goTo']
var isValidPropertyForBlock = (node, parent) =>
  !blacklist.includes(node.key.value)

var makeToggle = (fn, prop) =>
  `${fn} = () => this.setState({ ${prop}: !this.state.${prop} })`

var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i]

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }

    return target
  }

var objectWithoutProperties = function(obj, keys) {
  var target = {}

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue
    target[i] = obj[i]
  }

  return target
}

var makeVisitors = ({
  getBlockName,
  getStyleForProperty,
  getValueForProperty,
  isValidPropertyForBlock,
  PropertiesStyleLeave,
}) => {
  const BlockDefaultProps = {
    enter(node, parent, state) {
      if (parent || node.name.value === 'List') return

      const from = getProp$1(node, 'from')
      if (from && isData$1(from)) {
        state.use(from.value.value)
        state.defaultProps = toCamelCase(from.value.value)
      }
    },
  }

  const BlockName = {
    enter(node, parent, state) {
      const name = getBlockName(node, state)
      if (name === null) return this.skip()

      node.name.finalValue = name
      state.use(name)

      state.render.push(`<${name}`)
    },
    leave(node, parent, state) {
      if (
        node.explicitChildren ||
        (node.blocks && node.blocks.list.length > 0)
      ) {
        state.render.push(`</${node.name.finalValue}>`)
      } else {
        state.render.push('/>')
      }
    },
  }

  const BlockWhen = {
    enter(node, parent, state) {
      // when lets you show/hide blocks depending on props
      const when = getProp$1(node, 'when')
      if (when) {
        node.when = true

        if (parent) state.render.push('{')
        state.render.push(`${when.value.value} ? `)
      }
    },
    leave(node, parent, state) {
      if (node.when) {
        state.render.push(` : null`)
        if (parent) state.render.push('}')
      }
    },
  }

  const BlockExplicitChildren = {
    leave(node, parent, state) {
      if (node.explicitChildren) {
        state.render.push('>')
        state.render.push(node.explicitChildren)
      }
    },
  }

  const BlocksList = {
    enter(node, parent, state) {
      if (parent.name.value === 'List') {
        let from = getProp$1(parent, 'from')
        if (!from) return

        if (isData$1(from)) {
          state.use(from.value.value)
          from = toCamelCase(from.value.value)
        } else {
          from = from.value.value
        }

        state.render.push(
          `{Array.isArray(${from}) && ${from}.map((item, i) => `
        )

        node.list.forEach(n => (n.isInList = true))
      }
    },
    leave(node, parent, state) {
      if (parent.name.value === 'List') {
        state.render.push(')}')
      }
    },
  }

  const BlockRoute = {
    enter(node, parent, state) {
      const at = getProp$1(node, 'at')
      if (at) {
        let [path$$1, isExact = false] = at.value.value.split(' ')
        state.use('Route')

        if (path$$1 === '/') state.use('Router')

        if (!path$$1.startsWith('/')) {
          path$$1 = `\`\${props.match.url}/${path$$1}\``
        }

        node.isRoute = true
        state.render.push(
          `<Route path=${safe(path$$1)} ${isExact
            ? 'exact'
            : ''} render={routeProps => `
        )
      }
    },
    leave(node, parent, state) {
      if (node.isRoute) {
        state.render.push('} />')
      }
    },
  }

  const PropertiesListKey = {
    leave(node, parent, state) {
      if (parent.isInList && !node.hasKey) {
        state.render.push(' key={i}')
      }
    },
  }

  const PropertiesRoute = {
    leave(node, parent, state) {
      if (parent.isRoute) {
        state.render.push(' {...routeProps}')
      }
    },
  }

  const PropertiesStyle = {
    enter(node, parent, state) {
      node.style = {
        dynamic: {
          base: {},
          active: {},
          hover: {},
          activeHover: {},
          disabled: {},
          placeholder: {},
          print: {},
        },
        static: {
          base: {},
          active: {},
          hover: {},
          activeHover: {},
          disabled: {},
          placeholder: {},
          print: {},
        },
      }

      const name = parent.name.value
      if (name === 'Vertical' || name === 'List') {
        node.style.static.base.flexDirection = 'column'
      } else if (name === 'Horizontal') {
        node.style.static.base.flexDirection = 'row'
      }
    },
    leave: PropertiesStyleLeave,
  }

  // const PropertyData = {
  //   enter(node, parent, state) {
  //     if (isData(node)) {
  //       state.render.push(``)
  //       return true
  //     }
  //   }
  // }

  const PropertyList = {
    enter(node, parent, state) {
      // block is inside List
      if (parent.isInList === 'List' && node.key.value === 'key') {
        parent.hasKey = true
      }
    },
  }

  const PropertyRest = {
    enter(node, parent, state) {
      if (
        !parent.skip &&
        !(node.key.value === 'from' && parent.parent.name.value === 'List')
      ) {
        if (isToggle$1(node)) {
          const propToToggle = node.tags.toggle
          const functionName = `toggle${toPascalCase(propToToggle)}`
          state.remap[propToToggle] = {
            body: makeToggle(functionName, propToToggle),
            fn: functionName,
          }
          state.render.push(` ${node.key.value}={props.${functionName}}`)
          return
        }

        if (state.views[node.value.value]) {
          state.render.push(` ${node.key.value}=${wrap(node.value.value)}`)
          state.use(node.value.value)
          return
        }

        const value = getValueForProperty(node, parent)

        if (value) {
          Object.keys(value).forEach(k =>
            state.render.push(` ${k}=${value[k]}`)
          )
        }
      }
    },
  }

  const PropertyStyle = {
    enter(node, parent, state) {
      if (isStyle$1(node) && parent.parent.isBasic) {
        const code = isCode$1(node)
        const _getStyleForProperty = getStyleForProperty(node, parent, code),
          { _isProp } = _getStyleForProperty,
          styleForProperty = objectWithoutProperties(_getStyleForProperty, [
            '_isProp',
          ])

        if (_isProp) {
          Object.keys(styleForProperty).forEach(k =>
            state.render.push(` ${k}=${safe(styleForProperty[k], node)}`)
          )
        } else {
          const target = code ? parent.style.dynamic : parent.style.static
          Object.assign(target[getStyleType(node)], styleForProperty)
        }

        return true
      }
    },
  }

  const PropertyText = {
    enter(node, parent, state) {
      if (node.key.value === 'text' && parent.parent.name.value === 'Text') {
        parent.parent.explicitChildren = isCode$1(node)
          ? wrap(node.value.value)
          : node.value.value

        return true
      }
    },
  }

  return {
    BlockDefaultProps,
    BlockExplicitChildren,
    BlockName,
    BlockRoute,
    BlockWhen,

    Block: {
      // TODO Image
      // TODO Capture*
      // TODO List without wrapper?
      enter(node, parent, state) {
        BlockWhen.enter.call(this, node, parent, state)
        BlockRoute.enter.call(this, node, parent, state)
        BlockName.enter.call(this, node, parent, state)
        BlockDefaultProps.enter.call(this, node, parent, state)
      },
      leave(node, parent, state) {
        BlockExplicitChildren.leave.call(this, node, parent, state)
        BlockName.leave.call(this, node, parent, state)
        BlockRoute.leave.call(this, node, parent, state)
        BlockWhen.leave.call(this, node, parent, state)
      },
    },

    Blocks: {
      enter(node, parent, state) {
        if (node.list.length > 0) state.render.push('>')
        BlocksList.enter.call(this, node, parent, state)
      },
      leave(node, parent, state) {
        BlocksList.leave.call(this, node, parent, state)
      },
    },

    Properties: {
      enter(node, parent, state) {
        PropertiesStyle.enter.call(this, node, parent, state)
      },
      leave(node, parent, state) {
        PropertiesStyle.leave.call(this, node, parent, state)
        PropertiesListKey.leave.call(this, node, parent, state)
        PropertiesRoute.leave.call(this, node, parent, state)
      },
    },

    Property: {
      enter(node, parent, state) {
        if (
          node.key.value === 'at' ||
          node.key.value === 'when' ||
          isData$1(node)
        )
          return
        if (!isValidPropertyForBlock(node, parent)) return

        // if (PropertyData.enter.call(this, node, parent, state)) return
        if (PropertyStyle.enter.call(this, node, parent, state)) return
        if (PropertyText.enter.call(this, node, parent, state)) return
        PropertyList.enter.call(this, node, parent, state)
        PropertyRest.enter.call(this, node, parent, state)
      },
    },

    Fonts(list, state) {
      state.fonts = list
    },

    Todos(list, state) {
      state.todos = list
    },
  }
}

var maybeUsesRouter = state => {
  if (state.uses.includes('Router')) {
    state.render = ['<Router>', ...state.render, '</Router>']
  }
}

// TODO don't import glam if styles aren't inlined and there are no dynamic
// styles
var maybeUsesStyleSheet = state => {
  if (hasKeys(state.styles)) {
    state.uses.push('glam')
  }
}

var reactNative = [
  'CaptureEmail',
  'CaptureFile',
  'CaptureInput',
  'CaptureNumber',
  'CapturePhone',
  'CaptureSecure',
  'CaptureText',
  'Horizontal',
  'Vertical',
  'Image',
  'Text',
  'List',
  'Proxy',
  'SvgText',
  'Svg',
  'Circle',
  'Ellipse',
  'G',
  'LinearGradient',
  'RadialGradient',
  'Line',
  'Path',
  'Polygon',
  'Polyline',
  'Rect',
  'Symbol',
  'Use',
  'Defs',
  'Stop',
  'Router',
  'Route',
  'Link',
]

var getBody = ({ state, name }) => {
  const render = state.render.join('')
  return state.captures.length > 0
    ? `class ${name} extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const { props, state } = this
    return (${render})
  }
}`
    : `const ${name} = (props) => (${render})`
}

var getDefaultProps = ({ state, name }) =>
  state.defaultProps ? `${name}.defaultProps = ${state.defaultProps}` : ''

var SVG = [
  'Svg',
  'Circle',
  'Ellipse',
  'G',
  'LinearGradient',
  'RadialGradient',
  'Line',
  'Path',
  'Polygon',
  'Polyline',
  'Rect',
  'Symbol',
  'SvgText',
  'Use',
  'Defs',
  'Stop',
]

const NATIVE = [
  'Image',
  'KeyboardAvoidingView',
  'ScrollView',
  'StyleSheet',
  'Text',
  'TextInput',
  'TouchableHighlight',
  'View',
]

var getDependencies = (uses, getImport) => {
  const usesNative = []
  const usesSvg = []

  const useNative = d => {
    if (!usesNative.includes(d)) {
      usesNative.push(d)
    }
  }
  const useSvg = d => {
    if (!usesSvg.includes(d)) {
      usesSvg.push(d)
    }
  }

  const dependencies = []
  uses.sort().forEach(d => {
    if (NATIVE.includes(d)) {
      useNative(d)
    } else if (SVG.includes(d)) {
      useSvg(d === 'SvgText' ? 'Text as SvgText' : d)
    } else if (/^[A-Z]/.test(d) || /\.data$/.test(d)) {
      dependencies.push(getImport(d))
    } else if (d === 'glam') {
      dependencies.push(`import css from 'glam'`)
    }
  })

  if (usesSvg.length > 0) {
    const svg = usesSvg.filter(m => m !== 'Svg').join(', ')
    dependencies.push(`import Svg, { ${svg} } from 'react-native-svg'`)
  }

  if (usesNative.length > 0) {
    dependencies.push(`import { ${usesNative.join(', ')} } from 'react-native'`)
  }

  return dependencies.join('\n')
}

var getRemap = ({ state, name }) => {
  if (Object.keys(state.remap).length === 0) return false
  const remap = {
    name: `Remap${name}`,
  }

  const localState = []
  const fns = []
  const methods = Object.keys(state.remap).map(prop => {
    localState.push(`${prop}: props.${prop},`)
    const { body, fn } = state.remap[prop]
    fns.push(`${fn}={this.${fn}}`)
    return body
  })

  remap.component = `class ${remap.name} extends React.Component {
constructor(props) {
super(props)
this.state = ${wrap(localState.join('\n'))}
}
${methods.join('\n')}

render() {
  return <${name} {...this.props} {...this.state} ${fns.join(' ')} />
}
}`

  return remap
}

var getTests = ({ state, name }) => {
  if (!state.tests) return false

  const tests = {
    name: `Tests${name}`,
  }

  // TODO track choices in sessionStorage
  tests.component = `
  const g = typeof window === 'undefined' ? global : window

  class ${tests.name} extends React.Component {
  constructor(props) {
    super(props)

    const { _main, ...rest } = makeTests(this.display)
    this.state = {
      ...rest[_main],
      _on: true,
    }

    const tests = {
      active: _main,
      on: this.on,
      off: this.off,
    }

    Object.keys(rest).forEach(test => {
      tests[test] = () => this.display(rest[test], test)
    })

    if (typeof g.tests === 'undefined') {
      const validTests = k => !(k === 'off' || k === 'on')
      g.tests = {
        off: () => Object.keys(g.tests).filter(validTests).forEach(t => g.tests[t].off()),
        on: () => Object.keys(g.tests).filter(validTests).forEach(t => g.tests[t].on()),
      }
    }

    if (typeof g.tests.${name} === 'undefined') {
      g.tests.${name} = tests
    } else if (Array.isArray(g.tests.${name})) {
      g.tests.${name}.push(tests)
    } else {
      g.tests.${name} = [
        g.tests.${name},
        tests
      ]
      g.tests.${name}.off = () => g.tests.${name}.forEach(t => t.off())
      g.tests.${name}.on = () => g.tests.${name}.forEach(t => t.on())
    }

    this.test = tests

    console.info('${name} tests 👉', g.tests)
  }

  componentWillUnmount() {
    if (Array.isArray(g.tests.${name})) {
      g.tests.${name} = g.tests.${name}.filter(t => t === this.tests)
      if (g.tests.${name}.length === 0) {
        delete g.tests.${name}
      }
    } else {
      delete g.tests.${name}
    }
  }

  display = (next, name) => {
    this.setState(next, () => {
      g.tests.${name}.active = name
    })
  }

  off = () => this.setState({ _on: false })
  on = () => this.setState({ _on: true })

  render() {
    const { _on, ...state } = this.state
    return _on ? <${name} {...this.props} {...state} /> : <${name} {...this.props} />
  }
}`

  return tests
}

var toComponent = ({ getImport, getStyles, name, state }) => {
  const remap = getRemap({ state, name })
  let xport = remap ? remap.name : name

  const tests = getTests({ state, name: xport })
  if (tests) xport = tests.name
  // TODO remove withRouter when
  // https://github.com/ReactTraining/react-router/issues/4571 is merged and
  // relative links are supported
  if (state.withRouter) xport = `withRouter(${xport})`

  const dependencies = [
    `import React from 'react'`,
    state.withRouter && `import { withRouter } from 'react-router'`,
    tests && `import makeTests from './${name}.view.tests.js'`,
    getDependencies(state.uses, getImport),
  ]
    .filter(Boolean)
    .join('\n')

  // TODO Emojis should be wrapped in <span>, have role="img", and have an accessible description
  // with aria-label or aria-labelledby  jsx-a11y/accessible-emoji
  return `/* eslint-disable jsx-a11y/accessible-emoji */
${dependencies}

${getStyles(state, name)}

${tests ? tests.component : ''}
${remap ? remap.component : ''}

${getBody({ state, name })}
${getDefaultProps({ state, name })}
export default ${xport}`
}

const imports = {
  Link: "import { Link } from 'react-router-dom'",
  Route: "import { Route } from 'react-router-dom'",
  Router: "import { BrowserRouter as Router } from 'react-router-dom'",
}

var reactDom = ({
  getImport,
  inlineStyles = true,
  file,
  name,
  tests = false,
  view,
  views = {},
}) => {
  const finalName = reactNative.includes(name) ? `${name}1` : name
  if (name !== finalName) {
    console.warn(`// "${name}" is a Views reserved name.
      We've renamed it to "${finalName}", so your view should work but this isn't ideal.
      To fix this, change its file name to something else.`)
  }

  const state = {
    captures: [],
    defaultProps: false,
    file,
    fonts: [],
    inlineStyles,
    remap: {},
    render: [],
    styles: {},
    todos: [],
    uses: [],
    tests,
    use(block) {
      if (
        state.uses.includes(block) ||
        /props/.test(block) ||
        block === finalName
      )
        return

      state.uses.push(block)
    },
    views,
    withRouter: false,
  }

  if (name !== finalName) {
    console.warn(
      `// ${name} is a Views reserved name. To fix this, change its file name to something else.`
    )
  }

  const _makeVisitors = makeVisitors({
    getBlockName,
    getStyleForProperty,
    getValueForProperty,
    isValidPropertyForBlock,
    PropertiesStyleLeave: leave,
  }),
    {
      BlockDefaultProps,
      BlockExplicitChildren,
      BlockName,
      BlockRoute,
      BlockWhen,
    } = _makeVisitors,
    visitors = objectWithoutProperties(_makeVisitors, [
      'BlockDefaultProps',
      'BlockExplicitChildren',
      'BlockName',
      'BlockRoute',
      'BlockWhen',
    ])

  visitors.Block = {
    // TODO Capture*
    // TODO List without wrapper?
    enter(node, parent, state) {
      ;[
        BlockWhen.enter,
        BlockRoute.enter,
        BlockName.enter,
        enter$1,
        enter,
        BlockDefaultProps.enter,
      ].forEach(fn => fn.call(this, node, parent, state))
    },
    leave(node, parent, state) {
      ;[
        BlockExplicitChildren.leave,
        BlockName.leave,
        BlockRoute.leave,
        BlockWhen.leave,
      ].forEach(fn => fn.call(this, node, parent, state))
    },
  }

  morph$1(view, state, visitors)

  maybeUsesStyleSheet(state)
  maybeUsesRouter(state)

  const finalGetImport = name => imports[name] || getImport(name)

  return toComponent({
    getImport: finalGetImport,
    getStyles,
    name: finalName,
    state,
  })
}

const enter$2 = (node, parent, state) => {
  if (node.backgroundImage) {
    const source = wrap(getObjectAsString({ uri: node.backgroundImage }))
    state.render.push(` resizeMode="cover" source=${source}`)
  }
}

const enter$3 = (node, parent, state) => {
  if (/Capture/.test(node.name.value)) {
    if (node.properties && !hasProp(node, 'ref')) {
      node.properties.skip = true

      const { captureNext } = node
      let onSubmit = getProp$1(node, 'onSubmit') || null
      if (onSubmit) onSubmit = onSubmit.value.value

      if (captureNext) {
        state.render.push(` blurOnSubmit={false}`)
        state.render.push(
          ` onSubmitEditing={this.$capture${captureNext}? () => this.$capture${captureNext}.focus() : ${onSubmit}}`
        )
        state.render(
          ` returnKeyType = {this.$capture${captureNext}? 'next' : 'go'}`
        )
      } else {
        if (onSubmit) {
          state.render.push(` onSubmitEditing={${onSubmit}}`)
          state.render.push(` returnKeyType="go"`)
        } else {
          state.render.push(` returnKeyType="done"`)
        }
      }
      state.render.push(
        ` onChangeText = {${node.is} => this.setState({ ${node.is} })}`
      )
      state.render.push(` ref={$e => this.$capture${node.is} = $e}`)
      state.render.push(` value={state.${node.is}}`)
    }
  }
}

var getBlockName$1 = (node, state) => {
  switch (node.name.value) {
    case 'CaptureEmail':
    // case 'CaptureFile':
    case 'CaptureInput':
    case 'CaptureNumber':
    case 'CapturePhone':
    case 'CaptureSecure':
    case 'CaptureText':
      return 'TextInput'

    case 'Horizontal':
    case 'Vertical':
      return getGroupBlockName$1(node, state)

    case 'List':
      return getListBlockName(node)

    case 'Proxy':
      return getProxyBlockName$1(node)
    // TODO SvgText should be just Text but the import should be determined from the parent
    // being Svg

    default:
      return node.name.value
  }
}

const getGroupBlockName$1 = (node, state) => {
  let name = 'View'

  if (hasProp(node, 'teleportTo')) {
    node.teleport = true
  } else if (hasProp(node, 'goTo')) {
    node.goTo = true
  } else if (hasProp(node, 'onClick')) {
    const propNode = getProp$1(node, 'onClick')

    if (isToggle$1(propNode)) {
      const propToToggle = propNode.tags.toggle
      const functionName = `toggle${toPascalCase(propToToggle)}`
      state.remap[propToToggle] = {
        body: makeToggle(functionName, propToToggle),
        fn: functionName,
      }

      node.action = `props.${functionName}`
      return
    } else {
      node.action = propNode.value.value
    }
  }

  if (hasProp(node, 'backgroundImage')) {
    const propNode = getProp$1(node, 'backgroundImage')
    node.backgroundImage = isCode$1(propNode)
      ? propNode.value.value
      : JSON.stringify(propNode.value.value)

    name = 'Image'
  } else if (hasProp(node, 'overflowY', v => v === 'auto' || v === 'scroll')) {
    name = 'ScrollView'
  }

  return name
}

const getListBlockName = node =>
  hasProp(node, /^overflow/, v => v === 'auto' || v === 'scroll')
    ? 'ScrollView'
    : 'View'

const getProxyBlockName$1 = node => {
  const from = getProp$1(node, 'from')
  return from && from.value.value
}

const enter$4 = (node, parent, state) => {
  const name = getBlockName$1(node, state)

  if (
    name === 'Text' &&
    parent &&
    parent.parent &&
    (parent.parent.backgroundImage || parent.parent.ensureBackgroundColor)
  ) {
    node.ensureBackgroundColor = true
  }

  if (node.action) {
    state.use('TouchableHighlight')
    state.render.push(`<TouchableHighlight
          activeOpacity={0.7}
          onPress=${wrap(node.action)}
          underlayColor='transparent'>`)
    node.wrapEnd = '</TouchableHighlight>'
  } else if (node.teleport) {
    state.use('Link')
    let to = getProp$1(node, 'teleportTo').value.value

    if (to.startsWith('/') || to === '..') {
      to = safe(to)
    } else {
      to = isCode$1(to) ? `\${${to}}` : to
      to = `{\`\${props.match.url === '/' ? '' : props.match.url}/${to}\`}`
      state.withRouter = true
    }

    state.render.push(`<Link
          activeOpacity={0.7}
          to=${to}
          underlayColor='transparent'>`)
    node.wrapEnd = '</Link>'
  } else if (node.goTo) {
    // const goTo = getProp(node, 'goTo')
    // TODO https://facebook.github.io/react-native/docs/linking.html
  }
}

const leave$1 = (node, parent, state) => {
  if (node.wrapEnd) {
    state.render.push(node.wrapEnd)
  }
}

const leave$2 = (node, parent, state) => {
  let style = null

  if (
    parent.ensureBackgroundColor &&
    (!('backgroundColor' in node.style.static.base) ||
      !('backgroundColor' in node.style.dynamic.base))
  ) {
    node.style.static.base.backgroundColor = 'transparent'
  }

  if (hasKeys(node.style.static.base)) {
    const id = hash(node.style.static.base)
    state.styles[id] = node.style.static.base
    parent.styleId = id
    style = `styles.${id}`
  }
  if (hasKeys(node.style.dynamic.base)) {
    const dynamic = getObjectAsString(node.style.dynamic.base)
    style = style ? `[${style},${dynamic}]` : dynamic
  }

  if (style) {
    state.render.push(` style={${style}}`)
  }
}

var getStyleForProperty$1 = (node, parent, code) => {
  const key = node.key.value
  const value = node.value.value

  switch (key) {
    case 'border':
    case 'borderBottom':
    case 'borderLeft':
    case 'borderRight':
    case 'borderTop':
      return getBorder(value, key.replace('border', ''))

    case 'boxShadow':
      return getShadow(value)

    case 'fontFamily':
      return {
        fontFamily: getFontFamily(node, parent),
      }

    case 'zIndex':
      return {
        zIndex: code ? value : parseInt(value, 10),
      }

    case 'color':
      if (
        /Capture/.test(parent.parent.name.value) &&
        isTag(node, 'placeholder')
      ) {
        return {
          _isProp: true,
          placeholderTextColor: value,
        }
      }

    default:
      return {
        [key]: value,
      }
  }
}

const getFontFamily = (node, parent) => {
  const fontWeight = parent.list.find(n => n.key.value === 'fontWeight')
  // const key = node.key.value
  const fontFamily = node.value.value.split(',')[0].replace(/\s/g, '')

  return fontWeight ? `${fontFamily}-${fontWeight.value.value}` : fontFamily
}

// support
// /* offset-x | offset-y | color */
// box-shadow: 60px -16px teal;
// /* offset-x | offset-y | blur-radius | color */
// box-shadow: 10px 5px 5px black;
// /* offset-x | offset-y | blur-radius | spread-radius | color */
// box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
//
// https://developer.mozilla.org/en/docs/Web/CSS/box-shadow?v=example
// prop mapping https://github.com/necolas/react-native-web/issues/44#issuecomment-269031472
const getShadow = value => {
  const [offsetX, offsetY, ...parts] = value.split(' ')

  const ret = {
    // Android
    elevation: 1,
    // iOS,
    shadowOffset: {
      height: parseInt(offsetX, 10),
      width: parseInt(offsetY, 10),
    },
  }

  let color
  if (parts.length === 1) {
    color = parts[0]
  } else if (parts.length === 2) {
    color = parts[1]
    ret.shadowRadius = parseInt(parts[0], 10)
  }

  if (color) {
    // TODO what if the color is a prop? do we calculate this on the fly, how?
    if (/props/.test(color)) {
      ret.shadowColor = color
      ret.shadowOpacity = 1
    } else {
      color = getColor(color)
      ret.shadowColor = color.string()
      ret.shadowOpacity = color.valpha
    }
  }

  return ret
}

const getBorder = (value, specific = '') => {
  const [borderWidth, borderStyle, borderColor] = value.split(' ')

  return {
    [`border${specific}Color`]: borderColor,
    /*[`border${specific}Style`]:*/ borderStyle,
    [`border${specific}Width`]: parseInt(borderWidth, 10),
  }
}

var getStyles$1 = ({ styles }) =>
  hasKeys(styles)
    ? `const styles = StyleSheet.create(${JSON.stringify(styles)})`
    : ''

var getValueForProperty$1 = (node, parent) => {
  const key = node.key.value
  const value = node.value.value

  switch (node.value.type) {
    case 'Literal':
      return {
        [key]: safe(value, node),
      }
    // TODO lists
    case 'ArrayExpression':
    // TODO support object nesting
    case 'ObjectExpression':
    default:
      return false
  }
}

const blacklist$1 = [
  'backgroundImage',
  'backgroundSize',
  'cursor',
  'overflow',
  'overflowX',
  'overflowY',
  'fontWeight',
  'onClick',
  'pageBreakInside',
  'teleportTo',
  // TODO convert to upper case...
  'textTransform',
  'goTo',
]

// TODO whitelist instead

// TODO FIXME pass props to non basic blocks
var isValidPropertyForBlock$1 = (node, parent) =>
  !blacklist$1.includes(node.key.value)
// !node.isBasic || (node.isBasic &&

var maybeUsesTextInput = state => {
  if (state.uses.includes('TextInput')) {
    state.uses.push('KeyboardAvoidingView')
    state.render = [
      `<KeyboardAvoidingView behavior='position'>`,
      ...state.render,
      `</KeyboardAvoidingView>`,
    ]
  }
}

var maybeUsesRouter$1 = state => {
  if (state.uses.includes('Router')) {
    state.render = ['<Router>', ...state.render, '</Router>']
  }
}

var maybeUsesStyleSheet$1 = state => {
  if (Object.keys(state.styles).length > 0) {
    state.uses.push('StyleSheet')
  }
}

const imports$1 = {
  Link: "import { Link } from 'react-router-native'",
  Route: "import { Route } from 'react-router-native'",
  Router: "import { NativeRouter as Router } from 'react-router-native'",
}

var reactNative$1 = ({ getImport, name, tests = false, view, views = {} }) => {
  const finalName = reactNative.includes(name) ? `${name}1` : name
  if (name !== finalName) {
    console.warn(`// "${name}" is a Views reserved name.
      We've renamed it to "${finalName}", so your view should work but this isn't ideal.
      To fix this, change its file name to something else.`)
  }

  const state = {
    captures: [],
    defaultProps: false,
    fonts: [],
    remap: {},
    render: [],
    styles: {},
    tests,
    todos: [],
    uses: [],
    use(block) {
      if (
        state.uses.includes(block) ||
        /props/.test(block) ||
        block === finalName
      )
        return

      state.uses.push(block)
    },
    views,
    withRouter: false,
  }

  const _makeVisitors = makeVisitors({
    getBlockName: getBlockName$1,
    getStyleForProperty: getStyleForProperty$1,
    getValueForProperty: getValueForProperty$1,
    isValidPropertyForBlock: isValidPropertyForBlock$1,
    PropertiesStyleLeave: leave$2,
  }),
    {
      BlockDefaultProps,
      BlockExplicitChildren,
      BlockName,
      BlockRoute,
      BlockWhen,
    } = _makeVisitors,
    visitors = objectWithoutProperties(_makeVisitors, [
      'BlockDefaultProps',
      'BlockExplicitChildren',
      'BlockName',
      'BlockRoute',
      'BlockWhen',
    ])

  visitors.Block = {
    // TODO Capture*
    // TODO FlatList
    enter(node, parent, state) {
      ;[
        BlockWhen.enter,
        BlockRoute.enter,
        enter$4,
        BlockName.enter,
        enter$3,
        enter$2,
        BlockDefaultProps.enter,
      ].forEach(fn => fn.call(this, node, parent, state))
    },
    leave(node, parent, state) {
      ;[
        BlockExplicitChildren.leave,
        BlockName.leave,
        leave$1,
        BlockRoute.leave,
        BlockWhen.leave,
      ].forEach(fn => fn.call(this, node, parent, state))
    },
  }

  morph$1(view, state, visitors)

  maybeUsesTextInput(state)
  maybeUsesRouter$1(state)
  maybeUsesStyleSheet$1(state)

  const finalGetImport = name => imports$1[name] || getImport(name)

  return toComponent({
    getImport: finalGetImport,
    getStyles: getStyles$1,
    name: finalName,
    state,
  })
}

var tests = ({ view }) => {
  // because the walker mutates the AST, we need to get a new one each time
  // get the names first
  const names = parse(view).views.map((view, index) => {
    let name

    walk(view, {
      enter(node, parent) {
        if (node.type === 'Block') {
          name = node.is || `Test${index}`
        }
      },
    })

    return name
  })

  // then the tests
  const tests = parse(view).views.map((view, index) => {
    const test = {}
    let name

    walk(view, {
      enter(node, parent) {
        if (node.type === 'Block') {
          name = node.is || `Test${index}`
        } else if (node.type === 'Property') {
          test[node.key.value] = getValue$3(node, names)

          if (
            node.value.type === 'ArrayExpression' ||
            node.value.type === 'ObjectExpression'
          )
            this.skip()
        }
      },
    })

    return {
      name,
      test,
    }
  })

  const body = tests
    .map(({ name, test }, index) => {
      // every test after the first one inherits the first one
      const data = index > 0 ? _extends({}, tests[0].test, test) : test

      return `const ${name} = ${JSON.stringify(data)}`
    })
    .join('\n')

  return `export default display => {
    ${body.replace(/"?<<DISPLAY>>"?/g, '')}
    return { _main: '${names[0]}', ${names.join(',')} }
  }`
}

// TODO embed data
// Test
// name Dario
// addresses
// from addresses.data
const getValue$3 = (property, tests) => {
  switch (property.value.type) {
    case 'Literal':
      const v = property.value.value
      return tests.includes(v)
        ? `<<DISPLAY>>() => display(${v}, '${v}')<<DISPLAY>>`
        : v

    case 'ArrayExpression':
      return property.value.elements.map(v => getValue$3(v, tests))

    case 'ObjectExpression':
      let value = {}

      property.value.properties.forEach(pr => {
        value[pr.key.value] = getValue$3(pr, tests)
      })

      return value

    default:
      return null
  }
}

var doMorph = {
  data,
  'react-dom': reactDom,
  'react-native': reactNative$1,
  tests,
}

const data$1 = (name, warning) =>
  `const ${toCamelCase(name)} = () => { console.warn("${warning}"); return {} }`

const reactDom$2 = (name, warning) =>
  `const ${name} = () => { console.warn("${warning}"); return <div>${name} 👻</div> }`

const reactNative$3 = (name, warning) =>
  `const ${name} = () => { console.warn("${warning}"); return <Text>${name} 👻</Text> }`

var doGetViewNotFound = {
  data: data$1,
  'react-dom': reactDom$2,
  'react-native': reactNative$3,
}

var restrictedNames = {
  data: [],
  'react-dom': reactNative,
  'react-native': reactNative,
  tests: [],
}

const DEFAULT_IMPORT = name =>
  /\.data$/.test(name)
    ? `import ${toCamelCase(name)} from './${name}.js'`
    : `import ${name} from './${name}.view.js'`

const morph = (
  code,
  {
    as,
    compile,
    file = {},
    getImport = DEFAULT_IMPORT,
    inlineStyles,
    name,
    pretty = false,
    tests,
    views = {},
  }
) => {
  let morphed = doMorph[as]({
    file,
    getImport,
    inlineStyles,
    name,
    view: code,
    tests,
    views,
  })

  if (compile) {
    morphed = buble.transform(morphed, {
      objectAssign: 'Object.assign',
      transforms: {
        modules: false,
      },
    }).code
  }

  return pretty
    ? prettier.format(morphed, {
        singleQuote: true,
        trailingComma: 'es5',
      })
    : morphed
}

const getViewNotFound = (as, name, warning) =>
  doGetViewNotFound[as](name, warning)

const sanitize = input =>
  path
    .basename(input)
    .replace(path.extname(input), '')
    .replace(/[^a-zA-Z_$0-9]+/g, '_')
    .replace(/^_/, '')
    .replace(/_$/, '')
    .replace(/^(\d)/, '_$1')

const pathToName = path$$1 =>
  toPascalCase(sanitize(path.basename(path$$1).replace('.view', '')))

const isViewNameRestricted = (view, as) => restrictedNames[as].includes(view)

exports.morph = morph
exports.getViewNotFound = getViewNotFound
exports.pathToName = pathToName
exports.isViewNameRestricted = isViewNameRestricted
