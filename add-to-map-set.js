export default function addToMapSet(map, key, value) {
  if (!map.has(key)) {
    map.set(key, new Set())
  }
  map.get(key).add(value)
}
