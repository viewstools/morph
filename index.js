import { basename, extname } from 'path'
import morphFont from './morph/font.js'
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

export { morphFont }
