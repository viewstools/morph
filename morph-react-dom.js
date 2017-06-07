import {
  getObjectAsString,
  getProp,
  hasKeys,
  hasProp,
  isCode,
} from './morph-utils.js'
import {
  makeVisitors,
  safe as safeProp,
  toComponent,
  wrap,
} from './morph-react.js'
import { transform } from 'babel-core'
import isUnitlessNumber from './react-native/is-unitless-number.js'
import hash from './hash.js'
import morph from './morph.js'
import toSlugCase from 'to-slug-case'

export default ({ getImport, name, tests = false, view }) => {
  const state = {
    captures: [],
    defaultProps: false,
    fonts: [],
    remap: {},
    render: [],
    styles: {},
    todos: [],
    uses: [],
    tests,
    // data(file) {
    //   if (!state.data.includes(file)) state.data.push(file)
    // },
    use(name) {
      if (!state.uses.includes(name) && !/props/.test(name))
        state.uses.push(name)
    },
  }

  const {
    BlockDefaultProps,
    BlockExplicitChildren,
    BlockName,
    BlockRoute,
    BlockWhen,
    ...visitors
  } = makeVisitors({
    getBlockName,
    getStyleForProperty,
    getValueForProperty,
    isValidPropertyForBlock,
    PropertiesStyleLeave,
  })

  visitors.Block = {
    // TODO Capture*
    // TODO List without wrapper?
    enter(node, parent, state) {
      BlockWhen.enter.call(this, node, parent, state)
      BlockRoute.enter.call(this, node, parent, state)
      // BlockWrap.enter.call(this, node, parent, state)
      BlockName.enter.call(this, node, parent, state)
      // BlockCapture.enter.call(this, node, parent, state)
      BlockTeleport.enter.call(this, node, parent, state)
      BlockGoTo.enter.call(this, node, parent, state)
      BlockDefaultProps.enter.call(this, node, parent, state)
    },
    leave(node, parent, state) {
      BlockExplicitChildren.leave.call(this, node, parent, state)
      BlockName.leave.call(this, node, parent, state)
      // BlockWrap.leave.call(this, node, parent, state)
      BlockRoute.leave.call(this, node, parent, state)
      BlockWhen.leave.call(this, node, parent, state)
    },
  }

  morph(view, state, visitors)

  if (Object.keys(state.styles).length > 0) {
    state.uses.push('glam')
  }

  if (state.uses.includes('Router')) {
    state.render = ['<Router>', ...state.render, '</Router>']
  }

  const imports = {
    Link: "import { Link } from 'react-router-dom'",
    Route: "import { Route } from 'react-router-dom'",
    Router: "import { BrowserRouter as Router } from 'react-router-dom'",
  }

  const finalGetImport = name => imports[name] || getImport(name)

  return toComponent({ getImport: finalGetImport, getStyles, name, state })
}

const BlockGoTo = {
  enter(node, parent, state) {
    if (node.goTo) {
      const goTo = getProp(node, 'goTo')
      state.render.push(
        ` target='_blank' href=${safeProp(goTo.value.value, goTo)}`
      )
    }
  },
}

const BlockTeleport = {
  enter(node, parent, state) {
    if (node.teleport) {
      // TODO relative vs absolute
      const teleportTo = getProp(node, 'teleportTo')
      state.render.push(` to=${safeProp(teleportTo.value.value, teleportTo)}`)
    }
  },
}

// const BlockWrap = {
//   enter(node, parent, state) {
//     getBlockName(node)

//     if (node.teleport) {
//       state.use('Link')
//       const teleportTo = getProp(node, 'teleportTo')
//       state.render.push(
//         `<Link to=${safeProp(teleportTo.value.value, teleportTo)}>`
//       )
//       node.wrapEnd = '</Link>'
//     }
//   },
//   leave(node, parent, state) {
//     if (node.wrapEnd) {
//       state.render.push(node.wrapEnd)
//     }
//   },
// }

function PropertiesStyleLeave(node, parent, state) {
  if (hasKeys(node.style.static.base)) {
    const id = hash(node.style.static)
    state.styles[id] = node.style.static
    parent.styleId = id
    const isActive = getProp(parent, 'isActive')

    let className = [
      `styles.${id}`,
      isActive && `${isActive.value.value} && 'active'`,
    ].filter(Boolean)

    if (className.length > 0) {
      className = className.map(k => `\${${k}}`).join(' ')
      className = `\`${className}\``
    }

    state.render.push(` className=${wrap(className)}`)
  }
  // TODO needs to be different, it should also be a classname here too
  if (hasKeys(node.style.dynamic.base)) {
    const dynamic = getObjectAsString(node.style.dynamic.base)
    state.render.push(` style={${dynamic}}`)
  }
}

