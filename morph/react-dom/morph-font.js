import { isGoogleFont } from '../fonts.js'

export default (font, sources) => {
  let body

  if (isGoogleFont(font.family)) {
    let family = font.family.replace(/\s/g, '+')
    let style = font.style === 'italic' ? 'ital,' : ''
    body = `@import url('https://fonts.googleapis.com/css2?family=${family}:${style}wght@${
      style !== '' ? '0,' : ''
    }${font.weight}&display=swap');`
  } else {
    body = `@font-face {
    font-display: swap;
    font-family: '${font.family}';
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
