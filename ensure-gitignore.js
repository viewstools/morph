import { promises as fs } from 'fs'
import ensureFile from './ensure-file.js'
import path from 'path'

let MARKER = '# views'
let CONTENT = `# views
**/view.js
**/DesignSystem/Fonts/*.js
**/*.graphql.js
**/data.js
src/Data/ViewsData.js
src/Logic/ViewsFlow.js
src/Logic/ViewsFlow.json
src/Logic/useIsBefore.js
src/Logic/useIsMedia.js
src/Logic/useIsHovered.js
src/Logic/ViewsTools.js
src/Logic/ViewsToolsDesignSystem.js`

export default async function ensureIsBefore({ pass, src }) {
  if (pass > 0) return false

  let file = path.join(src, '..', '.gitignore')
  let content = ''
  try {
    content = await fs.readFile(file, 'utf8')
  } catch (error) {}

  // convert crlf to lf
  let lines = content.replace(/\r\n/g, '\n').split('\n')
  let markerIndex = lines.indexOf(MARKER)
  if (markerIndex > -1) {
    lines = lines.slice(0, markerIndex)
    lines.push(CONTENT)

    let rest = lines.slice(markerIndex)
    let endIndex = rest.map((item) => item.trim()).indexOf('')
    if (endIndex > -1) {
      lines = [...lines, ...rest.slice(endIndex)]
    }
  } else {
    lines.push(CONTENT)
  }
  content = `${lines.join('\n')}\n`

  return ensureFile({ file, content })
}
