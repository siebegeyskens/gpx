import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useRouteSelection } from './useRouteSelection'

describe('useRouteSelection', () => {
  it('calls onKeep and resets draft after keeping a segment', () => {
    const onKeep = vi.fn()
    const routePoints: Array<[number, number]> = [
      [52.0, 13.0],
      [52.1, 13.1],
      [52.2, 13.2],
    ]

    const { result } = renderHook(() => useRouteSelection(routePoints, { onKeep }))

    act(() => {
      result.current.onRouteClick({ latlng: { lat: 52.0, lng: 13.0 } } as never)
    })
    act(() => {
      result.current.onRouteClick({ latlng: { lat: 52.2, lng: 13.2 } } as never)
    })

    expect(result.current.draftSegment).toEqual(routePoints)

    act(() => {
      result.current.keepDraft()
    })

    expect(onKeep).toHaveBeenCalledTimes(1)
    expect(onKeep).toHaveBeenCalledWith(routePoints)
    expect(result.current.draftSegment).toEqual([])
    expect(result.current.startPoint).toBeNull()
    expect(result.current.endPoint).toBeNull()
  })
})
