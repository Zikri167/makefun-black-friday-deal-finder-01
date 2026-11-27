// Deal Beacon — routing and page wiring.
//
// Hash routes, each linkable and shareable:
//   #/            home: deal grid + filters
//   #/best        best deals first
//   #/deal/<id>   one deal, with verdict, evidence and store link
//   #/about       how the list was made
//
// The home page keeps its filter state in memory and in the hash query
// (for example #/?store=Amazon&minPct=30), so a filtered view can be shared.
// Rendering is a full re-render of #app on each route change; after the
// render, window.__shotReady is set so screenshots can wait for it.

import { homeView, bestView, dealView, aboutView, dealCard } from './views.js';
import { defaultState, applyFilters } from './filters.js';
import { DEALS } from './data.js';

const app = document.getElementById('app');
const state = defaultState();

function parseHash() {
  const raw = location.hash.slice(1) || '/';
  const [pathPart, queryPart] = raw.split('?');
  const query = new URLSearchParams(queryPart ?? '');
  return { path: pathPart, query };
}

function readStateFromQuery(query) {
  state.q = query.get('q') ?? '';
  state.category = query.get('category') ?? 'all';
  state.store = query.get('store') ?? 'all';
  state.minPct = Number(query.get('minPct') ?? 0) || 0;
  state.sort = query.get('sort') ?? 'verdict';
}

function writeStateToHash() {
  const q = new URLSearchParams();
  if (state.q) q.set('q', state.q);
  if (state.category !== 'all') q.set('category', state.category);
  if (state.store !== 'all') q.set('store', state.store);
  if (state.minPct) q.set('minPct', String(state.minPct));
  if (state.sort !== 'verdict') q.set('sort', state.sort);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  history.replaceState(null, '', `#/${suffix}`);
}

function renderGridOnly() {
  const grid = document.getElementById('grid');
  const count = document.getElementById('count');
  if (!grid || !count) return;
  const deals = applyFilters(state);
  const total = DEALS.length;
  count.textContent = deals.length === total
    ? `${total} deals checked 27 Nov 2026`
    : `${deals.length} of ${total} deals`;
  grid.innerHTML = deals.length
    ? deals.map(dealCard).join('')
    : '<p class="empty">No deals match those filters — try widening the search.</p>';
}

function wireFilters() {
  const q = document.getElementById('f-q');
  const category = document.getElementById('f-category');
  const store = document.getElementById('f-store');
  const minPct = document.getElementById('f-minpct');
  const sort = document.getElementById('f-sort');
  if (!q) return;
  q.addEventListener('input', () => {
    state.q = q.value;
    writeStateToHash();
    renderGridOnly();
  });
  category.addEventListener('change', () => {
    state.category = category.value;
    writeStateToHash();
    renderGridOnly();
  });
  store.addEventListener('change', () => {
    state.store = store.value;
    writeStateToHash();
    renderGridOnly();
  });
  minPct.addEventListener('change', () => {
    state.minPct = Number(minPct.value);
    writeStateToHash();
    renderGridOnly();
  });
  sort.addEventListener('change', () => {
    state.sort = sort.value;
    writeStateToHash();
    renderGridOnly();
  });
}

function render() {
  const { path, query } = parseHash();
  let html;
  if (path === '/' || path === '') {
    readStateFromQuery(query);
    html = homeView(state);
  } else if (path === '/best') {
    html = bestView();
  } else if (path.startsWith('/deal/')) {
    html = dealView(path.slice('/deal/'.length));
  } else if (path === '/about') {
    html = aboutView();
  } else {
    html = homeView(state);
  }
  app.innerHTML = html;
  if (path === '/' || path === '') wireFilters();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);

render();
