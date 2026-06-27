import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useWallet, useUserCard } from '../../hooks/useWallet.js'
import { useCard } from '../../hooks/useCards.js'
import CardTile from '../shared/CardTile.jsx'
import BenefitProgressList from './BenefitProgressList.jsx'
import PerkTracker from './PerkTracker.jsx'
import InsuranceUsageView from './InsuranceUsageView.jsx'
import { daysUntil, fmtDate, todayISO } from '../../utils/dates.js'
import { rewardTypeOf, cashbackEarnedThisPeriod, formatMyr } from '../../utils/points.js'
import { useBenefitProgress } from '../../hooks/useBenefitProgress.js'

export default function UserCardDetail() {
  const { userCardId } = useParams()
  const userCard = useUserCard(userCardId)
  const card = useCard(userCard?.cardId)
  const { updateCard, updatePoints, removeCard } = useWallet()
  const navigate = useNavigate()
  const [tab, setTab] = useState('benefits')
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { getProgress } = useBenefitProgress()

  if (!userCard || !card) {
    return (
      <div className="text-gray-400">
        Card not found. <Link to="/wallet" className="text-blue-400">Back to wallet</Link>
      </div>
    )
  }

  const rewardType = rewardTypeOf(card)
  const isCashback = rewardType === 'cashback'

  return (
    <div className="max-w-5xl">
      <Link to="/wallet" className="text-sm text-gray-400 hover:text-white">← Back to wallet</Link>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 mt-4 items-start">
        <div className="space-y-4">
          <CardTile card={card} compact />
          {isCashback
            ? <CashbackSummary card={card} userCard={userCard} getProgress={getProgress} />
            : <PointsPanel userCard={userCard} onUpdate={(bal) => updatePoints(userCard.id, bal)} />
          }
          <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-4 space-y-2 text-xs">
            <Row label="Nickname" value={userCard.nickname || '—'} />
            <Row label="Last 4" value={userCard.last4 || '—'} />
            <Row label="AF renewal" value={fmtDate(userCard.annualFeeRenewalDate)} />
            {!isCashback && <Row label="Pts → MYR" value={userCard.pointsToMyrRatio} />}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="flex-1 text-xs bg-gray-800 border border-gray-700 text-white py-2 rounded hover:bg-gray-700">
              Edit
            </button>
            <button onClick={() => setConfirmDelete(true)} className="text-xs bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-2 rounded hover:bg-red-500/20">
              Delete
            </button>
          </div>
        </div>

        <div>
          <div className="flex gap-1 border-b border-gray-800 mb-5">
            {['benefits', 'perks', 'insurance'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm capitalize border-b-2 transition-colors ${
                  tab === t ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'benefits' && <BenefitProgressList card={card} userCard={userCard} />}
          {tab === 'perks' && <PerkTracker card={card} userCard={userCard} />}
          {tab === 'insurance' && <InsuranceUsageView card={card} userCard={userCard} />}
        </div>
      </div>

      {editing && (
        <EditModal
          userCard={userCard}
          isCashback={isCashback}
          onClose={() => setEditing(false)}
          onSave={(patch) => { updateCard(userCard.id, patch); setEditing(false) }}
        />
      )}

      {confirmDelete && (
        <DeleteModal
          onCancel={() => setConfirmDelete(false)}
          onSoft={() => { removeCard(userCard.id); navigate('/wallet') }}
          onHard={() => { removeCard(userCard.id, { hard: true }); navigate('/wallet') }}
        />
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  )
}

function PointsPanel({ userCard, onUpdate }) {
  const [bal, setBal] = useState(userCard.pointsBalance)
  const stale = daysUntil(userCard.pointsLastUpdated)
  const staleDays = stale != null ? Math.abs(stale) : null
  const expDays = daysUntil(userCard.pointsExpiryDate)
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-4">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Points balance</div>
      <div className="flex gap-2">
        <input
          type="number"
          value={bal}
          onChange={e => setBal(Number(e.target.value) || 0)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white"
        />
        <button
          onClick={() => onUpdate(bal)}
          disabled={bal === userCard.pointsBalance}
          className="text-xs bg-white text-gray-900 px-3 rounded font-semibold disabled:opacity-40"
        >
          Save
        </button>
      </div>
      <div className="text-[11px] text-gray-500 mt-2">
        {staleDays != null ? `Updated ${staleDays}d ago` : 'Never updated'}
        {expDays != null && expDays >= 0 && ` · expires in ${expDays}d`}
        {expDays != null && expDays < 0 && ` · expired ${Math.abs(expDays)}d ago`}
      </div>
    </div>
  )
}

function CashbackSummary({ card, userCard, getProgress }) {
  const total = cashbackEarnedThisPeriod(card, userCard, getProgress)
  const capRows = card.benefits.filter(b =>
    b.type === 'cashback' && b.thresholdType === 'max_benefit_cap' && b.trackingUnit === 'myr'
  )
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-4">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Cashback this month</div>
      <div className="text-2xl font-bold text-emerald-300">{formatMyr(total)}</div>
      {capRows.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-800 space-y-1">
          {capRows.map(b => {
            const { amount } = getProgress(userCard.id, b, userCard.annualFeeRenewalDate)
            const earned = Math.min(amount * (b.rate / 100), b.cashbackCap || Infinity)
            return (
              <div key={b.id} className="flex justify-between text-[11px]">
                <span className="text-gray-400 capitalize">{b.category}</span>
                <span className="text-gray-200">{formatMyr(earned)} <span className="text-gray-600">/ {formatMyr(b.cashbackCap)}</span></span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EditModal({ userCard, isCashback, onClose, onSave }) {
  const [form, setForm] = useState({
    nickname: userCard.nickname || '',
    last4: userCard.last4 || '',
    annualFeeRenewalDate: userCard.annualFeeRenewalDate,
    pointsToMyrRatio: userCard.pointsToMyrRatio,
    pointsExpiryDate: userCard.pointsExpiryDate || '',
    pointsExpiryType: userCard.pointsExpiryType,
    pointsExpiryNotes: userCard.pointsExpiryNotes || '',
  })
  const baseFields = [
    ['Nickname', 'text', 'nickname'],
    ['Last 4', 'text', 'last4'],
    ['AF renewal date', 'date', 'annualFeeRenewalDate'],
  ]
  const pointsFields = [
    ['Points → MYR ratio', 'number', 'pointsToMyrRatio'],
    ['Points expiry date', 'date', 'pointsExpiryDate'],
  ]
  const fields = isCashback ? baseFields : [...baseFields, ...pointsFields]
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-auto">
        <h2 className="text-lg font-bold text-white mb-4">Edit card</h2>
        <div className="space-y-3">
          {fields.map(([label, type, key]) => (
            <label key={key} className="block">
              <div className="text-xs text-gray-400 mb-1">{label}</div>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm"
              />
            </label>
          ))}
          {!isCashback && (
            <label className="block">
              <div className="text-xs text-gray-400 mb-1">Expiry type</div>
              <select
                value={form.pointsExpiryType}
                onChange={e => setForm(f => ({ ...f, pointsExpiryType: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm"
              >
                <option value="card_anniversary">Card anniversary</option>
                <option value="calendar_year">Calendar year</option>
                <option value="rolling_12m">Rolling 12 months</option>
                <option value="none">No expiry</option>
                <option value="other">Other</option>
              </select>
            </label>
          )}
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-white px-3">Cancel</button>
          <button onClick={() => onSave({
            ...form,
            last4: form.last4 || null,
            nickname: form.nickname || null,
            pointsExpiryDate: form.pointsExpiryDate || null,
          })} className="bg-white text-gray-900 font-semibold px-4 py-2 rounded text-sm hover:bg-gray-100">
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteModal({ onCancel, onSoft, onHard }) {
  const [hard, setHard] = useState(false)
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full">
        <h2 className="text-lg font-bold text-white mb-2">Remove card?</h2>
        <p className="text-sm text-gray-400 mb-4">
          Soft delete hides the card but keeps your history for future restore. Hard delete permanently wipes all data for this card.
        </p>
        <label className="flex items-center gap-2 text-sm text-gray-300 mb-4">
          <input type="checkbox" checked={hard} onChange={e => setHard(e.target.checked)} />
          I want to permanently delete all data for this card
        </label>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="text-sm text-gray-400 hover:text-white px-3">Cancel</button>
          {hard ? (
            <button onClick={onHard} className="bg-red-500 text-white font-semibold px-4 py-2 rounded text-sm hover:bg-red-400">
              Permanently delete
            </button>
          ) : (
            <button onClick={onSoft} className="bg-amber-500 text-white font-semibold px-4 py-2 rounded text-sm hover:bg-amber-400">
              Hide card
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