const getBlockName = node => {
  switch (node.name.value) {
    case 'CaptureEmail':
    case 'CaptureFile':
    case 'CaptureInput':
    case 'CaptureNumber':
    case 'CapturePhone':
    case 'CaptureSecure':
    case 'CaptureText':
      return 'input'

    case 'Horizontal':
    case 'Vertical':
      return getGroupBlockName(node)

    case 'Image':
      return 'img'

    case 'Text':
    case 'List':
      return 'div'

    case 'Proxy':
      return getProxyBlockName(node)
    // TODO SvgText should be just Text but the import should be determined from the parent
    // being Svg

    case 'SvgText':
      return 'text'

    default:
      return node.name.value
  }
}

const getGroupBlockName = node => {
  let name = 'div'

  if (hasProp(node, 'teleportTo')) {
    name = 'Link'
    node.teleport = true
  } else if (hasProp(node, 'goTo')) {
    name = 'a'
    node.goTo = true
  } else if (hasProp(node, 'onClick')) {
    name = 'button'
  } else if (hasProp(node, 'overflowY', v => v === 'auto' || v === 'scroll')) {
    name = 'div'
  }

  return name
}

const getProxyBlockName = node => {
  const from = getProp(node, 'from')
  return from && from.value.value
}

const getStyleForProperty = (node, parent, code) => {
  const key = node.key.value
  const value = node.value.value

  switch (key) {
    case 'backgroundImage':
      return {
        backgroundImage: code ? `\`url(\${${value}})\`` : `url("${value}")`,
        backgroundSize: 'cover',
      }

    case 'zIndex':
      return {
        zIndex: code ? value : parseInt(value, 10),
      }

    default:
      return {
        [key]: code && !/(.+)\?(.+):(.+)/.test(value) ? safe(value) : value,
      }
  }
}

const getValueForProperty = (node, parent) => {
  const key = node.key.value
  const value = node.value.value

  switch (node.value.type) {
    case 'Literal':
      return {
        [key]: typeof value === 'string' && !isCode(node)
          ? JSON.stringify(value)
          : wrap(value),
      }
    // TODO lists
    case 'ArrayExpression':
    // TODO support object nesting
    case 'ObjectExpression':
    default:
      return false
  }
}

const blacklist = ['backgroundSize', 'teleportTo', 'goTo']
const isValidPropertyForBlock = (node, parent) =>
  !blacklist.includes(node.key.value)

const getValue = (key, value) =>
  typeof value === 'number' &&
    !(isUnitlessNumber.hasOwnProperty(key) && isUnitlessNumber[key])
    ? `${value}px`
    : `${value}`

const toCss = obj =>
  Object.keys(obj)
    .map(k => `${toSlugCase(k)}: ${getValue(k, obj[k])};`)
    .join('\n')

const toNestedCss = ({
  base,
  hover,
  active,
  activeHover,
  disabled,
  placeholder,
}) => {
  const baseCss = toCss(base)
  const hoverCss = toCss(hover)
  const activeCss = toCss(active)
  const activeHoverCss = toCss(activeHover)
  const disabledCss = toCss(disabled)
  const placeholderCss = toCss(placeholder)

  const ret = [
    baseCss,
    hoverCss && `&:hover {${hoverCss}}`,
    activeCss && `&.active {${activeCss}}`,
    activeHoverCss && `&.active:hover {${activeHoverCss}}`,
    disabledCss && `&:disabled {${disabledCss}}`,
    placeholderCss && `&::placeholder {${placeholderCss}}`,
  ]
    .filter(Boolean)
    .join('\n')

  return ret
}

const getStyles = styles => {
  if (!hasKeys(styles)) return ''

  const obj = Object.keys(styles)
    .map(k => `${JSON.stringify(k)}: css\`${toNestedCss(styles[k])}\``)
    .join(',')

  return transformGlam(`const styles = {${obj}}`).code
}

const transformGlam = code =>
  transform(code, {
    babelrc: false,
    plugins: [[require.resolve('glam/babel'), { inline: true }]],
  })

const interpolateCode = s => (/props|item/.test(s) ? '${' + s + '}' : s)
const safe = s => '`' + s.split(' ').map(interpolateCode).join(' ') + '`'
