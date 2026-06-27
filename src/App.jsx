import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/shared/Layout.jsx'
import CardsPage from './components/cards/CardsPage.jsx'
import CardDetailPage from './components/cards/CardDetailPage.jsx'
import WalletDashboard from './components/wallet/WalletDashboard.jsx'
import AddCardFlow from './components/wallet/AddCardFlow.jsx'
import UserCardDetail from './components/wallet/UserCardDetail.jsx'
import MonthlyCheckIn from './components/wallet/MonthlyCheckIn.jsx'
import SettingsPage from './components/shared/SettingsPage.jsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/wallet" replace />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/cards/:id" element={<CardDetailPage />} />
          <Route path="/wallet" element={<WalletDashboard />} />
          <Route path="/wallet/add/:cardId" element={<AddCardFlow />} />
          <Route path="/wallet/check-in" element={<MonthlyCheckIn />} />
          <Route path="/wallet/:userCardId" element={<UserCardDetail />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
