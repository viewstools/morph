const globule = require('globule')
const fs = require('fs')

module.exports = src => {
  const options = {
    filter: f => !/node_modules/.test(f),
  }

  const created = globule.find(
    [
      `${src}/**/*.data`,
      `${src}/**/*.view`,
      `${src}/**/*.view.logic.js`,
      `${src}/**/*.view.tests`,
    ],
    options
  )

  const morphed = globule.find(
    [
      `${src}/**/*.data.js`,
      `${src}/**/*.view.css`,
      `${src}/**/*.view.js`,
      `${src}/**/*.view.tests.js`,
    ],
    options
  )

  const toRemove = morphed.filter(
    m => !created.includes(m.replace(/\.(js|css)$/, ''))
  )

  toRemove.forEach(f => fs.unlinkSync(f))
}
