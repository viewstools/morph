import path from 'path'

let EXTENSIONS = ['view.blocks', 'logic.js', 'react.js']

export default function getViewIdFromFile(file) {
  let extension = EXTENSIONS.find(item => file.endsWith(item))

  if (!extension) {
    throw new Error(
      `Can't recognise the extension of "${file}" to get a view's id.`
    )
  }

  return path.basename(path.dirname(file))
}
