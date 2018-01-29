import { morph } from '../index.js'
import { join } from 'path'
import { existsSync, readdirSync, readFileSync } from 'fs'

const isView = f => /\.view$/.test(f)
const getPath = (f = '.') => join(__dirname, 'views', f)

const getFont = font =>
  `./Fonts/${font.family}-${font.weight}${
    font.style === 'italic' ? '-italic' : ''
  }`
;['react-dom', 'react-native', 'e2e'].forEach(as =>
  describe(as, () => {
    readdirSync(getPath())
      .filter(isView)
      .forEach(f => {
        const name = f.replace(/\.view$/, '')
        const code = readFileSync(getPath(f), 'utf-8')
        const testFile = getPath(`${f}.tests`)
        const tests = existsSync(testFile)
          ? readFileSync(testFile, 'utf-8')
          : undefined

        it(`parses ${as} ${name}`, () => {
          expect(
            morph(code, {
              as,
              getFont,
              inlineStyles: true,
              name,
              pretty: true,
              tests,
            })
          ).toMatchSnapshot()

          if (as === 'react-dom') {
            expect(
              morph(code, {
                as,
                debug: true,
                getFont,
                inlineStyles: true,
                name,
                pretty: true,
                tests,
              })
            ).toMatchSnapshot(`${as} parses ${as} ${name} debug`)
          }
        })
        // TODO test rendered morphed view
      })
  })
)
