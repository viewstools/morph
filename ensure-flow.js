import { promises as fs } from 'fs'
import crypto from 'crypto'
import ensureFile from './ensure-file.js'
import getViewRelativeToView from './get-view-relative-to-view.js'
import path from 'path'

function maybeReactNative(as, content) {
  return as === 'react-native'
    ? content.replace(
        'import',
        `import { URL } from 'react-native-url-polyfill'\nimport`
      )
    : content
}

async function makeFlow({ as, viewsById, viewsToFiles }) {
  let flowJson = makeFlowJson({ viewsById, viewsToFiles })

  let content = await fs.readFile(
    path.join(__dirname, 'views', 'ViewsFlow.js'),
    'utf8'
  )
  return maybeReactNative(as, content).replace(
    'export let flowDefinition = {}',
    `export let flowDefinition = ${flowJson.flowDefinitionString}`
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
  let flowDefinition = {}

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

    if (view.parsed.view.flow !== 'separate') continue

    flowDefinition[view.parsed.view.viewPath] = states
  }

  let flowDefinitionString = JSON.stringify(flowDefinition)
  let hash = crypto
    .createHash('sha1')
    .update(flowDefinitionString)
    .digest('hex')
  let changed = prevHash !== hash
  if (changed) {
    prevHash = hash
  }
  return { hash, changed, flowDefinition, flowDefinitionString }
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
          content: flowJson.flowDefinitionString,
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
