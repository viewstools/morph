// This file is auto-generated. Edit Settings.view to change it. More info: https://github.com/viewstools/docs/blob/master/UseViews/README.md#viewjs-is-auto-generated-and-shouldnt-be-edited
/* eslint-disable jsx-a11y/accessible-emoji, no-unused-vars, no-dupe-keys */
import '../../Fonts/WonderUnitSans-300.js'
import * as fromFlow from '../../useFlow.js'
import ArrowLeft from '../../Svgs/ArrowLeft.view.js'
import ButtonIcon from '../../Buttons/ButtonIcon.view.js'
import React from 'react'
import { css } from 'emotion'

let styles = {}
styles.Vertical = css({ label: 'Vertical', marginLeft: 8 })
styles.Text = css({
  label: 'Text',
  color: 'deepskyblue',
  fontFamily: 'WonderUnitSans',
  fontSize: 28,
  fontWeight: 300,
  marginTop: 24,
})

let Settings = props => {
  let setFlow = fromFlow.useSetFlow()

  return (
    <React.Fragment>
      <div
        data-testid="Settings.Vertical"
        className={`views-block ${styles.Vertical}`}
      >
        <ButtonIcon
          proxyArrowRight={ArrowLeft}
          data-testid="Settings.ButtonIcon"
          alignSelf="flex-start"
          onClick={() => setFlow('/App/Users')}
          onClickId="/App/Users"
          text="Go to users"
        />
        <span
          data-testid="Settings.Text"
          className={`views-text ${styles.Text}`}
        >
          Settings
        </span>
      </div>
      {props.children}
    </React.Fragment>
  )
}

export default Settings
