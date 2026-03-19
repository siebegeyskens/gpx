import { gpx as toGeoJsonGpx } from '@tmcw/togeojson'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

/**
 * Parse GPX XML into GeoJSON for the track geometry only.
 * - Input: GPX XML text
 * - Output: FeatureCollection of LineString/MultiLineString features derived from `trk`/`trkseg`
 */
export function parseGpxToGeoJsonTrackOnly(
  xmlText: string,
): FeatureCollection<Geometry> {
  const dom = new DOMParser().parseFromString(xmlText, 'application/xml')

  // Basic GPX sanity check: missing <gpx> typically means invalid XML or wrong input.
  const gpxEl = dom.querySelector('gpx')
  if (!gpxEl) {
    throw new Error('Invalid GPX: missing <gpx> root element')
  }

  const fc = toGeoJsonGpx(dom) as FeatureCollection<Geometry>

  // Keep only line geometries. This effectively excludes waypoints (points) and filters out most non-track
  // features. If you later add `rte` parsing, we can refine this to distinguish tracks vs routes.
  const filteredFeatures = fc.features.filter((f): f is Feature<Geometry> => {
    const t = f.geometry?.type
    return t === 'LineString' || t === 'MultiLineString'
  })

  return {
    ...fc,
    features: filteredFeatures,
  }
}

