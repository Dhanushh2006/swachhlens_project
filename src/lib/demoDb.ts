import { createDemoState } from '../data/demoSeed'
import type { AppState } from '../types/domain'

const DB_NAME = 'swachhlens-prototype'
const STORE_NAME = 'operational-state'
const STATE_KEY = 'current'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(new Error('The prototype database could not be opened.'))
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
  })
}

async function readState(): Promise<AppState | undefined> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(STATE_KEY)
    request.onsuccess = () => resolve(request.result as AppState | undefined)
    request.onerror = () => reject(new Error('Prototype data could not be read.'))
  })
}

async function writeState(state: AppState): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(state, STATE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(new Error('Prototype changes could not be saved.'))
  })
}

export const demoDb = {
  async load(): Promise<AppState> {
    const stored = await readState()
    if (stored?.version === 1 && stored.incidents?.length >= 20) return stored
    const seeded = createDemoState()
    await writeState(seeded)
    return seeded
  },
  save: writeState,
  async reset() {
    const seeded = createDemoState()
    await writeState(seeded)
    return seeded
  },
}
