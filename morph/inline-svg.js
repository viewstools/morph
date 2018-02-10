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

module.exports = async svgFile => {
  const content = await fs.readFile(svgFile, 'utf-8')

  return (await morphSvgToView(content))
    .split('\n')
    .map(line => {
      return line === 'Svg'
        ? `Svg\n${svgCustomStyles.join('\n')}`
        : line.startsWith('width')
          ? line.replace('width', 'width < ||')
          : line.startsWith('height')
            ? line.replace('height', 'height < ||')
            : line.startsWith('fill ')
              ? line.replace('fill', 'fill < ||')
              : line.startsWith('stroke ')
                ? line.replace('stroke', 'stroke < ||')
                : line
    })
    .join('\n')
}
