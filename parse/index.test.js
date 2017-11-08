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
]
