import * as visitor from './react-dom/block.js'
import getStyleForProperty from './react-dom/get-style-for-property.js'
import getStyles from './react-dom/get-styles.js'
import getValueForProperty from './react-dom/get-value-for-property.js'
import getViewRelativeToView from '../get-view-relative-to-view.js'
import makeGetImport from './react/make-get-import.js'
import restrictedNames from './react-dom/restricted-names.js'
import toComponent from './react/to-component.js'
import walk from './walk.js'

let imports = {
  ViewsModalOverlay:
    "import { DialogOverlay as ViewsModalOverlay, DialogContent as ViewsModalOverlayContent } from '@reach/dialog'",
}

export default ({
  getFontImport,
  getSystemImport,
  local,
  localSupported,
  track,
  tools,
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
    data: view.parsed.view.data,
    dataFormat: view.parsed.view.dataFormat,
    dataValidate: view.parsed.view.dataValidate,
    dependencies: new Set(),
    flow: null,
    setFlowTo: false,
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

      return viewInView && !viewInView.custom && viewInView.parsed.view.isStory
    },
    lazy: {},
    local,
    locals: {},
    localSupported: [],
    name: finalName,
    pathToStory: view.parsed.view.pathToStory,
    render: [],
    styles: {},
    stylesOrder: [],
    usedBlockNames: { [finalName]: 1, AutoSizer: 1, Column: 1, Table: 1 },
    uses: [],
    testIdKey: 'data-testid',
    viewPathKey: 'data-view-path',
    testIds: {},
    tools,
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
        'ViewsModalOverlayContent' === block ||
        block === finalName
      )
        return

      state.uses.push(block)
    },
    useIsBefore: view.parsed.view.useIsBefore,
    useIsMedia: view.parsed.view.useIsMedia,
  }

  // TIP: use the following code to trace generated code
  // let _push = state.render.push.bind(state.render)
  // state.render.push = item => {
  //   _push(item)
  //   if (item.includes("Some <isHovered")) {
  //     console.trace()
  //   }
  // }

  if (state.data) {
    state.use('ViewsUseData')
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
