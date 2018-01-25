const fs = require('mz/fs')

const CSS = `* {
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: -ms-autohiding-scrollbar;
}
html,
body,
#root {
  height: 100%;
  margin: 0;
}
a.views-block,
button.views-block,
div.views-block,
form.views-block,
img.views-block,
input.views-block,
span.views-block,
svg.views-block,
textarea.views-block {
  align-items: stretch;
  box-sizing: border-box;
  color: inherit;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  hyphens: auto;
  margin: 0;
  outline: 0;
  overflow-wrap: break-word;
  padding: 0;
  position: relative;
  text-decoration: none;
  word-wrap: break-word;
}
a.views-block,
button.views-block,
input.views-block,
textarea.views-block {
  background-color: transparent;
  border-radius: 0;
  border: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  margin: 0;
  padding: 0;
  text-align: left;
  white-space: normal;
}
button.views-block::-moz-focus-inner {
  border: 0;
  margin: 0;
  padding: 0;
}
/* remove number arrows */
input.views-block[type='number']::-webkit-outer-spin-button,
input.views-block[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}`

const BASE_CSS = `import { injectGlobal } from 'react-emotion'
injectGlobal(\`${CSS}\`)`

module.exports = async file => {
  await fs.writeFile(file, BASE_CSS, { encoding: 'utf8' })
}
