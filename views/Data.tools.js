// This file is automatically generated by Views and will be overwritten
// when the morpher runs. If you want to contribute to how it's generated, eg,
// improving the algorithms inside, etc, see this:
// https://github.com/viewstools/morph/blob/master/ensure-data.js
import {
  normalizePath,
  useSetFlowTo,
  useFlow,
  getNextFlow,
  isFlowKeyWithArguments,
  getFlowDefinitionKey,
  getFlowDefinition,
  getParentView,
} from './Flow.js'
// import get from 'dlv';
import get from 'lodash/get'
import camelCase from 'lodash/camelCase'
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
function reducer(state, action) {
  switch (action.type) {
    case SET: {
      return {
        ...state,
        _touched: action.touched
          ? new Set([...state._touched, action.touched])
          : state._touched,
        value: produce(set)(state.value, action.path, action.value),
      }
    }

    case SET_FN: {
      return {
        ...state,
        _touched: action.touched
          ? new Set([...state._touched, action.touched])
          : state._touched,
        value: produce(action.fn)(state.value, set, get),
      }
    }

    case RESET: {
      return { value: action.value, _touched: new Set(state._touched) }
    }

    case IS_SUBMITTING: {
      return { ...state, _isSubmitting: action.value }
    }

    case FORCE_REQUIRED: {
      return { ...state, _forceRequired: true, _isSubmitting: false }
    }

    default: {
      throw new Error(
        `Unknown action type "${action.type}" in useData reducer.`
      )
    }
  }
}

