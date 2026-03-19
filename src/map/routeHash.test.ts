import { describe, expect, it } from 'vitest'

import { createRouteHash } from './routeHash'

describe('createRouteHash', () => {
  it('returns a stable hash for identical routes', () => {
    const route: Array<[number, number]> = [
      [52.1, 13.1],
      [52.2, 13.2],
      [52.3, 13.3],
    ]

    expect(createRouteHash(route)).toBe(createRouteHash(route))
  })

  it('changes hash when route points change', () => {
    const routeA: Array<[number, number]> = [
      [52.1, 13.1],
      [52.2, 13.2],
    ]
    const routeB: Array<[number, number]> = [
      [52.1, 13.1],
      [52.25, 13.25],
    ]

    expect(createRouteHash(routeA)).not.toBe(createRouteHash(routeB))
  })

  it('returns fallback value for empty routes', () => {
    expect(createRouteHash([])).toBe('empty-route')
  })
})
