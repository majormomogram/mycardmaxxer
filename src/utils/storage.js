/**
 * localStorage wrapper — the seam for Phase 2 Supabase migration.
 * All persistent reads/writes go through here. Components never touch localStorage directly.
 */

const PREFIX = 'mycardmaxxer.'
const LEGACY_PREFIX = 'cycards.'

// One-time migration: copy any legacy cycards.* keys into mycardmaxxer.* and remove the old.
function migrateLegacyKeys() {
  if (typeof localStorage === 'undefined') return
  let migrated = 0
  for (const k of Object.keys(localStorage)) {
    if (!k.startsWith(LEGACY_PREFIX)) continue
    const newKey = PREFIX + k.slice(LEGACY_PREFIX.length)
    if (localStorage.getItem(newKey) == null) {
      localStorage.setItem(newKey, localStorage.getItem(k))
      migrated++
    }
    localStorage.removeItem(k)
  }
  if (migrated > 0) console.info(`mycardmaxxer: migrated ${migrated} legacy keys`)
}
migrateLegacyKeys()

export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch (e) {
    console.warn('storage.read failed', key, e)
    return fallback
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    console.warn('storage.write failed', key, e)
  }
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key)
}

export function listKeys() {
  return Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .map(k => k.slice(PREFIX.length))
}

export function exportAll() {
  const data = {}
  for (const key of listKeys()) {
    data[key] = read(key, null)
  }
  return data
}

export function importAll(data, { replace = false } = {}) {
  if (replace) {
    for (const key of listKeys()) remove(key)
  }
  for (const [key, value] of Object.entries(data)) {
    write(key, value)
  }
}
