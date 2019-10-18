import { promises as fs } from 'fs'
import addToMapSet from './add-to-map-set.js'
import morphFontAsReactDom from './morph/react-dom/morph-font.js'
import morphFontAsReactNative from './morph/react-native/morph-fonts.js'
import path from 'path'
import sort from 'bubblesort'
import relativise from './relativise.js'

let morphFont = {
  'react-dom': morphFontAsReactDom,
  'react-native': morphFontAsReactNative,
  'react-pdf': morphFontAsReactNative,
}

export async function ensureFontsDirectory(src) {
  let fontsDirectory = path.join(src, 'Fonts')

  try {
    await fs.mkdir(fontsDirectory)
  } catch (error) {}
}

export let getFontId = file => path.basename(file, path.extname(file))

let fontsOrder = ['eot', 'woff2', 'woff', 'ttf', 'svg', 'otf']

let sortFonts = fonts => {
  return new Set(
    sort(
      [...fonts],
      (a, b) => fontsOrder.indexOf(b.type) - fontsOrder.indexOf(a.type)
    )
  )
}

export function processCustomFonts({ customFonts, filesFontCustom }) {
  for (let file of filesFontCustom) {
    addToMapSet(customFonts, getFontId(file), file)
  }
  for (let [id, fonts] of customFonts) {
    customFonts.set(id, sortFonts(fonts))
  }
}

export function morphAllFonts({
  as,
  customFonts,
  filesView,
  src,
  viewsToFiles,
}) {
  let fontsDirectory = path.join(src, 'Fonts')
  let fontsInUse = new Set()

  let mapCustomFont = file => ({
    type: FONT_TYPES[path.extname(file)],
    file: file.replace(fontsDirectory, '.'),
  })

  for (let file of filesView) {
    let view = viewsToFiles.get(file)

    if (view.custom) continue

    view.parsed.fonts.forEach(font => {
      fontsInUse.add(font.id)
    })
  }

  return [...fontsInUse].map(font => {
    let [family, weight, style = 'normal'] = font.split('-')

    let customFontSources = []
    if (customFonts.has(font)) {
      customFontSources = [...customFonts.get(font)].map(mapCustomFont)
    }

    return {
      file: path.join(src, 'Fonts', `${font}.js`),
      content: morphFont[as](
        {
          id: font,
          family,
          style,
          weight,
        },
        customFontSources
      ),
    }
  })
}

// let removeFont = file => {
//   let id = getFontId(file)
//   instance.customFonts = instance.customFonts.filter(font => font.id !== id)
// }

let FONT_TYPES = {
  '.otf': 'opentype',
  '.eot': 'eot',
  '.svg': 'svg',
  '.ttf': 'truetype',
  '.woff': 'woff',
  '.woff2': 'woff2',
}

export let makeGetFontImport = src => (font, view) =>
  `import "${relativise(view.file, path.join(src, 'Fonts', `${font}.js`))}"`

// let isFont = f => Object.keys(FONT_TYPES).includes(path.extname(f))
