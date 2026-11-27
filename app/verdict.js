// Deal Beacon — verdict signals.
//
// A verdict is a judgement about whether the sale price is genuinely good,
// not a marketing label. The rules below are the same ones shown on the About
// page, so what the site says and what it does can never drift apart.
//
//   new-low  — a source that tracks price history says this is the lowest
//              price ever recorded for the product. Only ever set by hand in
//              data.js, never guessed.
//   strong   — a big cut on a known brand: 40% off or more, or at least
//              $200 saved, or 30% off or more.
//   typical  — a normal sale: 15–30% off, the kind of price that shows up
//              in most sales events.
//   inflated — the "was" price is not supported by price history, or the
//              price was raised just before the sale. No deal in the current
//              list earned this label; the category exists so a bad deal can
//              be called out instead of hidden.
//
// The data file stores the verdict decided by the human check. The functions
// here turn that stored verdict into display text, a rank for sorting, and a
// cross-check: if the stored verdict disagrees with what the numbers say,
// `verdictAudit` flags it so the mismatch is visible instead of silent.

import { discountPct, savings } from './data.js';

export const VERDICTS = {
  'new-low': {
    label: 'New low',
    rank: 0,
    blurb: 'Lowest price ever recorded for this product, according to price history.',
  },
  strong: {
    label: 'Strong deal',
    rank: 1,
    blurb: 'A big, honest cut — 40% off or more, $200+ saved, or 30% off or more.',
  },
  typical: {
    label: 'Typical sale',
    rank: 2,
    blurb: 'A normal sale price — real, but this level of discount shows up often.',
  },
  inflated: {
    label: 'Inflated “was”',
    rank: 3,
    blurb: 'The “was” price looks padded or the price was raised before the sale.',
  },
};

export function verdictInfo(key) {
  return VERDICTS[key] ?? VERDICTS.typical;
}

// What the numbers alone would say, ignoring the hand-set verdict. Used to
// audit the stored verdicts and to sort "best first".
export function verdictFromNumbers(deal) {
  const pct = discountPct(deal);
  const save = savings(deal);
  if (pct >= 40 || save >= 200 || pct >= 30) return 'strong';
  return 'typical';
}

// Returns a list of deals whose stored verdict disagrees with the numbers.
// A stored "new-low" is never flagged — it rests on price-history sources,
// not on the discount alone. "strong" stored where the numbers say "typical"
// is also allowed to pass only when the evidence names a reason.
export function verdictAudit(deals) {
  const problems = [];
  for (const deal of deals) {
    if (deal.verdict === 'new-low' || deal.verdict === 'inflated') continue;
    const computed = verdictFromNumbers(deal);
    if (deal.verdict === 'strong' && computed === 'typical') {
      problems.push({ id: deal.id, stored: deal.verdict, computed });
    }
    if (deal.verdict === 'typical' && computed === 'strong') {
      problems.push({ id: deal.id, stored: deal.verdict, computed });
    }
  }
  return problems;
}
