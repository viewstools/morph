import list from 'google-fonts-complete/api-response.json'

const getWeights = variants =>
  variants
    .filter(v => !v.includes('italic'))
    .map(v => (v === 'regular' ? 400 : v))

const all = list.map(font => ({
  category: font.category,
  value: font.family,
  weights: getWeights(font.variants),
}))

const byName = {}
all.forEach(f => (byName[f.value] = f))

export const fontFamily = all.map(f => f.value)

export const isGoogleFont = family => !!byName[family]

export const maybeAddFallbackFont = f => {
  const font = byName[f]

  return font && font.category ? `${f}, ${font.category}` : f
}
