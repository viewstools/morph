import { DataProvider, DataConsumer, ItemProvider } from '../../Data/Users.js'
import React from 'react'
import Users from './Users.view.js'

export default function UsersLogic() {
  return (
    <DataProvider>
      <DataConsumer>
        {list =>
          list.map(item => (
            <ItemProvider key={item.id} value={item}>
              <Users />
            </ItemProvider>
          ))
        }
      </DataConsumer>
    </DataProvider>
  )
}
