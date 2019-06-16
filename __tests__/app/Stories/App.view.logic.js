import { Flow } from '../useFlow.js'
import App from './App.view.js'
import React from 'react'

let AppLogic = props => {
  let initialState

  try {
    initialState = JSON.parse(
      decodeURIComponent(window.location.search.split('?state=')[1])
    )
  } catch (error) {}

  return (
    <Flow initialState={initialState}>
      <App {...props} />
    </Flow>
  )
}
export default AppLogic
