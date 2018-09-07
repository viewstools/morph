import { getProp } from '../utils.js'
import { getDoneParams } from '../utils.js'

export function enter(node, parent, state) {
  if (!node.hasTimingAnimation) return

  state.render.push(
    ` onTransitionEnd={() => {
      if (props.onAnimationDone) {
        ${getDoneParams(node, 'timing')}
      }
    }}`
  )
}
