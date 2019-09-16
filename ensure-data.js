import { promises as fs } from 'fs'
import path from 'path'

let USE_DATA = `// This file is automatically generated by Views and will be overwritten
// when the morpher runs. If you want to contribute to how it's generated, eg,
// improving the algorithms inside, etc, see this:
// https://github.com/viewstools/morph/blob/master/ensure-data.js
import * as fromValidate from './Data/validators.js';
import get from 'lodash/get';
import produce from 'immer';
import set from 'lodash/set';
import React, { useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import parseDate from 'date-fns/parse';
import parseISO from 'date-fns/parseISO';
import formatDate from 'date-fns/format';
import isValidDate from 'date-fns/isValid';

let identity = { in: i => i, out: i => i };

// show
let ItemContext = React.createContext({});
export let ItemProvider = ItemContext.Provider;
export let useItem = ({ path = null, format = identity } = {}) => {
  let item = useContext(ItemContext);

  return useMemo(() => (path ? { value: format.in(get(item, path)) } : item), [
    item,
    path,
    format,
  ]); // eslint-ignore-line
  // ignore get
};

// capture
let captureItemReducer = produce((draft, action) => {
  switch (action.type) {
    case CAPTURE_SET_FIELD: {
      set(draft, action.key, action.value);
      break;
    }

    case CAPTURE_RESET: {
      return action.state;
    }

    case CAPTURE_FORCE_REQUIRED: {
      draft._forceRequired = true;
      break;
    }

    default: {
      throw new Error(
        \`Unknown action type "\${action.type}" in update item reducer.\`
      );
    }
  }
});
let CAPTURE_SET_FIELD = 'capture/SET_FIELD';
export let setField = (key, value) => ({
  type: CAPTURE_SET_FIELD,
  key,
  value,
});
let CAPTURE_RESET = 'capture/RESET';
export let reset = state => ({ type: CAPTURE_RESET, state });

let CAPTURE_FORCE_REQUIRED = 'capture/FORCE_REQUIRED';

let CaptureItemContext = React.createContext([]);
export let CaptureItemProvider = CaptureItemContext.Provider;
export let useCaptureItem = ({
  path = null, format = identity, validate = null, required = false
} = {}) => {
  let captureItem = useContext(CaptureItemContext);
  let touched = useRef(false);

  if (process.env.NODE_ENV === 'development') {
    if (validate && !(validate in fromValidate)) {
      throw new Error(
        \`"\${validate}" function doesn't exist or is not exported in Data/validators.js\`
      );
    }
  }

  return useMemo(() => {
    if (!path) return captureItem;

    let [item, dispatch, onSubmit] = captureItem;

    if (!item) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'Check that you have <CaptureItemProvider value={captureData}> in the component that defines the data for this story.'
        );
        console.log({
          path,
          format,
          validate,
          required,
          captureItem,
        });
      }
      return {};
    }

    let value = format.in(get(item, path));

    let isValid =
      validate && (touched.current || (required && item._forceRequired))
        ? fromValidate[validate](value)
        : true;
    let onChange = value => {
      touched.current = true;
      dispatch(setField(path, format.out(value)));
    }

    return {
      onChange,
      onSubmit,
      value,
      isValid,
      isInvalid: !isValid
    };
  }, [captureItem, path, format, required, validate]);
};
export let useCaptureItemProvider = (item, onSubmit) => {
  let [state, dispatch] = useReducer(captureItemReducer, item);
  let isSubmitting = useRef(false);

  useEffect(() => {
    dispatch(reset(item));
  }, [item]);

  return useMemo(() => {
    async function _onSubmit(options) {
      if (isSubmitting.current) return;
      isSubmitting.current = true;

      try {
        let res = await onSubmit(options)
        isSubmitting.current = false;

        if (!res) return;
      } catch(error) {
        isSubmitting.current = false;
      }

      dispatch({ type: CAPTURE_FORCE_REQUIRED });
    }
    return [state, dispatch, _onSubmit];
  }, [
    state,
    dispatch,
    onSubmit,
  ]);
};

function formatDateInOut(rvalue, formatIn, formatOut, whenInvalid = '') {
  let value =
    formatIn === 'iso'
      ? parseISO(rvalue)
      : parseDate(rvalue, formatIn, new Date());
  return isValidDate(value) ? formatDate(value, formatOut) : whenInvalid;
}

export let useMakeFormatDate = (formatIn, formatOut, whenInvalid) =>
  useMemo(
    () => ({
      in: value => formatDateInOut(value, formatIn, formatOut, whenInvalid),
      out: value => formatDateInOut(value, formatOut, formatIn, whenInvalid),
    }),
    [] // eslint-disable-line
  ); // ignore formatIn, formatouOut, whenInvalid
`

export default function ensureIsBefore({ src }) {
  return fs.writeFile(path.join(src, 'useData.js'), USE_DATA, {
    encoding: 'utf8',
  })
}
