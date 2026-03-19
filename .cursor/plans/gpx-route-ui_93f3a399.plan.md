---
name: gpx-route-ui
overview: Define a mobile-first GPX upload workflow that parses GPX tracks to GeoJSON and renders the route on a Leaflet map using shadcn UI components.
todos:
  - id: setup-tailwind-shadcn
    content: Add Tailwind + shadcn UI setup (update `src/index.css`, add Tailwind configs, add minimal shadcn utilities/components used by upload + layout).
    status: pending
  - id: gpx-upload-component
    content: Create `src/components/GpxUpload.tsx` (shadcn-based) to select/read `.gpx` and emit parsed XML to the app state; include loading/error UI.
    status: pending
  - id: gpx-parse-module
    content: Create `src/gpx/parseGpx.ts` implementing client-side GPX->GeoJSON for track-only (`trk/trkseg`) using `@tmcw/togeojson` (with a planned fallback to a custom parser).
    status: pending
  - id: leaflet-route-map
    content: Create `src/map/RouteMap.tsx` using `react-leaflet` to render GeoJSON route and fit bounds on update.
    status: pending
  - id: wire-up-app
    content: Update `src/App.tsx` to connect upload -> parse -> map, using a mobile-first shadcn layout.
    status: pending
  - id: styling-mobile-first
    content: Ensure map + UI follow mobile-first conventions (single-column layout by default; min-width breakpoints for enhancements).
    status: pending
isProject: false
---

## Goal

Add an end-to-end GPX workflow:

1. Upload a `.gpx` file (mobile-first shadcn UI).
2. Parse the GPX (client-side) into GeoJSON for `trk`/`trkseg` only.
3. Render the resulting route on a Leaflet map (mobile-first layout).

## Step 1: GPX Upload (shadcn, mobile-first)

- Create a `GpxUpload` component that:
  - Uses shadcn primitives (`Card`, `Button`, `Input`, `Alert`), with a clear empty/loading/error states.
  - Uses a file input (and optionally drag/drop) restricted to `accept=".gpx,application/gpx+xml,application/xml,text/xml"`.
  - On selection: reads the file as text on the client and passes XML string to Step 2.
  - Supports future expansion to multiple files, but for now renders a single active track.

## Step 2: Parse GPX -> GeoJSON (client-side, track-only)

Primary (recommended): use a conversion library

- Use `@tmcw/togeojson` (or `@mapbox/togeojson`) which supports GPX.
- Approach:
  - Parse the uploaded XML string using `DOMParser` into an XML DOM.
  - Convert to GeoJSON via `togeojson.gpx(dom)`.
- Output expectation:
  - A GeoJSON `FeatureCollection` with `LineString`/`MultiLineString` features for `trk`/`trkseg`.

## Step 3: Render route on a Leaflet map

Primary (matches your current direction): `react-leaflet`

- Install `leaflet` + `react-leaflet`.
- Render strategy:
  - Use `MapContainer` + `TileLayer` + `GeoJSON` (or map GeoJSON lines to `Polyline`).
  - When new GeoJSON arrives, fit map bounds to the route.
  - Keep map styling and the route layer styling in one place (so it can evolve).

## UX / Architecture (what to add to the codebase)

- Replace the current template UI in `src/App.tsx` (currently “Hello World”) with a two-panel mobile-first layout:
  - Top: `GpxUpload` card.
  - Bottom: `RouteMap` card (full-width map area).
- Add small modules to keep the pipeline clean:
  - `src/gpx/parseGpx.ts`: `parseGpxToGeoJsonTrackOnly(xmlText: string): GeoJSON.FeatureCollection`
  - `src/components/GpxUpload.tsx`: upload UI + state
  - `src/map/RouteMap.tsx`: Leaflet map + fit-bounds + layer styling

## Mobile-first design specifics

- Layout defaults for narrow screens:
  - Single column, upload above map.
  - Map gets a sensible height (e.g. `60vh`–`70vh`) and doesn’t collapse.
- Breakpoints:
  - Use `@media (min-width: ...)` (consistent with your mobile-first rule).
  - On larger widths, optionally switch to a side-by-side layout.

## Validation / Test plan (lightweight)

- Use a couple small GPX samples to verify:
  - Route appears for `trk/trkseg`.
  - Bounds fit correctly.
  - Error state triggers for invalid GPX/XML.
- Manual performance check with a moderately sized GPX file.

