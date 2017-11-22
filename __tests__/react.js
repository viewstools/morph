import { morph } from '../index.js'
import { join } from 'path'
import { existsSync, readdirSync, readFileSync } from 'fs'

const isView = f => /\.view$/.test(f)
const getPath = (f = '.') => join(__dirname, 'views', f)
;['react-dom', 'react-native'].forEach(as =>
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
          const morphed = morph(code, {
            as,
            inlineStyles: true,
            name,
            pretty: true,
            tests,
          })
          expect(morphed).toMatchSnapshot()
        })
        // TODO test rendered morphed view
      })
  })
)
