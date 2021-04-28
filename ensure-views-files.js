import { promises as fs } from 'fs'
import ensureFile from './ensure-file.js'
import ensureFlow from './ensure-flow.js'
import ensureIsMedia from './ensure-is-media.js'
import ensureGitignore from './ensure-gitignore.js'
import ensureMorpherVersion from './ensure-morpher-version.js'
import glob from 'fast-glob'
import path from 'path'

export default async function ensureViewsFiles(state) {
  return Promise.all([
    ...ensureFlow(state),
    ensureIsMedia(state),
    ...(await ensureStaticFiles(state)),
    ensureMorpherVersion(state),
    ensureGitignore(state),
  ])
}

async function ensureStaticFiles({ pass, src, tools }) {
  if (pass > 0) return []

  let files = await glob('**/*.js', {
    cwd: path.join(__dirname, 'views'),
    ignore: ['Flow.js', '**/*.tools.js', tools && 'Tools.js'].filter(Boolean),
  })

  if (tools) {
    let filesTools = await glob('**/*.tools.js', {
      cwd: path.join(__dirname, 'views'),
      ignore: ['Flow.tools.js'],
    })

    files = [
      ...files.filter(
        (file) => !filesTools.includes(file.replace('.js', '.tools.js'))
      ),
      ...filesTools,
    ]
  }

  return files
    .map(async (file) =>
      ensureFile({
        file: path.join(src, 'Views', file.replace('.tools.js', '.js')),
        content: await fs.readFile(path.join(__dirname, 'views', file)),
      })
    )
    .flat()
}
