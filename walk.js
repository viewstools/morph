// source https://github.com/Rich-Harris/estree-walker
// with added nodeKeys to be able to define the order in which groups of properties will be called
export default function walk(ast, { enter, leave, nodeKeys }) {
  childKeys = Object.assign({}, nodeKeys)
  visit(ast, null, enter, leave)
}

const context = {
  skip: () => (context.shouldSkip = true),
  shouldSkip: false,
}

let childKeys = {}

const toString = Object.prototype.toString

function isArray(thing) {
  return toString.call(thing) === '[object Array]'
}

function visit(node, parent, enter, leave, prop, index) {
  if (!node) return

  if (enter) {
    context.shouldSkip = false
    enter.call(context, node, parent, prop, index)
    if (context.shouldSkip) return
  }

  const keys =
    childKeys[node.type] ||
    (childKeys[node.type] = Object.keys(node).filter(
      key => typeof node[key] === 'object'
    ))

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i]
    const value = node[key]

    if (isArray(value)) {
      for (let j = 0; j < value.length; j += 1) {
        // allow you to walk up the tree
        node.parent = parent
        visit(value[j], node, enter, leave, key, j)
      }
    } else if (value && value.type) {
      // allow you to walk up the tree
      node.parent = parent
      visit(value, node, enter, leave, key, null)
    }
  }

  if (leave) {
    leave(node, parent, prop, index)
  }
}
