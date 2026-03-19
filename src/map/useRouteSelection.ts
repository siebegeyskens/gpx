import * as React from 'react'
import type { LeafletMouseEvent } from 'leaflet'

import { nearestPointIndex, sliceRouteSegment } from './routeSelection'

type RoutePoint = [number, number]

export function useRouteSelection(routePoints: RoutePoint[]) {
  const [startIdx, setStartIdx] = React.useState<number | null>(null)
  const [endIdx, setEndIdx] = React.useState<number | null>(null)
  const [keptSegments, setKeptSegments] = React.useState<RoutePoint[][]>([])

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
    setKeptSegments((prev) => [...prev, draftSegment])
    setStartIdx(null)
    setEndIdx(null)
  }, [draftSegment])

  const resetSelection = React.useCallback(() => {
    setStartIdx(null)
    setEndIdx(null)
    setKeptSegments([])
  }, [])

  // Reset draft/kept segments when a new route is loaded.
  React.useEffect(() => {
    setStartIdx(null)
    setEndIdx(null)
    setKeptSegments([])
  }, [routePoints])

  return {
    draftSegment,
    endPoint,
    keptSegments,
    keepDraft,
    onRouteClick,
    resetSelection,
    startPoint,
  }
}

