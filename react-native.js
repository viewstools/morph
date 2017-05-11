import getBody from './react-native/get-body.js'
import getDependencies from './react-native/get-dependencies.js'
import morphBlock from './react-native/morph-block.js'
import toJson from './to-json.js'

export default ({ getImport, name, view }) => {
  // TODO try without toJson, maybe using a buble like approach with the AST and magicstring
  // TODO sourcemaps
  const block = toJson({ code: view, name }).views[0].json
  const gen = morphBlock(block, { index: 0 })
  let code = []

  let next
  while (!(next = gen.next()).done) {
    code.push(next.value)
  }
  code = code.join('')

  const { captures, uses } = next.value

  if (uses.includes('TextInput')) {
    uses.push('KeyboardAvoidingView')
    code = `<KeyboardAvoidingView behavior='position'>${code}</KeyboardAvoidingView>`
  }

  return `import React from 'react'
${getDependencies(uses, getImport)}
${getBody({ code, captures, name })}
export default ${name}`
}
