import addFileIfItDoesntExist from './add-file-if-it-doesnt-exist.js'
import ensureFile from './ensure-file.js'
import path from 'path'

let DATA = `// This file is automatically generated by Views and will be overwritten
// when the morpher runs. If you want to contribute to how it's generated, eg,
// improving the algorithms inside, etc, see this:
// https://github.com/viewstools/morph/blob/master/ensure-data.js
import * as fromValidate from './validate.js'
import * as fromFormat from './format.js'
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

    case FORCE_REQUIRED: {
      draft._forceRequired = true
      break
    }

    default: {
      throw new Error(
        \`Unknown action type "\${action.type}" in useData reducer.\`
      )
    }
  }
})

let DataContexts = {
  default: React.createContext([]),
}
export function DataProvider(props) {
  if (!props.context) {
    throw new Error(
      \`You're missing the context value in DataProvider. Eg: <DataProvider context="namespace" ...\`
    )
  }
  if (!(props.context in DataContexts)) {
    DataContexts[props.context] = React.createContext([])
    DataContexts[props.context].displayName = props.context
  }
  let Context = DataContexts[props.context]

  let [state, dispatch] = useReducer(reducer, props.value)
  let isSubmitting = useRef(false)
  let shouldCallOnChange = useRef(false)

  useEffect(() => {
    if (isSubmitting.current) return

    shouldCallOnChange.current = false
    dispatch({ type: RESET, value: props.value })
  }, [props.value]) // eslint-disable-line
  // ignore dispatch

  let value = useMemo(() => {
    async function onSubmit(args) {
      if (isSubmitting.current) return
      isSubmitting.current = true

      try {
        let res = await props.onSubmit(state, args)
        isSubmitting.current = false

        if (!res) return
      } catch (error) {
        isSubmitting.current = false
      }

      dispatch({ type: FORCE_REQUIRED })
    }

    return [state, dispatch, onSubmit]
  }, [state, props.onSubmit]) // eslint-disable-line
  // the linter says we need props when props.onSubmit is already there

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

    onChange.current(state, fn => dispatch({ type: SET_FN, fn }))
  }, [state])

  return <Context.Provider value={value}>{props.children}</Context.Provider>
}
DataProvider.defaultProps = {
  context: 'default',
  onChange: () => {},
  onSubmit: () => {},
}

export function useData({
  path = null,
  context = 'default',
  formatIn = null,
  formatOut = null,
  validate = null,
  validateRequired = false,
} = {}) {
  if (process.env.NODE_ENV === 'development') {
    if (!(context in DataContexts)) {
      throw new Error(
        \`"\${context}" isn't a valid Data context. Check that you have <DataProvider context="\${context}" value={data}> in the component that defines the context for this story.\`
      )
    }

    if (formatIn && !(formatIn in fromFormat)) {
      throw new Error(
        \`"\${formatIn}" function doesn't exist or is not exported in Data/format.js\`
      )
    }

    if (formatOut && !(formatOut in fromFormat)) {
      throw new Error(
        \`"\${formatOut}" function doesn't exist or is not exported in Data/format.js\`
      )
    }

    if (validate && !(validate in fromValidate)) {
      throw new Error(
        \`"\${validate}" function doesn't exist or is not exported in Data/validators.js\`
      )
    }
  }

  let contextValue = useContext(DataContexts[context])
  let touched = useRef(false)

  return useMemo(() => {
    let [data, dispatch, onSubmit] = contextValue

    if (!data) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'Check that you have <DataProvider value={data}> in the component that defines the data for this story.',
          {
            path,
            formatIn,
            formatOut,
            validate,
            validateRequired,
            data,
          }
        )
      }
      return {}
    }

    let rawValue = path ? get(data, path) : data
    let value = rawValue
    if (path && formatIn) {
      value = fromFormat[formatIn](rawValue, data)
    }

    let isValidInitial = true
    if (validate) {
      isValidInitial = fromValidate[validate](rawValue, value, data)
    }
    let isValid = touched.current || (validateRequired && data._forceRequired)? isValidInitial : true

    function onChange(value, changePath = path) {
      touched.current = !!value

      if (typeof value === 'function') {
        dispatch({ type: SET_FN, fn: value })
      } else if (!changePath) {
        dispatch({ type: RESET, value })
      } else {
        dispatch({
          type: SET,
          path: changePath,
          value: formatOut ? fromFormat[formatOut](value, data) : value,
        })
      }
    }

    return {
      onChange,
      onSubmit,
      value,
      isValid,
      isValidInitial,
      isInvalid: !isValid,
      isInvalidInitial: !isValidInitial,
    }
  }, [contextValue, path, formatIn, formatOut, validateRequired, validate])
}
`

export default async function ensureData({ src }) {
  await Promise.all([
    addFileIfItDoesntExist(
      path.join(src, 'Data', 'format.js'),
      '// export functions to use in data format'
    ),
    addFileIfItDoesntExist(
      path.join(src, 'Data', 'validate.js'),
      '// export functions to use in data validate'
    ),
  ])

  return ensureFile({
    file: path.join(src, 'Data', 'ViewsData.js'),
    content: DATA,
  })
}
