import maybeMorph from './maybe-morph.js'
import path from 'path'

export default function morphAllViews({
  as,
  getFontImport,
  getSystemImport,
  filesView,
  src,
  tools,
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
        src,
        tools,
        verbose: false,
        view,
        viewsById,
        viewsToFiles,
      }),
    }))
}
