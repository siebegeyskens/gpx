type RoutePoint = [number, number]

const COORD_PRECISION_FACTOR = 1e5

function fnv1a(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function createRouteHash(routePoints: RoutePoint[]): string {
  if (routePoints.length === 0) return 'empty-route'

  const serialized = routePoints
    .map(([lat, lon]) => {
      const latFixed = Math.round(lat * COORD_PRECISION_FACTOR)
      const lonFixed = Math.round(lon * COORD_PRECISION_FACTOR)
      return `${latFixed}:${lonFixed}`
    })
    .join('|')

  return fnv1a(serialized)
}
