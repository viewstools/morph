import SVG from './svg.js'
import { existsSync } from 'fs'
import path from 'path'

let NATIVE = [
  'Animated',
  'Image',
  'KeyboardAvoidingView',
  'SafeAreaView',
  'ScrollView',
  'StyleSheet',
  'Text',
  'TextInput',
  'TouchableWithoutFeedback',
  'TouchableHighlight',
  'View',
  'Platform',
]

let sortAlphabetically = (a, b) => {
  return a === b ? 0 : a < b ? -1 : 1
}

function filterAndSort(list) {
  return list.filter(Boolean).sort(sortAlphabetically)
}

export default (state, getImport, file) => {
  let usesNative = []
  let usesSvg = []

  let useNative = (d) => {
    if (!usesNative.includes(d)) {
      usesNative.push(d)
    }
  }
  let useSvg = (d) => {
    if (!usesSvg.includes(d)) {
      usesSvg.push(d)
    }
  }

  let dependencies = [`import React from 'react'`]
  let dependenciesLazy = []
  let dependenciesDisplayNames = []
  let dependenciesErrors = []

  state.uses.sort().forEach((d) => {
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
      let importStatement = getImport(d, state.lazy[d])

      if (importStatement.startsWith('import ')) {
        dependencies.push(importStatement)
      } else if (importStatement.startsWith('let ')) {
        dependenciesLazy.push(importStatement)
      } else {
        dependenciesErrors.push(importStatement)
      }

      if (/logic\.js'/.test(importStatement)) {
        dependenciesDisplayNames.push(`${d}.displayName = '${d}Logic'`)
      }
    } else if (d.startsWith('import ')) {
      dependencies.push(d)
    }
  })

  if (state.isReactNative) {
    // TODO fonts in RN
    // state.getFont(state.fonts)
  } else {
    state.fonts.forEach((usedFont) =>
      dependencies.push(state.getFontImport(usedFont.id))
    )
  }

  // TODO we probably want to check that the file exists and do something if it
  // doesn't, like warn the user at least?
  state.images.forEach((img) =>
    dependencies.push(`import ${img.name} from "${img.file}"`)
  )

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
    let svg = usesSvg.filter((m) => m !== 'Svg').join(', ')
    dependencies.push(`import Svg, { ${svg} } from 'react-native-svg'`)
  }

  if (usesNative.length > 0) {
    dependencies.push(
      `import { ${usesNative.join(', ')} } from '${
        state.reactNativeLibraryImport
      }'`
    )
  }

  if (state.useIsBefore) {
    dependencies.push(getImport('ViewsUseIsBefore'))
  }

  if (state.useIsHovered) {
    dependencies.push(getImport('ViewsUseIsHovered'))
  }

  if (state.useIsFocused) {
    dependencies.push(getImport('ViewsUseIsFocused'))
  }

  if (state.useIsMedia) {
    dependencies.push(getImport('ViewsUseIsMedia'))
  }

  let isUsingDataOnChange = existsSync(
    path.join(path.dirname(file), 'useListItemDataOnChange.js')
  )
  if (isUsingDataOnChange) {
    dependencies.push(
      "import useListItemDataOnChange from './useListItemDataOnChange.js'"
    )
  }
  let isUsingDataOnSubmit = existsSync(
    path.join(path.dirname(file), 'useListItemDataOnSubmit.js')
  )
  if (isUsingDataOnSubmit) {
    dependencies.push(
      "import useListItemDataOnSubmit from './useListItemDataOnSubmit.js'"
    )
  }

  return [
    ...filterAndSort(dependencies),
    ...filterAndSort(dependenciesLazy),
    ...filterAndSort(dependenciesErrors),
    ...filterAndSort(dependenciesDisplayNames),
  ].join('\n')
}
