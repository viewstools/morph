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

const addDimensions = result => {
  // look between first Svg and second Svg
  // if width and height exists do nothing
  // otherwise get them from viewbox
  // add width and height lines
  // and return new result
  debugger

  const substring = result.split(/Svg/)[1]
  const viewboxZero = result.split(/viewBox /)[1]

  const viewbox = substring.split(/viewBox /)[1]
  if (!substring.includes('width')) {
    const width = viewbox.split(' ')[2]
    result = `${result.substring(
      0,
      result.lastIndexOf(viewboxZero.split('\n')[1])
    )}width < ${width}\n${result.substring(
      result.lastIndexOf(viewboxZero.split('\n')[1])
    )}`
  }

  if (!substring.includes('height')) {
    const height = viewbox.split(' ')[3]
    result = `${result.substring(
      0,
      result.lastIndexOf(viewboxZero.split('\n')[1])
    )}height < ${height}\n${result.substring(
      result.lastIndexOf(viewboxZero.split('\n')[1])
    )}`
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

  result = addDimensions(result)

  return result
}
