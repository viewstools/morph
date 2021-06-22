import * as visitor from './react-native/block.js'
import getStyleForProperty from './react-native/get-style-for-property.js'
import getStyles from './react-native/get-styles.js'
import getValueForProperty from './react-native/get-value-for-property.js'
import getViewRelativeToView from '../get-view-relative-to-view.js'
import makeGetImport from './react/make-get-import.js'
import maybeUsesTextInput from './react-native/maybe-uses-text-input.js'
import maybeUsesStyleSheet from './react-native/maybe-uses-style-sheet.js'
import restrictedNames from './react-native/restricted-names.js'
import toComponent from './react/to-component.js'
import walk from './walk.js'

let imports = {
  DismissKeyboard: `import dismissKeyboard from 'dismissKeyboard'`,
}

export default ({
  getFontImport,
  getSystemImport,
  morpher = 'react-native',
  reactNativeLibraryImport = 'react-native',
  profile = false,
  src,
  tools,
  view,
  viewsById,
  viewsToFiles,
}) => {
  let name = view.id
  let finalName = restrictedNames.includes(name) ? `${name}1` : name

  let state = {
    animations: {},
    animated: new Set(),
    images: [],
    variables: [],
    hasListItem: false,
    dependencies: new Set(),
    flow: null,
    flowHas: false,
    flowValue: false,
    setFlowTo: false,
    getFontImport: (font) => getFontImport(font, view),
    getStyleForProperty,
    getValueForProperty,
    hasRefs: false,
    isReactNative: true,
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
    profile,
    remap: {},
    render: [],
    styles: {},
    testIdKey: 'testID',
    testIdKeyAsProp: 'testID',
    viewPathKey: 'testID',
    viewPathKeyAsProp: 'testID',
    testIds: {},
    tools,
    reactNativeLibraryImport,
    usedBlockNames: { [finalName]: 1, AutoSizer: 1, Column: 1, Table: 1 },
    usedVariableNames: {},
    usedImports: {},
    usedImportNames: {
      fromViewsFormat: 1,
      fromViewsValidate: 1,
      fromViewsAggregate: 1,
    },
    designTokenVariableName: {},
    uses: [],
    use(block, isLazy = false) {
      if (isLazy) {
        state.lazy[block] = true
      }

      if (
        state.uses.includes(block) ||
        /props/.test(block) ||
        'React.Fragment' === block
      )
        return

      if (block === finalName) {
        state.name = `${view.id}${state.usedBlockNames[finalName]++}`
      }

      state.uses.push(block)
    },
    useIsBefore: view.parsed.view.useIsBefore,
    useIsMedia: view.parsed.view.useIsMedia,
    isDesignSystemRoot: view.parsed.view.isDesignSystemRoot,
  }

  // // TIP: use the following code to trace generated code
  // let _push = state.render.push.bind(state.render)
  // state.render.push = item => {
  //   _push(item)
  //   console.log(item)
  //   if (item.includes("isBefore")) {
  //     console.trace()
  //   }
  // }

  if (profile) {
    state.use('ViewsUseProfile')
  }

  state.fonts = view.parsed.fonts
  state.slots = view.parsed.slots

  walk(view.parsed.view, visitor, state)

  maybeUsesTextInput(state)
  maybeUsesStyleSheet(state)

  return {
    code: toComponent({
      getImport: makeGetImport({
        imports,
        getSystemImport,
        src,
        view,
        viewsById,
        viewsToFiles,
      }),
      getStyles,
      name: finalName,
      state,
      view,
    }),
    extraFiles: [],
    dependencies: state.dependencies,
    flow: state.flow,
    flowDefaultState: state.flowDefaultState,
    // fonts: view.parsed.fonts,
    // slots: view.parsed.slots,
  }
}
