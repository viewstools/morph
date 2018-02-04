import parse from './index.js'

test('#parse', () => {
  VIEWS.forEach(view => expect(parse(view)).toMatchSnapshot())

  expect(parse(WARNING)).toMatchSnapshot()
})

const VIEWS = [
  `Main Vertical`,

  `Main Vertical
Text`,

  `BlueButton Vertical
Before Text

Nested Vertical
ImageInside Image
source https://image.com/file.jpg

VerticalInside Vertical


After Text
text after
color purple
when hover
color red

Last Vertical
backgroundColor blue`,

  // ensure that empty spaces at the end of the block don't block the block from
  // being recognised as a stop point for the props of the previous block
  `A Vertical 
A1 Text
color red

A2 Text    
color white`,

  `Vertical
backgroundColor props.backgroundColor
onClick event => props.onClick(props.name, event)
Title Text
color props red
marginLeft props 10
text props.title This is the title

CaptureText
onFocus props

List
from props
Stuff`,
]

const WARNING = `Warning Vertical
EmptyWhen Vertical
color blue
marginTop props
border 1px solid red
when
color red
when props. stuff
backgroundColor purple
color green`
