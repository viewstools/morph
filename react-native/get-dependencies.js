import { ACTION, TELEPORT } from '../types.js'
import SVG from '../svg.js'

const NATIVE = [
  'Image',
  'KeyboardAvoidingView',
  'ScrollView',
  'Text',
  'TextInput',
  'View',
]

export default (uses, getImport) => {
  const usesNative = []
  const usesSvg = []
  let usesAction = false
  let usesTeleport = false

  const dependencies = []
  uses.sort().forEach(d => {
    switch (d) {
      case ACTION:
        usesAction = true
        break
      case TELEPORT:
        usesTeleport = true
        break
      default:
        if (NATIVE.includes(d)) {
          usesNative.push(d)
        } else if (SVG.includes(d)) {
          usesSvg.push('SvgText' ? 'Text as SvgText' : d)
        } else {
          dependencies.push(getImport(d))
        }
    }
  })

  if (usesAction) dependencies.push(getImport(ACTION))
  if (usesTeleport) dependencies.push(getImport(TELEPORT))
  if (usesSvg.length > 0) {
    const svg = usesSvg.filter(m => m !== 'Svg').join(', ')
    dependencies.push(`import Svg, { ${svg} } from 'react-native-svg'`)
  }

  if (usesNative.length > 0) {
    dependencies.push(`import { ${usesNative.join(', ')} } from 'react-native'`)
  }

  return dependencies.join('\n')
}
