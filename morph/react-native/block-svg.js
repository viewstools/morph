import { getProp, hasProp } from '../utils.js'

const SVG_BLOCKS_WITH_OPACITY = [
  'SvgPath',
  'SvgCircle',
  'SvgEllipse',
  'SvgPolygon',
  'SvgPolyline',
  'SvgRect',
  'SvgText',
]

export function enter(node, parent, state) {
  if (node.name === 'Svg' && !parent) {
    state.isSvg = true
    state.svgOpacity = getProp(node, 'opacity')
  } else if (
    state.isSvg &&
    state.svgOpacity &&
    SVG_BLOCKS_WITH_OPACITY.includes(node.name)
  ) {
    if (hasProp(node, 'fill')) {
      node.properties.push({ ...state.svgOpacity, name: 'fillOpacity' })
    }

    if (hasProp(node, 'stroke')) {
      node.properties.push({ ...state.svgOpacity, name: 'strokeOpacity' })
    }
  }
}
