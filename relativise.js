import path from 'path'

export default function relativise(from, to, src) {
  let r = path.relative(from, to).replace(/\\/g, '/')
  let p = r.substr(r.startsWith('../..') ? 3 : 1)

  if (p.startsWith('..')) {
    p = to.replace(`${src}/`, '')
  }

  return p
}
