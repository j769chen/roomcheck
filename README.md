# RoomCheck

A website and mobile app that estimate your remaining TFSA, RRSP and FHSA contribution room.

## Layout

```
packages/core   Calculation logic and CRA limits, shared by both apps (vitest)
apps/web        Vite + React site
apps/mobile     Expo (React Native) app
```

## Commands

```
npm install
npm run web          # site at http://localhost:5173
npm run mobile       # Expo dev server, scan the QR with Expo Go
npm test
npm run typecheck
npm run lint
```

## How the numbers are worked out

TFSA: the sum of annual limits from the year you turned 18, became a resident, or 2009 (whichever is latest), plus withdrawals from earlier years, minus everything you've contributed. Withdrawals made this year come back on January 1.

RRSP: unused room carried forward, plus 18% of last year's earned income up to the annual dollar limit, minus your pension adjustment and any PSPA, plus any PAR. Over-contributions up to $2,000 are not penalized.

FHSA: $8,000 a year from the year you open the account, with up to $8,000 of unused room carried forward and a $40,000 lifetime cap. Over-contributions reduce the next year's room. Withdrawals don't restore room.

## Future years

The calculators work for any year. Published CRA limits live in `packages/core/src/limits.ts`. For later years, limits are projected the way CRA sets them and shown as estimates:

- TFSA: $5,000 indexed to inflation (2% assumed), rounded to the nearest $500
- RRSP: the latest published limit grown with average wages (3% assumed), rounded to the nearest $10
- FHSA: fixed at $8,000 a year and $40,000 lifetime, so no projection is needed

When CRA announces new limits each November, add them to the tables (and the TFSA indexation rate) to replace the estimates.

Limits on file: TFSA through 2026, RRSP through 2027.

These are estimates. CRA My Account and your Notice of Assessment are the official record.
