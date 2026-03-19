import { beforeEach, describe, expect, it } from 'vitest'

import { selectionsDb } from './selectionsDb'

describe('selectionsDb', () => {
  beforeEach(async () => {
    await selectionsDb.selections.clear()
  })

  it('persists and reads back selection records', async () => {
    await selectionsDb.selections.add({
      createdAt: 1,
      routeRef: {
        fileName: 'route.gpx',
        routeHash: 'abc12345',
      },
      segment: [
        [52.0, 13.0],
        [52.1, 13.1],
      ],
    })

    const rows = await selectionsDb.selections.toArray()
    expect(rows).toHaveLength(1)
    expect(rows[0].routeRef.fileName).toBe('route.gpx')
    expect(rows[0].routeRef.routeHash).toBe('abc12345')
    expect(rows[0].segment).toEqual([
      [52.0, 13.0],
      [52.1, 13.1],
    ])
  })
})
