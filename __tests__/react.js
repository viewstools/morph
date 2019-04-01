import { morph, parse } from '../index.js'
import { join } from 'path'
import { readdirSync, readFileSync } from 'fs'

let isView = f => /\.view$/.test(f)
let getPath = (f = '.') => join(__dirname, 'views', f)
let getName = f => f.replace(/\.view$/, '')

let getFont = font =>
  `./Fonts/${font.family}-${font.weight}${
    font.style === 'italic' ? '-italic' : ''
  }`

let localSupported = ['en', 'es', 'fr']
let targets = ['react-dom', 'react-native', 'e2e']

targets.forEach(as => {
  global.describe(as, () => {
    let views = {}

    let files = readdirSync(getPath())
      .filter(isView)
      .map(f => {
        let view = getName(f)
        let source = readFileSync(getPath(f), 'utf-8')
        views[view] = parse({ source })
        return f
      })

    files.forEach(f => {
      let name = getName(f)

      it(`parses ${as} ${name}`, () => {
        expect(
          morph({
            as,
            getFont,
            getImport: (name, isLazy) => {
              return isLazy
                ? `let ${name} = React.lazy(() => import('./${name}.view.js'))`
                : `import ${name} from './${name}.view.js'`
            },
            localSupported,
            name,
            pretty: true,
            views,
          })
        ).toMatchSnapshot()
      })
      // TODO test rendered morphed view
    })
  })
})
