import * as React from 'react'
import { MapContainer, CircleMarker, Polyline, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { FeatureCollection, Geometry, Position } from 'geojson'

import type { Bounds } from './geojsonRoute'
import { useRouteSelection } from './useRouteSelection'
import { Button } from '../components/ui/button'
import type { RoutePoint, SelectionRecord } from '../db/selectionsDb'

type Props = {
  geojson?: FeatureCollection<Geometry> | null
  savedSelections: SelectionRecord[]
  onKeepSelection: (segment: RoutePoint[]) => void | Promise<void>
  onClearSelections: () => void | Promise<void>
}

const ROUTE_VISIBLE_WEIGHT_PX = 3
const ROUTE_HIT_WEIGHT_PX = 24
const DEFAULT_CENTER: [number, number] = [20, 0]
const DEFAULT_ZOOM = 2

function positionToLatLng(position: Position): [number, number] {
  // GeoJSON order is [lon, lat, ...]
  const lon = position[0]
  const lat = position[1]
  return [lat, lon]
}

function extractPolylines(
  geojson: FeatureCollection<Geometry> | null | undefined,
): Array<RoutePoint[]> {
  if (!geojson) return []

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

function computeBoundsFromPolylines(polylines: RoutePoint[][]): Bounds | null {
  if (polylines.length === 0) return null

  let minLat = Number.POSITIVE_INFINITY
  let minLon = Number.POSITIVE_INFINITY
  let maxLat = Number.NEGATIVE_INFINITY
  let maxLon = Number.NEGATIVE_INFINITY

  for (const line of polylines) {
    for (const [lat, lon] of line) {
      minLat = Math.min(minLat, lat)
      minLon = Math.min(minLon, lon)
      maxLat = Math.max(maxLat, lat)
      maxLon = Math.max(maxLon, lon)
    }
  }

  if (
    !Number.isFinite(minLat) ||
    !Number.isFinite(minLon) ||
    !Number.isFinite(maxLat) ||
    !Number.isFinite(maxLon)
  ) {
    return null
  }

  return { minLat, minLon, maxLat, maxLon }
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

export function RouteMap({ geojson, onClearSelections, onKeepSelection, savedSelections }: Props) {
  const polylines = React.useMemo(() => extractPolylines(geojson), [geojson])
  const routePoints = React.useMemo(() => polylines.flat(), [polylines])
  const savedSegments = React.useMemo(
    () => savedSelections.map((selection) => selection.segment),
    [savedSelections],
  )
  const bounds = React.useMemo(() => {
    const routeBounds = computeBoundsFromPolylines(polylines)
    if (routeBounds) return routeBounds
    return computeBoundsFromPolylines(savedSegments)
  }, [polylines, savedSegments])
  const {
    draftSegment,
    endPoint,
    keepDraft,
    onRouteClick,
    resetSelection,
    startPoint,
  } = useRouteSelection(routePoints, { onKeep: onKeepSelection })
  const routeLoaded = polylines.length > 0

  return (
    <div className="space-y-3">
      <div className="h-[60vh] w-full overflow-hidden rounded-lg border bg-muted/40">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
        >
          {bounds ? <FitBounds bounds={bounds} /> : null}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {polylines.map((positions, idx) => {
            if (!routeLoaded) return null
            return (
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
            )
          })}

          {savedSegments.map((segment, idx) => (
            <Polyline
              key={`saved-${idx}`}
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
          {routeLoaded
            ? 'Tap route once for start, tap again for end. Keep saves the selected section locally.'
            : 'No route loaded. Showing all saved selections from local storage.'}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={keepDraft} disabled={!routeLoaded || draftSegment.length < 2}>
            Keep
          </Button>
          <Button variant="secondary" onClick={resetSelection}>
            Reset Draft
          </Button>
          <Button variant="secondary" onClick={onClearSelections} disabled={savedSegments.length === 0}>
            Clear Saved
          </Button>
          <span className="self-center text-xs text-muted-foreground">
            Saved sections: {savedSegments.length}
          </span>
        </div>
      </div>
    </div>
  )
}

