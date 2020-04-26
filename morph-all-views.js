import maybeMorph from './maybe-morph.js'
import path from 'path'

export default function morphAllViews({
  as,
  getFontImport,
  getSystemImport,
  local,
  filesView,
  tools,
  track,
  viewsById,
  viewsToFiles,
}) {
  return [...filesView]
    .map(file => viewsToFiles.get(file))
    .filter(view => !view.custom)
    .map(view => ({
      file: path.join(path.dirname(view.file), 'view.js'),
      content: maybeMorph({
        as,
        getFontImport,
        getSystemImport,
        local,
        tools,
        track,
        verbose: false,
        view,
        viewsById,
        viewsToFiles,
      }),
    }))
}
