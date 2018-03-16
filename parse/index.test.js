import parse from './index.js'

test('#parse', () => {
  VIEWS.forEach(view => expect(parse({ source: view })).toMatchSnapshot())

  expect(parse({ source: WARNING })).toMatchSnapshot()
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
when <hover
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
backgroundColor <backgroundColor
onClick <onClick
Title Text
color < red
marginLeft < 10
text <title This is the title

CaptureText
onFocus <

List
from <
Stuff`,

  `Locals Vertical
Text
text hi
when <es
text hola`,
]

const WARNING = `Warning Vertical
EmptyWhen Vertical
color blue
marginTop <
border 1px solid red
when
color red
when < stuff
backgroundColor purple
color green`
