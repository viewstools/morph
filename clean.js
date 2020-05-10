import del from 'del'
import deleteEmpty from 'delete-empty'
import glob from 'fast-glob'
import path from 'path'
import trash from 'trash'

export default async function clean(src, verbose, all = false) {
  let views = await glob(['**/view.blocks', '**/view.js'], {
    cwd: src,
    ignore: ['*node_modules*'],
  })

  let map = {}
  views.forEach(item => {
    let dir = path.dirname(item)
    if (!map[dir]) {
      map[dir] = new Set()
    }
    map[dir].add(path.basename(item))
  })

  let empty = Object.keys(map)
    .filter(key => map[key].size === 1 && map[key].has('view.js'))
    .map(item => path.join(src, item))

  await trash(empty)

  if (all) {
    await del(
      [
        '**/view.js',
        'Data/ViewsData.js',
        `DesignSystem/Fonts/*.js`,
        'Logic/ViewsFlow.js',
        'Logic/useIsMedia.js',
        'Logic/useIsBefore.js',
        'Logic/useIsHovered.js',
        'Logic/ViewsTools.js',
      ].map(item => path.join(src, item))
    )

    let deleted = await deleteEmpty(src)
    if (verbose) {
      deleted.forEach(d => console.log(`x ${d}`))
    }
  }
}
