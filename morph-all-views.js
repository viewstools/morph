import maybeMorph from './maybe-morph.js'

export default async function morphAllViews({
  as,
  getFontImport,
  getSystemImport,
  local,
  filesView,
  track,
  viewsById,
  viewsToFiles,
}) {
  for await (let file of filesView) {
    let view = viewsToFiles.get(file)

    if (view.custom) continue

    await maybeMorph({
      as,
      getFontImport,
      getSystemImport,
      local,
      track,
      verbose: false,
      view,
      viewsById,
      viewsToFiles,
    })
  }
}
