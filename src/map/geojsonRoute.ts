import type { FeatureCollection, Geometry, Position } from 'geojson'

export type Bounds = {
  minLat: number
  minLon: number
  maxLat: number
  maxLon: number
}

function positionToLatLon(position: Position): { lat: number; lon: number } {
  // GeoJSON order is [lon, lat, ...]
  const lon = position[0]
  const lat = position[1]
  return { lat, lon }
}

export function computeBoundsFromTrackLines(
  geojson: FeatureCollection<Geometry>,
): Bounds {
  let minLat = Number.POSITIVE_INFINITY
  let minLon = Number.POSITIVE_INFINITY
  let maxLat = Number.NEGATIVE_INFINITY
  let maxLon = Number.NEGATIVE_INFINITY

  for (const feature of geojson.features) {
    if (!feature.geometry) continue
    const { geometry } = feature

    if (geometry.type === 'LineString') {
      for (const pos of geometry.coordinates) {
        const { lat, lon } = positionToLatLon(pos)
        minLat = Math.min(minLat, lat)
        minLon = Math.min(minLon, lon)
        maxLat = Math.max(maxLat, lat)
        maxLon = Math.max(maxLon, lon)
      }
    }

    if (geometry.type === 'MultiLineString') {
      for (const line of geometry.coordinates) {
        for (const pos of line) {
          const { lat, lon } = positionToLatLon(pos)
          minLat = Math.min(minLat, lat)
          minLon = Math.min(minLon, lon)
          maxLat = Math.max(maxLat, lat)
          maxLon = Math.max(maxLon, lon)
        }
      }
    }
  }

  if (
    !Number.isFinite(minLat) ||
    !Number.isFinite(minLon) ||
    !Number.isFinite(maxLat) ||
    !Number.isFinite(maxLon)
  ) {
    throw new Error('No line geometry found to compute bounds')
  }

  return { minLat, minLon, maxLat, maxLon }
}

