import ensureFile from './ensure-file.js'
import path from 'path'

let USE_IS_BEFORE = `// This file is automatically generated by Views and will be overwritten
// when the morpher runs. If you want to contribute to how it's generated, eg,
// improving the algorithms inside, etc, see this:
// https://github.com/viewstools/morph/blob/master/ensure-is-before.js
import { useEffect, useState } from 'react'

export default function useIsBefore() {
  let [isBefore, setIsBefore] = useState(true)

  useEffect(function() {
    let cancel = false
    requestAnimationFrame(function() {
      if (cancel) return
      setIsBefore(false)
    })
    return () => cancel = true
  }, [])

  return isBefore
}`

export default function ensureIsBefore({ pass, src }) {
  if (pass > 0) return false

  return ensureFile({
    file: path.join(src, 'Logic', 'useIsBefore.js'),
    content: USE_IS_BEFORE,
  })
}
