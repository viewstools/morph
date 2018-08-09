import * as PropertyRest from './property-rest.js'
import { getProp, isColumn, isHeader, isCell } from '../utils.js'

export function enter(node, parent, state) {
  if (!isColumn(node)) return

  const dataKey = getProp(node, 'key')
  const width = getWidth(node, parent)

  state.render.push(` dataKey="${dataKey.value}" width={${width}}`)

  // const label = getLabel(node)
  // if (label) {
  //   state.render.push(`label="${label}"`)
  // }

  const header = node.children.find(isHeader)
  if (header && !header.isBasic) {
    state.render.push(
      ` headerRenderer={headerProps => <${header.name} {...headerProps} `
    )
    header.properties.forEach(propNode => {
      if (propNode.name === 'isHeader') return
      PropertyRest.enter(propNode, header, state)
    })
    state.render.push(` />}`)
  }

  const cell = node.children.find(isCell)
  if (cell && !cell.isBasic) {
    state.render.push(
      ` cellRenderer={cellProps => <${cell.name} {...cellProps} `
    )
    cell.properties.forEach(propNode => {
      if (propNode.name === 'isCell') return
      PropertyRest.enter(propNode, cell, state)
    })
    state.render.push(` />}`)
  }
}

const getWidth = (node, parent) => {
  const width = getProp(node, 'width')
  if (width && width.value !== 'auto') {
    return width.value
  }

  const columns = parent.children.filter(child => child.name === 'Column')
  const columnsWithFixedWidth = columns
    .map(node => {
      const width = getProp(node, 'width')
      return width && typeof width.value === 'number' && width.value
    })
    .filter(Boolean)

  const columnsWidthSum = columnsWithFixedWidth.reduce(
    (res, value) => res + value,
    0
  )

  return columnsWidthSum
    ? `(width - ${columnsWidthSum}) / ${columns.length -
        columnsWithFixedWidth.length}`
    : `width / ${columns.length}`
}

// const getLabel = node => {
//   const header = node.children.find(node => getProp(node, 'isHeader'))
//   if (!header) return

//   if (header.name === 'Text') {
//     // removing the text node, because the column handles the label
//     node.children.splice(node.children.indexOf(header), 1)
//   } else {
//     node.externalHeader = header
//   }

//   return getProp(header, 'text').value
// }
