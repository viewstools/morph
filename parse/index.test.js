import parse from './index.js'

test('#parse', () => {
  VIEWS.forEach(view => expect(parse(view)).toMatchSnapshot())
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
color props.some.thing || 'red'
marginLeft props.marginLeft
text props.some.prop
CaptureText
onFocus props.onFocus
List
from props.stuff
when props.stuff.length > 0
Stuff`,
]
