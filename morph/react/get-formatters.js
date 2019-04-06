export default state => (state.isFormatted ? createFormatters(state) : '')

let createFormatters = ({ formats, localSupported }) => {
  return formats
    .map(format => {
      return getFormat(format, localSupported)
    })
    .join('')
}

let getFormat = (format, localSupported) => {
  let style = Object.keys(format)[0]
  let type = style === 'currency' || style === 'percent' ? 'Number' : 'DateTime'

  let options = getOptions(format[`${style}`], style, type)
  let string = `let ${style}Options = ${options}\nlet ${style}Formatters = {`
  localSupported.forEach(local => {
    string += `${local}: new Intl.${type}Format('${local}', ${style}Options),\n`
  })

  return `${string} }\n`
}

let getOptions = (format, style, type) => {
  if (style === 'currency')
    return `{ style: 'currency', currency: '${format}' }`

  if (style === 'percent')
    return `{ style: 'percent', maximumFractionDigits: 2 }`

  if (style === 'time' && format.clock) {
    format.hour12 = format.clock === '24h' ? false : true
    delete format.clock
  }
  return JSON.stringify(format)
}
