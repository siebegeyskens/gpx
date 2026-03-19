import * as React from 'react'

import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'

export type GpxUploadProps = {
  onGpxLoaded: (xmlText: string, fileName: string) => void
}

export function GpxUpload({ onGpxLoaded }: GpxUploadProps) {
  const [isReading, setIsReading] = React.useState(false)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    setIsReading(true)
    try {
      // Reading as text keeps this step simple; parsing happens later.
      const xmlText = await file.text()
      setFileName(file.name)
      onGpxLoaded(xmlText, file.name)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read GPX file')
    } finally {
      setIsReading(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>GPX Upload</CardTitle>
        <CardDescription>Upload a GPX file to render the route.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              id="gpx-file"
              type="file"
              accept=".gpx,application/gpx+xml,application/xml,text/xml"
              disabled={isReading}
              className="cursor-pointer"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0]
                if (!file) return
                void handleFile(file)
              }}
            />
            {fileName ? (
              <p className="text-sm text-muted-foreground">Loaded: {fileName}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Choose a file (mobile: upload button, then we parse next).
              </p>
            )}
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Upload failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex items-center gap-2">
            <Button type="button" disabled>
              {isReading ? 'Reading...' : 'Ready'}
            </Button>
            <span className="text-xs text-muted-foreground">
              We parse and map after upload.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

