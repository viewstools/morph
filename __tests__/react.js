import { morph, parse } from '../index.js'
import { join } from 'path'
import { existsSync, readdirSync, readFileSync } from 'fs'

const isView = f => /\.view$/.test(f)
const getPath = (f = '.') => join(__dirname, 'views', f)
const getName = f => f.replace(/\.view$/, '')

const viewsSource = {}
const viewsParsed = {}
const files = []

const getFiles = () => {
  readdirSync(getPath())
    .filter(isView)
    .forEach(f => {
      const view = getName(f)
      const source = readFileSync(getPath(f), 'utf-8')
      viewsParsed[view] = parse(source)
      viewsSource[view] = source
      files.push(f)
    })
}

const getFont = font =>
  `./Fonts/${font.family}-${font.weight}${
    font.style === 'italic' ? '-italic' : ''
  }`
;['react-dom', 'react-native', 'e2e'].forEach(as =>
  describe(as, () => {
    getFiles()
    files.forEach(f => {
      const name = getName(f)
      const code = viewsSource[name]
      const testFile = getPath(`${f}.tests`)
      const tests = existsSync(testFile)
        ? readFileSync(testFile, 'utf-8')
        : undefined

      it(`parses ${as} ${name}`, () => {
        expect(
          morph({
            as,
            getFont,
            inlineStyles: true,
            name,
            pretty: true,
            tests,
            viewsParsed,
          })
        ).toMatchSnapshot()

        if (as === 'react-dom') {
          expect(
            morph({
              as,
              debug: true,
              getFont,
              inlineStyles: true,
              name,
              pretty: true,
              tests,
              viewsParsed,
            })
          ).toMatchSnapshot(`${as} parses ${as} ${name} debug`)
        }
      })
      // TODO test rendered morphed view
    })
  })
)
