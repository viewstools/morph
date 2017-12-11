const fs = require('mz/fs')
const morphSvgToView = require('./svg-to-view.js')

const svgCustomStyles = [
  'alignSelf props.alignSelf',
  'flex props.flex',
  'margin props.margin',
  'marginTop props.marginTop',
  'marginBottom props.marginBottom',
  'marginLeft props.marginLeft',
  'marginRight props.marginRight',
]

module.exports = async svgFile => {
  const content = await fs.readFile(svgFile, 'utf-8')

  return (await morphSvgToView(content))
    .split('\n')
    .map(
      line =>
        line === 'Svg'
          ? `Svg\n${svgCustomStyles.join('\n')}`
          : line.startsWith('width')
            ? line.replace('width', 'width props.width || ')
            : line.startsWith('height')
              ? line.replace('height', 'height props.height || ')
              : line
    )
    .join('\n')
}
