import path from 'path'

export default file => {
  if (file.endsWith('.view')) {
    return path.basename(file, '.view')
  } else if (file.endsWith('.view.logic.js')) {
    return path.basename(file, '.view.logic.js')
  } else if (file.endsWith('.js')) {
    return path.basename(file, '.js')
  } else {
    throw new Error(
      `Can't recognise the extension of "${file}" to get a view's id.`
    )
  }
}
