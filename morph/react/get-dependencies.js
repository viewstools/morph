import SVG from './svg.js'

const NATIVE = [
  'Animated',
  'Image',
  'KeyboardAvoidingView',
  'FlatList',
  'ScrollView',
  'StyleSheet',
  'Text',
  'TextInput',
  'TouchableWithoutFeedback',
  'TouchableHighlight',
  'View',
]

export default (state, getImport) => {
  const usesNative = []
  const usesSvg = []

  const useNative = d => {
    if (!usesNative.includes(d)) {
      usesNative.push(d)
    }
  }
  const useSvg = d => {
    if (!usesSvg.includes(d)) {
      usesSvg.push(d)
    }
  }

  const dependencies = [`import React from 'react'`]

  state.uses.sort().forEach(d => {
    if (state.isReactNative && NATIVE.includes(d)) {
      useNative(d)
    } else if (state.isReactNative && SVG.includes(d)) {
      useSvg(
        d === 'Svg'
          ? d
          : d === 'SvgGroup'
            ? `G as SvgGroup`
            : `${d.replace('Svg', '')} as ${d}`
      )
    } else if (d.endsWith('SvgInline')) {
      dependencies.push(`import ${d} from "./${d}.view.js"`)
    } else if (d === 'Table') {
    } else if (/^[A-Z]/.test(d)) {
      dependencies.push(getImport(d))
    }
  })

  if (state.isReactNative) {
    state.getFont(state.fonts)
  } else {
    dependencies.push(getImport('ViewsBaseCss'))

    state.fonts.forEach(usedFont => {
      const font = state.getFont(usedFont)
      if (font) {
        dependencies.push(`import "${font}"`)
      }
    })
  }

  // TODO we probably want to check that the file exists and do something if it
  // doesn't, like warn the user at least?
  state.images.forEach(img =>
    dependencies.push(`import ${img.name} from "${img.file}"`)
  )

  if (state.cssDynamic || state.cssStatic) {
    dependencies.push('import { css } from "emotion"')
  }

  if (state.isAnimated) {
    const animations = [
      !state.isReactNative && 'animated',
      state.hasSpringAnimation && 'Spring',
      state.hasTimingAnimation && state.isReactNative && 'Timing',
    ].filter(Boolean)

    if (animations.length > 0) {
      dependencies.push(
        `import { ${animations.join(', ')} } from "@viewstools/animations/${
          state.isReactNative ? 'native' : 'dom'
        }"`
      )
    }
  }

  if (state.isTable && !state.isReactNative) {
    dependencies.push(
      'import { AutoSizer, Column, Table } from "react-virtualized"'
    )
  }

  if (usesSvg.length > 0) {
    const svg = usesSvg.filter(m => m !== 'Svg').join(', ')
    dependencies.push(`import Svg, { ${svg} } from 'react-native-svg'`)
  }

  if (usesNative.length > 0) {
    dependencies.push(`import { ${usesNative.join(', ')} } from 'react-native'`)
  }

  if (state.track && !state.debug) {
    dependencies.push('import PropTypes from "prop-types"')
  }

  if (Object.keys(state.locals).length > 0) {
    dependencies.push('import { Subscribe } from "unstated"')
    dependencies.push(getImport('LocalContainer'))
  }

  return dependencies
    .filter(Boolean)
    .sort()
    .join('\n')
}
