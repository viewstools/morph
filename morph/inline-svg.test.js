const toSvg = require('./inline-svg.js')
const path = require('path')

test('#toSvg', async () => {
  expect(
    await toSvg(path.join(__dirname, 'inline-svg-fixture.svg'))
  ).toMatchSnapshot()
})
