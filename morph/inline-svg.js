const fs = require('mz/fs')
const morphSvgToView = require('./svg-to-view.js')
const path = require('path')
const toPascalCase = require('to-pascal-case')

module.exports = async svgFile => {
  const content = await fs.readFile(svgFile, 'utf-8')
  const svg = await morphSvgToView(content)
  const name = toPascalCase(path.basename(svgFile, '.svg'))
  return `${name} ${svg}`
}
