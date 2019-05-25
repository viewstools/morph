import getFirstLine from 'firstline'
import glob from 'fast-glob'
import isViewCustom from './is-view-custom.js'

let getFiles = async (src, pattern, ignore = []) =>
  new Set(
    await glob(pattern, {
      absolute: true,
      bashNative: ['linux'],
      cwd: src,
      ignore: ['**/node_modules/**', '**/*.view.js', ...ignore],
    })
  )

export let getFilesView = src => getFiles(src, ['**/*.view'])
export let getFilesViewLogic = src => getFiles(src, ['**/*.view.logic.js'])
export let getFilesViewCustom = async src => {
  let allFiles = await getFiles(src, ['**/*.js'], ['**/*.view.logic.js'])
  let files = new Set()

  for await (let file of allFiles) {
    let firstLine = await getFirstLine(file)
    if (isViewCustom(firstLine)) {
      files.add(file)
    }
  }
  return files
}
export let getFilesFontCustom = src =>
  getFiles(src, [
    '**/Fonts/*.eot',
    '**/Fonts/*.otf',
    '**/Fonts/*.ttf',
    '**/Fonts/*.svg',
    '**/Fonts/*.woff',
    '**/Fonts/*.woff2',
  ])
