import * as React from 'react'
import type { LeafletMouseEvent } from 'leaflet'

import { nearestPointIndex, sliceRouteSegment } from './routeSelection'

type RoutePoint = [number, number]

type UseRouteSelectionOptions = {
  onKeep: (segment: RoutePoint[]) => void | Promise<void>
}

export function useRouteSelection(routePoints: RoutePoint[], options: UseRouteSelectionOptions) {
  const { onKeep } = options
  const [startIdx, setStartIdx] = React.useState<number | null>(null)
  const [endIdx, setEndIdx] = React.useState<number | null>(null)

  const draftSegment = React.useMemo(() => {
    if (startIdx === null || endIdx === null) return []
    return sliceRouteSegment(routePoints, startIdx, endIdx)
  }, [endIdx, routePoints, startIdx])

  const startPoint = startIdx === null ? null : routePoints[startIdx]
  const endPoint = endIdx === null ? null : routePoints[endIdx]

  const onRouteClick = React.useCallback(
    (e: LeafletMouseEvent) => {
      const idx = nearestPointIndex(routePoints, e.latlng)
      if (idx === -1) return

      if (startIdx === null || endIdx !== null) {
        setStartIdx(idx)
        setEndIdx(null)
        return
      }

      setEndIdx(idx)
    },
    [endIdx, routePoints, startIdx],
  )

  const keepDraft = React.useCallback(() => {
    if (draftSegment.length < 2) return
    void onKeep(draftSegment)
    setStartIdx(null)
    setEndIdx(null)
  }, [draftSegment, onKeep])

  const resetSelection = React.useCallback(() => {
    setStartIdx(null)
    setEndIdx(null)
  }, [])

  // Reset active selection when route points change.
  React.useEffect(() => {
    setStartIdx(null)
    setEndIdx(null)
  }, [routePoints])

  return {
    draftSegment,
    endPoint,
    keepDraft,
    onRouteClick,
    resetSelection,
    startPoint,
  }
}

