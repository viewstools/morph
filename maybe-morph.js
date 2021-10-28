import chalk from 'chalk'
import morphers from './morphers.js'
// import prettier from 'prettier'

export default function maybeMorph({
  as,
  getFontImport,
  getSystemImport,
  profile,
  src,
  tools,
  view,
  viewsById,
  viewsToFiles,
  verbose,
  designSystemImportRoot,
}) {
  let result = null
  try {
    result = morphers[as]({
      getFontImport,
      getSystemImport,
      profile,
      src,
      tools,
      view,
      viewsById,
      viewsToFiles,
      designSystemImportRoot,
    })

    view.version++

    verbose &&
      console.log(
        `${chalk.green('M')} ${view.id}@${view.version}:${chalk.dim(view.file)}`
      )

    return { content: result.code, extraFiles: result.extraFiles }

    // return prettier.format(result.code, {
    //   parser: 'babel',
    //   singleQuote: true,
    //   trailingComma: 'es5',
    // })
  } catch (error) {
    console.error(chalk.red('M'), view, error.codeFrame || error)
    return {
      content: `import { useEffect } from 'react'

export default function ${view.id}() {
  useEffect(() => {
    console.error({
      type: 'morph',
      view: '${view.id}',
      file: '${view.file}',
      todo: "Report to https://github.com/viewstools/morph/issues/new with .view and .view.js files and what changed when it failed. This will help us improve the morpher. Thanks!",
    })
  }, [])

  return "😳 Can't morph '${view.id}'. See console for more details."
}

/*
>>> CODE
${result && result.code.replace(/(\/\*|\*\/)/g, '')}


>>> ERROR
${error.message}
${error.stack}
*/`,
    }
  }
}
