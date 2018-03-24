import morphFontAsReactDom from './react-dom/morph-font.js'
import morphFontsAsReactNative from './react-native/morph-fonts.js'

export default data => {
  return data.as === 'react-dom'
    ? morphFontAsReactDom(data.font, data.files)
    : morphFontsAsReactNative(data.fonts, data.files)
}
