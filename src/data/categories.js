export const CATEGORIES = [
  { id: 'petrol', label: 'Petrol', icon: '⛽' },
  { id: 'groceries', label: 'Groceries', icon: '🛒' },
  { id: 'dining', label: 'Dining', icon: '🍽️' },
  { id: 'online', label: 'Online Shopping', icon: '🛍️' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'overseas', label: 'Overseas', icon: '🌏' },
  { id: 'utilities', label: 'Utilities', icon: '💡' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { id: 'grab', label: 'Grab', icon: '🚗' },
  { id: 'general', label: 'General / Other', icon: '💳' },
]

export const categoryById = (id) => CATEGORIES.find(c => c.id === id) || { id, label: id, icon: '•' }
