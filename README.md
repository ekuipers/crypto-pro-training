# Crypto Trading — Micro-Learning Program

An interactive, self-paced crypto trading course covering everything from your first spot trade to leverage, market structure, and risk management. It's a Node.js + React app (see `## Hosting & frontend` below); your progress, chosen level, and theme are saved automatically in your browser's local storage.

## Getting started

```sh
npm run build   # installs client/ deps and builds the React app
npm start        # serves it at http://localhost:3000
```

Or `npm run dev` for a hot-reloading dev server. The companion trade journal & backtest spreadsheet (`docs/trading-journal.xlsx`) is linked from inside the "Trading journal & backtest template" module.

## Hosting & frontend

- Node.js + Express (`server.js`) serves the built React app (`client/dist`, built via `vite build`), the course content/logic (`src/js/course.js`, `src/css/course.css`), and remaining static assets (favicons, `trading-journal.xlsx`) from `docs/`.
- `client/` is its own npm project (own `package.json`) — root `npm run build` runs `npm --prefix client install && npm --prefix client run build` so a fresh clone installs `client/`'s own `vite`/`react` deps before building (same pattern as CryptoPro Trader).
- React owns only the shell chrome (`Header`/`PageIntro`/`Footer`); `src/js/course.js` (the course data, rendering, quiz/progress state, and calculators — unchanged from the prior static-HTML version) is loaded as a classic script after React's first render, same bridge pattern used by CryptoPro Trader's dashboard.
- No longer hosted on GitHub Pages (static-only, can't run a Node server) — the old `.github/workflows/static.yml` was removed. Needs a Node-capable host (Vercel, matching Trader/Charts) — **linking a new Vercel project is a manual step**, not yet done as of this conversion.
- Browser click-through **not yet verified** — exercise theme switching, level filtering, module open/close, quiz answers, calculators, and progress persistence before relying on it.

## The course at a glance

- **67 short modules across 9 tracks** — each module is a 10–15 minute "micro-lesson."
- Tracks: Foundations & Spot Trading · Technical Analysis · Futures & Leverage · Risk Management & Psychology · Advanced Charting & Market Structure · Strategies & Playbooks · Crypto Market Structure & Sentiment · Portfolio Risk & Execution · Practice, Tools & Capstone.

## Choosing your level (header, top right)

Pick **Beginner**, **Intermediate**, or **Advanced**. The course instantly filters to show only modules for that level and hides the rest. You can switch any time — your progress for each level is tracked separately. A handful of universal items (the calculators, the "reality of trading" lesson, the journal, security, and the capstone) are tagged **All levels** and stay visible no matter what you select.

## Changing the theme (header, top right)

Five colour schemes are available: **Dark, Light, Ocean, Forest, Grape**. Click a coloured swatch to switch instantly; your choice is remembered.

## How each module works

Click a module title to expand it. Inside you'll find, in order:

1. **🔗 Video lesson** — opens a curated YouTube search for that exact topic in a new tab (always current; never a dead link).
2. **Concept** — the core idea, kept short.
3. **Visual** — an annotated chart diagram (on selected modules).
4. **Worked example** — the concept applied with real numbers.
5. **Your turn** — a quick hands-on exercise.
6. **Quick check** — a one-question quiz; click an answer to see if you're right and why.
7. **Mark module complete** — click to tick it off and advance the progress bar.

The progress bar at the top shows how much of the **current level** you've completed.

## Built-in calculators

In the **Practice, Tools & Capstone** track you'll find three live calculators that update as you type:

- **Position-size** — turns your account size, risk %, entry, and stop into the exact position size (so hitting your stop loses only what you planned).
- **Risk/Reward** — shows your reward-to-risk ratio and the break-even win rate it implies.
- **Liquidation price** — estimates how far a leveraged position can move before liquidation (approximate; always confirm on your exchange).

## The trade journal (`trading-journal.xlsx`)

Open it from the "Trading journal & backtest template" module or directly. It has four tabs:

- **Instructions** — how to use it.
- **Trade Log** — record every trade; it auto-calculates Risk $, P/L, and R-multiple. Type only the blue columns.
- **Dashboard** — live win rate, expectancy, and total R from your log.
- **Backtest** — test a strategy on historical charts before risking money.

## Suggested path

1. Start at **Beginner** and work top to bottom. Don't skip Risk Management & Psychology.
2. Read the **"reality of trading"** module early, and set up the **journal**.
3. Use the **demo-trading protocol**: paper-trade one playbook for 50–100 logged trades before risking real money.
4. Move to **Intermediate**, then **Advanced**, as each level's bar fills.
5. Finish with the **Capstone** — write and pressure-test your own one-page trading plan.

## Important disclaimer

This program is **educational only and is not financial advice**. Crypto is highly volatile and you can lose your entire capital, especially with leverage. Nothing here recommends buying, selling, or holding any asset. Never trade money you can't afford to lose, and verify everything independently before risking real funds.
