export default state => (state.hasFormattedChild ? createFormatters(state) : '')

const createFormatters = ({ localSupported }) => {
  // TODO: Handle other types of formatting
  let string = `const formatters = {`
  localSupported.forEach(local => {
    //TODO: need to get the currency from the node
    string += `${local}: new Intl.NumberFormat('${local}', { style: 'currency', currency: 'USD' }),\n`
  })

  return `${string} }`
}
