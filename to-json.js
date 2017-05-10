import parse from './parse/index.js'

const add = (group, obj, k, v) => {
  if (!obj[group]) obj[group] = {}
  obj[group][k] = v
}

const getValue = property => {
  switch (property.value.type) {
    case 'Literal':
      if (
        property.tags &&
        property.tags.includes('code') &&
        !/^{/.test(property.value.value)
      ) {
        return `{${property.value.value}}`
      } else {
        return property.value.value
      }
      break

    case 'ArrayExpression':
      return property.value.elements.map(getValue)
      break

    case 'ObjectExpression':
      let value = {}

      property.value.properties.forEach(pr => {
        value[pr.key.value] = getValue(pr)
      })

      return value
      break

    default:
      return null
      break
  }
}

const RELEVANT_STYLE_TAGS = ['active', 'activeHover', 'hover', 'placeholder']
const findRelevantStyleTag = tags => {
  const tag = tags.find(t => RELEVANT_STYLE_TAGS.includes(t))
  return tag ? `${tag[0].toUpperCase()}${tag.slice(1)}` : ''
}

const walkBlock = (
  { blocks, captureNext, is, isBasic, name, properties },
  { isView, scope }
) => {
  const b = {}

  if (isView) {
    b.block = name.value
    b.blockIs = is ? `${scope}.${is}` : is
    b.captureNext = captureNext

    if (blocks) {
      b.blocks = blocks.elements.map(eb => walkBlock(eb, { isView, scope }))
    }
  }

  if (properties) {
    properties.properties.forEach(p => {
      const value = getValue(p)

      if (p.tags && p.tags.includes('style')) {
        const relevantTag = findRelevantStyleTag(p.tags)

        if (isView && isBasic) {
          add(`style${relevantTag}`, b, p.key.value, value)
        } else {
          b[`${p.key.value}${relevantTag}`] = value
        }
      } else {
        b[p.key.value] = value
      }
    })
  }

  return b
}

export default ({ code, isView = true, name }) => {
  const ret = parse(code)
  const views = ret.views
  delete ret.views
  const key = isView ? 'views' : 'states'

  return Object.assign({}, ret, {
    [key]: views.map(ast => ({
      ast,
      json: walkBlock(ast, { isView, scope: name }),
    })),
  })
}
