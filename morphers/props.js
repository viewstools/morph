import toJson from '../to-json.js'

export const morph = ({ props }) => {
  let ret = {}

  try {
    const { states } = toJson({ code: props, isView: false })

    if (states.length) {
      ret = {}
      states.forEach((v, i) => {
        ret[v.ast.is || `State${i}`] = v.json
      })
    }
  } catch (err) {}

  return JSON.stringify(ret, null, 2)
}
