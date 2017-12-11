const { html2json } = require('html2json')
const flatten = require('flatten')
const SvgOptimiser = require('svgo')
const toCamelCase = require('to-camel-case')
const toPascalCase = require('to-pascal-case')

const getAttrs = attr =>
  Object.keys(attr)
    .filter(a => a !== 'xmlns')
    .map(prop => {
      let value = attr[prop]
      if (Array.isArray(value)) {
        value = value.join(' ')
      }
      return `${toCamelCase(prop)} ${value}`
    })

const getBlock = raw => {
  switch (raw) {
    case 'svg':
      return 'Svg'

    case 'g':
      return 'SvgGroup'

    default:
      return `Svg${toPascalCase(raw)}`
  }
}

const IGNORE = ['title', 'desc']

const parseSvg = ({ attr, child, tag }) => {
  const s = []

  if (!tag || IGNORE.includes(tag.toLowerCase())) return false

  s.push(getBlock(tag))
  if (attr) {
    const attrs = getAttrs(attr)
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

module.exports = async raw => {
  const svgo = new SvgOptimiser()
  // TODO revisit this hack to SVGO's plugin config :/, it's too complex
  // and undocumented to spend time going through it
  svgo.config.plugins = svgo.config.plugins.map(list =>
    list.filter(
      plugin =>
        !(plugin.name === 'removeDimensions' || plugin.name === 'removeViewBox')
    )
  )
  const res = await svgo.optimize(raw)
  return flatten(parseSvg(html2json(res.data).child[0]))
    .filter(Boolean)
    .join('\n')
}
