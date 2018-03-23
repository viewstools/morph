export default state => (state.hasFormattedChild ? createFormatters(state) : '')

const createFormatters = ({ formats, localSupported }) => {
  return formats
    .map(format => {
      return getFormat(format, localSupported)
    })
    .join('')
}

const getFormat = (format, localSupported) => {
  const style = Object.keys(format)[0]
  const type =
    style === 'currency' || style === 'percent' ? 'Number' : 'DateTime'

  const options = getOptions(format[`${style}`], style, type)
  let string = `const ${style}Options = ${options}\nconst ${style}Formatters = {`
  localSupported.forEach(local => {
    string += `${local}: new Intl.${type}Format('${local}', ${style}Options),\n`
  })

  return `${string} }\n`
}

const getOptions = (format, style, type) => {
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
