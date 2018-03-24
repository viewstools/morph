import { sortFonts } from '../utils.js'
import sort from 'bubblesort'

export default (fonts, files) => {
  let body = `export default {\n`
  fonts.forEach(font => {
    const sources = sort(files.filter(src => font.id === src.id), sortFonts)

    body += `${sources
      .map(src => `'${font.id}': require('./${src.file}'),\n`)
      .join(',')}`
  })
  return `${body}}`
}
