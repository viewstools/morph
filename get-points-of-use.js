export default function getPointsOfUse({ view, viewsToFiles }) {
  let filesView = new Set([view.file])
  let viewsId = new Set()

  for (let viewInView of viewsToFiles.values()) {
    if (viewInView.custom) continue

    if (viewInView.parsed.view.views.has(view.id)) {
      filesView.add(viewInView.file)
      viewsId.add(viewInView.id)
    }
  }

  return { filesView, viewsId }
}
