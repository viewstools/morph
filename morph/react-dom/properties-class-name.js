import { deinterpolate, getProp, isCode, isInterpolation } from '../utils.js'
import wrap from '../react/wrap.js'

export const enter = (node, parent, state) => {
  node.className = ['views-block']

  const className = getProp(node, 'className')
  if (className) {
    node.className.push(
      className.tags.code ? `\${${className.value}}` : className.value
    )
  }

  if (state.debug && node.isCapture) {
    node.className.push('mousetrap')
  }
}

export const leave = (node, parent, state) => {
  if (node.className.length === 1) {
    let className = node.className[0]
    let shouldWrap = true

    if (isInterpolation(className)) {
      className = deinterpolate(className)
    } else if (!isCode(className)) {
      className = `"${className}"`
      shouldWrap = false
    }

    state.render.push(` className=${shouldWrap ? wrap(className) : className}`)
  } else if (node.className.length > 1) {
    const className = `\`${node.className.join(' ')}\``
    state.render.push(` className=${wrap(className)}`)
  }
}
