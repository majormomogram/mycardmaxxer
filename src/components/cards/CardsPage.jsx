import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCards } from '../../hooks/useCards.js'
import { CATEGORIES, categoryById } from '../../data/categories.js'
import { formatRate, effectiveReturn, formatMyr } from '../../utils/points.js'
import CardTile from '../shared/CardTile.jsx'

export default function CardsPage() {
  const cards = useCards()
  const [filterCategory, setFilterCategory] = useState('all')
  const navigate = useNavigate()

  const ranked = useMemo(() => {
    if (filterCategory === 'all') return cards
    return [...cards].sort((a, b) => {
      const ba = a.benefits.find(b => b.category === filterCategory && b.trackingUnit === null)
        || a.benefits.find(b => b.category === filterCategory)
      const bb = b.benefits.find(b => b.category === filterCategory && b.trackingUnit === null)
        || b.benefits.find(b => b.category === filterCategory)
      return effectiveReturn(bb) - effectiveReturn(ba)
    })
  }, [cards, filterCategory])

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Card database</h1>
        <p className="text-sm text-gray-400 mt-1">Browse Malaysian credit cards. Filter by category to find the best earn rate.</p>
      </header>

      <div className="flex gap-2 flex-wrap mb-8">
        <FilterPill active={filterCategory === 'all'} onClick={() => setFilterCategory('all')}>All</FilterPill>
        {CATEGORIES.map(c => (
          <FilterPill key={c.id} active={filterCategory === c.id} onClick={() => setFilterCategory(c.id)}>
            <span className="mr-1">{c.icon}</span>{c.label}
          </FilterPill>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ranked.map(card => {
          const bestBenefit = filterCategory === 'all'
            ? null
            : card.benefits.find(b => b.category === filterCategory && b.trackingUnit === null)
              || card.benefits.find(b => b.category === filterCategory)
          return (
            <CardTile
              key={card.id}
              card={card}
              onClick={() => navigate(`/cards/${card.id}`)}
              footer={
                <div className="space-y-1">
                  {bestBenefit ? (
                    <>
                      <div className="text-sm font-semibold">{formatRate(bestBenefit)}</div>
                      <div className="text-[11px] opacity-75">
                        ≈ {formatMyr(effectiveReturn(bestBenefit, 0.005))} per RM1 · {categoryById(bestBenefit.category).label}
                      </div>
                    </>
                  ) : (
                    <div className="text-xs opacity-80">
                      {card.annualFee === 0 ? 'Lifetime free' : `Annual fee RM${card.annualFee}`}
                    </div>
                  )}
                </div>
              }
            />
          )
        })}
      </div>
    </div>
  )
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? 'bg-white text-gray-900 border-white'
          : 'bg-transparent text-gray-300 border-gray-700 hover:border-gray-500'
      }`}
    >
      {children}
    </button>
  )
}
