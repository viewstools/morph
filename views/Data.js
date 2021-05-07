// This file is automatically generated by Views and will be overwritten
// when the morpher runs. If you want to contribute to how it's generated, eg,
// improving the algorithms inside, etc, see this:
// https://github.com/viewstools/morph/blob/master/ensure-data.js
import {
  normalizePath,
  useSetFlowTo,
  useFlow,
  getNextFlow,
  getFlowDefinition,
  getParentView,
} from './Flow.js'
// import get from 'dlv';
import get from 'lodash/get'
import produce from 'immer'
// import set from 'dset';
import set from 'lodash/set'
import React, {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'

let SET = 'data/SET'
let SET_FN = 'data/SET_FN'
let RESET = 'data/RESET'
let FORCE_REQUIRED = 'data/FORCE_REQUIRED'
let IS_SUBMITTING = 'data/IS_SUBMITTING'
let reducer = produce((draft, action) => {
  switch (action.type) {
    case SET: {
      set(draft.value, action.path, action.value)
      break
    }

    case SET_FN: {
      action.fn(draft.value, set, get)
      break
    }

    case RESET: {
      return { value: action.value }
    }

    case IS_SUBMITTING: {
      draft._isSubmitting = action.value
      break
    }

    case FORCE_REQUIRED: {
      draft._forceRequired = true
      draft._isSubmitting = false
      break
    }

    default: {
      throw new Error(
        `Unknown action type "${action.type}" in useData reducer.`
      )
    }
  }
})

let DataContexts = {
  default: React.createContext([]),
}
export function DataProvider(props) {
  if (!(props.context in DataContexts)) {
    DataContexts[props.context] = React.createContext([])
    DataContexts[props.context].displayName = props.context
  }
  let Context = DataContexts[props.context]

  let [_state, dispatch] = useReducer(reducer, { value: props.value })
  let [state, setState] = useReducer((_, s) => s, { value: props.value })
  // TODO: refactor -- This is part of the listeners
  let setFlowTo = useSetFlowTo(props.viewPath)
  let flow = useFlow()
  let flowRef = useRef(flow)
  useEffect(() => {
    flowRef.current = flow
  }, [flow])
  let listeners = useRef([])
  function registerListener(listener) {
    listeners.current.push(listener)
    // TODO: because we have the effect now but we may need it then
    // listener(_state, state)
    return () => {
      listeners.current = listeners.current.filter((l) => l !== listener)
    }
  }

  useEffect(() => {
    if (state === _state) return

    // We are sorting the listeners from longest to shorter
    // as an approximation to get the order of setFlowTo's application
    let nextFlow = flowRef.current.flow
    let listenersCurrent = [...listeners.current]
    listenersCurrent.sort((a, b) => b.viewPath.length - a.viewPath.length)
    let targets = []

    function _setFlowTo(target) {
      nextFlow = getNextFlow(target, nextFlow)
      targets.push(target)
    }

    function _has(key) {
      if (!key) return false

      let [parent, view] = getParentView(key)
      let value = nextFlow[parent]
      if (value === view) return true
      if (typeof value === 'string') return false

      let parentFlowDefinition = getFlowDefinition(parent)
      return (
        Array.isArray(parentFlowDefinition) && parentFlowDefinition[0] === view
      )
    }

    let hasKeys = []

    listenersCurrent.forEach(({ listener, viewPath }) => {
      let has = (key) => {
        let result = _has(key)
        hasKeys.push({ viewPath, key, result, flow: { ...nextFlow } })
        return result
      }
      listener(_state.value, state.value, { has }, _setFlowTo)
    })
    targets.forEach(setFlowTo)
    setState(_state)
  }, [_state, state]) // eslint-disable-line
  // ignore setFlowTo

  // track a reference of state so that any call to onSubmit gets the latest
  // state even if it changed through the execution
  let stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  let isSubmitting = useRef(false)
  let shouldCallOnChange = useRef(false)

  useEffect(() => {
    if (isSubmitting.current) return

    shouldCallOnChange.current = false

    dispatch({ type: RESET, value: props.value })
  }, [props.value]) // eslint-disable-line
  // ignore dispatch

  function _onChange(value, changePath = null) {
    if (typeof value === 'function') {
      dispatch({ type: SET_FN, fn: value })
    } else if (!changePath) {
      dispatch({ type: RESET, value })
    } else {
      dispatch({
        type: SET,
        path: changePath,
        value,
      })
    }
  }

  // keep track of props.onChange outside of the following effect to
  // prevent loops. Making the function useCallback didn't work
  let onSubmit = useRef(props.onSubmit)
  useEffect(() => {
    onSubmit.current = props.onSubmit
  }, [props.onSubmit])

  async function _onSubmit(args) {
    if (isSubmitting.current) return
    isSubmitting.current = true

    try {
      dispatch({ type: IS_SUBMITTING, value: true })
      let res = await onSubmit.current({
        value: stateRef.current.value,
        args,
        onChange: _onChange,
      })
      isSubmitting.current = false

      if (!res) {
        dispatch({ type: IS_SUBMITTING, value: false })
        return
      }
    } catch (error) {
      isSubmitting.current = false
    }

    dispatch({ type: FORCE_REQUIRED })
  }

  let value = useMemo(
    () => [state, dispatch, _onSubmit, props.value, registerListener],
    [state, props.value] // eslint-disable-line
  ) // ignore registerListener

  // keep track of props.onChange outside of the following effect to
  // prevent loops. Making the function useCallback didn't work
  let onChange = useRef(props.onChange)
  useEffect(() => {
    onChange.current = props.onChange
  }, [props.onChange])

  useEffect(() => {
    if (!shouldCallOnChange.current) {
      shouldCallOnChange.current = true
      return
    }

    onChange.current(state.value, (fn) => dispatch({ type: SET_FN, fn }))
  }, [state]) // eslint-disable-line
  // ignore props.context, props.viewPath

  return <Context.Provider value={value}>{props.children}</Context.Provider>
}
DataProvider.defaultProps = {
  context: 'default',
  onChange: () => {},
  onSubmit: () => {},
}

export function useDataListener({
  // path = null,
  context = 'default',
  viewPath,
  listener,
} = {}) {
  let [, , , , registerListener] = useContext(DataContexts[context])

  return useEffect(() => {
    if (!viewPath) return
    return registerListener({ listener, viewPath })
  }, []) // eslint-disable-line
}

export function useData({
  path = null,
  context = 'default',
  formatIn = null,
  formatOut = null,
  validate = null,
  validateRequired = false,
  viewPath = null,
} = {}) {
  let [data, dispatch, onSubmit, originalValue] = useContext(
    DataContexts[context]
  )
  let touched = useRef(false)

  let [value, isValidInitial, isValid] = useMemo(() => {
    let rawValue = path ? get(data.value, path) : data.value

    let value = rawValue
    if (formatIn) {
      try {
        value = formatIn(rawValue, data.value)
      } catch (error) {}
    }

    let isValidInitial = true
    if (validate) {
      try {
        isValidInitial = !!validate(rawValue, value, data.value)
      } catch (error) {}
    }
    let isValid =
      touched.current || (validateRequired && data._forceRequired)
        ? isValidInitial
        : true

    return [value, isValidInitial, isValid]
  }, [data, formatIn, path, validate, validateRequired]) // eslint-disable-line
  // ignore context and viewPath

  let memo = useMemo(
    () => {
      if (!data) return {}

      function onChange(value, changePath = path) {
        touched.current = true

        if (typeof value === 'function') {
          dispatch({ type: SET_FN, fn: value })
        } else if (!changePath) {
          dispatch({ type: RESET, value })
        } else {
          let valueSet = value
          if (formatOut) {
            try {
              valueSet = formatOut(value, data.value)
            } catch (error) {}
          }

          dispatch({
            type: SET,
            path: changePath,
            value: valueSet,
          })
        }
      }

      return {
        onChange,
        onSubmit,
        value,
        originalValue,
        isSubmitting: data._isSubmitting,
        isValid,
        isValidInitial,
        isInvalid: !isValid,
        isInvalidInitial: !isValidInitial,
      }
    },
    // eslint-disable-next-line
    [
      dispatch,
      path,
      value,
      isValidInitial,
      isValid,
      formatOut,
      data?._isSubmitting, // eslint-disable-line
      onSubmit,
    ]
  )
  // ignore data - this can cause rendering issues though

  return memo
}

export function useSetFlowToBasedOnData({
  context,
  data,
  fetching,
  error,
  viewPath,
  pause = false,
}) {
  let flow = useFlow()
  let setFlowTo = useSetFlowTo(viewPath, true)
  let contentPath = useMemo(() => {
    if (flow.flow[viewPath] === 'Content') {
      let result = Object.entries(flow.flow).find(([key]) =>
        key.includes(`${viewPath}/Content`)
      )
      if (result) {
        let [key, value] = result
        return `${key.replace(`${viewPath}/`, '')}/${value}`
      }
    }

    return 'Content'
  }, []) // eslint-disable-line
  // ignore flow.flow

  useEffect(() => {
    let view = contentPath
    if (error) {
      view = 'Error'
    } else if (pause && !data) {
      view = 'No'
    } else if (fetching) {
      view = 'Loading'
    } else if (isEmpty(data)) {
      view = 'Empty'
    }

    // TODO do we need No? I think we need it, even if it is used once only
    // otherwise we'll need to render any of the other states
    setFlowTo(normalizePath(viewPath, view))
  }, [data, error]) // eslint-disable-line
  // ignore setFlowTo and props.viewPath
}

function isEmpty(data) {
  return Array.isArray(data) ? data.length === 0 : !data
}
