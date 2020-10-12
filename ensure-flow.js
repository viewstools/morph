import { promises as fs } from 'fs'
import crypto from 'crypto'
import ensureFile from './ensure-file.js'
import getViewRelativeToView from './get-view-relative-to-view.js'
import path from 'path'

function ensureFirstViewIsOn(flow, key, views) {
  if (!views.has(key)) return

  let view = flow.get(key)
  if (view && view.views.size > 0) {
    let index = 0
    for (let id of view.views) {
      if (index === 0 || !view.isSeparate) {
        views.add(id)
      }
      index++
      ensureFirstViewIsOn(flow, id, views)
    }
  }
}

function maybeReactNative(as, content) {
  return as === 'react-native'
    ? content.replace(
        'import',
        `import { URL } from 'react-native-url-polyfill'\nimport`
      )
    : content
}

let TOP_VIEW = '/App'
async function makeFlow({ as, viewsById, viewsToFiles }) {
  let flowMap = new Map()
  let flowMapStr = []

  for (let view of viewsToFiles.values()) {
    if (!view || view.custom || !view.parsed.view.isView) continue

    let states = []
    for (let id of view.parsed.view.views) {
      let viewInView = getViewRelativeToView({
        id,
        view,
        viewsById,
        viewsToFiles,
      })

      if (viewInView && !viewInView.custom && viewInView.parsed.view.isView) {
        states.push(id)
      }
    }

    let isSeparate = view.parsed.view.flow === 'separate'
    let parent = view.parsed.view.viewPathParent

    flowMapStr.push(
      `['${view.parsed.view.viewPath}', { isSeparate: ${isSeparate}, parent: '${
        parent === '/' ? '' : parent
      }',
  views: new Set(${states.length > 0 ? JSON.stringify(states) : ''}) }]`
    )
    flowMap.set(view.parsed.view.viewPath, {
      parent,
      isSeparate,
      views: new Set(states),
    })
  }

  let initialState = new Set([TOP_VIEW])
  ensureFirstViewIsOn(flowMap, TOP_VIEW, initialState)

  let content = await fs.readFile(
    path.join(__dirname, 'views', 'ViewsFlow.js'),
    'utf8'
  )
  return maybeReactNative(as, content)
    .replace(
      'export let flow = new Map()',
      `export let flow = new Map([
${flowMapStr.join(',\n')}
])`
    )
    .replace(
      'initialState: new Set()',
      `initialState: new Set(${JSON.stringify([...initialState], null, '  ')})`
    )
}

async function makeFlowTools({ as }) {
  let content = fs.readFile(
    path.join(__dirname, 'views', 'ViewsFlow.tools.js'),
    'utf8'
  )
  return maybeReactNative(as, content)
}

let prevHash = null
function makeFlowJson({ viewsById, viewsToFiles }) {
  let flowMap = new Map()

  for (let view of viewsToFiles.values()) {
    if (!view || view.custom || !view.parsed.view.isView) continue

    let states = []
    for (let id of view.parsed.view.views) {
      let viewInView = getViewRelativeToView({
        id,
        view,
        viewsById,
        viewsToFiles,
      })

      if (viewInView && !viewInView.custom && viewInView.parsed.view.isView) {
        states.push(id)
      }
    }

    let isSeparate = view.parsed.view.flow === 'separate'
    let parent = view.parsed.view.viewPathParent
    if (parent === '/') {
      parent = ''
    }

    // flowMapStr.push(
    //   `['${view.parsed.view.viewPath}', { isSeparate: ${isSeparate}, parent: '${
    //     parent === '/' ? '' : parent
    //   }',
    // views: new Set(${states.length > 0 ? JSON.stringify(states) : ''}) }]`
    // )
    flowMap.set(view.parsed.view.viewPath, {
      parent,
      isSeparate,
      views: states,
    })
  }

  let flowMapEntries = JSON.stringify(Array.from(flowMap.entries()))
  let hash = crypto.createHash('sha1').update(flowMapEntries).digest('hex')
  let changed = prevHash !== hash
  if (changed) {
    prevHash = hash
  }
  return { hash, changed, flow: flowMapEntries }
}

export default function ensureFlow({
  as,
  pass,
  src,
  tools,
  viewsById,
  viewsToFiles,
}) {
  if (tools) {
    let flowJson = makeFlowJson({ viewsById, viewsToFiles })

    return [
      pass === 0 &&
        makeFlowTools({ as }).then((content) =>
          ensureFile({
            file: path.join(src, 'Logic', 'ViewsFlow.js'),
            content,
          })
        ),
      flowJson.changed &&
        ensureFile({
          file: path.join(src, 'Logic', 'ViewsFlow.json'),
          content: flowJson.flow,
        }),
    ]
  } else {
    return [
      makeFlow({ as, viewsById, viewsToFiles }).then((content) =>
        ensureFile({
          file: path.join(src, 'Logic', 'ViewsFlow.js'),
          content,
        })
      ),
    ]
  }
}
