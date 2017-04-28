import morphBlock from './react-native/morph-block.js'
import SVG from './svg.js'
import toJson from './to-json.js'
import wrap from './react-native/wrap.js'

// TODO fix like react-dom
const toReactNative = (block, { custom = [], name } = {}) => {
  const code = []
  const gen = morphBlock(block, { custom: SVG.concat(custom), indent: '', index: 0 })

  let next
  while (!(next = gen.next()).done) {
    code.push(next.value)
  }

  const captures = next.value.captures
  const uses = next.value.uses.sort()

  return wrap({
    captures,
    name,
    code: code.join('').replace(/\n$/, ''),
    uses,
  })
}

export default ({ custom, name, view:code }) => {
  const asJson = toJson({ code })
  return toReactNative(asJson.views[0].json, { custom, name })
}
