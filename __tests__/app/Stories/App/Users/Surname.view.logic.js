import { useItemValue } from '../../../Data/Users.js'
import React from 'react'
import Surname from './Surname.view.js'

export default function SurnameLogic() {
  let text = useItemValue('surname')
  return <Surname text={text} />
}
