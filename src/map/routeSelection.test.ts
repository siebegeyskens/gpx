import { describe, expect, it } from 'vitest'

import { nearestPointIndex, sliceRouteSegment } from './routeSelection'

describe('routeSelection', () => {
  it('finds nearest route point index', () => {
    const points: Array<[number, number]> = [
      [52.0, 13.0],
      [52.1, 13.1],
      [52.2, 13.2],
    ]

    const idx = nearestPointIndex(points, { lat: 52.11, lng: 13.09 })
    expect(idx).toBe(1)
  })

  it('slices inclusive route segment regardless of click order', () => {
    const points: Array<[number, number]> = [
      [52.0, 13.0],
      [52.1, 13.1],
      [52.2, 13.2],
      [52.3, 13.3],
    ]

    expect(sliceRouteSegment(points, 1, 3)).toEqual([
      [52.1, 13.1],
      [52.2, 13.2],
      [52.3, 13.3],
    ])

    expect(sliceRouteSegment(points, 3, 1)).toEqual([
      [52.1, 13.1],
      [52.2, 13.2],
      [52.3, 13.3],
    ])
  })
})

