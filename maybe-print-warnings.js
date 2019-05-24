import chalk from 'chalk'

export default function maybePrintWarnings(view, verbose) {
  if (!verbose || view.parsed.warnings.length === 0) return

  console.error(chalk.red(view.id), chalk.dim(view.file))

  view.parsed.warnings.forEach(warning => {
    console.error(
      `  ${chalk.yellow(warning.loc.start.line)}: ${chalk.blue(
        warning.type
      )} Line: "${warning.line}"`
    )
  })
}
