import { CARDS, cardById } from '../data/cards.js'

/**
 * Phase 2 seam: today this returns the static module; later it will fetch from Supabase.
 */
export function useCards() {
  return CARDS
}

export function useCard(id) {
  return cardById(id)
}
