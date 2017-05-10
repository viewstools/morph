const { morph } = require('../lib.js')

const views = [
  {
    name: 'JustText',
    code: `Text
text hey!`,
  },
  {
    name: 'Proxy',
    code: `Button is Horizontal
Icon is Proxy
from props.icon
fill red
Text
text props.text`,
  },
  {
    name: 'UseOfProxy',
    code: `App is Horizontal
Button
icon MyIcon
text I'm a button!`,
  },
  {
    name: 'ListOfSomething',
    code: `List
from props.list
Text
text item.name`,
  },
]

const as = 'react-dom'

describe(as, () => {
  views.forEach(({ code, name }) => {
    it(`parses ${name}`, () => {
      expect(morph(code, { as, name, pretty: true })).toMatchSnapshot()
    })
  })
})
