// This file is auto-generated. Edit App.view to change it. More info: https://github.com/viewstools/docs/blob/master/UseViews/README.md#viewjs-is-auto-generated-and-shouldnt-be-edited
/* eslint-disable jsx-a11y/accessible-emoji, no-unused-vars, no-dupe-keys */
import * as fromFlow from '../useFlow.js'
import Button from '../Buttons/Button.view.js'
import React from 'react'
import Settings from './App/Settings.view.js'
import Users from './App/Users.view.logic.js'
import useIsMedia from '../useIsMedia.js'
import { css } from 'emotion'

let styles = {}
styles.Topbar = css({
  label: 'Topbar',
  flexDirection: 'row',
  borderBottomLeftRadius: 4,
  borderBottomRightRadius: 4,
  borderTopLeftRadius: 4,
  borderTopRightRadius: 4,
  marginBottom: 8,
  marginLeft: 8,
  marginRight: 8,
  marginTop: 8,
  paddingLeft: 24,
  paddingRight: 24,
  backgroundColor: 'var(--backgroundColor)',
})

let App = props => {
  let isMedia = useIsMedia()

  let flow = fromFlow.useFlow()
  let setFlow = fromFlow.useSetFlow()

  return (
    <React.Fragment>
      <div
        data-testid="App.Topbar"
        style={{
          '--backgroundColor': `${isMedia.mobile ? '#AABBCC' : '#404040'}`,
        }}
        className={`views-block ${styles.Topbar}`}
      >
        <Button
          data-testid="App.Button"
          onClick={() => setFlow('/App/Users')}
          onClickId="/App/Users"
          text="Go to users"
          width={isMedia.mobile ? 400 : 300}
        />
        <Button
          data-testid="App.Button:1"
          marginLeft={8}
          onClick={() => setFlow('/App/Settings')}
          onClickId="/App/Settings"
          text="Go to settings"
        />
        <Button
          data-testid="App.Button:2"
          isDisabled={true}
          text="Disabled button"
        />
      </div>
      {flow.has('/App/Users') ? <Users data-testid="App.Users" /> : null}
      {flow.has('/App/Settings') ? (
        <Settings data-testid="App.Settings" />
      ) : null}
      {props.children}
    </React.Fragment>
  )
}

export default App
