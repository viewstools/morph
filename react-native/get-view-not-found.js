export default (
  name,
  warning
) => `const ${name} = () => { console.warn("${warning}"); return <Text>${name} 👻</Text> }`
