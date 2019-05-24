import path from 'path'

export default function relativise(from, to) {
  let r = path.relative(from, to).replace(/\\/g, '/')
  return r.substr(r.startsWith('../..') ? 3 : 1)
}
