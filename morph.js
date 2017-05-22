import parse from './parse/index.js'
import walk from './walk.js'

export default (code, state, visitors) => {
  const parsed = parse(code)

  walk(parsed.views[0], {
    enter(node, parent) {
      const visitor = visitors[node.type]
      if (visitor && visitor.enter)
        visitor.enter.call(this, node, parent, state)
    },
    leave(node, parent) {
      const visitor = visitors[node.type]
      if (visitor && visitor.leave)
        visitor.leave.call(this, node, parent, state)
    },
    nodeKeys: {
      Block: ['properties', 'blocks'],
    },
  })

  if (visitors['Fonts']) visitors['Fonts'](parsed.fonts, state)
  if (visitors['Todos']) visitors['Todos'](parsed.todos, state)
}
