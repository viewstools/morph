import * as visitor from './react-dom/block.js'
import getStyleForProperty from './react-dom/get-style-for-property.js'
import getStyles from './react-dom/get-styles.js'
import getValueForProperty from './react-dom/get-value-for-property.js'
import getViewRelativeToView from '../get-view-relative-to-view.js'
import makeGetImport from './react/make-get-import.js'
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
  getFontImport,
  getSystemImport,
  local,
  localSupported,
  track,
  view,
  viewsById,
  viewsToFiles,
}) => {
  let name = view.id
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
    flow: null,
    flowSetState: false,
    getFontImport: font => getFontImport(font, view),
    getStyleForProperty,
    getValueForProperty,
    hasRefs: false,
    images: [],
    isDynamic: false,
    isReactNative: false,
    isStory: id => {
      let viewInView = getViewRelativeToView({
        id,
        view,
        viewsById,
        viewsToFiles,
      })

      return !viewInView.custom && viewInView.parsed.view.isStory
    },
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
    useIsBefore: view.parsed.view.useIsBefore,
    useIsMedia: view.parsed.view.useIsMedia,
  }

  if (name !== finalName) {
    console.warn(
      `// ${name} is a Views reserved name. To fix this, change its file name to something else.`
    )
  }

  state.fonts = view.parsed.fonts
  state.slots = view.parsed.slots
  state.localSupported = localSupported

  walk(view.parsed.view, visitor, state)
  maybeUsesRouter(state)

  return {
    code: toComponent({
      getImport: makeGetImport({
        imports,
        getSystemImport,
        view,
        viewsById,
        viewsToFiles,
      }),
      getStyles,
      name: finalName,
      state,
    }),
    dependencies: state.dependencies,
    flow: state.flow,
    flowDefaultState: state.flowDefaultState,
    // TODO flow supported states
    // fonts: view.parsed.fonts,
    // slots: view.parsed.slots,
  }
}
