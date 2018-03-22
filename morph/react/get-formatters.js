export default state => (state.hasFormattedChild ? createFormatters(state) : '')

const createFormatters = ({ formats, localSupported }) => {
  let formatters = ''
  formats.forEach(format => {
    const style = Object.keys(format)[0]
    if (style === 'currency' || style === 'percent') {
      formatters += getFormat(format, style, localSupported, 'Number')
    } else {
      formatters += getFormat(format, style, localSupported, 'DateTime')
    }
  })
  return formatters
}

const getFormat = (format, style, localSupported, type) => {
  const options = getOptions(format, style, type)
  let string = `const ${style}Options = ${options}\nconst ${style}Formatters = {`
  localSupported.forEach(local => {
    debugger
    string += `${local}: new Intl.${type}Format('${local}', ${style}Options),\n`
  })

  return `${string} }\n`
}

const getOptions = (format, style, type) => {
  if (style === 'currency')
    return `{ style: 'currency', currency: '${format.currency}' }`

  if (style === 'percent')
    return `{ style: 'percent', maximumFractionDigits: 2 }`

  if (style === 'date') {
    debugger
    return JSON.stringify(format.date)
  }

  // time??
}
