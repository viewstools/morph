const fs = require('mz/fs')
const morphSvgToView = require('./svg-to-view.js')

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

module.exports = async svgFile => {
  const content = await fs.readFile(svgFile, 'utf-8')
  const result = await morphSvgToView(content)

  return checkDimensions(result)
}
