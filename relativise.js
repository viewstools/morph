import path from 'path'
import slash from 'slash'

export default function relativise(rfrom, rto, rsrc = '') {
  let src = slash(rsrc)
  let from = slash(rfrom)
  let to = slash(rto)

  let r = slash(path.relative(from, to))
  let p = r.substr(r.startsWith('../..') ? 3 : 1)

  if (p.startsWith('..')) {
    p = to.replace(`${src}/`, '')
  }

  return p
}
