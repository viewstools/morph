import React, { Profiler } from 'react'

let data = []

export function Profile(props) {
  return (
    <Profiler id={props.viewPath} onRender={onRender}>
      {props.children}
    </Profiler>
  )

  function onRender(
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
    // interactions
  ) {
    if (data.length === 10000) {
      console.debug({
        type: 'views/profile',
        data: [...data],
      })
      data = []
    }

    data.push([id, phase, actualDuration, baseDuration, startTime, commitTime])
  }
}
