import { useItemValue } from '../../../Data/Users.js'
import React from 'react'
import Name from './Name.view.js'

export default function NameLogic() {
  let text = useItemValue('name')
  return <Name text={text} />
}
