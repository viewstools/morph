import { deinterpolate, getProp, isSlot, isInterpolation } from '../utils.js'
import wrap from '../react/wrap.js'

export let enter = (node, parent, state) => {
  node.className = node.isBasic
    ? [
        node.name === 'Text'
          ? 'views-text'
          : node.isCapture
          ? 'views-capture'
          : 'views-block',
      ]
    : []

  let className = getProp(node, 'className')
  if (className) {
    node.className.push(
      className.tags.slot ? `\${${className.value}}` : className.value
    )
  }
}

export let leave = (node, parent, state) => {
  if (node.isFragment) return

  if (node.className.length === 1) {
    let className = node.className[0]
    let shouldWrap = true

    if (isInterpolation(className)) {
      className = deinterpolate(className)
    } else if (!isSlot(className)) {
      className = `"${className}"`
      shouldWrap = false
    }

    state.render.push(` className=${shouldWrap ? wrap(className) : className}`)
  } else if (node.className.length > 1) {
    let className = `\`${node.className.join(' ')}\``
    state.render.push(` className=${wrap(className)}`)
  }
}
