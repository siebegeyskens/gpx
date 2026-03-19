import './App.css'

import * as React from 'react'

import type { FeatureCollection, Geometry, Position } from 'geojson'

import { GpxUpload } from './components/GpxUpload'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { parseGpxToGeoJsonTrackOnly } from './gpx/parseGpx'
import { RouteMap } from './map/RouteMap'
import { createRouteHash } from './map/routeHash'
import { usePersistedSelections } from './map/usePersistedSelections'

type RoutePoint = [number, number]

function positionToLatLng(position: Position): RoutePoint {
  // GeoJSON order is [lon, lat, ...]
  return [position[1], position[0]]
}

function extractRoutePoints(geojson: FeatureCollection<Geometry> | null): RoutePoint[] {
  if (!geojson) return []

  const points: RoutePoint[] = []
  for (const feature of geojson.features) {
    if (!feature.geometry) continue

    if (feature.geometry.type === 'LineString') {
      points.push(...feature.geometry.coordinates.map(positionToLatLng))
    }

    if (feature.geometry.type === 'MultiLineString') {
      for (const line of feature.geometry.coordinates) {
        points.push(...line.map(positionToLatLng))
      }
    }
  }

  return points
}

export default function App() {
  const [gpxXml, setGpxXml] = React.useState<string | null>(null)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [parsed, setParsed] = React.useState<FeatureCollection<Geometry> | null>(null)
  const [parseError, setParseError] = React.useState<string | null>(null)
  const { addSelection, clearSelections, isLoading, selections } = usePersistedSelections()
  const routePoints = React.useMemo(() => extractRoutePoints(parsed), [parsed])
  const routeHash = React.useMemo(() => createRouteHash(routePoints), [routePoints])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl space-y-4 p-4 md:grid md:grid-cols-[360px_1fr] md:gap-6 md:space-y-0 md:p-6">
        <section className="space-y-4">
          <GpxUpload
            onGpxLoaded={(xmlText, name) => {
              setGpxXml(xmlText)
              setFileName(name)
              try {
                const geojson = parseGpxToGeoJsonTrackOnly(xmlText)
                setParsed(geojson)
                setParseError(null)
              } catch (e) {
                setParsed(null)
                setParseError(e instanceof Error ? e.message : 'Failed to parse GPX')
              }
            }}
          />
        </section>

        <section className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Route Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parsed ? (
                  <p className="text-sm text-muted-foreground">
                    Loaded: <span className="font-medium text-foreground">{fileName}</span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isLoading
                      ? 'Loading saved selections...'
                      : 'No route loaded. Saved selections are shown on the map.'}
                  </p>
                )}

                {gpxXml && !parsed ? (
                  <div className="rounded-lg border bg-muted/40 p-4 text-center">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Loaded: <span className="font-medium text-foreground">{fileName}</span>
                      </p>
                      {parseError ? (
                        <p className="text-sm text-destructive">Parse error: {parseError}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Parsing completed, but no route geometry was found.
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}

                <RouteMap
                  geojson={parsed}
                  savedSelections={selections}
                  onKeepSelection={async (segment) => {
                    if (!fileName || routePoints.length === 0) return
                    await addSelection(segment, { fileName, routeHash })
                  }}
                  onClearSelections={clearSelections}
                />
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
