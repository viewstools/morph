import { promises as fs } from 'fs'
import ensureFile from './ensure-file.js'
import path from 'path'

let makeUseIsMedia = (
  media
) => `// This file is automatically generated by Views and will be overwritten
// when the morpher runs. If you want to contribute to how it's generated, eg,
// improving the algorithms inside, etc, see this:
// https://github.com/viewstools/morph/blob/master/ensure-is-media.js

import { useMedia } from 'use-media';

let useIsMedia = () => ({
  ${media
    .map(({ name, minWidth, maxWidth }) => {
      let ret = [`"${name}": useMedia({ minWidth: ${minWidth}`]
      if (maxWidth) {
        ret.push(`, maxWidth: ${maxWidth}`)
      }
      ret.push('})')
      return ret.join('')
    })
    .join(',')}
})
export default useIsMedia`

async function getMediaConfig(src) {
  let media = {
    mobile: {
      width: 414,
    },
    tablet: {
      width: 1024,
    },
    laptop: {
      width: 1280,
    },
  }
  try {
    media = JSON.parse(
      await fs.readFile(
        path.resolve(path.join(src, '..', 'app.viewstools')),
        'utf8'
      )
    ).media
    delete media.base
  } catch (error) {}

  return Object.entries(media)
    .sort((a, b) => a[1].width - b[1].width)
    .map(([name, item], index, list) => ({
      name,
      minWidth: index === 0 ? 0 : list[index - 1][1].width + 1,
      maxWidth:
        index === 0
          ? item.width
          : index === list.length - 1
          ? null
          : item.width,
    }))
}

export default async function ensureIsMedia({ pass, src }) {
  if (pass > 0) return false

  return ensureFile({
    file: path.join(src, 'Logic', 'useIsMedia.js'),
    content: makeUseIsMedia(await getMediaConfig(src)),
  })
}
