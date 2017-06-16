// import { timing, Value } from 'animated/lib/targets/react-dom.js'
import Dimensions from './Dimensions.js'
import React from 'react'
import View from './App.view.js'

const AppLogic = props =>
  <Dimensions>
    {({ height, width }) => <View height={height} width={width} />}
  </Dimensions>

export default AppLogic
