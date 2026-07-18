# Memory / Changelog

Running log of changes to the Crypto Trading Micro-Learning course, per the workflow rules in `CLAUDE.md`.

Note: `CLAUDE.md` referenced a prior `v1.35.1` bug-fix entry, but this file was found empty at the
start of this session (2026-07-18) — no earlier history survived. Versioning restarts here at
v1.36.0 and this file is now the source of truth going forward.

## v1.38.0 — 2026-07-18 — Quiz score mini dashboard

**Roadmap item implemented:** "Add a mini dashboard at the top of the page on top of the banner,
which shows the score of correctly answered and failed questions."

### Changes

- **New `.quizbar`** layered on the banner (same treatment as the existing theme `.topbar`, stacked
  above it) showing live counts: ✅ correct, ❌ incorrect, 🎯 accuracy %, and total answered.
- **Quiz results now persist** in `localStorage` (`cryptoCourseQuizState_v1`, keyed by module id,
  storing `{chosen, correct}` per quiz) instead of only living in the DOM for the current page load.
  `applyQuizState()` restores the correct/wrong highlighting and locks already-answered quizzes on
  every load, and `updateQuizDashboard()` recomputes the bar from that same stored state.
- **`answer()`** now takes the module id, records the first result per quiz (subsequent clicks after
  an answer is locked are ignored, so re-clicking can't inflate the score), and refreshes the bar.
- **`resetProgress()`** now also clears the quiz state and dashboard alongside module completion, since
  "Reset progress" should mean a full reset.
- Version bump: `COURSE_VERSION` 1.37.0 → 1.38.0.

### Verification

- `node --check` on the extracted `<script>` block — syntax OK.
- Copied the exact `loadQuiz`/`saveQuiz`/`updateQuizDashboard`/`applyQuizState`/`answer` function
  bodies into a standalone Node harness with a minimal fake DOM/localStorage and asserted: answering
  one quiz correctly and one incorrectly yields 1/1/50%; re-clicking an already-answered quiz does not
  double-count; a simulated page reload (fresh DOM elements, same stored state) restores the correct
  totals plus the correct/wrong button highlighting and re-locks the quiz; reset zeroes everything.
  All assertions passed. (Full browser install via Playwright was judged disproportionate for this
  static-site change; the harness exercises the real, unmodified function bodies.)

## v1.38.0 — 2026-07-18 — Favicon: Bitcoin badge → graduation cap

**Problem:** The favicon's ₿ badge said "crypto" but nothing said "training app" (user feedback).

**Fix:** Replaced the Bitcoin ₿ badge in `docs/favicon.svg` with a graduation-cap (mortarboard)
badge — same orange (`#f7931a`) circle, cap drawn as dark paths (board, base, tassel) so it stays
crisp at small sizes with no font dependencies. Candlesticks and trend line unchanged.
Re-rendered all rasters (`favicon.ico`, `favicon-32.png`, `favicon-192.png`,
`apple-touch-icon.png`) via cairosvg. Version bump 1.37.0 → 1.38.0.

**Verification:** Rendered at 180px and inspected visually — cap, tassel, and candles all legible.

## v1.37.0 — 2026-07-18 — Site favicon & logo

**Task:** Create a favicon based on the site's theme and use it as the site logo (workflow rule #10).

### Changes

- **`docs/favicon.svg` (new):** hand-built 64×64 SVG icon matching the site theme — dark navy
  gradient rounded square (`#1b2330` → `#0b0e14`, border `#27303f`), three rising candlesticks in
  the site's green/red (`#3fb950`/`#f85149`), a translucent green trend line, and a Bitcoin-orange
  (`#f7931a`) badge with a hand-drawn ₿ path (drawn as strokes, not text, so it renders in any
  rasterizer without font dependencies).
- **`docs/favicon.ico`, `docs/favicon-32.png`, `docs/favicon-192.png`, `docs/apple-touch-icon.png`
  (new):** raster fallbacks rendered from the SVG via cairosvg (ImageMagick's SVG renderer produced
  artifacts; cairosvg output was verified visually).
- **`docs/index.html` + `docs/crypto-trading-course.html`:** added `<link rel="icon">` (SVG + ICO)
  and `<link rel="apple-touch-icon">` tags in `<head>`.
- **`docs/crypto-trading-course.html`:** header brand now uses the favicon as the site logo
  (replaced the 🪙 emoji with an inline `<img src="favicon.svg">`).
- **Version bump:** `COURSE_VERSION` 1.36.0 → 1.37.0 (footer updates automatically).

### Verification

- Rendered the icon at 180px and inspected it visually — candles, trend line, and ₿ badge all crisp.
- Grepped both HTML files to confirm favicon links present and no duplicate tags.

## v1.36.0 — 2026-07-18 — Roadmap rescan: content expansion + bug fixes

**Roadmap item implemented:** "Add more details to the existing modules and add new modules where
you deem necessary."

### New modules added (61 → 67 total, still 9 tracks)

- **Foundations & Spot Trading:** "Dollar-cost averaging (DCA)" — a beginner accumulation concept
  that was a clear gap next to the existing lump-sum/timing content.
- **Technical Analysis:** "Bollinger Bands & volatility" — the course had momentum (RSI, MACD) and
  trend (MAs) indicators but no volatility indicator.
- **Futures & Leverage:** "Hedging with derivatives" — covers using a short perp to offset spot risk
  without selling, a natural advanced-level companion to the existing long/short and sizing modules.
- **Advanced Charting & Market Structure:** "Volume profile & point of control" — institutional-style
  volume-by-price concept (POC, HVN/LVN) that complements the existing liquidity/order-block module.
- **Strategies & Playbooks:** "Playbook 4 — DCA & accumulation" — a non-technical-analysis playbook
  tying the new DCA foundations module into a concrete, rule-based approach.
- **Crypto Market Structure & Sentiment:** "The Fear & Greed Index & social sentiment" — sentiment
  gauge distinct from the existing funding-rate/OI positioning content.

Each new module follows the existing format (concept, worked example, exercise, quiz) and carries an
explicit `lvl` (Beginner/Intermediate/Advanced) exactly like every other module.

Added matching glossary terms: Dollar-cost averaging (DCA), Bollinger Bands, Hedging, Volume profile
/ POC, Fear & Greed Index.

### Bugs found and fixed

1. **Stale hardcoded counts.** The banner ("📚 4 tracks · 🔗 33 video-link + reading modules") and
   footer ("4 tracks · 33 modules") were left over from an earlier version of the course and no
   longer matched the actual 9-track/61-module (now 67) content. Fixed by computing both from the
   `COURSE` array at render time (`COURSE.length` / `totalModules`) so they can't go stale again.
2. **Fragile positional level-lookup array.** Levels for the first four tracks (Foundations, TA,
   Futures, Risk & Psychology) were assigned via a flat `LEVELS[]` array indexed by render order,
   while tracks 5–9 already used an explicit `lvl` field per module. Inserting a module anywhere in
   the first four tracks would have silently shifted every subsequent module's level. Refactored so
   every module across all 9 tracks now declares `lvl` explicitly; the positional array was removed.
   *How verified:* extracted the course `<script>` block and ran it under Node (`node --check` for
   syntax, then a `require()`-based structural check) confirming 9 tracks / 67 modules, expected
   level distribution, and no module missing required fields.
3. **No GitHub Pages entry point.** `.github/workflows/static.yml` (added upstream) uploads the
   entire repo as the Pages artifact, but there was no root `index.html` — the course itself lives at
   `docs/crypto-trading-course.html`. Added a root `index.html` that redirects to it.
4. **Missing `trading-journal.xlsx`.** The course's "Trading journal & backtest template" module links
   to `trading-journal.xlsx` (a download in the same folder) and the README describes it in detail,
   but the file didn't exist in the repo. Generated a real workbook (via a one-off Python/openpyxl
   script) with the four tabs the README already documents: Instructions, Trade Log (auto-calculates
   Risk $, P/L $, R-multiple from typed inputs), Dashboard (win rate, expectancy, total R read live
   from the Trade Log), and Backtest (same mechanics for proving a playbook against historical data
   before risking money). Saved to `docs/trading-journal.xlsx` next to the course HTML.
5. **Stray corrupted bytes in `README.md`.** The file ended with a garbled, UTF-16-encoded
   `# cyrpto-trading-course` stub (rendering as spaced-out characters) — leftover junk from repo
   initialization, not real content. Removed it.
6. **No version number surfaced anywhere.** `CLAUDE.md` instructs keeping a version number in the
   footer, but none existed. Added `COURSE_VERSION` in the script and display it in the footer.

### Also updated

- `README.md`: module count 61 → 67.
- `CLAUDE.md`: cleared the Roadmap and Bugs sections now that this pass is complete (per workflow
  rule #3 — completed roadmap items and fixed bugs move here).
