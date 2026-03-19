import './App.css'

import * as React from 'react'

import { GpxUpload } from './components/GpxUpload'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'

export default function App() {
  const [gpxXml, setGpxXml] = React.useState<string | null>(null)
  const [fileName, setFileName] = React.useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl space-y-4 p-4 md:grid md:grid-cols-[360px_1fr] md:gap-6 md:space-y-0 md:p-6">
        <section className="space-y-4">
          <GpxUpload
            onGpxLoaded={(xmlText, name) => {
              setGpxXml(xmlText)
              setFileName(name)
            }}
          />
        </section>

        <section className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Route Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex min-h-[60vh] items-center justify-center rounded-lg border bg-muted/40 p-4 text-center">
                {gpxXml ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Loaded: <span className="font-medium text-foreground">{fileName}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Next step: parse GPX to GeoJSON and render the route on the map.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Upload a GPX file to see your route.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
