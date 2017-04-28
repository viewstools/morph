import { extractCode, hasCode } from './code.js'

// TODO onClick for debug
export default function* Style({ css }, { indent, index }) {
  let accessed = []

  yield `${indent}<style>\n${indent}  `

  if (hasCode(css)) {
    yield css
    accessed = extractCode(css).accessed
  } else {
    yield `{\`${css}\`}`
  }
  yield `\n${indent}</style>\n`

  return {
    accessed,
    index: index + 1,
    uses: []
  }
}
