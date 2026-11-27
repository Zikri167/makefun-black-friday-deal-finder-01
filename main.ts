// Deal Beacon — build entry point (Node 22, standard library only).
//
// What this does, in plain terms: it takes the static site in app/ and the
// screenshots in screenshots/, copies them into the output directory
// (MAKEFUN_OUTPUT_DIR, or /output when that is not set), and writes
// dossier.json there — the summary the scorer reads, produced by the
// vendored make.fun library. The site itself needs no build step: app/ is
// plain HTML, CSS and ES modules a browser can open directly.
//
// vendor/makefun-frontend.ts is copied from the kit and must stay untouched:
// dossier.json has to be byte for byte what the scorer's own copy writes.
//
// Run locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: dossier text is capped at 160 KiB; at most 4
// screenshots, each at most 256 KiB; app/ at most 993 files and 16 MiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
