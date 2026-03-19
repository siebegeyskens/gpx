import * as React from 'react'
import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { FeatureCollection, Geometry, Position } from 'geojson'

import { computeBoundsFromTrackLines, type Bounds } from './geojsonRoute'

type Props = {
  geojson: FeatureCollection<Geometry>
}

function positionToLatLng(position: Position): [number, number] {
  // GeoJSON order is [lon, lat, ...]
  const lon = position[0]
  const lat = position[1]
  return [lat, lon]
}

function extractPolylines(geojson: FeatureCollection<Geometry>): Array<Array<[number, number]>> {
  const polylines: Array<Array<[number, number]>> = []

  for (const feature of geojson.features) {
    if (!feature.geometry) continue

    const geometry = feature.geometry
    if (geometry.type === 'LineString') {
      polylines.push(geometry.coordinates.map(positionToLatLng))
    }

    if (geometry.type === 'MultiLineString') {
      for (const line of geometry.coordinates) {
        polylines.push(line.map(positionToLatLng))
      }
    }
  }

  return polylines
}

export function RouteMap({ geojson }: Props) {
  const bounds = React.useMemo(() => computeBoundsFromTrackLines(geojson), [geojson])
  const polylines = React.useMemo(() => extractPolylines(geojson), [geojson])

  console.log(polylines)

  function FitBounds({ bounds }: { bounds: Bounds }) {
    const map = useMap()

    React.useEffect(() => {
      const southWest: [number, number] = [bounds.minLat, bounds.minLon]
      const northEast: [number, number] = [bounds.maxLat, bounds.maxLon]
      map.fitBounds([southWest, northEast], { padding: [16, 16] })
    }, [bounds, map])

    return null
  }

  return (
    <div className="h-[60vh] w-full overflow-hidden rounded-lg border bg-muted/40">
      <MapContainer
        bounds={[
          [bounds.minLat, bounds.minLon],
          [bounds.maxLat, bounds.maxLon],
        ]}
        style={{ height: '100%', width: '100%' }}
      >
        <FitBounds bounds={bounds} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {polylines.map((positions, idx) => (
          <Polyline
            key={idx}
            positions={positions}
            pathOptions={{ color: '#2563eb', weight: 3, opacity: 0.9 }}
          />
        ))}
      </MapContainer>
    </div>
  )
}

