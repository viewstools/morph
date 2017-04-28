import proper from '../proper.js'

export const START = /^\s*{/
export const END = /}\s*$/

export const extractCode = text => {
  if (typeof text !== 'string') return false

  const code = text.replace(START, '').replace(END, '')
  const { accessed, isValid } = proper(code, 'props')

  return {
    accessed,
    code: isValid ? code : JSON.stringify(code),
    codeRaw: code,
    isValid,
  }
}
export const hasCode = text => (
  typeof text === 'string' && START.test(text) && END.test(text)
)
