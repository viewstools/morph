import { promises as fs } from 'fs'
import path from 'path'

let USE_IS_BEFORE = `import { useEffect, useState } from 'react'

export default function useIsBefore() {
  let [isBefore, setIsBefore] = useState(true)

  useEffect(function() {
    requestIdleCallback(function() {
      setIsBefore(false)
    })
  }, [])

  return isBefore
}`

export default function ensureIsBefore({ src }) {
  return fs.writeFile(path.join(src, 'useIsBefore.js'), USE_IS_BEFORE, {
    encoding: 'utf8',
  })
}
