const { readFileSync, writeFileSync } = require('fs')
const { morph, pathToName } = require('./lib.js')

let {
  as,
  compile,
  help,
  input,
  output,
  pretty,
} = require('minimist')(process.argv.slice(2), {
  alias: {
    help: 'h',
    input: 'i',
    o: 'output',
  },
  booleans: ['help'],

  default: {
    as: 'react-dom',
    compile: false,
    pretty: false,
  },
})

if (help) {
  console.log(
    `
  views-morph
    --as            target platform             defaults to react-dom
    --compile       if true, produces raw js    defaults to false
    --input -i      /path/to/some.view
    --name          the name of the view        defaults to the input file name without
                                                the extension in pascal case format. Eg: for input
                                                file-is-view.view you the name is FileIsView.
    --output -o     /path/to/output.js          defaults to stdout
    --pretty        nicely format output code   defaults to false
  `
  )

  process.exit()
}

if (!input) {
  console.error(
    'You need to specify an input file. Eg run views-morph --input some.view'
  )
  process.exit()
}

const code = morph(readFileSync(input, 'utf-8'), {
  as,
  compile,
  name: pathToName(input),
  pretty,
})

if (output) {
  writeFileSync(output, code)
} else {
  console.log(code)
}
