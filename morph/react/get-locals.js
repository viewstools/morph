export default ({ locals }) =>
  `\n${Object.keys(locals)
    .map(k => `const ${k} = ${JSON.stringify(locals[k], null, ' ')}`)
    .join('\n')}`
