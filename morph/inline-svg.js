const fs = require('mz/fs')
const morphSvgToView = require('./svg-to-view.js')

const svgCustomStyles = [
  'alignSelf <',
  'flex <',
  'marginTop <',
  'marginBottom <',
  'marginLeft <',
  'marginRight <',
]

// refactor line replacements

const insertDimension = (result, viewbox, dimensionName, dimensionVal) =>
  `${result.substring(
    0,
    result.lastIndexOf(viewbox.split('\n')[1])
  )}${dimensionName} < ${dimensionVal}\n${result.substring(
    result.lastIndexOf(viewbox.split('\n')[1])
  )}`

// if width or height props aren't declared, get them from the viewbox
const checkDimensions = result => {
  const svgString = result.split(/Svg/)[1]
  const viewbox = result.split(/viewBox /)[1]
  const dimensions = ['width', 'height']

  dimensions.forEach((dimension, index) => {
    if (!svgString.includes(dimension)) {
      // skipping the first 2 indicies in viewbox, they're not relevant
      const dimensionVal = viewbox.split(' ')[index + 2]
      result = insertDimension(result, viewbox, dimension, dimensionVal)
    }
  })

  return result
}

// if there are duplicate fills or strokes, expose them as fill2, fill3 etc
const checkDuplicates = result => {
  const slotNames = ['fill', 'stroke']

  slotNames.forEach(name => {
    const slots = result.split(new RegExp(`${name} <`))
    debugger

    if (slots.length > 2) {
      slots.slice(2, slots.length).forEach((slot, index) => {
        result = `${result.substring(0, result.indexOf(slot))}${name}${index +
          2}${result.substring(result.indexOf(slot))}`
      })
    }
  })

  return result
}

module.exports = async svgFile => {
  const content = await fs.readFile(svgFile, 'utf-8')

  let result = (await morphSvgToView(content))
    .split('\n')
    .map(line => {
      return line === 'Svg'
        ? `Svg\n${svgCustomStyles.join('\n')}`
        : line.startsWith('width')
          ? line.replace('width', 'width <')
          : line.startsWith('height')
            ? line.replace('height', 'height <')
            : line.startsWith('fill ')
              ? line.replace('fill', 'fill <')
              : line.startsWith('stroke ')
                ? line.replace('stroke', 'stroke <')
                : line
    })
    .join('\n')

  result = checkDuplicates(checkDimensions(result))

  return result
}
