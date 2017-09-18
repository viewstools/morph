import { morph } from '../index.js'
import { join } from 'path'
import { readdirSync, readFileSync } from 'fs'

const as = 'tests'
const isData = f => /\.view.tests$/.test(f)
const getPath = (f = '.') => join(__dirname, 'tests', f)
describe(as, () => {
  readdirSync(getPath())
    .filter(isData)
    .forEach(f => {
      const name = f.replace(/\.view$/, '')
      const raw = getPath(f)
      const code = readFileSync(raw, 'utf-8')

      it(`parses ${as} ${name}`, () => {
        expect(
          morph(code, { as, file: { raw }, name, pretty: true })
        ).toMatchSnapshot()
      })
    })
})
