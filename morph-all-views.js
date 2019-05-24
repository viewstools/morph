import maybeMorph from './maybe-morph.js'

export default async function morphAllViews({
  as,
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
