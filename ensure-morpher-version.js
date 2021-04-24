import { promises as fs } from 'fs'
import pkg from './package.json'
import ensureFile from './ensure-file.js'
import path from 'path'

export default async function ensureIsBefore({ pass, src }) {
  if (pass > 0) return false

  let file = path.join(src, '..', 'app.viewstools')
  let content = {}
  try {
    content = JSON.parse(await fs.readFile(file, 'utf8'))
  } catch (error) {}

  let version = parseVersion(pkg.version)

  if (
    version.major === -1 ||
    version.minor === -1 ||
    version.patch === -1 ||
    (version.major === content.morpherVersion?.major &&
      version.minor === content.morpherVersion?.minor &&
      version.patch === content.morpherVersion?.patch)
  ) {
    return false
  }

  content.morpherVersion = version

  return ensureFile({ file, content: JSON.stringify(content, null, '  ') })
}

function parseVersion(str) {
  try {
    let [, major, minor, patch = 0] = str.match(/(\d+)\.(\d+)\.?(\d+)?/)
    return {
      major: parseInt(major, 10),
      minor: parseInt(minor, 10),
      patch: parseInt(patch, 10),
    }
  } catch (error) {
    return { major: -1, minor: -1, patch: -1 }
  }
}
