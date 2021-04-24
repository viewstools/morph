import { DataProvider } from './Data.js'
import React, { useMemo } from 'react'
import useIsMedia from './hooks/useIsMedia.js'

export default function Media(props) {
  let media = useIsMedia()
  let value = useMemo(
    () => ({
      ...media,
      type: Object.keys(media).find((key) => media[key]),
    }),
    [media]
  )

  return (
    <DataProvider context="media" value={value} viewPath={props.viewPath}>
      {props.children}
    </DataProvider>
  )
}
