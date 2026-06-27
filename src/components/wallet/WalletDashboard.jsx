import { Link } from 'react-router-dom'
import { useWallet } from '../../hooks/useWallet.js'
import { useCards, useCard } from '../../hooks/useCards.js'
import WalletCardTile from './WalletCardTile.jsx'
import AlertsPanel from './AlertsPanel.jsx'

export default function WalletDashboard() {
  const { cards: userCards } = useWallet()
  const allCards = useCards()

  if (userCards.length === 0) {
    return <EmptyWallet />
  }

  return (
    <div>
      <header className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">My Wallet</h1>
          <p className="text-sm text-gray-400 mt-1">{userCards.length} active card{userCards.length === 1 ? '' : 's'}</p>
        </div>
        <Link
          to="/wallet/check-in"
          className="bg-white text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
        >
          Monthly check-in
        </Link>
      </header>

      <div className="mb-6">
        <AlertsPanel cards={userCards} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {userCards.map(uc => {
          const card = allCards.find(c => c.id === uc.cardId)
          if (!card) return null
          return <WalletCardTile key={uc.id} card={card} userCard={uc} />
        })}
      </div>

      <div className="mt-8">
        <Link to="/cards" className="text-sm text-gray-400 hover:text-white">+ Add another card from the database</Link>
      </div>
    </div>
  )
}

function EmptyWallet() {
  return (
    <div className="max-w-xl mx-auto text-center py-20">
      <div className="text-6xl mb-4">👛</div>
      <h2 className="text-2xl font-bold text-white mb-2">Your wallet is empty</h2>
      <p className="text-sm text-gray-400 mb-6">
        Pick a card from the database to start tracking points, perks, and spend toward benefit caps.
      </p>
      <Link to="/cards" className="bg-white text-gray-900 font-semibold px-5 py-2.5 rounded-lg inline-block hover:bg-gray-100">
        Browse cards →
      </Link>
    </div>
  )
}
