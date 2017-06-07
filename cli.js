#!/usr/bin/env node

const { readFileSync, statSync } = require('fs')
const { morph, pathToName } = require('./lib.js')
const chalk = require('chalk')
const watch = require('./watch.js')

const {
  _,
  as,
  compile,
  help,
  pretty,
  tests,
  watch: shouldWatch,
} = require('minimist')(process.argv.slice(2), {
  alias: {
    help: 'h',
  },
  booleans: ['help', 'watch'],

  default: {
    as: 'react-dom',
    compile: false,
    pretty: true,
    tests: true,
    watch: false,
  },
})

if (help) {
  console.log(`
  views-morph [file or directory]
    --as            target platform
                      react-dom (default)
                      react-native
                      data

    --compile       if true, produces ES5 JS, defaults to false
    --pretty        format output code, defaults to true
    --tests         if true, it includes the .view.tests files in
                      the output, defaults to true
    --watch         watch a directory and produce .view.js files
  `)

  process.exit()
}

const input = Array.isArray(_) && _[0]

if (!input) {
  console.error(
    'You need to specify an input file. Eg run views-morph some.view'
  )
  process.exit()
}

if (shouldWatch) {
  if (!statSync(input).isDirectory()) {
    console.error(
      `You need to specify an input directory to watch. ${input} is a file.`
    )
    process.exit()
  }

  console.log(
    `Will morph files at '${chalk.green(input)}' as ${chalk.green(
      as
    )} and ${tests ? 'will' : "won't"} include tests\n`
  )
  console.log(chalk.yellow('A'), ' = Added')
  console.log(chalk.blue('D'), ` = View deleted`)
  console.log(chalk.green('M'), ` = Morphed`)
  console.log(chalk.red('M'), ` = Morph failed`)
  console.log(chalk.magenta('!'), ` = View doesn't exist but is being used`)
  console.log('\n\nPress', chalk.blue('ctrl+c'), 'to stop at any time.\n\n')

  watch({
    as,
    compile,
    pretty,
    src: input,
    tests,
  })
} else {
  const code = morph(readFileSync(input, 'utf-8'), {
    as,
    compile,
    name: pathToName(input),
    pretty,
    tests,
  })

  console.log(code)
}
