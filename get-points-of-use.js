export default function getPointsOfUse({ view, viewsToFiles }) {
  let filesView = new Set([view.file])
  let filesViewLogic = new Set()
  let viewsId = new Set()

  if (view.logic) {
    filesViewLogic.add(view.logic)
  }

  for (let viewInView of viewsToFiles.values()) {
    if (viewInView.custom) continue

    if (viewInView.parsed.view.views.has(view.id)) {
      filesView.add(viewInView.file)
      if (viewInView.logic) {
        filesViewLogic.add(viewInView.logic)
      }
      viewsId.add(viewInView.id)
    }
  }

  return { filesView, filesViewLogic, viewsId }
}
