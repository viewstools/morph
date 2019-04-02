let { html2json } = require('html2json')
let flatten = require('flatten')
let SvgOptimiser = require('svgo')
let toCamelCase = require('to-camel-case')
let toPascalCase = require('to-pascal-case')

let svgCustomStyles = [
  '  alignSelf < auto',
  '  marginTop < 0',
  '  marginBottom < 0',
  '  marginLeft < 0',
  '  marginRight < 0',
  '  opacity < 1',
]

let slotNames = ['fill', 'stroke']

let addSlots = (prop, value) => {
  let match = slotNames.some(name => prop === name)
  value = match ? `< ${value}` : value

  return value
}

let TRANSFORM_AXES = ['X', 'Y', 'Z']
let parseTransform = value =>
  value.split(/\s(?=[a-z])/).map(transform => {
    let name = transform.split('(')[0]
    let values = transform.match(/\(([^)]+)\)/)[1].split(/\s+|,/)
    return values.map((val, j) => `${name}${TRANSFORM_AXES[j]} ${val}`)
  })

let IGNORE_ATTRS = [
  'xmlns',
  'id',
  'class',
  'onclick',
  'aria-label',
  'style',
  'baseProfile',
]

let getAttrs = (attr, tag) =>
  Object.keys(attr)
    .filter(a => !IGNORE_ATTRS.includes(a))
    .map(prop => {
      let value = attr[prop]
      if (Array.isArray(value)) {
        value = value.join(' ')
      }
      if (prop === 'transform' && tag !== 'g') {
        return parseTransform(value)
      }
      return `${toCamelCase(prop)} ${addSlots(prop, value)}`
    })

let getBlock = raw => {
  switch (raw) {
    case 'svg':
      return 'Svg'

    case 'g':
      return 'SvgGroup'

    case 'lineargradient':
      return 'SvgLinearGradient'

    case 'radialgradient':
      return 'SvgRadialGradient'

    default:
      return `Svg${toPascalCase(raw)}`
  }
}

let IGNORE_TAGS = [
  'clippath',
  'defs',
  'desc',
  'filter',
  'script',
  'style',
  'title',
  'use',
]

let indent = level => new Array(Math.max(level, 0)).fill('  ').join('')

let parseSvg = ({ attr, child, tag }, level = 0) => {
  if (!tag || IGNORE_TAGS.includes(tag.toLowerCase())) return false

  let s = []
  let nextLevel = level + 1

  s.push(`${indent(level)}${getBlock(tag)}`)

  if (tag === 'svg') {
    s.push(svgCustomStyles)
  }

  if (attr) {
    let attrs = getAttrs(attr, tag)

    if (attr.viewBox) {
      attrs = addDimensions(attrs, attr)
    }
    if (tag === 'svg') {
      ensureWidthAndHeightAsOpenSlots(attrs)
    }

    s.push(flatten(attrs).map(a => `${indent(nextLevel)}${a}`))
  }

  if (child) {
    s.push(child.map(c => parseSvg(c, nextLevel)))
  }

  return s
}

// if width or height props aren't declared, get them from the viewbox
let addDimensions = (attrs, { viewBox, width, height }) => {
  if (!width) {
    attrs.push(`width < ${viewBox[2]}`)
  }
  if (!height) {
    attrs.push(`height < ${viewBox[3]}`)
  }
  return attrs
}

let ensureSlot = (attrs, prop, defaultValue) => {
  let slotRe = new RegExp(`${prop} <`)

  if (!attrs.some(item => slotRe.test(item))) {
    let staticPropIndex = attrs.findIndex(item => item.startsWith(prop))
    if (staticPropIndex !== -1) {
      attrs[staticPropIndex] = attrs[staticPropIndex].replace(prop, `${prop} <`)
    } else {
      attrs.push(`${prop} < ${defaultValue}`)
    }
  }
}

let ensureWidthAndHeightAsOpenSlots = attrs => {
  ensureSlot(attrs, 'width', 50)
  ensureSlot(attrs, 'height', 50)
}

let addNamedSlot = (line, name, num) => {
  let [slotName, slotValue] = line.split(' < ')
  return `${slotName} <${name}${num} ${slotValue}`
}

// if there are duplicate properties, expose them as fill2, fill3 etc
let fixDuplicates = result => {
  slotNames.forEach(name => {
    let count = 0
    let values = []
    result.forEach((line, index) => {
      let re = new RegExp(`${name} <`)
      if (line && re.exec(line)) {
        let value = line.split('< ')[1]
        count++

        if (count > 1 && !values.includes(value)) {
          // duplicate properties but the value doesn't already exist
          values[count] = value
          result[index] = addNamedSlot(line, name, count)
        } else if (count > 1 && values.indexOf(value) > 1) {
          // duplicate properties and value does already exist
          // but if indexOf(value) === 1 then it matches the first slot
          // and does not need to be named
          let i = values.indexOf(value)
          result[index] = addNamedSlot(line, name, i)
        } else {
          // first property
          values[count] = value
        }
      }
    })
  })
}

let isString = l => typeof l === 'string'

module.exports = async raw => {
  let svgo = new SvgOptimiser()
  // TODO revisit this hack to SVGO's plugin config :/, it's too complex
  // and undocumented to spend time going through it
  svgo.config.plugins = svgo.config.plugins
    .map(list =>
      list.filter(
        plugin =>
          !(
            plugin.name === 'removeDimensions' ||
            plugin.name === 'removeViewBox' ||
            plugin.name === 'moveElemsAttrsToGroup' ||
            plugin.name === 'convertTransform'
          )
      )
    )
    .filter(list => list.length)

  let res = await svgo.optimize(raw)
  let lines = flatten(parseSvg(html2json(res.data).child[0])).filter(isString)
  fixDuplicates(lines)
  return lines.join('\n')
}
