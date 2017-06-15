/* eslint-disable no-restricted-globals */
let call

export const onView = fn => (call = fn)

export const fire = view => typeof call === 'function' && call(view)

export const get = file => files[file]

export const set = (file, text) => {
  files[file] = text

  const value = encodeURIComponent(JSON.stringify(files))

  replaceHash(value)
}

function replaceHash(hash) {
  if (
    typeof URL === 'function' &&
    typeof history === 'object' &&
    typeof history.replaceState === 'function'
  ) {
    const url = new URL(location)
    url.hash = hash
    history.replaceState(null, null, url)
  } else {
    location.hash = hash
  }
}

let files = {
  logic: '',
  tests: '',
  view: `Vertical
alignItems center
backgroundColor deepskyblue
borderRadius 4
margin 20
padding 20
Text
color white
text :)
fontFamily Roboto
fontWeight 300
fontSize 80`,
  viewJs: '',
}

try {
  const data = JSON.parse(decodeURIComponent(location.hash.slice(1)))
  files = {
    ...files,
    ...data,
  }
} catch (e) {}
