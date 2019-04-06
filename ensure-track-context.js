let fs = require('mz/fs')

let TRACK_CONTEXT = `import React from 'react'

export let TrackContext = React.createContext()

export class Track extends React.Component {
  track = ({ block, action, event }) => {
    // TODO add your own tracking logic
    console.log(block, action, event.target.textContent || event.target.parentNode.textContent)
  }

  render() {
    return (
      <TrackContext.Provider value={this.track}>
        {this.props.children}
      </TrackContext.Provider>
    )
  }
}`

module.exports = async ({ file }) => {
  if (!(await fs.exists(file))) {
    await fs.writeFile(file, TRACK_CONTEXT, {
      encoding: 'utf8',
    })
  }
}
