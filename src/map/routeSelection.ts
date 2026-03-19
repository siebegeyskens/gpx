import type { LatLngLiteral } from 'leaflet'

export function nearestPointIndex(
  points: Array<[number, number]>,
  click: LatLngLiteral,
): number {
  if (points.length === 0) return -1

  let bestIdx = 0
  let bestDist = Number.POSITIVE_INFINITY

  for (let i = 0; i < points.length; i += 1) {
    const [lat, lon] = points[i]
    const dLat = lat - click.lat
    const dLon = lon - click.lng
    const distSq = dLat * dLat + dLon * dLon
    if (distSq < bestDist) {
      bestDist = distSq
      bestIdx = i
    }
  }

  return bestIdx
}

export function sliceRouteSegment(
  points: Array<[number, number]>,
  startIdx: number,
  endIdx: number,
): Array<[number, number]> {
  if (points.length === 0) return []
  if (startIdx < 0 || endIdx < 0) return []

  const from = Math.min(startIdx, endIdx)
  const to = Math.max(startIdx, endIdx)
  return points.slice(from, to + 1)
}

