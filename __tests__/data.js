import { morph } from '../index.js'
import { join } from 'path'
import { readdirSync, readFileSync } from 'fs'

const as = 'data'
const isData = f => /\.data$/.test(f)
const getPath = (f = '.') => join(__dirname, 'data', f)
describe(as, () => {
  readdirSync(getPath()).filter(isData).forEach(f => {
    const name = f.replace(/\.view$/, '')
    const code = readFileSync(getPath(f), 'utf-8')

    it(`parses ${as} ${name}`, () => {
      expect(morph(code, { as, name, pretty: true })).toMatchSnapshot()
    })
  })
})
