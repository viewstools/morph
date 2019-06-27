import SVG from './svg.js'

let NATIVE = [
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

let sortAlphabetically = (a, b) => {
  return a === b ? 0 : a < b ? -1 : 1
}

let importsFirst = (a, b) => {
  let aIsImport = a.startsWith('import')
  let bIsImport = b.startsWith('import')

  if ((aIsImport && bIsImport) || (!aIsImport && !bIsImport))
    return sortAlphabetically(a, b)

  if (aIsImport) return -1
  if (bIsImport) return 1
}

export default (state, getImport) => {
  let usesNative = []
  let usesSvg = []

  let useNative = d => {
    if (!usesNative.includes(d)) {
      usesNative.push(d)
    }
  }
  let useSvg = d => {
    if (!usesSvg.includes(d)) {
      usesSvg.push(d)
    }
  }

  let dependencies = [`import React from 'react'`]

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
    } else if (d === 'Table') {
    } else if (/^[A-Z]/.test(d)) {
      dependencies.push(getImport(d, state.lazy[d]))
    }
  })

  if (state.isReactNative) {
    // TODO fonts in RN
    // state.getFont(state.fonts)
  } else {
    state.fonts.forEach(usedFont =>
      dependencies.push(state.getFontImport(usedFont.id))
    )
  }

  // TODO we probably want to check that the file exists and do something if it
  // doesn't, like warn the user at least?
  state.images.forEach(img =>
    dependencies.push(`import ${img.name} from "${img.file}"`)
  )

  if (state.cssDynamic || state.cssStatic) {
    dependencies.push('import { css } from "emotion"')
    state.dependencies.add('emotion')
  }

  if (state.isAnimated) {
    let animations = [
      'animated',
      (state.hasSpringAnimation ||
        (state.hasTimingAnimation && state.isReactNative)) &&
        'useSpring',
    ].filter(Boolean)

    if (animations.length > 0) {
      dependencies.push(
        `import { ${animations.join(', ')} } from "react-spring"`
      )

      state.dependencies.add('react-spring')

      if (state.hasTimingAnimation && state.isReactNative) {
        dependencies.push(`import * as Easing from 'd3-ease'`)
        state.dependencies.add('d3-ease')
      }
    }
  }

  if (state.isReactNative) {
    for (let component of state.animated) {
      dependencies.push(`let Animated${component} = animated(${component})`)
    }
  }

  if (state.isTable) {
    dependencies.push(
      `import { AutoSizer, Column, Table } from "@viewstools/tables/${
        state.isReactNative ? 'native' : 'dom'
      }"`
    )
    state.dependencies.add('@viewstools/tables')
  }

  if (usesSvg.length > 0) {
    let svg = usesSvg.filter(m => m !== 'Svg').join(', ')
    dependencies.push(`import Svg, { ${svg} } from 'react-native-svg'`)
  }

  if (usesNative.length > 0) {
    dependencies.push(`import { ${usesNative.join(', ')} } from 'react-native'`)
  }

  if (state.track) {
    dependencies.push(getImport('TrackContext'))
  }

  if (state.useIsBefore) {
    dependencies.push(getImport('ViewsUseIsBefore'))
  }

  if (state.useIsMedia) {
    dependencies.push(getImport('ViewsUseIsMedia'))
  }

  if (Object.keys(state.locals).length > 0) {
    dependencies.push('import { Subscribe } from "unstated"')
    dependencies.push(getImport('LocalContainer'))
    state.dependencies.add('unstated')
  }

  return dependencies
    .filter(Boolean)
    .sort(importsFirst)
    .join('\n')
}
