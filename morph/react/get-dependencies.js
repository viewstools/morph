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

export default ({ images, isReactNative, uses }, getImport) => {
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
  uses.sort().forEach(d => {
    if (isReactNative && NATIVE.includes(d)) {
      useNative(d)
    } else if (isReactNative && SVG.includes(d)) {
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
    } else if (d === 'glam') {
      dependencies.push(`import css from 'glam'`)
    }
  })

  // TODO we probably want to check that the file exists and do something if it
  // doesn;t, like warn the user at least?
  images.forEach(img =>
    dependencies.push(`import ${img.name} from "${img.file}"`)
  )

  if (usesSvg.length > 0) {
    const svg = usesSvg.filter(m => m !== 'Svg').join(', ')
    dependencies.push(`import Svg, { ${svg} } from 'react-native-svg'`)
  }

  if (usesNative.length > 0) {
    dependencies.push(`import { ${usesNative.join(', ')} } from 'react-native'`)
  }

  return dependencies.join('\n')
}
