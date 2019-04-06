export default ({ locals }) =>
  `\n${Object.keys(locals)
    .map(k => `let ${k} = ${JSON.stringify(locals[k], null, ' ')}`)
    .join('\n')}`
