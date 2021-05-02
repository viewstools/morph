import maybeMorph from './maybe-morph.js'
import path from 'path'

export default function morphAllViews({
  as,
  getFontImport,
  getSystemImport,
  filesView,
  profile,
  src,
  tools,
  viewsById,
  viewsToFiles,
}) {
  return [...filesView]
    .map((file) => viewsToFiles.get(file))
    .filter((view) => !view.custom)
    .map((view) => {
      let { content, extraFiles = [] } = maybeMorph({
        as,
        getFontImport,
        getSystemImport,
        profile,
        src,
        tools,
        verbose: false,
        view,
        viewsById,
        viewsToFiles,
      })

      return [
        {
          file: path.join(path.dirname(view.file), 'view.js'),
          content,
        },
        ...extraFiles.map(({ name, content }) => ({
          file: path.join(path.dirname(view.file), name),
          content,
        })),
      ]
    })
    .flat()
}
