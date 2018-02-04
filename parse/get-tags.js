import { isShorthand, isStyle, isProps } from './helpers.js'

const CODE_PROPS = ['from', 'when', 'onClick', 'onFocus', 'onWhen']
const shouldBeProps = prop => CODE_PROPS.includes(prop) || /^on[A-Z]/.test(prop)

export default (name, props, value, block) => {
  const tags = {}

  if (isStyle(name)) tags.style = true
  if (isShorthand(name) && block.isBasic) {
    tags.shorthand = true
  }

  if (shouldBeProps(name)) tags.shouldBeProps = true
  if (props) tags.props = true

  if (tags.props || tags.shouldBeProps) {
    tags.validProps = isProps(props)
  }

  return tags
}
