import fsExtra from 'fs-extra'
import path from 'path'

let TOOLS_FILE = `let warnedAboutMissingOut = false

export default function useTools() {
  if (!warnedAboutMissingOut) {
    warnedAboutMissingOut = true

    console.log(\`



    😱😱😱😱😱😱😱😱😱😱😱



    🚨 You're missing out!!!

    🚀 Views Tools can help you find product market fit before you run out of money.

    ✨ Find out how 👉 https://views.tools





    \`)
  }

  return [null, () => {}]
}`

export default async function ensureTools({ src }) {
  let file = path.join(src, 'useTools.js')

  if ((await fsExtra.exists(file)) && process.env.REACT_APP_VIEWS_TOOLS)
    return null

  return { file, content: TOOLS_FILE }
}
