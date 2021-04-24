import ensureDir from './ensure-dir.js'
import path from 'path'

export default async function ensureFile({ file, content }) {
  await ensureDir(path.dirname(file))

  return { file, content }
}
