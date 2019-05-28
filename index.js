import { basename, extname } from 'path'
import {
  getFilesView,
  getFilesViewLogic,
  getFilesViewCustom,
  getFilesFontCustom,
} from './get-files.js'
import { processCustomFonts } from './fonts.js'
import {
  watchFilesView,
  watchFilesViewLogic,
  watchFilesViewCustom,
  watchFilesFontCustom,
} from './watch-files.js'
import addToMapSet from './add-to-map-set.js'
import getViewIdFromFile from './get-view-id-from-file.js'
import makeProcessFiles from './process-files.js'
import restrictedNames from './restricted-names.js'
import toPascalCase from 'to-pascal-case'

let sanitize = input =>
  basename(input)
    .replace(extname(input), '')
    .replace(/[^a-zA-Z_$0-9]+/g, '_')
    .replace(/^_/, '')
    .replace(/_$/, '')
    .replace(/^(\d)/, '_$1')

export let pathToName = path =>
  toPascalCase(sanitize(basename(path).replace('.view', '')))

export let isViewNameRestricted = (view, as) =>
  restrictedNames[as].includes(view)

export {
  addToMapSet,
  getFilesFontCustom,
  getFilesView,
  getFilesViewCustom,
  getFilesViewLogic,
  getViewIdFromFile,
  makeProcessFiles,
  processCustomFonts,
  watchFilesFontCustom,
  watchFilesView,
  watchFilesViewCustom,
  watchFilesViewLogic,
}
