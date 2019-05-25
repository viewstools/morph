import { promises as fs } from 'fs'
import getViewRelativeToView from './get-view-relative-to-view.js'
import path from 'path'
import relativise from './relativise.js'

export default async function hackMigration({ src, viewsById, viewsToFiles }) {
  // hack up
  let viewMap = []

  let app = viewsToFiles.get([...viewsById.get('App')][0])

  async function run(view, nextId, dir) {
    viewMap.push(`mkdir -p ${dir}`)
    viewMap.push(`git mv ${view.file} ${path.join(dir, `${nextId}.view`)}`)

    if (view.logic) {
      let nextLogicFile = path.join(dir, `${nextId}.view.logic.js`)
      viewMap.push(`git mv ${view.logic} ${nextLogicFile}`)

      let logic = await fs.readFile(view.logic, 'utf8')
      logic = logic.replace(new RegExp(`${view.id}`, 'g'), nextId)

      logic = logic.split('\n').map(line => {
        if (line.startsWith('import ')) {
          let match = line.match(/from '(\.\..+)'/)
          if (match) {
            let dep = path.normalize(
              path.join(path.dirname(view.logic), match[1])
            )
            return line.replace(match[1], relativise(nextLogicFile, dep))
          }
        }
        return line
      })

      await fs.writeFile(view.logic, logic.join('\n'), 'utf8')
    }

    let viewInViewRemapped = new Map()

    for await (let id of view.parsed.view.views) {
      let viewInView = getViewRelativeToView({
        id,
        view,
        viewsById,
        viewsToFiles,
      })

      if (!viewInView.custom && viewInView.parsed.view.isStory) {
        let viewInViewNextId = viewInView.id
          .replace(view.id, '')
          .replace(nextId, '')

        if (viewInView.id !== viewInViewNextId) {
          viewInViewRemapped.set(viewInView.id, viewInViewNextId)
        }

        await run(viewInView, viewInViewNextId, path.join(dir, nextId))
      }
    }

    if (viewInViewRemapped.size > 0) {
      let content = await fs.readFile(view.file, 'utf8')
      for (let [id, nextId] of viewInViewRemapped) {
        content = content.replace(new RegExp(`${id}`, 'g'), nextId)
      }
      await fs.writeFile(view.file, content, 'utf8')
    }
  }
  await run(app, 'App', path.join(src, 'Stories'))

  console.log(viewMap.join('\n'))
}
