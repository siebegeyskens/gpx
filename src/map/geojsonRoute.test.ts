import { describe, expect, it } from 'vitest'

import type { FeatureCollection, Geometry } from 'geojson'

import { computeBoundsFromTrackLines } from './geojsonRoute'

describe('computeBoundsFromTrackLines', () => {
  it('computes min/max bounds from LineString coordinates', () => {
    const fc: FeatureCollection<Geometry> = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: null,
          geometry: {
            type: 'LineString',
            coordinates: [
              [13.0, 52.0],
              [13.1, 52.1],
            ],
          },
        },
      ],
    }

    const b = computeBoundsFromTrackLines(fc)
    expect(b.minLat).toBe(52.0)
    expect(b.minLon).toBe(13.0)
    expect(b.maxLat).toBe(52.1)
    expect(b.maxLon).toBe(13.1)
  })
})

