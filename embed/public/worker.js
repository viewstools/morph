/* eslint-env worker */
/* eslint no-var: off, strict: off */

// "Polyfills" in order for all the code to run
self.global = self
self.Buffer = {
  isBuffer: function() {
    return false
  },
}
// eslint-disable-next-line
fs = module$1 = module = path = os = crypto = {}
self.process = { argv: [], env: {} }
self.assert = { ok: function() {}, strictEqual: function() {} }
self.require = function require(path) {
  return self[path.replace(/.+-/, '')]
}

importScripts('lib/index.js')
importScripts('lib/parser-babylon.js')
importScripts('views-morph.js')

var prettier = index // eslint-disable-line
self.prettier = prettier

var parsersLoaded = {}

self.onmessage = function(message) {
  var code
  var fonts

  try {
    code = views.morph(message.data.text, message.data.options)
    code = prettier.format(code, {
      parser: 'babylon',
      singleQuote: true,
      trailingComma: 'es5',
    })
    code = code
      .replace(/import /g, '// import')
      .replace(`export default`, `return `)

    var fontsMatch = code.match(/\/\/ fonts (.+)/)
    if (fontsMatch && fontsMatch[1]) {
      fonts = JSON.parse(fontsMatch[1])
    }
  } catch (e) {
    code = e.toString()
  }

  self.postMessage({ code: code, fonts: fonts })
}
