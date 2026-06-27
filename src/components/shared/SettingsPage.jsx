import { useState, useMemo } from 'react'
import { listKeys, read, remove, exportAll, importAll } from '../../utils/storage.js'

export default function SettingsPage() {
  const [tick, setTick] = useState(0)
  const refresh = () => setTick(t => t + 1)

  const stats = useMemo(() => {
    const keys = listKeys()
    const wallet = read('wallet', [])
    const progress = read('benefit_progress', [])
    const totalBytes = keys.reduce((sum, k) => {
      const raw = localStorage.getItem('cycards.' + k)
      return sum + (raw?.length || 0)
    }, 0)
    return {
      cardCount: wallet.length,
      activeCount: wallet.filter(c => c.isActive !== false).length,
      progressRows: progress.length,
      totalKb: (totalBytes / 1024).toFixed(1),
      keys,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  const wipe = (key, label) => {
    if (!confirm(`Permanently delete all ${label}? This cannot be undone.`)) return
    remove(key)
    refresh()
  }

  const wipeAll = () => {
    if (!confirm('This will permanently delete EVERYTHING — wallet, perk usage, spend progress. Continue?')) return
    if (!confirm('Really? There is no undo.')) return
    for (const k of listKeys()) remove(k)
    refresh()
  }

  const doExport = () => {
    const data = exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const date = new Date().toISOString().slice(0, 10)
    a.download = `cycards-export-${date}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const replace = confirm('OK = Replace all current data with the imported file.\nCancel = Merge imported data on top of current data.')
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        importAll(data, { replace })
        refresh()
        alert('Import complete.')
      } catch (err) {
        alert('Import failed: ' + err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Your data lives in this browser's localStorage. Nothing is sent to any server.</p>
      </header>

      <Section title="Storage">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Stat label="Active cards" value={stats.activeCount} />
          <Stat label="Total cards" value={stats.cardCount} sub={`incl. ${stats.cardCount - stats.activeCount} hidden`} />
          <Stat label="Progress rows" value={stats.progressRows} />
          <Stat label="Storage size" value={`${stats.totalKb} KB`} />
        </div>
        <p className="text-xs text-gray-500">
          Data persists across browser closes and machine restarts. It is cleared only when you reset below, or if you clear site data in browser settings.
        </p>
      </Section>

      <Section title="Backup">
        <div className="flex flex-wrap gap-3">
          <button onClick={doExport} className="bg-white text-gray-900 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-gray-100">
            Export as JSON
          </button>
          <label className="bg-gray-800 border border-gray-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer">
            Import JSON
            <input type="file" accept="application/json" onChange={doImport} className="hidden" />
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Export creates a downloadable snapshot of everything. Import replaces or merges based on the prompt.
        </p>
      </Section>

      <Section title="Reset">
        <div className="space-y-3">
          <ResetRow
            label="Clear benefit progress only"
            description="Wipes monthly spend totals and breakdowns. Cards, perks, and points balances remain."
            onClick={() => wipe('benefit_progress', 'benefit progress')}
          />
          <ResetRow
            label="Clear wallet (all cards)"
            description="Removes every card you've added, including perk usage and insurance notes. Benefit progress is also lost since it's keyed to cards."
            onClick={() => wipe('wallet', 'wallet cards')}
          />
          <ResetRow
            label="Wipe everything"
            description="Nuclear option. Resets the app to a clean install."
            onClick={wipeAll}
            destructive
          />
        </div>
      </Section>

      {stats.keys.length > 0 && (
        <Section title="Storage keys">
          <ul className="text-xs text-gray-500 font-mono space-y-0.5">
            {stats.keys.map(k => <li key={k}>cycards.{k}</li>)}
          </ul>
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      {children}
    </section>
  )
}

function Stat({ label, value, sub }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
      {sub && <div className="text-[10px] text-gray-500 mt-1">{sub}</div>}
    </div>
  )
}

function ResetRow({ label, description, onClick, destructive }) {
  return (
    <div className="flex items-start justify-between gap-4 bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <div className="flex-1">
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-xs text-gray-400 mt-0.5">{description}</div>
      </div>
      <button
        onClick={onClick}
        className={`text-xs font-semibold px-3 py-2 rounded whitespace-nowrap ${
          destructive
            ? 'bg-red-500 text-white hover:bg-red-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20'
        }`}
      >
        {destructive ? 'Wipe all' : 'Clear'}
      </button>
    </div>
  )
}
