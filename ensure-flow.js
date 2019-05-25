import { promises as fs } from 'fs'
import getViewRelativeToView from './get-view-relative-to-view.js'
import prettier from 'prettier'
import path from 'path'

let makeFlow = ({ viewsById, viewsToFiles }) => {
  let flowMap = []
  let initialState = {}

  for (let view of viewsToFiles.values()) {
    if (
      view.custom ||
      !view.parsed.view.isStory ||
      view.parsed.view.flow !== 'separate'
    )
      continue

    let states = []
    for (let id of view.parsed.view.views) {
      let viewInView = getViewRelativeToView({
        id,
        view,
        viewsById,
        viewsToFiles,
      })

      if (!viewInView.custom && viewInView.parsed.view.isStory) {
        states.push(id)
      }
    }

    flowMap.push(`["${view.id}", new Set(${JSON.stringify(states)})]`)
    initialState[view.id] = states[0]
  }
  return `import React, { useCallback, useContext, useLayoutEffect, useState } from 'react'

let FlowState = React.createContext({})
let FlowSetState = React.createContext()

export let useFlow = () => useContext(FlowState)

export let useFlowState = (key, initialValue) => {
  let state = useFlow()
  let setState = useFlowSetState()

  useLayoutEffect(() => {
    if (!(key in state)) {
      setState(key, initialValue)
    }
  }, [])

  return state[key]
}

export let flow = new Map([${flowMap.join(', ')}])

export let useFlowSetState = () => useContext(FlowSetState)

export function Flow(props) {
  let [state, _setState] = useState(props.initialState)

  let setState = useCallback(
    (key, value) => {
      if (flow.get(key).has(value)) {
        _setState(state => ({ ...state, [key]: value }))
      } else {
        throw new Exception(\`Story "$\{key}" doesn't have a state named "$\{value}". Valid states are $\{flow.get(key)}.\`)
      }
    },
    [_setState],
  )

  if (process.env.NODE_ENV === 'development') {
    console.table(state)
  }

  return (
    <FlowSetState.Provider value={setState}>
      <FlowState.Provider value={state}>
        {props.children}
      </FlowState.Provider>
    </FlowSetState.Provider>
  )
}
Flow.defaultProps = {
  initialState: ${JSON.stringify(initialState, null, '  ')}
}`
}

export default function ensureFlow({ src, viewsById, viewsToFiles }) {
  return fs.writeFile(
    path.join(src, 'use-flow.js'),
    prettier.format(makeFlow({ viewsById, viewsToFiles }), {
      parser: 'babel',
      singleQuote: true,
      trailingComma: 'es5',
    }),
    { encoding: 'utf8' }
  )
}
