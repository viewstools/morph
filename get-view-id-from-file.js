import path from 'path'

let EXTENSIONS = ['.block', '.block.logic.js', '.view', '.view.logic.js', '.js']

export default function getViewIdFromFile(file) {
  let extension = EXTENSIONS.find(item => file.endsWith(item))

  if (!extension) {
    throw new Error(
      `Can't recognise the extension of "${file}" to get a view's id.`
    )
  }

  return path.basename(file, extension)
}
