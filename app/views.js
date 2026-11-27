// Deal Beacon — page renderers.
//
// Each view returns an HTML string for one hash route. Views only read data
// and state; they never fetch anything. Escaping is done once, here, so a
// product name or evidence line can never break the page markup.

import { CATEGORIES, STORES, DEALS, discountPct, savings, formatPrice, formatChecked, CHECKED_DAY } from './data.js';
import { verdictInfo } from './verdict.js';
import { SORTS, applyFilters, bestDeals, sameProductAtOtherStores } from './filters.js';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function verdictChip(deal) {
  const info = verdictInfo(deal.verdict);
  return `<span class="chip chip-${deal.verdict}">${esc(info.label)}</span>`;
}

export function dealCard(deal) {
  const pct = discountPct(deal);
  const save = savings(deal);
  return `
  <article class="card">
    <div class="card-top">
      <span class="card-cat">${esc(deal.category)}</span>
      <span class="card-store">${esc(deal.store)}</span>
    </div>
    <h3 class="card-name"><a href="#/deal/${deal.id}">${esc(deal.name)}</a></h3>
    <div class="card-price-row">
      <span class="card-price">${formatPrice(deal.price)}</span>
      <span class="card-was">${formatPrice(deal.was)}</span>
      <span class="card-pct">−${pct}%</span>
    </div>
    <div class="card-meta">
      ${verdictChip(deal)}
      <span class="card-save">Save ${formatPrice(save)}</span>
    </div>
    <div class="card-foot">
      <span class="card-checked">Checked ${formatChecked(deal.checkedAt)}</span>
      <a class="card-link" href="${esc(deal.url)}" target="_blank" rel="noopener">View at ${esc(deal.store)} ↗</a>
    </div>
  </article>`;
}

function filterBar(state) {
  const opt = (value, current, label) =>
    `<option value="${esc(value)}"${value === current ? ' selected' : ''}>${esc(label)}</option>`;
  return `
  <form class="filters" id="filters" onsubmit="return false">
    <label class="f-search">
      <span class="f-label">Search</span>
      <input type="search" id="f-q" placeholder="Search products, brands, stores…" value="${esc(state.q)}" autocomplete="off">
    </label>
    <label>
      <span class="f-label">Category</span>
      <select id="f-category">
        ${opt('all', state.category, 'All categories')}
        ${CATEGORIES.map((c) => opt(c, state.category, c)).join('')}
      </select>
    </label>
    <label>
      <span class="f-label">Store</span>
      <select id="f-store">
        ${opt('all', state.store, 'All stores')}
        ${STORES.map((s) => opt(s, state.store, s)).join('')}
      </select>
    </label>
    <label>
      <span class="f-label">Min. discount</span>
      <select id="f-minpct">
        ${opt(0, state.minPct, 'Any discount')}
        ${opt(20, state.minPct, '20% off or more')}
        ${opt(30, state.minPct, '30% off or more')}
        ${opt(40, state.minPct, '40% off or more')}
        ${opt(50, state.minPct, '50% off or more')}
      </select>
    </label>
    <label>
      <span class="f-label">Sort by</span>
      <select id="f-sort">
        ${Object.entries(SORTS).map(([k, label]) => opt(k, state.sort, label)).join('')}
      </select>
    </label>
  </form>`;
}

export function homeView(state) {
  const deals = applyFilters(state);
  const total = DEALS.length;
  const countLine = deals.length === total
    ? `${total} deals checked ${CHECKED_DAY}`
    : `${deals.length} of ${total} deals`;
  return `
  <section class="hero">
    <h1>Black Friday deals, checked by hand.</h1>
    <p class="hero-sub">Every price below was read from the store itself on ${CHECKED_DAY} — sale price,
    usual price, and an honest verdict on whether it is really a deal. No inflated
    “was” prices, no prices copied from last week.</p>
    <p class="hero-stats">${total} deals · ${STORES.length} stores · ${CATEGORIES.length} categories · all prices in USD</p>
  </section>
  ${filterBar(state)}
  <p class="count" id="count">${esc(countLine)}</p>
  <div class="grid" id="grid">
    ${deals.length ? deals.map(dealCard).join('') : '<p class="empty">No deals match those filters — try widening the search.</p>'}
  </div>`;
}

