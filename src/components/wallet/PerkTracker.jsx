import { useState } from 'react'
import { useWallet } from '../../hooks/useWallet.js'
import { todayISO, fmtDate } from '../../utils/dates.js'
import ProgressBar from '../shared/ProgressBar.jsx'

export default function PerkTracker({ card, userCard }) {
  if (card.perks.length === 0) {
    return <div className="text-sm text-gray-500 italic">No listed perks for this card.</div>
  }
  return (
    <div className="space-y-3">
      {card.perks.map(perk => (
        <PerkRow key={perk.id} perk={perk} userCard={userCard} />
      ))}
    </div>
  )
}

function PerkRow({ perk, userCard }) {
  const { logPerkUse, undoLastPerkLog, setPerkUsed } = useWallet()
  const [logOpen, setLogOpen] = useState(false)
  const [logDate, setLogDate] = useState(todayISO())
  const [logNote, setLogNote] = useState('')
  const [showLogs, setShowLogs] = useState(false)

  const usage = userCard.perkUsage.find(p => p.perkId === perk.id)
  const used = usage?.used || 0
  const unlimited = perk.quantity >= 999
  const remaining = unlimited ? null : Math.max(0, perk.quantity - used)
  const pct = unlimited ? 0 : (used / perk.quantity) * 100
  const color = unlimited ? 'blue' : pct >= 100 ? 'red' : pct > 66 ? 'amber' : 'green'

  const submit = () => {
    logPerkUse(userCard.id, perk.id, logDate, logNote)
    setLogDate(todayISO())
    setLogNote('')
    setLogOpen(false)
  }

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">{perk.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">{perk.description}</div>
          {perk.notes && <div className="text-[11px] text-gray-500 italic mt-0.5">{perk.notes}</div>}
        </div>
        <div className="text-right">
          {unlimited ? (
            <span className="text-xs text-gray-300">Unlimited</span>
          ) : (
            <span className="text-xs text-gray-300">
              <span className="text-white font-semibold">{used}</span> / {perk.quantity}
            </span>
          )}
        </div>
      </div>

      {!unlimited && (
        <div className="mt-3">
          <ProgressBar value={used} max={perk.quantity} color={color} />
          <div className="text-xs text-gray-400 mt-1">
            {remaining > 0 ? `${remaining} left this ${perk.frequency.replace('annual', 'year')}` : 'Period exhausted'}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setLogOpen(o => !o)}
          className="text-xs bg-blue-500/20 border border-blue-500/40 text-blue-300 px-3 py-1 rounded hover:bg-blue-500/30"
        >
          + Log a use
        </button>
        {used > 0 && (
          <>
            <button
              onClick={() => undoLastPerkLog(userCard.id, perk.id)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Undo last
            </button>
            {usage?.logs?.length > 0 && (
              <button
                onClick={() => setShowLogs(s => !s)}
                className="text-xs text-gray-400 hover:text-white"
              >
                {showLogs ? 'Hide' : 'Show'} history
              </button>
            )}
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-gray-500">Manual count:</span>
          <input
            type="number"
            min={0}
            value={used}
            onChange={e => setPerkUsed(userCard.id, perk.id, Number(e.target.value) || 0)}
            className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-xs text-right"
          />
        </div>
      </div>

      {logOpen && (
        <div className="mt-3 bg-gray-800/60 rounded-lg p-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="date"
              value={logDate}
              onChange={e => setLogDate(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
            />
            <input
              placeholder={perk.type === 'lounge' ? 'Location + companion' : 'Note (optional)'}
              value={logNote}
              onChange={e => setLogNote(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setLogOpen(false)} className="text-xs text-gray-400 hover:text-white px-2">Cancel</button>
            <button onClick={submit} className="text-xs bg-emerald-500 text-white px-3 py-1 rounded hover:bg-emerald-400">Save</button>
          </div>
        </div>
      )}

      {showLogs && usage?.logs?.length > 0 && (
        <div className="mt-3 border-t border-gray-800 pt-3 space-y-1">
          {[...usage.logs].reverse().map((log, i) => (
            <div key={i} className="text-xs text-gray-400">
              <span className="text-gray-500">{fmtDate(log.date)}:</span> {log.note || <em className="text-gray-600">no note</em>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