let DataContexts = {
  default: React.createContext([]),
}
export function DataProvider(props) {
  if (process.env.NODE_ENV === 'development') {
    if (!props.context) {
      debug({
        type: 'views/data/missing-context-value',
        viewPath: props.viewPath,
        message: `You're missing the context value in DataProvider. Eg: <DataProvider context="namespace" value={value}>. You're using the default one now instead.`,
      })
    }
  }
  if (!(props.context in DataContexts)) {
    DataContexts[props.context] = React.createContext([])
    DataContexts[props.context].displayName = props.context
  }
  let Context = DataContexts[props.context]

  let initialState = { value: props.value, _touched: new Set() }
  let [_state, dispatch] = useReducer(reducer, initialState)
  let [state, setState] = useReducer((_, s) => s, initialState)
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
    debug({
      type: 'views/data/listeners/state-change',
      state,
      _state,
    })

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

      // active view in flow
      let [parent, view] = getParentView(key)
      let value = nextFlow[parent]
      if (value === view) return true
      if (typeof value === 'string') return false

      // FIXME HACK: check for a definition key instead of the arguments
      // version of it because Tools doesn't understand list items on the
      //  flow just yet and sets the flow to the definition key instead
      if (isFlowKeyWithArguments(key)) {
        let definitionKey = getFlowDefinitionKey(key)
        let [parent, view] = getParentView(definitionKey)
        let value = nextFlow[parent]
        if (value === view) return true
        if (typeof value === 'string') return false
      }

      // first view defined on the flow
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
    if (listenersCurrent.length || targets.length || hasKeys.length) {
      debug({
        type: 'views/data/listeners/current',
        listeners: listenersCurrent,
        targets,
        hasKeys,
      })
    }
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

  function _change(value, changePath = null) {
    if (typeof value === 'function') {
      dispatch({ type: SET_FN, fn: value })
    } else if (!changePath) {
      dispatch({ type: RESET, value })
    } else {
      dispatch({
        type: SET,
        path: changePath,
        value,
        touched: false,
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
        originalValue: props.value,
        args,
        change: _change,
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
  context,
  viewPath,
  listener,
} = {}) {
  let [, , , , registerListener] = useContext(DataContexts[context])

  return useEffect(() => {
    if (!viewPath) return
    return registerListener({ listener, viewPath })
  }, []) // eslint-disable-line
}

if (process.env.NODE_ENV === 'development') {
  let isArray = Array.isArray
  Array.isArray = (maybeArray) => {
    try {
      return isArray(maybeArray) || `${maybeArray}` === 'proxyString'
    } catch (error) {
      return false
    }
  }
}

export function useDataContext(name) {
  let context = DataContexts[name]
  if (!context) {
    context = DataContexts.default
    debug({ type: 'views/data/missing-context', context: name })
  }
  return useContext(context)
}

export function useData({
  context,
  path = null,
  formatIn: format = null,
  formatOut = null,
  validate = null,
  validateRequired: required = false,
  viewPath = null,
} = {}) {
  let value = useDataFormat({
    context,
    path,
    format,
    viewPath,
    __ignoreMissingInDevMode: true,
  })
  let originalValue = useDataOriginalValue({
    context,
    viewPath,
  })
  let change = useDataChange({ context, path, formatOut, viewPath })
  let submit = useDataSubmit({ context, viewPath })
  let isSubmitting = useDataIsSubmitting({ context, viewPath })
  let isValidInitial = useDataIsValidInitial({
    context,
    path,
    validate,
    viewPath,
    __ignoreMissingInDevMode: true,
  })
  let isValid = useDataIsValid({
    context,
    path,
    validate,
    required,
    viewPath,
    __ignoreMissingInDevMode: true,
  })

  return {
    change,
    submit,
    value,
    originalValue,
    isSubmitting,
    isValid,
    isValidInitial,
    isInvalid: !isValid,
    isInvalidInitial: !isValidInitial,
  }
}

export function useDataValue({ context, path = null, viewPath = null } = {}) {
  let [data] = useDataContext(context)

  if (process.env.NODE_ENV === 'development') {
    // source: https://github.com/TheWWWorm/proxy-mock/blob/master/index.js
    function getProxyMock(
      specifics = {
        value: 'proxyString',
      },
      name = 'proxyMock',
      wrap
    ) {
      function _target() {
        getProxyMock()
      }

      let target = wrap ? wrap(name, _target) : _target

      target[Symbol.toPrimitive] = (hint, b, c) => {
        if (hint === 'string') {
          return 'proxyString'
        } else if (hint === 'number') {
          return 42
        }
        return '1337'
      }
      target[Symbol.iterator] = function* () {
        yield getProxyMock({}, `${name}.Symbol(Symbol.iterator)`, wrap)
      }

      let length = 3

      return new Proxy(target, {
        get(obj, key) {
          key = key.toString()
          if (key === 'forEach') {
            return function forEach(fn) {
              Array(length)
                .fill(0)
                .forEach((_, i) => {
                  let item = getProxyMock({}, `${name}`, wrap)
                  fn(item, i, [item])
                })
            }
          }
          if (key === 'map' || key === 'filter') {
            return function map(fn) {
              return Array(length)
                .fill(0)
                .map((_, i) => {
                  let item = getProxyMock({}, `${name}`, wrap)
                  return fn(item, i, [item])
                })
            }
          }
          if (key === 'find') {
            return function map(fn) {
              let item = getProxyMock({}, `${name}`, wrap)
              return fn(item, 0, [item])
            }
          }
          if (key === 'length') {
            return length
          }
          if (key === 'lat') {
            return 35.3877847
          }
          if (key === 'lng') {
            return 24.048761
          }
          if (/date/.test(key)) {
            return '2021-03-22'
          }
          if (/time/.test(key)) {
            return '11:50'
          }
          if (key === 'text') {
            return 'proxyString'
          }
          if (key === 'id') {
            return null
          }
          if (specifics.hasOwnProperty(key)) {
            return specifics[key]
          }
          if (key === 'Symbol(Symbol.toPrimitive)') {
            return obj[Symbol.toPrimitive]
          }
          if (key === 'Symbol(Symbol.iterator)') {
            return obj[Symbol.iterator]
          }
          if (!obj.hasOwnProperty(key)) {
            obj[key] = getProxyMock({}, `${name}.${key}`, wrap)
          }

          return obj[key]
        },
        apply() {
          return getProxyMock({}, `${name}`, wrap)
        },
      })
    }

    function getDataMock() {
      let value = getProxyMock()
      return {
        value,
      }
    }

    if (!(context in DataContexts)) {
      debug({
        type: 'views/data/missing-data-provider',
        viewPath,
        context,
        message: `"${context}" isn't a valid Data context. Add a <DataProvider context="${context}" value={data}> in the component that defines the context for this view. You're using a mock now.`,
      })
      return getDataMock()
    }

    if (!data) {
      debug({
        type: 'views/data/missing-data-for-provider',
        viewPath,
        context,
        message: `"${context}" doesn't have data. You're using a mock now.`,
      })
      return getDataMock()
    }
  }

  return path ? get(data.value, path) : data.value
}

export function useDataOriginalValue({ context } = {}) {
  let [, , , originalValue] = useDataContext(context)
  return originalValue
}

export function useDataFormat({
  context,
  path = null,
  format = null,
  viewPath = null,
  __ignoreMissingInDevMode = false,
} = {}) {
  let [data] = useDataContext(context)
  let value = useDataValue({ context, path, viewPath })

  if (format) {
    try {
      value = format(value, data.value)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        debug({
          type: 'views/data/runtime-format',
          viewPath,
          context,
          format,
          message: `format function failed to run`,
          error,
        })
      }
    }
  } else if (!__ignoreMissingInDevMode) {
    debug({
      type: 'views/data/runtime-format-missing',
      viewPath,
      context,
      message: `Please provide a format function.`,
    })
  }
  return value
}

export function useDataChange({
  context,
  path = null,
  formatOut = null,
  viewPath = null,
} = {}) {
  let [data, dispatch] = useDataContext(context)

  function change(value, changePath = path) {
    if (typeof value === 'function') {
      dispatch({ type: SET_FN, fn: value, touched: changePath })
    } else if (!changePath) {
      dispatch({ type: RESET, value })
    } else {
      let valueSet = value
      if (formatOut) {
        try {
          valueSet = formatOut(value, data.value)
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            debug({
              type: 'views/data/runtime-formatOut',
              viewPath,
              context,
              formatOut,
              message: `format function failed to run`,
              error,
            })
          }
        }
      }

      dispatch({
        type: SET,
        path: changePath,
        value: valueSet,
        touched: changePath,
      })
    }
  }

  if (process.env.NODE_ENV === 'development') {
    function getDataMock() {
      return function change() {}
    }

    if (!(context in DataContexts)) {
      debug({
        type: 'views/data/missing-data-provider',
        viewPath,
        context,
        message: `"${context}" isn't a valid Data context. Add a <DataProvider context="${context}" value={data}> in the component that defines the context for this view. You're using a mock now.`,
      })
      return getDataMock()
    }

    if (!data) {
      debug({
        type: 'views/data/missing-data-for-provider',
        viewPath,
        context,
        message: `"${context}" doesn't have data. You're using a mock now.`,
      })
      return getDataMock()
    }
  }

  return change
}

export function useDataSubmit({ context, viewPath = null } = {}) {
  let [data, , submit] = useDataContext(context)

  if (process.env.NODE_ENV === 'development') {
    function getDataMock() {
      return function submit() {}
    }

    if (!(context in DataContexts)) {
      debug({
        type: 'views/data/missing-data-provider',
        viewPath,
        context,
        message: `"${context}" isn't a valid Data context. Add a <DataProvider context="${context}" value={data}> in the component that defines the context for this view. You're using a mock now.`,
      })
      return getDataMock()
    }

    if (!data) {
      debug({
        type: 'views/data/missing-data-for-provider',
        viewPath,
        context,
        message: `"${context}" doesn't have data. You're using a mock now.`,
      })
      return getDataMock()
    }
  }

  return submit
}

export function useDataIsSubmitting({ context, viewPath = null } = {}) {
  let [data] = useDataContext(context)

  if (process.env.NODE_ENV === 'development') {
    function getDataMock() {
      return false
    }

    if (!(context in DataContexts)) {
      debug({
        type: 'views/data/missing-data-provider',
        viewPath,
        context,
        message: `"${context}" isn't a valid Data context. Add a <DataProvider context="${context}" value={data}> in the component that defines the context for this view. You're using a mock now.`,
      })
      return getDataMock()
    }

    if (!data) {
      debug({
        type: 'views/data/missing-data-for-provider',
        viewPath,
        context,
        message: `"${context}" doesn't have data. You're using a mock now.`,
      })
      return getDataMock()
    }
  }

  return data?._isSubmitting
}

function isValidInitial({
  context,
  value,
  validate,
  viewPath,
  __ignoreMissingInDevMode = false,
}) {
  let isValidInitial = true
  if (validate) {
    try {
      isValidInitial = !!validate(value)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        debug({
          type: 'views/data/runtime-validate',
          viewPath,
          context,
          validate,
          message: `validate function failed to run`,
          error,
        })
      }
    }
  } else if (!__ignoreMissingInDevMode) {
    debug({
      type: 'views/data/runtime-validate-missing',
      viewPath,
      context,
      message: `Please provide a validate function.`,
    })
  }
  return isValidInitial
}

