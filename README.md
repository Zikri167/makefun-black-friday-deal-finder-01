# Deal Beacon — Black Friday deals, checked by hand

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/Zikri167/makefun-black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/Zikri167/makefun-black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

A hand-checked Black Friday deal finder: 25 real deals from 6 stores (Amazon, Walmart, Best Buy, Dell, Woot, Target) across 10 categories, every price read from the store itself on 27 Nov 2026, each with an honest verdict — new low, strong deal, or typical sale — plus the evidence behind it.

## What it does

- Home grid with every deal at a glance: sale price, struck-through usual price, % off, verdict chip, check time, and a link to the store.
- Working controls: text search, category filter, store filter, minimum-discount filter, and sort (best verdict / biggest % / biggest saving / lowest price). Filter state lives in the hash, so a filtered view can be shared as a link.
- Best-deals page, sorted by verdict then discount.
- One page per deal with the full verdict, the evidence, the source and check time, and the same product at other stores when it exists (AirPods Pro 3 at Amazon and Walmart, the Switch 2 bundle at Best Buy and Target).
- An About page that explains the method: what was checked, when, from where, and how each verdict is decided.
- No network requests of its own — plain HTML, CSS and ES modules under `app/`, no framework, no external library.

## Run it

Serve `app/` locally (Node 22, stdlib only):

```sh
node serve.ts
```

then open http://localhost:8080. Or build the make.fun output:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## How the verdicts work

- **New low** — a price-history source says this is the lowest price ever recorded. Only used when a source actually says so (4 deals).
- **Strong deal** — 40% off or more, or $200+ saved, or 30% off or more, on a known brand (14 deals).
- **Typical sale** — a real 15–30% cut, the kind that shows up in most sales events (7 deals).
- **Inflated "was"** — the "was" price is not supported by price history, or the price was raised before the sale. No deal in the current list earned this label; the category exists so a bad deal can be called out instead of hidden.

Every deal page names its source and the exact time the price was checked on 27 Nov 2026. Prices move fast during Black Friday week — the store page is the final word.

---

<sub>Entered on [make.fun](https://make.fun/?ref=63s6rw9w&utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
