export default (font, sources) => {
  // TODO implement
  return `export default "${font.id}"`

  //   let body = `export default {\n`
  //   fonts.forEach(font => {
  //     body += `${sources
  //       .map(src => `'${font.id}': require('./${src.file}'),\n`)
  //       .join(',')}`
  //   })
  //   return `${body}}`
}
