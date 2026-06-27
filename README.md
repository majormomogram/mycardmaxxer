# mycardmaxxer — Malaysian credit card tracker

Personal dashboard for Malaysian credit card benefits, perk usage, and spend-toward-cap progress. Built for Alliance Visa Infinite, UOB One Card Classic, and AmBank Visa Signature, but easily extensible.

**Client-only by design.** All your data lives in your own browser's `localStorage`. Nothing is sent to any server, nothing is stored in this repo, and your data is not visible to anyone else using the same hosted URL. Each visitor starts fresh and writes only to their own browser.

## Features

- Card database with researched benefits, perks, insurance, and reference points-to-MYR ratios
- Personal wallet: track points balance, perk usage (lounge visits, dining credits), and benefit progress
- Inline spend trackers with progress bars against caps and unlock requirements
- Monthly breakdown grid for annual spend goals (fee waivers, lounge unlocks)
- Smart wallet UI: cashback cards skip points UI, points cards skip cashback UI
- Alerts panel: expiring points, perk quotas running out, annual fee renewals
- Monthly check-in flow to update everything in under 2 minutes
- Settings: export/import your data as JSON, or reset everything

## Stack

Vite + React 18, Tailwind CSS, React Router, date-fns. No backend.

## Running locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173/

## Privacy

- No accounts, no signups, no analytics
- No personal data is ever sent over the network
- Your card list, points balance, spend totals, and perk logs are stored only in your browser's localStorage
- Use Settings → Export to back up your data manually
- Use Settings → Reset to wipe it
