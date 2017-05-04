export default (name, warning) =>
  `import { View } from 'react-native'
  const ${name} = () => { console.warn("${warning}"); return <View>${name} 👻</View> }`
