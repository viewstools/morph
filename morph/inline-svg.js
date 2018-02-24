const fs = require('mz/fs')
const morphSvgToView = require('./svg-to-view.js')

const slotNames = ['width', 'height', 'fill', 'stroke']

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

// if there are duplicate properties, expose them as fill2, fill3, width2, width3 etc
const checkDuplicates = result => {
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
  const result = await morphSvgToView(content)

  return checkDuplicates(checkDimensions(result))
}
