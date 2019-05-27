import React, { useContext, useReducer } from 'react'

function reducer(state, action) {
  if (action.type) {
    // TODO
  }
  return state
}

let DataContext = React.createContext([])
let DispatchContext = React.createContext(() => {})

export let DataConsumer = DataContext.Consumer
export let DataProvider = props => {
  let [list, dispatch] = useReducer(reducer, [
    {
      id: 1,
      name: 'Jenny',
      surname: 'Summers',
    },
    {
      id: 2,
      name: 'John',
      surname: 'Winters',
    },
  ])

  return (
    <DataContext.Provider value={list}>
      <DispatchContext.Provider value={dispatch}>
        {props.children}
      </DispatchContext.Provider>
    </DataContext.Provider>
  )
}
export let useData = () => useContext(DataContext)
export let useDispatch = () => useContext(DispatchContext)

let ItemContext = React.createContext({})
export let ItemConsumer = ItemContext.Consumer
export let ItemProvider = ItemContext.Provider

export let useItem = () => useContext(ItemContext)
export let useItemValue = key => useItem()[key]
