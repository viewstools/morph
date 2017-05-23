import { morph } from '../index.js'
import { join } from 'path'
import { readdirSync, readFileSync } from 'fs'

const isView = f => /\.view$/.test(f)
const getPath = (f = '.') => join(__dirname, 'views', f)
;[('react-dom', 'react-native')].forEach(as =>
  describe(as, () => {
    readdirSync(getPath()).filter(isView).forEach(f => {
      const name = f.replace(/\.view$/, '')
      const code = readFileSync(getPath(f), 'utf-8')

      it(`parses ${name}`, () => {
        expect(morph(code, { as, name, pretty: true })).toMatchSnapshot()
      })
    })
  })
)
