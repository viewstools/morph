let fs = require('mz/fs')
let morphSvgToView = require('./svg-to-view.js')
let path = require('path')
let toPascalCase = require('to-pascal-case')

module.exports = async svgFile => {
  let content = await fs.readFile(svgFile, 'utf-8')
  let svg = await morphSvgToView(content)
  let name = toPascalCase(path.basename(svgFile, '.svg'))
  return `${name} ${svg}`
}
