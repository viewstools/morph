import SVG from './svg.js'

const NATIVE = [
  'Animated',
  'Image',
  'KeyboardAvoidingView',
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

  const dependencies = []
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
    } else if (/^[A-Z]/.test(d)) {
      dependencies.push(getImport(d))
    }
  })

  // TODO native
  if (!state.isReactNative) {
    dependencies.push(getImport('ViewsBaseCss'))

    state.fonts.forEach(usedFont => {
      const font = state.getFont(usedFont)
      if (font) {
        dependencies.push(`import "${font}"`)
      }
    })
  }

  // TODO we probably want to check that the file exists and do something if it
  // doesn;t, like warn the user at least?
  state.images.forEach(img =>
    dependencies.push(`import ${img.name} from "${img.file}"`)
  )

  if (state.cssDynamic && state.cssStatic) {
    dependencies.push('import styled, { css } from "react-emotion"')
  } else if (state.cssStatic) {
    dependencies.push('import { css } from "react-emotion"')
  } else if (state.cssDynamic) {
    dependencies.push('import styled from "react-emotion"')
  }

  if (usesSvg.length > 0) {
    const svg = usesSvg.filter(m => m !== 'Svg').join(', ')
    dependencies.push(`import Svg, { ${svg} } from 'react-native-svg'`)
  }

  if (usesNative.length > 0) {
    dependencies.push(`import { ${usesNative.join(', ')} } from 'react-native'`)
  }

  if (state.track) {
    dependencies.push('import PropTypes from "prop-types"')
  }

  return dependencies.join('\n')
}
