import { morph, parse } from '../index.js'
import { join } from 'path'
import { existsSync, readdirSync, readFileSync } from 'fs'

const isView = f => /\.view$/.test(f)
const getPath = (f = '.') => join(__dirname, 'views', f)
const getName = f => f.replace(/\.view$/, '')

const views = {}
const files = []

const getFiles = () =>
  readdirSync(getPath())
    .filter(isView)
    .map(f => {
      const view = getName(f)
      const source = readFileSync(getPath(f), 'utf-8')
      views[view] = parse({ source })
      return f
    })

const getFont = font =>
  `./Fonts/${font.family}-${font.weight}${
    font.style === 'italic' ? '-italic' : ''
  }`

const localSupported = ['en', 'es', 'fr']
;['react-dom', 'react-native', 'e2e'].forEach(as =>
  describe(as, () => {
    getFiles().forEach(f => {
      const name = getName(f)

      it(`parses ${as} ${name}`, () => {
        expect(
          morph({
            as,
            getFont,
            localSupported,
            name,
            pretty: true,
            views,
          })
        ).toMatchSnapshot()

        if (as === 'react-dom') {
          expect(
            morph({
              as,
              debug: true,
              getFont,
              localSupported,
              name,
              pretty: true,
              views,
            })
          ).toMatchSnapshot(`${as} parses ${as} ${name} debug`)
        }
      })
      // TODO test rendered morphed view
    })
  })
)
