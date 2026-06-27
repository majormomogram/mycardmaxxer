/**
 * localStorage wrapper — the seam for Phase 2 Supabase migration.
 * All persistent reads/writes go through here. Components never touch localStorage directly.
 */

const PREFIX = 'cycards.'

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
