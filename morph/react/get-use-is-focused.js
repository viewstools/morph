let FOCUSED_PROPS = new Set(['isFocused', 'onFocus', 'onBlur'])

export default function getUseIsFocused({ state }) {
  let focusedProps = state.slots
    .filter((slot) => FOCUSED_PROPS.has(slot.name))
    .map((slot) => slot.name)

  return `let [isFocused, onFocusBind, onBlurBind] = useIsFocused({${focusedProps.join(
    ','
  )}})`
}
