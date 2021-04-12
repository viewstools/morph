// This file is automatically generated by Views and will be overwritten
// when the morpher runs. If you want to contribute to how it's generated, eg,
// improving the algorithms inside, etc, see this:
// https://github.com/viewstools/morph/blob/master/ensure-data.js
import * as fromValidate from './validate.js'
import * as fromFormat from './format.js'
import { normalizePath, useSetFlowTo, useFlow } from 'Logic/ViewsFlow.js'
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
      set(draft, action.path, action.value)
      break
    }

    case SET_FN: {
      action.fn(draft, set, get)
      break
    }

    case RESET: {
      return action.value
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
  let [_state, dispatch] = useReducer(reducer, props.value)
  let [state, setState] = useReducer((_, s) => s, props.value)
  let listeners = useRef([])
  function registerListener(listener) {
    listeners.current.push(listener)
    listener(_state, state)
    return () => {
      listeners.current = listeners.current.filter((l) => l !== listener)
    }
  }

  useEffect(() => {
    if (state === _state) return

    listeners.current.forEach((listener) => listener(_state, state))
    setState(_state)
  }, [_state, state])

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
      let res = await onSubmit.current(stateRef.current, args)
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

    onChange.current(state, (fn) => dispatch({ type: SET_FN, fn }))
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
  // viewPath = null,
  listener,
} = {}) {
  let [, , , , registerListener] = useContext(DataContexts[context])

  return useEffect(() => {
    return registerListener(listener)
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
    let rawValue = path ? get(data, path) : data

    let value = rawValue
    if (path && formatIn) {
      try {
        value = fromFormat[formatIn](rawValue, data)
      } catch (error) {}
    }

    let isValidInitial = true
    if (validate) {
      try {
        isValidInitial = !!fromValidate[validate](rawValue, value, data)
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
              valueSet = fromFormat[formatOut](value, data)
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
  }, [])

  useEffect(() => {
    let view = contentPath
    if (error) {
      view = 'Error'
    } else if (pause && !data) {
      view = 'No'
    } else if (fetching) {
      view = 'Loading'
    } else if (isEmpty(context, data)) {
      view = 'Empty'
    }

    // TODO do we need No? I think we need it, even if it is used once only
    // otherwise we'll need to render any of the other states
    setFlowTo(normalizePath(viewPath, view))
  }, [data, error]) // eslint-disable-line
  // ignore setFlowTo and props.viewPath
}

function isEmpty(context, data) {
  if (!data) return true
  let value = data[context]
  return Array.isArray(value) ? value.length === 0 : !value
}
