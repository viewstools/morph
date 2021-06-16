import React from 'react'
import { DataProvider, useDataValue } from 'Views/Data.js'
import get from 'lodash/get'
import tokens from 'DesignSystem/tokens.json'

let defaultTheme = Object.keys(tokens)[0]

export function DesignTokens({ theme = defaultTheme, children, viewPath }) {
  return (
    <DataProvider
      context="design_tokens_theme"
      value={theme}
      viewPath={viewPath}
    >
      {children}
    </DataProvider>
  )
}

export function useDesignTokenValue({ path, viewPath }) {
  let theme = useDataValue({
    context: 'design_tokens_theme',
    viewPath,
  })
  let token = get(tokens, `${theme}.${path}`)
  if (process.env.NODE_ENV === 'development') {
    if (!token) {
      debug({
        type: 'views/design-tokens/missing-design-token',
        viewPath,
        message: `You're missing the design token "${path}" for the theme "${theme}". Please add it to your project's design-tokens.json file.`,
      })
    }
  }
  return token
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
