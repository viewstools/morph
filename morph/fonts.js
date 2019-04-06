import list from 'google-fonts-complete/api-response.json'

let getWeights = variants =>
  variants
    .filter(v => !v.includes('italic'))
    .map(v => (v === 'regular' ? 400 : v))

let all = list.map(font => ({
  category: font.category,
  value: font.family,
  weights: getWeights(font.variants),
}))

let byName = {}
all.forEach(f => (byName[f.value] = f))

export let fontFamily = all.map(f => f.value)

export let isGoogleFont = family => !!byName[family]

export let maybeAddFallbackFont = f => {
  let font = byName[f]

  return font && font.category ? `${f}, ${font.category}` : f
}
