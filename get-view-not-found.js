import reactDom from './react-dom/get-view-not-found.js'
import reactNative from './react-native/get-view-not-found.js'
import toCamelCase from 'to-camel-case'

const data = (name, warning) =>
  `const ${toCamelCase(name)} = () => { console.warn("${warning}"); return {} }`

export default {
  data,
  'react-dom': reactDom,
  'react-native': reactNative,
}
