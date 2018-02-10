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
// if there duplicate fills or strokes they should be exposed as fill2, fill3 etc
// if no width/height is supplied get them from viewbox

const insertDimension = (result, viewbox, dimensionName, dimensionVal) =>
  `${result.substring(
    0,
    result.lastIndexOf(viewbox.split('\n')[1])
  )}${dimensionName} < ${dimensionVal}\n${result.substring(
    result.lastIndexOf(viewbox.split('\n')[1])
  )}`

const checkDimensions = result => {
  const svgString = result.split(/Svg/)[1]
  const viewbox = result.split(/viewBox /)[1]

  if (!svgString.includes('width')) {
    const widthVal = viewbox.split(' ')[2]
    result = insertDimension(result, viewbox, 'width', widthVal)
  }

  if (!svgString.includes('height')) {
    const heightVal = viewbox.split(' ')[3]
    result = insertDimension(result, viewbox, 'height', heightVal)
  }

  return result
}

module.exports = async svgFile => {
  const content = await fs.readFile(svgFile, 'utf-8')
  debugger

  const morphedSvg = (await morphSvgToView(content)).split('\n')

  let result = morphedSvg
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

  return result
}