export function useDataIsValidInitial({
  context,
  path = null,
  validate = null,
  viewPath = null,
  __ignoreMissingInDevMode = false,
}) {
  let value = useDataValue({ context, path, viewPath })
  return isValidInitial({
    context,
    value,
    validate,
    viewPath,
    __ignoreMissingInDevMode,
  })
}

export function useDataIsValid({
  context,
  path = null,
  validate = null,
  required = false,
  viewPath = null,
  __ignoreMissingInDevMode = false,
} = {}) {
  let [data] = useDataContext(context)
  let value = useDataValue({ context, path, viewPath })

  let isValid =
    data._touched.has(path) || (required && data._forceRequired)
      ? isValidInitial({
          context,
          value,
          validate,
          viewPath,
          __ignoreMissingInDevMode,
        })
      : true

  return isValid
}

export function useSetFlowToBasedOnData({
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

export function useSetFlowToBasedOnDataExists({
  context,
  path = null,
  format = null,
  viewPath,
}) {
  let dataValue = useDataValue({ context, path, viewPath })
  let setFlowTo = useSetFlowTo(viewPath)

  let renderOneRef = useRef(false)

  useDataListener({
    context,
    viewPath,
    listener: (next, prev, flow, setFlowTo) => {
      if (!renderOneRef.current) return

      let value = path ? get(next, path) : next
      let isContent = !!value
      if (format) {
        isContent = format(value)
      }

      let prevValue = path ? get(prev, path) : prev
      let isContentPrev = !!prevValue
      if (format) {
        isContentPrev = format(prevValue)
      }

      let target = normalizePath(viewPath, isContent ? 'Content' : 'No')
      if (isContent !== isContentPrev || !flow.has(target)) {
        setFlowTo(target)
      }
    },
  })

  useEffect(() => {
    let isContent = !!dataValue
    if (format) {
      isContent = format(dataValue)
    }
    let viewPathNext = normalizePath(viewPath, isContent ? 'Content' : 'No')
    setFlowTo(viewPathNext)
    renderOneRef.current = true
  }, [viewPath]) //eslint-disable-line

  return null
}

export function useSetFlowToBasedOnDataIsValid({
  context,
  path,
  viewPath,
  validate,
  validateInitial = true,
}) {
  let dataIsValidInitial = useDataIsValidInitial({
    context,
    path,
    validate,
    viewPath,
  })
  let dataIsValid = useDataIsValid({
    context,
    path,
    validate,
    viewPath,
  })

  let setFlowTo = useSetFlowTo(viewPath)
  let validateInitialRef = useRef(false)
  let renderOneRef = useRef(false)

  useDataListener({
    context,
    viewPath,
    listener: (next, prev, flow, setFlowTo) => {
      if (!renderOneRef.current) return

      let value = path ? get(next, path) : next
      let isContent = validate(value, value, next)

      let prevValue = path ? get(prev, path) : prev
      let isContentPrev = validate(prevValue, prevValue, prev)

      let target = normalizePath(viewPath, isContent ? 'IsValid' : 'No')

      if (
        isContent !== isContentPrev ||
        validateInitialRef.current ||
        !flow.has(target)
      ) {
        setFlowTo(target)
      }

      if (validateInitialRef.current) {
        validateInitialRef.current = false
      }
    },
  })

  useEffect(() => {
    // on mount
    let isContent = validateInitial ? dataIsValidInitial : dataIsValid
    let target = normalizePath(viewPath, isContent ? 'IsValid' : 'No')
    setFlowTo(target)
    validateInitialRef.current = !validateInitial
    renderOneRef.current = true
  }, [viewPath]) //eslint-disable-line

  return null
}

export function useSetFlowToBasedOnDataIsInvalid({
  context,
  path,
  viewPath,
  validate,
  validateInitial = true,
}) {
  let dataIsValidInitial = useDataIsValidInitial({
    context,
    path,
    validate,
    viewPath,
  })
  let dataIsValid = useDataIsValid({
    context,
    path,
    validate,
    viewPath,
  })

  let setFlowTo = useSetFlowTo(viewPath)
  let validateInitialRef = useRef(false)
  let renderOneRef = useRef(false)

  useDataListener({
    context,
    viewPath,
    listener: (next, prev, flow, setFlowTo) => {
      if (!renderOneRef.current) return

      let value = path ? get(next, path) : next
      let isContent = !validate(value, value, next)

      let prevValue = path ? get(prev, path) : prev
      let isContentPrev = !validate(prevValue, prevValue, prev)

      let target = normalizePath(viewPath, isContent ? 'IsInvalid' : 'No')

      if (
        isContent !== isContentPrev ||
        validateInitialRef.current ||
        !flow.has(target)
      ) {
        setFlowTo(target)
      }

      if (validateInitialRef.current) {
        validateInitialRef.current = false
      }
    },
  })

  useEffect(() => {
    // on mount
    let isContent = validateInitial ? !dataIsValidInitial : !dataIsValid
    let target = normalizePath(viewPath, isContent ? 'IsInvalid' : 'No')
    setFlowTo(target)
    validateInitialRef.current = !validateInitial
    renderOneRef.current = true
  }, [viewPath]) //eslint-disable-line

  return null
}

export function useSetFlowToBasedOnDataIsSubmitting({ context, viewPath }) {
  let setFlowTo = useSetFlowTo(viewPath)
  let dataIsSubmitting = useDataIsSubmitting({ context, viewPath })

  // Does not need a register listener
  // Review when merge into the morpher
  useEffect(() => {
    setFlowTo(normalizePath(viewPath, dataIsSubmitting ? 'IsSubmitting' : 'No'))
  }, [viewPath, dataIsSubmitting]) //eslint-disable-line

  return null
}

export function useSetFlowToBasedOnDataSwitch({
  context,
  path,
  format = toCapitalisedCamelCase,
  viewPath,
}) {
  let dataValue = useDataFormat({
    context,
    path,
    format,
    viewPath,
  })
  let setFlowTo = useSetFlowTo(viewPath)
  let renderOneRef = useRef(false)

  useDataListener({
    context,
    viewPath,
    listener: (next, prev, flow, setFlowTo) => {
      if (!renderOneRef.current) return

      let value = path ? get(next, path) : next
      let view = format(value, next)

      let prevValue = path ? get(prev, path) : prev
      let viewPrev = format(prevValue, prev)

      let target = normalizePath(viewPath, view)
      if (view !== viewPrev || !flow.has(target)) {
        setFlowTo(target)
      }
    },
  })

  useEffect(() => {
    setFlowTo(normalizePath(viewPath, dataValue))
    renderOneRef.current = true
  }, [viewPath]) //eslint-disable-line

  return null
}

function toCapitalisedCamelCase(value) {
  return value && capitalize(camelCase(value))
}

function capitalize(value) {
  if (!value || typeof value !== 'string') return ''
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function isEmpty(data) {
  return Array.isArray(data) ? data.length === 0 : !data
}

let logQueue = []
let logTimeout = null
function debug(stuff) {
  logQueue.push(stuff)
  clearTimeout(logTimeout)
  logTimeout = setTimeout(() => {
    if (logQueue.length > 0) {
      console.debug({
        type: 'views/data',
        warnings: logQueue,
      })
      logQueue = []
    }
  }, 500)
}
