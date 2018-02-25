const fs = require('mz/fs')
const morphSvgToView = require('./svg-to-view.js')

module.exports = async svgFile => {
  const content = await fs.readFile(svgFile, 'utf-8')
  return await morphSvgToView(content)
}
