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
  morpher = 'react-dom',
  src,
  tools,
  view,
  viewsById,
  viewsToFiles,
}) => {
  let name = view.id
  let finalName = restrictedNames.includes(name) ? `${name}1` : name

  let state = {
    animated: new Set(),
    animations: {},
    cssDynamic: false,
    cssStatic: false,
    dataBlocks: [],
    hasListItem: false,
    dependencies: new Set(),
    flow: null,
    setFlowTo: false,
    getFontImport: (font) => getFontImport(font, view),
    getStyleForProperty,
    getValueForProperty,
    hasRefs: false,
    images: [],
    isDynamic: false,
    isReactNative: false,
    isView: (id) => {
      let viewInView = getViewRelativeToView({
        id,
        view,
        viewsById,
        viewsToFiles,
      })

      return viewInView && !viewInView.custom && viewInView.parsed.view.isView
    },
    lazy: {},
    morpher,
    name: finalName,
    viewPath: view.parsed.view.viewPath,
    viewPathParent: view.parsed.view.viewPathParent,
    render: [],
    styles: {},
    stylesOrder: [],
    usedBlockNames: { [finalName]: 1, AutoSizer: 1, Column: 1, Table: 1 },
    usedDataNames: {},
    usedImports: {},
    usedImportNames: {
      fromViewsFormat: 1,
      fromViewsValidate: 1,
      fromViewsAggregate: 1,
    },
    uses: [],
    testIdKey: 'data-testid',
    testIdKeyAsProp: 'dataTestid',
    viewPathKey: 'data-view-path',
    viewPathKeyAsProp: 'dataViewPath',
    testIds: {},
    tools,
    use(block, isLazy = false) {
      if (isLazy) {
        state.lazy[block] = true
      }

      if (
        state.uses.includes(block) ||
        /props/.test(block) ||
        /^Animated/.test(block) ||
        'React.Fragment' === block ||
        'ViewsModalOverlayContent' === block
      )
        return

      if (block === finalName) {
        state.name = `${view.id}${state.usedBlockNames[finalName]++}`
      }

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

  if (name !== finalName) {
    console.warn(
      `// ${name} is a Views reserved name. To fix this, change its file name to something else.`
    )
  }

  state.fonts = view.parsed.fonts
  state.slots = view.parsed.slots

  walk(view.parsed.view, visitor, state)

  return {
    code: toComponent({
      getImport: makeGetImport({
        src,
        imports,
        getSystemImport,
        view,
        viewsById,
        viewsToFiles,
      }),
      getStyles,
      name: state.name,
      state,
      view,
    }),
    dependencies: state.dependencies,
    flow: state.flow,
    flowDefaultState: state.flowDefaultState,
    // TODO flow supported states
    // fonts: view.parsed.fonts,
    // slots: view.parsed.slots,
  }
}
