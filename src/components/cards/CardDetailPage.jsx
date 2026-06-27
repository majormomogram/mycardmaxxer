import { useNavigate, useParams, Link } from 'react-router-dom'
import { useCard } from '../../hooks/useCards.js'
import { categoryById } from '../../data/categories.js'
import { formatRate, formatMyr } from '../../utils/points.js'
import CardTile from '../shared/CardTile.jsx'

export default function CardDetailPage() {
  const { id } = useParams()
  const card = useCard(id)
  const navigate = useNavigate()

  if (!card) {
    return (
      <div className="text-center py-20 text-gray-400">
        Card not found. <Link to="/cards" className="text-blue-400">Back to database</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <Link to="/cards" className="text-sm text-gray-400 hover:text-white">← Back to cards</Link>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 mt-4 items-start">
        <div className="sticky top-6">
          <CardTile card={card} />
          <button
            onClick={() => navigate(`/wallet/add/${card.id}`)}
            className="mt-4 w-full bg-white text-gray-900 font-semibold py-3 rounded-xl hover:bg-gray-100"
          >
            Add to my wallet
          </button>
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <div>Annual fee: {card.annualFee === 0 ? 'Lifetime free' : `RM${card.annualFee}`}</div>
            {card.feeWaiverCondition && (
              <div className="text-gray-400">{card.feeWaiverCondition}</div>
            )}
            <div>Last verified: {card.lastVerified}</div>
            <a href={card.sourceUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline block pt-1">
              Source: official bank page ↗
            </a>
          </div>
        </div>

        <div className="space-y-8">
          {card.dataConfidence === 'unverified' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-amber-200 text-sm">
              <strong>Unverified data:</strong> Some fields on this card could not be confirmed across multiple sources. Check conditions on each benefit below for specifics, and verify directly with the bank before relying on figures.
            </div>
          )}

          <Section title="Benefits">
            <div className="space-y-3">
              {card.benefits.map(b => (
                <BenefitRow key={b.id} benefit={b} />
              ))}
            </div>
          </Section>

          {card.perks.length > 0 && (
            <Section title="Perks">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {card.perks.map(p => (
                  <PerkRow key={p.id} perk={p} />
                ))}
              </div>
            </Section>
          )}

          {card.insurance.length > 0 && (
            <Section title="Insurance coverage">
              <div className="space-y-3">
                {card.insurance.map((ins, i) => (
                  <InsuranceRow key={i} insurance={ins} />
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Coverage subject to cardmember agreement. Verify directly with your bank.
              </div>
            </Section>
          )}

          {card.defaultPointsToMyrRatio != null && (
            <Section title="Points value reference">
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-sm text-gray-300">
                <div className="text-white font-semibold mb-1">≈ RM {card.defaultPointsToMyrRatio.toFixed(4)} per point</div>
                <div className="text-xs text-gray-400">{card.pointsRatioBasis}</div>
                {card.pointsRatioSourceUrl && (
                  <a href={card.pointsRatioSourceUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline mt-2 inline-block">
                    Bank rewards catalogue ↗
                  </a>
                )}
                {card.pointsRatioVerifiedAt && (
                  <span className="text-[11px] text-gray-500 ml-3">verified {card.pointsRatioVerifiedAt}</span>
                )}
              </div>
            </Section>
          )}

          {card.notes && (
            <Section title="Notes">
              <div className="text-sm text-gray-300">{card.notes}</div>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      {children}
    </section>
  )
}

function BenefitRow({ benefit }) {
  const cat = categoryById(benefit.category)
  const isTracker = benefit.thresholdType === 'unlock_requirement' && benefit.rate === 0
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-400 flex items-center gap-1">
            <span>{cat.icon}</span> {cat.label}
          </div>
          <div className="text-base font-semibold text-white mt-0.5">
            {isTracker ? 'Spend tracker' : formatRate(benefit)}
          </div>
        </div>
        <div className="text-right text-xs text-gray-400 space-y-0.5">
          {benefit.cashbackCap != null && <div>Cap: {formatMyr(benefit.cashbackCap)}/period</div>}
          {benefit.minimumSpend != null && <div>Min spend: {formatMyr(benefit.minimumSpend)}/mo</div>}
        </div>
      </div>
      {benefit.conditions && (
        <div className="mt-2 text-xs text-gray-400">{benefit.conditions}</div>
      )}
    </div>
  )
}

function PerkRow({ perk }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold text-white">{perk.name}</div>
        <div className="text-xs text-gray-400 whitespace-nowrap">
          {perk.quantity >= 999 ? 'Unlimited' : `${perk.quantity}/${perk.frequency.replace('annual', 'yr').replace('monthly', 'mo').replace('quarterly', 'qtr')}`}
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-1">{perk.description}</div>
      {perk.notes && <div className="text-[11px] text-gray-500 mt-1 italic">{perk.notes}</div>}
    </div>
  )
}

function InsuranceRow({ insurance }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold text-white">{insurance.name}</div>
        {insurance.coverageAmount != null && (
          <div className="text-xs text-gray-300 whitespace-nowrap">
            Up to {insurance.currency} {insurance.coverageAmount.toLocaleString('en-MY')}
          </div>
        )}
      </div>
      <div className="text-xs text-gray-400 mt-1">{insurance.description}</div>
      {insurance.conditions && (
        <div className="text-[11px] text-gray-500 mt-1 italic">{insurance.conditions}</div>
      )}
    </div>
  )
}
