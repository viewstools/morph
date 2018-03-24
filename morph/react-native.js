import * as visitor from './react-native/block.js'
import getStyleForProperty from './react-native/get-style-for-property.js'
import getStyles from './react-native/get-styles.js'
import getValueForProperty from './react-native/get-value-for-property.js'
import maybeUsesAnimated from './react-native/maybe-uses-animated.js'
import maybeUsesTextInput from './react-native/maybe-uses-text-input.js'
import maybeUsesRouter from './react-native/maybe-uses-router.js'
import maybeUsesStyleSheet from './react-native/maybe-uses-style-sheet.js'
import restrictedNames from './react-native/restricted-names.js'
import toComponent from './react/to-component.js'
import walk from './walk.js'

const imports = {
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
  const finalName = restrictedNames.includes(name) ? `${name}1` : name
  if (name !== finalName) {
    console.warn(
      `// "${name}" is a Views reserved name.
      We've renamed it to "${finalName}", so your view should work but this isn't ideal.
      To fix this, change its file name to something else.`
    )
  }

  const state = {
    captures: [],
    images: [],
    getFont,
    getStyleForProperty,
    getValueForProperty,
    isReactNative: true,
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
    uses: [],
    use(block) {
      if (
        state.uses.includes(block) ||
        /props/.test(block) ||
        block === finalName
      )
        return

      state.uses.push(block)
    },
  }

  const parsed = views[name]
  state.fonts = parsed.fonts
  state.slots = parsed.slots
  state.localSupported = localSupported

  walk(parsed.views[0], visitor, state)

  maybeUsesAnimated(state)
  maybeUsesTextInput(state)
  maybeUsesRouter(state)
  maybeUsesStyleSheet(state)
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
