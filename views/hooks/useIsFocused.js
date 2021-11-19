import { useCallback, useState } from 'react'

export default function useIsFocused({ onFocus, onBlur }) {
  let [isFocused, setIsFocused] = useState(false)

  let onFocusBind = useCallback(
    (e) => {
      setIsFocused(true)
      onFocus && onFocus(e)
    },
    [onFocus]
  )
  let onBlurBind = useCallback(
    (e) => {
      setIsFocused(false)
      onBlur && onBlur(e)
    },
    [onBlur]
  )

  return [isFocused, onFocusBind, onBlurBind]
}
