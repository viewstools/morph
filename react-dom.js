import { ACTION, TELEPORT } from './types.js'
import morphBlock from './react-dom/morph-block.js'
import toJson from './to-json.js'

export default ({ getImport, name, view }) => {
  // TODO try without toJson, maybe using a buble like approach with the AST and magicstring
  // TODO sourcemaps
  const block = toJson({ code: view }).views[0].json
  const code = []
  const gen = morphBlock(block, { index: 0 })

  let next
  while (!(next = gen.next()).done) {
    code.push(next.value)
  }

  let usesAction = false
  let usesTeleport = false
  const uses = next.value.uses.sort().filter(d => {
    switch (d) {
      case 'ViewsAction':
        usesAction = true
        break
      case 'ViewsTeleport':
        usesTeleport = true
        break
      default:
        return true
    }
  })

  const dependencies = uses.map(getImport)
  if (usesAction) dependencies.push(getImport(ACTION))
  if (usesTeleport) dependencies.push(getImport(TELEPORT))

  return `import React from 'react'
${dependencies.join('\n')}
const ${name} = props => (
  ${code.join('')}
)
export default ${name}`
}
