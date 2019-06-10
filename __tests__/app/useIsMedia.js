import { useMedia as _useMedia } from 'use-media'

let useIsMedia = () => {
  let mobile = _useMedia({ minWidth: 0, maxWidth: 305 })
  let tablet = _useMedia({ minWidth: 306, maxWidth: 1024 })
  let laptop = _useMedia({ minWidth: 1025, maxWidth: 1280 })
  let desktop = _useMedia({ minWidth: 1281 })

  return {
    mobile,
    tablet,
    laptop,
    desktop,
  }
}
export default useIsMedia
