import wrap from '../react/wrap.js'
import { getProp, getVariableName, isScrollView } from '../utils'

export function enter(node, parent, state) {
  if (!isScrollView(node)) return

  let scrollToEnd = getProp(node, 'scrollToEnd')
  if (scrollToEnd) {
    let variableName = getVariableName('scrollViewRef', state)
    state.variables.push(`let ${variableName} = React.useRef()`)
    state.render.push(` ref=${wrap(variableName)}`)
    state.render.push(
      ` onContentSizeChange={() => ${variableName}.current.scrollToEnd({ animated: true })}`
    )
  }
}
