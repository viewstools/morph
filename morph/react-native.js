import * as visitor from './react-native/block.js'
import getStyleForProperty from './react-native/get-style-for-property.js'
import getStyles from './react-native/get-styles.js'
import getValueForProperty from './react-native/get-value-for-property.js'
import maybeUsesTextInput from './react-native/maybe-uses-text-input.js'
import maybeUsesRouter from './react-native/maybe-uses-router.js'
import maybeUsesStyleSheet from './react-native/maybe-uses-style-sheet.js'
import restrictedNames from './react-native/restricted-names.js'
import toComponent from './react/to-component.js'
import walk from './walk.js'

let imports = {
  DismissKeyboard: `import dismissKeyboard from 'dismissKeyboard'`,
  Link: "import { Link } from 'react-router-native'",
  Route: "import { Route } from 'react-router-native'",
  Router: "import { NativeRouter as Router } from 'react-router-native'",
}

export default ({
  file,
  getFont = () => false,
  getImport,
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
    animations: {},
    animated: new Set(),
    images: [],
    dependencies: new Set(),
    getFont,
    getStyleForProperty,
    getValueForProperty,
    hasRefs: false,
    isReactNative: true,
    lazy: {},
    local,
    locals: {},
    localSupported: [],
    name: finalName,
    remap: {},
    render: [],
    styles: {},
    svgs: [],
    testIdKey: 'testID',
    testIds: {},
    track,
    usedBlockNames: { [finalName]: 1, AutoSizer: 1, Column: 1, Table: 1 },
    uses: [],
    use(block, isLazy = false) {
      if (isLazy) {
        state.lazy[block] = true
      }

      if (
        state.uses.includes(block) ||
        /props/.test(block) ||
        'React.Fragment' === block ||
        block === finalName
      )
        return

      state.uses.push(block)
    },
  }

  let parsed = views[name]
  state.fonts = parsed.fonts
  state.slots = parsed.slots
  state.localSupported = localSupported

  walk(parsed.views[0], visitor, state)

  maybeUsesTextInput(state)
  maybeUsesRouter(state)
  maybeUsesStyleSheet(state)
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
    fonts: parsed.fonts,
    slots: parsed.slots,
    svgs: state.svgs,
  }
}
