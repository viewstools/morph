import maybeMorph from './maybe-morph.js'

export default async function morphAllViews({
  as,
  getFontImport,
  getSystemImport,
  local,
  track,
  viewsById,
  viewsToFiles,
}) {
  for await (let view of viewsToFiles.values()) {
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
