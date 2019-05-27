import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from 'react'

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

export let flow = new Map([['App', new Set(['Users', 'Settings'])]])

export let useFlowSetState = () => useContext(FlowSetState)

export function Flow(props) {
  let [state, _setState] = useState(props.initialState)

  let setState = useCallback(
    (key, value) => {
      if (flow.get(key).has(value)) {
        _setState(state => ({ ...state, [key]: value }))
      } else {
        throw new Error(
          `Story "${key}" doesn't have a state named "${value}". Valid states are ${[
            ...flow.get(key),
          ]}.`
        )
      }
    },
    [_setState]
  )

  if (process.env.NODE_ENV === 'development') {
    console.table(state)
  }

  return (
    <FlowSetState.Provider value={setState}>
      <FlowState.Provider value={state}>{props.children}</FlowState.Provider>
    </FlowSetState.Provider>
  )
}
Flow.defaultProps = {
  initialState: {
    App: 'Users',
  },
}
