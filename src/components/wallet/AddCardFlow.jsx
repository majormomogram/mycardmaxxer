import { useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useCard } from '../../hooks/useCards.js'
import { useWallet } from '../../hooks/useWallet.js'
import { todayISO } from '../../utils/dates.js'
import { DEFAULT_POINTS_TO_MYR, rewardTypeOf } from '../../utils/points.js'
import CardTile from '../shared/CardTile.jsx'

export default function AddCardFlow() {
  const { cardId } = useParams()
  const card = useCard(cardId)
  const { addCard } = useWallet()
  const navigate = useNavigate()

  const rewardType = useMemo(() => rewardTypeOf(card), [card])
  const stepsList = rewardType === 'cashback'
    ? ['Card', 'Perks', 'Insurance']
    : ['Card', 'Points', 'Perks', 'Insurance']

  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    last4: '',
    nickname: '',
    annualFeeRenewalDate: todayISO(),
    pointsToMyrRatio: card?.defaultPointsToMyrRatio ?? DEFAULT_POINTS_TO_MYR,
    pointsBalance: 0,
    pointsExpiryType: 'card_anniversary',
    pointsExpiryDate: '',
    pointsExpiryNotes: '',
    perkUsage: card ? card.perks.map(p => ({ perkId: p.id, tracked: true, usedSoFar: 0 })) : [],
  })

  if (!card) {
    return <div className="text-gray-400">Card not found. <Link to="/cards" className="text-blue-400">Back</Link></div>
  }

  const update = (patch) => setForm(f => ({ ...f, ...patch }))

  const currentStep = stepsList[step - 1]

  const submit = () => {
    const perkUsage = form.perkUsage
      .filter(p => p.tracked)
      .map(p => ({
        perkId: p.perkId,
        periodStart: todayISO(),
        used: Number(p.usedSoFar) || 0,
        logs: []
      }))
    const insuranceUsage = card.insurance.map(i => ({
      type: i.type,
      name: i.name,
      claimsThisYear: 0,
      notes: '',
    }))
    const isCashback = rewardType === 'cashback'
    addCard({
      cardId: card.id,
      last4: form.last4 || null,
      nickname: form.nickname || null,
      annualFeeRenewalDate: form.annualFeeRenewalDate,
      pointsBalance: isCashback ? 0 : Number(form.pointsBalance) || 0,
      pointsLastUpdated: todayISO(),
      pointsExpiryDate: isCashback ? null : (form.pointsExpiryDate || null),
      pointsExpiryType: isCashback ? 'none' : form.pointsExpiryType,
      pointsExpiryNotes: isCashback ? '' : form.pointsExpiryNotes,
      pointsToMyrRatio: isCashback ? null : (Number(form.pointsToMyrRatio) || DEFAULT_POINTS_TO_MYR),
      perkUsage,
      insuranceUsage,
    })
    navigate('/wallet')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to={`/cards/${card.id}`} className="text-sm text-gray-400 hover:text-white">← Cancel</Link>
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 mt-4 items-start">
        <div className="sticky top-6">
          <CardTile card={card} compact />
          <div className="mt-3 text-[11px] uppercase tracking-wider text-gray-500 text-center">
            {rewardType === 'cashback' ? 'Cashback card' : rewardType === 'points' ? 'Points card' : 'Hybrid card'}
          </div>
          <Stepper step={step} stepsList={stepsList} />
        </div>

        <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6">
          {currentStep === 'Card' && <Step1 form={form} update={update} />}
          {currentStep === 'Points' && <Step2 form={form} update={update} card={card} />}
          {currentStep === 'Perks' && <Step3 form={form} update={update} card={card} />}
          {currentStep === 'Insurance' && <Step4 card={card} />}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              className="text-sm text-gray-400 hover:text-white disabled:opacity-30"
              disabled={step === 1}
            >
              ← Back
            </button>
            {step < stepsList.length ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="bg-white text-gray-900 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={submit}
                className="bg-emerald-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-emerald-400"
              >
                Add to wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stepper({ step, stepsList }) {
  return (
    <div className="mt-6 space-y-2">
      {stepsList.map((s, i) => (
        <div key={s} className={`flex items-center gap-3 text-sm ${i + 1 === step ? 'text-white' : 'text-gray-500'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            i + 1 === step ? 'bg-white text-gray-900' : i + 1 < step ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-500'
          }`}>
            {i + 1 < step ? '✓' : i + 1}
          </div>
          {s}
        </div>
      ))}
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <label className="block mb-5">
      <div className="text-sm text-gray-300 mb-1.5">{label}</div>
      {children}
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </label>
  )
}

const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500'

function Step1({ form, update }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Card setup</h2>
      <p className="text-sm text-gray-400 mb-6">Basic info about your physical card.</p>
      <Field label="Last 4 digits (optional)">
        <input className={inputCls} value={form.last4} onChange={e => update({ last4: e.target.value })} maxLength={4} />
      </Field>
      <Field label="Nickname (optional)" hint="e.g. 'Daily driver', 'Travel card'">
        <input className={inputCls} value={form.nickname} onChange={e => update({ nickname: e.target.value })} />
      </Field>
      <Field label="Annual fee renewal date" hint="Used to track fee-waiver spend requirements over the card year.">
        <input type="date" className={inputCls} value={form.annualFeeRenewalDate} onChange={e => update({ annualFeeRenewalDate: e.target.value })} />
      </Field>
    </div>
  )
}

function Step2({ form, update, card }) {
  const ratioHint = card?.defaultPointsToMyrRatio
    ? `Pre-filled from ${card.bank}'s rewards catalogue (${card.pointsRatioBasis}). Adjust if you typically redeem differently.`
    : 'RM0.005 per point is a typical baseline. Adjust based on your redemption pattern.'
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Points</h2>
      <p className="text-sm text-gray-400 mb-6">Enter your current balance, when points expire, and the conversion ratio you typically get.</p>
      <Field label="Current points balance">
        <input type="number" className={inputCls} value={form.pointsBalance} onChange={e => update({ pointsBalance: e.target.value })} />
      </Field>
      <Field label="Points → MYR ratio" hint={ratioHint}>
        <input type="number" step="0.0001" className={inputCls} value={form.pointsToMyrRatio} onChange={e => update({ pointsToMyrRatio: e.target.value })} />
        {card?.pointsRatioSourceUrl && (
          <a href={card.pointsRatioSourceUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">
            View rewards catalogue ↗
          </a>
        )}
      </Field>
      <Field label="Expiry type">
        <select className={inputCls} value={form.pointsExpiryType} onChange={e => update({ pointsExpiryType: e.target.value })}>
          <option value="card_anniversary">Card anniversary</option>
          <option value="calendar_year">Calendar year (31 Dec)</option>
          <option value="rolling_12m">Rolling 12 months</option>
          <option value="none">No expiry</option>
          <option value="other">Other</option>
        </select>
      </Field>
      {form.pointsExpiryType !== 'none' && (
        <Field label="Next expiry date">
          <input type="date" className={inputCls} value={form.pointsExpiryDate} onChange={e => update({ pointsExpiryDate: e.target.value })} />
        </Field>
      )}
      <Field label="Notes (optional)">
        <textarea className={inputCls} rows={2} value={form.pointsExpiryNotes} onChange={e => update({ pointsExpiryNotes: e.target.value })} />
      </Field>
    </div>
  )
}

function Step3({ form, update, card }) {
  if (card.perks.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Perks</h2>
        <p className="text-sm text-gray-400">This card has no listed perks to track.</p>
      </div>
    )
  }
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Perks</h2>
      <p className="text-sm text-gray-400 mb-6">Opt in to track. If you've already used some this period, enter the count so the tracker starts accurate.</p>
      <div className="space-y-3">
        {card.perks.map((perk, i) => {
          const usage = form.perkUsage[i]
          if (!usage) return null
          return (
            <div key={perk.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{perk.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {perk.quantity >= 999 ? 'Unlimited' : `${perk.quantity} per ${perk.frequency}`}
                    {' · '}{perk.description}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usage.tracked}
                    onChange={e => {
                      const next = [...form.perkUsage]
                      next[i] = { ...usage, tracked: e.target.checked }
                      update({ perkUsage: next })
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-xs text-gray-300">Track</span>
                </label>
              </div>
              {usage.tracked && perk.quantity < 999 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-400">Used so far this period:</span>
                  <input
                    type="number"
                    min={0}
                    max={perk.quantity}
                    value={usage.usedSoFar}
                    onChange={e => {
                      const next = [...form.perkUsage]
                      next[i] = { ...usage, usedSoFar: e.target.value }
                      update({ perkUsage: next })
                    }}
                    className="w-20 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                  />
                  <span className="text-xs text-gray-500">/ {perk.quantity}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Step4({ card }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Insurance</h2>
      <p className="text-sm text-gray-400 mb-6">Read-only summary of what this card covers. You can log claims and notes later from the card detail page.</p>
      {card.insurance.length === 0 ? (
        <div className="text-sm text-gray-500">No insurance coverage on file for this card.</div>
      ) : (
        <div className="space-y-2">
          {card.insurance.map((ins, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <div className="text-sm font-semibold text-white">{ins.name}</div>
              {ins.coverageAmount != null && (
                <div className="text-xs text-gray-300 mt-1">Up to {ins.currency} {ins.coverageAmount.toLocaleString('en-MY')}</div>
              )}
              <div className="text-xs text-gray-400 mt-1">{ins.description}</div>
              {ins.conditions && <div className="text-[11px] text-gray-500 italic mt-1">{ins.conditions}</div>}
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 text-xs text-gray-500">
        Coverage subject to cardmember agreement. Verify directly with your bank.
      </div>
    </div>
  )
}
