let reactDom = (name, warning) =>
  `let ${name} = () => { console.warn("${warning}"); return null; }`

let reactNative = (name, warning) =>
  `let ${name} = () => { console.warn("${warning}"); return null; }`

export default {
  'react-dom': reactDom,
  'react-native': reactNative,
}
