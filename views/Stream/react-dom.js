// original source by Aggelos Arvanitakis https://github.com/3nvi
// https://itnext.io/improving-slow-mounts-in-react-apps-cff5117696dc

import React, { Children, useEffect, useMemo, useRef, useState } from 'react'

export default function Stream({ every = 5, pinToBottom = false, children }) {
  let [renderedItemsCount, setRenderedItemsCount] = useState(every)

  let [childrenArray, childrenArrayKey] = useMemo(
    () => [Children.toArray(children), Date.now()],
    [children]
  )

  useEffect(() => {
    if (renderedItemsCount >= childrenArray.length) return

    let cancel = false

    let requestIdleCallback =
      global.requestIdleCallback || global.requestAnimationFrame

    let handle = requestIdleCallback(
      () => {
        if (cancel) return

        setRenderedItemsCount((renderedItemsCount) =>
          Math.min(renderedItemsCount + every, childrenArray.length)
        )
      },
      { timeout: 200 }
    )

    return () => {
      cancel = true
      let cancelIdleCallback =
        global.cancelIdleCallback || global.cancelAnimationFrame
      cancelIdleCallback(handle)
    }
  }, [renderedItemsCount, childrenArray.length, every])

  return pinToBottom ? (
    <React.Fragment>
      <span style={{ marginTop: 'auto' }} />
      {childrenArray.slice(
        Math.max(childrenArray.length - renderedItemsCount, 0),
        childrenArray.length
      )}
      <PinToBottom key={childrenArrayKey + renderedItemsCount} />
    </React.Fragment>
  ) : (
    childrenArray.slice(0, renderedItemsCount)
  )
}

function PinToBottom() {
  let ref = useRef()
  useEffect(() => {
    requestAnimationFrame(() => {
      let node = ref.current?.parentElement
      if (node) {
        node.scrollTop = node.scrollHeight
      }
    })
  }, [])
  return <span ref={ref} />
}
