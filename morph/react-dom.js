import * as visitor from './react-dom/block.js'
import getStyleForProperty from './react-dom/get-style-for-property.js'
import getStyles from './react-dom/get-styles.js'
import getValueForProperty from './react-dom/get-value-for-property.js'
import maybeUsesRouter from './react-dom/maybe-uses-router.js'
import restrictedNames from './react-dom/restricted-names.js'
import toComponent from './react/to-component.js'
import walk from './walk.js'

let imports = {
  Link: "import { Link } from 'react-router-dom'",
  Route: "import { Route } from 'react-router-dom'",
  Router: "import { BrowserRouter as Router } from 'react-router-dom'",
  ModalOverlay:
    "import { DialogOverlay as ModalOverlay, DialogContent as ModalContent } from '@reach/dialog'",
}

export default ({
  file,
  getFont = () => false,
  getImport,
  isStory = () => true,
  local,
  localSupported,
  name,
  track = true,
  views,
}) => {
  let finalName = restrictedNames.includes(name) ? `${name}1` : name
  if (name !== finalName) {
    console.warn(
      `// "${name}" is a Views reserved name.
      We've renamed it to "${finalName}", so your view should work but this isn't ideal.
      To fix this, change its file name to something else.`
    )
  }

  let state = {
    animated: new Set(),
    animations: {},
    cssDynamic: false,
    cssStatic: false,
    dependencies: new Set(),
    file,
    flow: null,
    flowSetState: false,
    getFont,
    getStyleForProperty,
    getValueForProperty,
    hasRefs: false,
    images: [],
    isDynamic: false,
    isReactNative: false,
    isStory,
    lazy: {},
    local,
    locals: {},
    localSupported: [],
    name: finalName,
    render: [],
    styles: {},
    stylesOrder: [],
    usedBlockNames: { [finalName]: 1, AutoSizer: 1, Column: 1, Table: 1 },
    uses: [],
    testIdKey: 'data-testid',
    testIds: {},
    track,
    use(block, isLazy = false) {
      if (isLazy) {
        state.lazy[block] = true
      }

      if (
        state.uses.includes(block) ||
        /props/.test(block) ||
        /^Animated/.test(block) ||
        'React.Fragment' === block ||
        'ModalContent' === block ||
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

  let parsed = views[name]
  state.fonts = parsed.fonts
  state.slots = parsed.slots
  state.localSupported = localSupported

  walk(parsed.view, visitor, state)
  maybeUsesRouter(state)

  let finalGetImport = (name, isLazy) =>
    imports[name] || getImport(name, isLazy)

  return {
    code: toComponent({
      getImport: finalGetImport,
      getStyles,
      name: finalName,
      state,
    }),
    dependencies: state.dependencies,
    flow: state.flow,
    flowDefaultState: state.flowDefaultState,
    // TODO flow supported states
    fonts: parsed.fonts,
    slots: parsed.slots,
  }
}
