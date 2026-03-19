import { describe, expect, it } from 'vitest'
import type { Geometry } from 'geojson'

import { parseGpxToGeoJsonTrackOnly } from './parseGpx'

const TRACK_ONLY_GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Example</name>
  </metadata>
  <trk>
    <name>Test Track</name>
    <trkseg>
      <trkpt lat="52.0" lon="13.0">
        <ele>100</ele>
      </trkpt>
      <trkpt lat="52.1" lon="13.1" />
    </trkseg>
  </trk>
</gpx>`

describe('parseGpxToGeoJsonTrackOnly', () => {
  it('converts a GPX track into a GeoJSON FeatureCollection with line geometries', () => {
    const fc = parseGpxToGeoJsonTrackOnly(TRACK_ONLY_GPX)

    expect(fc.type).toBe('FeatureCollection')
    expect(fc.features.length).toBeGreaterThan(0)

    const geometryTypes = new Set(
      fc.features
        .map((f) => f.geometry?.type)
        .filter((t): t is Geometry['type'] => Boolean(t)),
    )

    // Track segments should end up as lines.
    expect(Array.from(geometryTypes).every((t) => t === 'LineString' || t === 'MultiLineString')).toBe(true)
  })

  it('throws on invalid GPX input', () => {
    expect(() => parseGpxToGeoJsonTrackOnly('<not-gpx />')).toThrow(/missing <gpx>/i)
  })
})

