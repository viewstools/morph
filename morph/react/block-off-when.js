import { getProp, isList, isStory } from '../utils.js'

let IS_MEDIA = /(!?props\.isMedia)(.+)/

export function enter(node, parent, state) {
  if (node.isFragment && node.children.length === 0) return

  // onWhen lets you show/hide blocks depending on props
  let onWhen = getProp(node, 'onWhen')

  if (onWhen) {
    node.onWhen = true

    if (parent && !isList(parent)) state.render.push('{')

    let value = onWhen.value
    if (state.data) {
      switch (value) {
        case 'props.isInvalid': {
          value = 'data.isInvalid'
          break
        }

        case 'props.isValid': {
          value = 'data.isValid'
          break
        }

        case 'props.value': {
          value = 'data.value'
          break
        }
        case '!props.value': {
          value = '!data.value'
          break
        }

        default:
          break
      }
    } else if (IS_MEDIA.test(value)) {
      let [, variable, media] = value.match(IS_MEDIA)
      value = `${variable.replace('props.', '')}.${media.toLowerCase()}`
    }
    state.render.push(`${value} ? `)
  } else if (isStory(node, state)) {
    node.onWhen = true
    state.render.push(`{flow.has("${state.pathToStory}/${node.name}") ? `)
  }
}

export function leave(node, parent, state) {
  if (node.onWhen) {
    state.render.push(` : null`)
    if (parent && !isList(parent)) state.render.push('}')
  }
}
