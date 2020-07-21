import ensureFile from './ensure-file.js'
import fs from 'fs'
import path from 'path'

let TOOLS_FILE = `import { useEffect } from 'react'

export default function ViewsTools(props) {
  useEffect(() => {
    console.log(\`



    😱😱😱😱😱😱😱😱😱😱😱



    🚨 You're missing out!!!

    🚀 Views Tools can help you find product market fit before you run out of money.

    ✨ Find out how 👉 https://views.tools




    \`)
  }, [])

  return props.children
}`

export default async function ensureTools({ pass, tools, src }) {
  if (pass > 0) return false

  let file = path.join(src, 'Logic', 'ViewsTools.js')

  if (fs.existsSync(file) && tools) return false

  return ensureFile({ file, content: TOOLS_FILE })
}
