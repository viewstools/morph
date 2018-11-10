import { morph, parse } from '../index.js'
import { join } from 'path'
import { readdirSync, readFileSync } from 'fs'

const isView = f => /\.view$/.test(f)
const getPath = (f = '.') => join(__dirname, 'views', f)
const getName = f => f.replace(/\.view$/, '')

const getFont = font =>
  `./Fonts/${font.family}-${font.weight}${
    font.style === 'italic' ? '-italic' : ''
  }`

const localSupported = ['en', 'es', 'fr']
;['react-dom', 'react-native', 'e2e'].forEach(as =>
  describe(as, () => {
    const views = {}

    const getFiles = () =>
      readdirSync(getPath())
        .filter(isView)
        .map(f => {
          const view = getName(f)
          const source = readFileSync(getPath(f), 'utf-8')
          views[view] = parse({ source })
          return f
        })

    getFiles().forEach(f => {
      const name = getName(f)

      it(`parses ${as} ${name}`, () => {
        expect(
          morph({
            as,
            getFont,
            getImport: (name, isLazy) => {
              return isLazy
                ? `const ${name} = React.lazy(() => import('./${name}.view.js'))`
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
)
