const reactDom = (name, warning) =>
  `const ${name} = () => { console.warn("${warning}"); return null; }`

const reactNative = (name, warning) =>
  `const ${name} = () => { console.warn("${warning}"); return null; }`

export default {
  'react-dom': reactDom,
  'react-native': reactNative,
}
