const { html2json } = require('html2json')
const flatten = require('flatten')
const SvgOptimiser = require('svgo')
const toCamelCase = require('to-camel-case')
const toPascalCase = require('to-pascal-case')

const svgCustomStyles = [
  'alignSelf < auto',
  'marginTop < 0',
  'marginBottom < 0',
  'marginLeft < 0',
  'marginRight < 0',
]

const slotNames = ['fill', 'stroke']

const addSlots = (prop, value) => {
  const match = slotNames.some(name => prop === name)
  value = match ? `< ${value}` : value

  return value
}

const parseTransform = (prop, value) => {
  const transforms = value.split(/\s(?=[a-z])/)
  return transforms
    .map((transform, i) => {
      const name = transform.split('(')[0]
      const values = transform.match(/\(([^)]+)\)/)[1].split(/\s+|,/)
      const axes = ['X', 'Y', 'Z']
      return values
        .map((val, j) => {
          const lastItem =
            j === values.length - 1 && i === transforms.length - 1
          return lastItem
            ? `${name}${axes[j]} ${val}`
            : `${name}${axes[j]} ${val}\n`
        })
        .join('')
    })
    .join('')
}

const IGNORE_ATTRS = ['xmlns', 'id', 'class', 'onclick', 'aria-label']

const getAttrs = (attr, tag) =>
  Object.keys(attr)
    .filter(a => !IGNORE_ATTRS.includes(a))
    .map(prop => {
      let value = attr[prop]
      if (Array.isArray(value)) {
        value = value.join(' ')
      }
      if (prop === 'transform' && tag !== 'g') {
        return `${parseTransform(prop, value)}`
      }
      return `${toCamelCase(prop)} ${addSlots(prop, value)}`
    })

const getBlock = raw => {
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

const IGNORE_TAGS = [
  'clippath',
  'defs',
  'desc',
  'filter',
  'script',
  'style',
  'title',
  'use',
]

const parseSvg = ({ attr, child, tag }) => {
  const s = []

  if (!tag || IGNORE_TAGS.includes(tag.toLowerCase())) return false

  s.push(getBlock(tag))
  if (tag === 'svg') {
    s.push(svgCustomStyles)
  }
  if (attr) {
    let attrs = getAttrs(attr, tag)
    if (attr.viewBox) {
      attrs = addDimensions(attrs, attr)
    }
    s.push(attrs)
  }

  if (child) {
    s.push(
      child.map(c => {
        const parsed = parseSvg(c)
        return parsed && [parsed, '']
      })
    )
  }

  return s
}

// if width or height props aren't declared, get them from the viewbox
const addDimensions = (attrs, { viewBox, width, height }) => {
  if (!width) {
    attrs.push(`width < ${viewBox[2]}`)
  }
  if (!height) {
    attrs.push(`height < ${viewBox[3]}`)
  }
  return attrs
}

const addNamedSlot = (line, name, num) =>
  `${line.split(' < ')[0]} <${name}${num} ${line.split(' < ')[1]}`

// if there are duplicate properties, expose them as fill2, fill3 etc
const checkDuplicates = result => {
  slotNames.forEach(name => {
    let count = 0
    let values = []
    result.forEach((line, index) => {
      const re = new RegExp(`${name} <`)
      if (line && re.exec(line)) {
        const value = line.split('< ')[1]
        count++

        if (count > 1 && !values.includes(value)) {
          // duplicate properties but the value doesn't already exist
          values[count] = value
          result[index] = addNamedSlot(line, name, count)
        } else if (count > 1 && values.indexOf(value) > 1) {
          // duplicate properties and value does already exist
          // but if indexOf(value) === 1 then it matches the first slot
          // and does not need to be named
          const i = values.indexOf(value)
          result[index] = addNamedSlot(line, name, i)
        } else {
          // first property
          values[count] = value
        }
      }
    })
  })

  return result
}

module.exports = async raw => {
  const svgo = new SvgOptimiser()
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

  const res = await svgo.optimize(raw)

  return checkDuplicates(
    flatten(parseSvg(html2json(res.data).child[0])).filter(
      l => typeof l === 'string'
    )
  ).join('\n')
}
