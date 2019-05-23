import fs from 'mz/fs.js'
import prettier from 'prettier'

let makeFlow = flow => `import React, { useCallback, useContext, useLayoutEffect, useState } from 'react'

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

export let useFlowSetState = () => useContext(FlowSetState)

export function Flow(props) {
  let [state, _setState] = useState(props.initialState)

  let setState = useCallback(
    (key, value) => _setState(state => ({ ...state, [key]: value })),
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
  initialState: ${JSON.stringify(flow, null, '  ')}
}
`

export default function ensureFlow(file, flow) {
  return fs.writeFile(
    file,
    prettier.format(makeFlow(flow), {
      parser: 'babel',
      singleQuote: true,
      trailingComma: 'es5',
    }),
    { encoding: 'utf8' }
  )
}
