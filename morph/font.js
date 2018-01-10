import morphFontAsReactDom from './react-dom/morph-font.js'
import morphFontAsReactNative from './react-native/morph-font.js'

export default ({ as, font, files }) =>
  as === 'react-dom'
    ? morphFontAsReactDom({ font, files })
    : morphFontAsReactNative({ font, files })
