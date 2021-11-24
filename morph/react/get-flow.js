export default function getFlow({ name, viewPath, src, view }) {
  let importFile = view.query ? 'data' : view.logic ? 'logic' : 'view'

  return `// This file is auto-generated.
// It's responsible for giving the view it's own Flow context.

import * as fromFlow from 'Views/Flow'
import ${name} from './${importFile}'

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
