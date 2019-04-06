import parse from './index.js'

test('#parse', () => {
  VIEWS.forEach(view => expect(parse({ source: view })).toMatchSnapshot())

  expect(parse({ source: WARNING })).toMatchSnapshot()
})

let VIEWS = [
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
    when <isHovered
    color red
  Last Vertical
    backgroundColor blue`,
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
  Capture
    type text
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

let WARNING = `Warning Vertical
  EmptyWhen Vertical
    color blue
    height 100
    marginTop <
    border 1px solid red
    height 302
    when
    color red
    when < stuff
    backgroundColor purple
    color green`
