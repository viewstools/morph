import ensureDir from './ensure-dir.js'
import { existsSync, promises as fs } from 'fs'
import path from 'path'

export default async function addFileIfItDoesntExist(file, content) {
  await ensureDir(path.dirname(file))

  if (existsSync(file)) return

  return fs.writeFile(file, content, 'utf-8')
}
