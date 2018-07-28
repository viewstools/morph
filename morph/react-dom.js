import * as visitor from './react-dom/block.js'
import getStyleForProperty from './react-dom/get-style-for-property.js'
import getStyles from './react-dom/get-styles.js'
import getValueForProperty from './react-dom/get-value-for-property.js'
import maybeUsesRouter from './react-dom/maybe-uses-router.js'
import restrictedNames from './react-dom/restricted-names.js'
import toComponent from './react/to-component.js'
import walk from './walk.js'

const imports = {
  Link: "import { Link } from 'react-router-dom'",
  Route: "import { Route } from 'react-router-dom'",
  Router: "import { BrowserRouter as Router } from 'react-router-dom'",
}

export default ({
  debug,
  enableAnimated = true,
  file,
  getFont = () => false,
  getImport,
  local,
  localSupported,
  name,
  track = true,
  views,
}) => {
  const finalName = restrictedNames.includes(name) ? `${name}1` : name
  if (name !== finalName) {
    console.warn(
      `// "${name}" is a Views reserved name.
      We've renamed it to "${finalName}", so your view should work but this isn't ideal.
      To fix this, change its file name to something else.`
    )
  }

  const state = {
    animations: {},
    cssDynamic: false,
    cssStatic: false,
    enableAnimated,
    debug,
    file,
    getFont,
    getStyleForProperty,
    getValueForProperty,
    hasRefs: false,
    images: [],
    isDynamic: false,
    isReactNative: false,
    local,
    locals: {},
    localSupported: [],
    name: finalName,
    render: [],
    styles: {},
    svgs: [],
    usedBlockNames: { [finalName]: 1 },
    uses: [],
    testIdKey: 'data-test-id',
    testIds: {},
    track,
    use(block) {
      if (
        state.uses.includes(block) ||
        /props/.test(block) ||
        /^Animated/.test(block) ||
        block === finalName
      )
        return

      state.uses.push(block)
    },
  }

  if (name !== finalName) {
    console.warn(
      `// ${name} is a Views reserved name. To fix this, change its file name to something else.`
    )
  }

  const parsed = views[name]
  state.fonts = parsed.fonts
  state.slots = parsed.slots
  state.localSupported = localSupported

  walk(parsed.views[0], visitor, state)
  maybeUsesRouter(state)

  const finalGetImport = name => imports[name] || getImport(name)

  return {
    code: toComponent({
      getImport: finalGetImport,
      getStyles,
      name: finalName,
      state,
    }),
    fonts: parsed.fonts,
    slots: parsed.slots,
    svgs: state.svgs,
  }
}
