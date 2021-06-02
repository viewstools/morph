import { isGoogleFont } from '../fonts.js'

export default (font, sources) => {
  let body

  if (isGoogleFont(font.family)) {
    let family = font.family.replace(/\s/g, '+')
    let style = font.style === 'italic' ? 'i' : ''
    body = `@import url('https://fonts.googleapis.com/css?family=${family}:${font.weight}${style}&display=swap');`
  } else {
    body = `@font-face {
    font-display: swap;
    font-family: '${font.family}', sans-serif;
    font-style: ${font.style};
    font-weight: ${font.weight};
    src: local('${font.family}'),
      ${sources
        .map((src) => `url('${src.file}') format('${src.type}')`)
        .join(',\n    ')};
  }`
  }

  return body
}
