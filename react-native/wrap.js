import SVG from '../svg.js'

const indent = (string, spaces = 2) => (
  string.replace(/^(?!$)/mg, new Array(spaces + 1).join(' '))
)

const NATIVE = [
  'Image',
  'KeyboardAvoidingView',
  'ScrollView',
  'Text',
  'TextInput',
  'View',
]

export default ({ captures, name, code, uses }) => {
  let dependencies = ''

  if (uses.includes('TextInput')) {
    uses.push('KeyboardAvoidingView')
    code = `<KeyboardAvoidingView behavior='position'>${code}</KeyboardAvoidingView>`
  }

  if (uses.length > 0) {
    const blocksDeps = []
    const nativeDeps = []
    let svgDeps = []

    dependencies = '\n'

    uses.forEach(m => {
      if (NATIVE.includes(m)) {
        nativeDeps.push(m)
      } else if (SVG.includes(m)) {
        svgDeps.push(m)
      } else {
        blocksDeps.push(`import ${m} from './${m}.js'`)
      }
    })

    if (svgDeps.length > 0) {
      svgDeps = svgDeps.filter(m => m !== 'Svg').map(m => m === 'SvgText'? 'Text as SvgText' : m)
      dependencies += `import Svg, { ${svgDeps.join(', ')} } from 'react-native-svg'\n`
    }

    if (nativeDeps.length > 0) {
      dependencies += `import { ${nativeDeps.join(', ')} } from 'react-native'\n`
    }

    if (blocksDeps.length > 0) {
      dependencies += blocksDeps.join('\n')
    }
  }

  return (
`import React from 'react'${dependencies}

export default class ${name} extends React.Component {
  ${captures.length > 0? 'state = {}' : ''}

  render() {
    const { ${captures.length > 0? 'state, ' : ''}props } = this

    return (
${indent(code, 6)}
    )
  }
}`)
}
