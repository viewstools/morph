export default (name, warning) =>
  `const ${name} = () => { console.warn("${warning}"); return <div>${name} 👻</div> }`
