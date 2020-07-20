import { promises as fs } from 'fs'
import addFileIfItDoesntExist from './add-file-if-it-doesnt-exist.js'
import ensureFile from './ensure-file.js'
import path from 'path'

export default async function ensureData({ pass, src }) {
  if (pass > 0) return false

  let [DATA] = await Promise.all([
    fs.readFile(path.join(__dirname, 'views', 'ViewsData.js')),
    addFileIfItDoesntExist(
      path.join(src, 'Data', 'format.js'),
      '// export functions to use in data format'
    ),
    addFileIfItDoesntExist(
      path.join(src, 'Data', 'validate.js'),
      '// export functions to use in data validate'
    ),
    addFileIfItDoesntExist(
      path.join(src, 'Data', 'compare.js'),
      '// export functions to use in data compare'
    ),
  ])

  return ensureFile({
    file: path.join(src, 'Data', 'ViewsData.js'),
    content: DATA,
  })
}
