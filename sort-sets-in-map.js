import path from 'path'

let getFileDepth = file => file.split(path.sep).length - 1

let sortByFileDepth = (a, b) => {
  let depthA = getFileDepth(a)
  let depthB = getFileDepth(b)
  let depthDelta = depthA - depthB

  if (depthDelta !== 0) return depthDelta

  return a < b ? 1 : a > b ? -1 : 0
}

export default function sortSetsInMap(map) {
  for (let [key, value] of map) {
    if (value.size <= 1) continue

    map.set(key, new Set([...value].sort(sortByFileDepth)))
  }
}
