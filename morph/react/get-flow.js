import relativise from '../../relativise.js'

export default function getFlow({ name, viewPath, src, view }) {
  return `// This file is auto-generated.
// It's responsible for giving the view it's own Flow context.

import * as fromFlow from 'Views/Flow'
import ${name} from '${relativise(view.file, view.importFile, src).replace(
    '.js',
    ''
  )}'

export default function ${name}Flow({ children, viewPath, ...props }) {
  return (
    <fromFlow.ViewsFlow viewPath={viewPath}>
      <${name} {...props} viewPath=${JSON.stringify(viewPath)}>
        {children}
      </${name}>
    </fromFlow.ViewsFlow>
  )
}`
}
