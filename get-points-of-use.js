export default function getPointsOfUse({ view, viewsToFiles }) {
  let filesView = new Set([view.file])
  let filesViewLogic = new Set()
  let filesViewGraphql = new Set()
  let viewsId = new Set()

  if (view.logic) {
    filesViewLogic.add(view.logic)
  }

  if (view.query) {
    filesViewGraphql.add(view.query)
  }

  for (let viewInView of viewsToFiles.values()) {
    if (viewInView.custom) continue

    if (viewInView.parsed.view.views.has(view.id)) {
      filesView.add(viewInView.file)
      if (viewInView.logic) {
        filesViewLogic.add(viewInView.logic)
      }
      if (viewInView.query) {
        filesViewGraphql.add(viewInView.query)
      }
      viewsId.add(viewInView.id)
    }
  }

  return { filesView, filesViewGraphql, filesViewLogic, viewsId }
}
