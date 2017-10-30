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
]
