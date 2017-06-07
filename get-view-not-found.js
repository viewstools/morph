import toCamelCase from 'to-camel-case'

const data = (name, warning) =>
  `const ${toCamelCase(name)} = () => { console.warn("${warning}"); return {} }`

const reactDom = (name, warning) =>
  `const ${name} = () => { console.warn("${warning}"); return <div>${name} 👻</div> }`

const reactNative = (name, warning) =>
  `const ${name} = () => { console.warn("${warning}"); return <Text>${name} 👻</Text> }`

export default {
  data,
  'react-dom': reactDom,
  'react-native': reactNative,
}
