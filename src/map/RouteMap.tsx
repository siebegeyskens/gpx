import * as React from 'react'
import { MapContainer, CircleMarker, Polyline, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { FeatureCollection, Geometry, Position } from 'geojson'

import { computeBoundsFromTrackLines, type Bounds } from './geojsonRoute'
import { useRouteSelection } from './useRouteSelection'
import { Button } from '../components/ui/button'

type Props = {
  geojson: FeatureCollection<Geometry>
}

const ROUTE_VISIBLE_WEIGHT_PX = 3
const ROUTE_HIT_WEIGHT_PX = 24

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

function FitBounds({ bounds }: { bounds: Bounds }) {
  const map = useMap()

  React.useEffect(() => {
    const southWest: [number, number] = [bounds.minLat, bounds.minLon]
    const northEast: [number, number] = [bounds.maxLat, bounds.maxLon]
    map.fitBounds([southWest, northEast], { padding: [16, 16] })
  }, [bounds.maxLat, bounds.maxLon, bounds.minLat, bounds.minLon, map])

  return null
}

export function RouteMap({ geojson }: Props) {
  const bounds = React.useMemo(() => computeBoundsFromTrackLines(geojson), [geojson])
  const polylines = React.useMemo(() => extractPolylines(geojson), [geojson])
  const routePoints = React.useMemo(() => polylines.flat(), [polylines])
  const {
    draftSegment,
    endPoint,
    keptSegments,
    keepDraft,
    onRouteClick,
    resetSelection,
    startPoint,
  } = useRouteSelection(routePoints)

  return (
    <div className="space-y-3">
      <div className="h-[60vh] w-full overflow-hidden rounded-lg border bg-muted/40">
        <MapContainer style={{ height: '100%', width: '100%' }}>
          <FitBounds bounds={bounds} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {polylines.map((positions, idx) => (
            <React.Fragment key={`base-${idx}`}>
              <Polyline
                positions={positions}
                pathOptions={{
                  color: '#2563eb',
                  weight: ROUTE_VISIBLE_WEIGHT_PX,
                  opacity: 0.9,
                }}
              />
              <Polyline
                positions={positions}
                pathOptions={{
                  color: '#2563eb',
                  weight: ROUTE_HIT_WEIGHT_PX,
                  opacity: 0,
                }}
                eventHandlers={{ click: onRouteClick }}
              />
            </React.Fragment>
          ))}

          {keptSegments.map((segment, idx) => (
            <Polyline
              key={`kept-${idx}`}
              positions={segment}
              pathOptions={{ color: '#22c55e', weight: 5, opacity: 0.95 }}
            />
          ))}

          {draftSegment.length > 1 ? (
            <Polyline
              positions={draftSegment}
              pathOptions={{ color: '#f59e0b', weight: 5, opacity: 0.95 }}
            />
          ) : null}

          {startPoint ? (
            <CircleMarker center={startPoint} radius={6} pathOptions={{ color: '#f59e0b' }} />
          ) : null}
          {endPoint ? (
            <CircleMarker center={endPoint} radius={6} pathOptions={{ color: '#ef4444' }} />
          ) : null}
        </MapContainer>
      </div>

      <div className="rounded-md border bg-background p-3">
        <p className="text-sm text-muted-foreground">
          Tap route once for start, tap again for end. Keep saves the selected section in memory.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={keepDraft} disabled={draftSegment.length < 2}>
            Keep
          </Button>
          <Button variant="secondary" onClick={resetSelection}>
            Reset
          </Button>
          <span className="self-center text-xs text-muted-foreground">
            Kept sections: {keptSegments.length}
          </span>
        </div>
      </div>
    </div>
  )
}

