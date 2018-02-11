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

const addSubstring = (result, indexOf, newSubstring) =>
  `${result.substring(
    0,
    result.lastIndexOf(indexOf)
  )}${newSubstring}${result.substring(result.lastIndexOf(indexOf))}`

// if width or height props aren't declared, get them from the viewbox
const checkDimensions = result => {
  const dimensions = ['width', 'height']
  const svgString = result.split(/Svg/)[1]
  const viewbox = result.split(/viewBox /)

  if (viewbox[1]) {
    dimensions.forEach((dimension, index) => {
      if (!svgString.includes(dimension)) {
        // skipping the first 2 indicies in viewbox, they're not relevant
        const dimensionVal = viewbox[1].split(' ')[index + 2]
        result = addSubstring(
          result,
          viewbox[1].split('\n')[1],
          `${dimension} < ${dimensionVal}\n`
        )
      }
    })
  }

  return result
}

// if there are duplicate fills or strokes, expose them as fill2, fill3 etc
const checkDuplicates = result => {
  const slotNames = ['fill', 'stroke']

  slotNames.forEach(name => {
    const slots = result.split(new RegExp(`${name} <`))

    // item at first index will be the content before the first match
    // so there will need to be at least 3 items in the array
    // to necessitate renaming slots
    if (slots.length > 2) {
      slots.slice(2, slots.length).forEach((slot, index) => {
        result = addSubstring(result, slot, `${name}${index + 2}`)
      })
    }
  })

  return result
}

module.exports = async svgFile => {
  const content = await fs.readFile(svgFile, 'utf-8')

  // refactor line replacements ?
  const result = (await morphSvgToView(content))
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

  return checkDuplicates(checkDimensions(result))
}
