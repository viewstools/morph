import { useEffect, useState } from 'react'

export default function useIsBefore() {
  let [isBefore, setIsBefore] = useState(true)

  useEffect(function() {
    requestIdleCallback(function() {
      setIsBefore(false)
    })
  }, [])

  return isBefore
}
