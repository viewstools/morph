const { morph } = require('../lib.js')
const { join } = require('path')
const { readdirSync, readFileSync } = require('fs')

const as = 'react-dom'
const isView = f => /\.view$/.test(f)
const getPath = (f = '.') => join(__dirname, 'views', f)

describe(as, () => {
  readdirSync(getPath()).filter(isView).forEach(f => {
    const name = f.replace(/\.view$/, '')
    const code = readFileSync(getPath(f), 'utf-8')

    it(`parses ${name}`, () => {
      expect(morph(code, { as, name, pretty: true })).toMatchSnapshot()
    })
  })
})
