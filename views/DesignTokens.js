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
  return get(tokens, `${theme}.${path}`)
}