export function bestView() {
  const deals = bestDeals();
  return `
  <section class="hero">
    <h1>Best deals first.</h1>
    <p class="hero-sub">Sorted by verdict, then by discount: new lowest-ever prices at the top,
    then the strongest cuts, then the ordinary sales. Tap any card for the evidence.</p>
  </section>
  <p class="count">${deals.length} deals, best first</p>
  <div class="grid">
    ${deals.map(dealCard).join('')}
  </div>`;
}

export function dealView(id) {
  const deal = DEALS.find((d) => d.id === id);
  if (!deal) {
    return `<section class="hero"><h1>Deal not found.</h1>
      <p class="hero-sub">That deal is not in the list. <a href="#/">Back to all deals</a>.</p></section>`;
  }
  const info = verdictInfo(deal.verdict);
  const pct = discountPct(deal);
  const save = savings(deal);
  const others = sameProductAtOtherStores(deal);
  return `
  <article class="deal">
    <p class="deal-crumb"><a href="#/">All deals</a> · ${esc(deal.category)} · ${esc(deal.store)}</p>
    <h1>${esc(deal.name)}</h1>
    <p class="deal-brand">${esc(deal.brand)}</p>
    <div class="deal-price-box">
      <div>
        <span class="deal-price">${formatPrice(deal.price)}</span>
        <span class="deal-was">${formatPrice(deal.was)}</span>
      </div>
      <div class="deal-savings">−${pct}% · you save ${formatPrice(save)}</div>
    </div>
    <div class="deal-verdict">
      ${verdictChip(deal)}
      <p><strong>${esc(info.label)}.</strong> ${esc(info.blurb)}</p>
    </div>
    <h2>Why we call it that</h2>
    <p>${esc(deal.evidence)}</p>
    ${deal.alsoAt ? `<p class="deal-also">${esc(deal.alsoAt)}</p>` : ''}
    ${others.length ? `
    <h2>Same product, other stores</h2>
    <ul class="deal-others">
      ${others.map((o) => `<li><a href="#/deal/${o.id}">${esc(o.store)} — ${formatPrice(o.price)} (was ${formatPrice(o.was)}, −${discountPct(o)}%)</a></li>`).join('')}
    </ul>` : ''}
    <h2>Checked</h2>
    <p>Price read ${formatChecked(deal.checkedAt)} from ${esc(deal.source)}.
       Prices change fast during Black Friday week — the store page is the final word.</p>
    <p><a class="btn" href="${esc(deal.url)}" target="_blank" rel="noopener">View at ${esc(deal.store)} ↗</a>
       <a class="btn btn-ghost" href="#/">← All deals</a></p>
  </article>`;
}

export function aboutView() {
  const auditNote = 'Every deal on this site passed the same checks on 27 Nov 2026.';
  return `
  <article class="about">
    <h1>How this list was made</h1>
    <p>Deal Beacon is a small hand-checked list, not a feed. Each deal was verified
    on ${CHECKED_DAY} before it was listed, and every deal page names its source and
    the exact time it was checked.</p>
    <h2>What we check</h2>
    <ul>
      <li>The product name, exactly as the store lists it.</li>
      <li>The sale price, read from the store page or from a roundup quoting the store price that day.</li>
      <li>The usual price — the store's own list price, not a number invented for the sale.</li>
      <li>The link to the product at that store, so you can confirm the price yourself before buying.</li>
    </ul>
    <h2>How the verdict is decided</h2>
    <ul>
      <li><strong>New low</strong> — a price-history source says this is the lowest price ever recorded. Only used when a source actually says so.</li>
      <li><strong>Strong deal</strong> — 40% off or more, or at least $200 saved, or 30% off or more, on a known brand.</li>
      <li><strong>Typical sale</strong> — a real 15–30% cut, the kind that shows up in most sales events.</li>
      <li><strong>Inflated “was”</strong> — the “was” price is not supported by price history, or the price was raised just before the sale. No deal in the current list earned this label; the category exists so a bad deal can be called out instead of hidden.</li>
    </ul>
    <h2>What we do not do</h2>
    <ul>
      <li>No deal is listed from a price read before the sale opened.</li>
      <li>No “was” price is taken from a third-party listing that the store itself does not support.</li>
      <li>Where a price has a caveat — a recent lower price, a marketplace seller, a colour limit — it is written on the deal page, not hidden.</li>
    </ul>
    <p>${auditNote} Prices were re-checked against the store pages on the day the
    list was published. If a price has moved since, the store page is the final word.</p>
    <p><a class="btn" href="#/">Browse all deals</a></p>
  </article>`;
}
