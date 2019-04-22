let fs = require('mz/fs')

let makeFlow = flow => `import React, { useCallback, useContext, useState } from 'react'

let FlowState = React.createContext({})
let FlowSetState = React.createContext()

export let useFlowState = key => useContext(FlowState)[key]
export let useFlowSetState = () => useContext(FlowSetState)

export function Flow(props) {
  let [state, _setState] = useState(props.initialState)

  let setState = useCallback(
    (key, value) => _setState({ ...state, [key]: value }),
    [state, _setState],
  )

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

module.exports = async (file, flow) => {
  await fs.writeFile(file, makeFlow(flow), { encoding: 'utf8' })
}
