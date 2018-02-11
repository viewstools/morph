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
  // debugger
  // const fills = result.split(/fill/)
  // if (fills.length > 2) {
  // }
  // find all instances of fill/stroke
  // if more than 1, loop over them and replace the slots with incremental names
  // push these new lines back onto the result
  // return result
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

  result = checkDimensions(result)
  //  result = checkDuplicates(result)

  return result
}
