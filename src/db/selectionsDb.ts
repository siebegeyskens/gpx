import Dexie, { type EntityTable } from 'dexie'

export type RoutePoint = [number, number]

export type RouteReference = {
  fileName: string
  routeHash: string
}

export type SelectionRecord = {
  id?: number
  createdAt: number
  segment: RoutePoint[]
  routeRef: RouteReference
}

class SelectionsDb extends Dexie {
  selections!: EntityTable<SelectionRecord, 'id'>

  constructor() {
    super('gpxSelectionsDb')

    this.version(1).stores({
      selections: '++id, createdAt, routeRef.routeHash',
    })
  }
}

export const selectionsDb = new SelectionsDb()
