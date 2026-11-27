// Deal Beacon — search, filter and sort.
//
// All filtering happens in memory over the deal list in data.js. Nothing is
// fetched, nothing leaves the page. The state object is plain data so the
// router can read it, the views can render it, and the URL hash can carry
// the current filters (shared links keep working).

import { DEALS, discountPct, savings } from './data.js';
import { verdictInfo } from './verdict.js';

export const SORTS = {
  verdict: 'Best verdict first',
  pct: 'Biggest % off',
  saving: 'Biggest saving ($)',
  price: 'Lowest price',
};

export function defaultState() {
  return { q: '', category: 'all', store: 'all', minPct: 0, sort: 'verdict' };
}

function matches(deal, state) {
  if (state.category !== 'all' && deal.category !== state.category) return false;
  if (state.store !== 'all' && deal.store !== state.store) return false;
  if (discountPct(deal) < state.minPct) return false;
  if (state.q) {
    const needle = state.q.trim().toLowerCase();
    const hay = `${deal.name} ${deal.brand} ${deal.category} ${deal.store}`.toLowerCase();
    if (!hay.includes(needle)) return false;
  }
  return true;
}

const SORTERS = {
  verdict: (a, b) =>
    verdictInfo(a.verdict).rank - verdictInfo(b.verdict).rank ||
    discountPct(b) - discountPct(a) ||
    savings(b) - savings(a),
  pct: (a, b) => discountPct(b) - discountPct(a) || savings(b) - savings(a),
  saving: (a, b) => savings(b) - savings(a) || discountPct(b) - discountPct(a),
  price: (a, b) => a.price - b.price || discountPct(b) - discountPct(a),
};

export function applyFilters(state) {
  const sort = SORTERS[state.sort] ?? SORTERS.verdict;
  return DEALS.filter((d) => matches(d, state)).sort(sort);
}

// The "best deals" page is the same sort, without any filters.
export function bestDeals() {
  return [...DEALS].sort(SORTERS.verdict);
}

// Same product at more than one store (by identical name) — used on the
// deal page so a shopper can compare prices across stores.
export function sameProductAtOtherStores(deal) {
  return DEALS.filter((d) => d.name === deal.name && d.id !== deal.id);
}
