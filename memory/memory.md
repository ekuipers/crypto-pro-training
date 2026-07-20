# Memory / Changelog

Running log of changes to the Crypto Trading Micro-Learning course, per the workflow rules in `CLAUDE.md`.

## v2.0.6 — 2026-07-21 — Roadmap: progress/settings sync to Postgres (Suite roadmap)

**Task:** "rescan roadmap," run from CryptoPro Trader with write access to all sub-repos. Suite roadmap
item: "Across all projects, save any user state like layouts, progress, etc. in the database... across
devices, browsers and sessions." CryptoPro Charts already had a proven reference implementation — a
generic `layouts(uid, name, data jsonb)` table + `/api/session` GET/PUT + a client `persistence.js` with a
debounced autosave and server-first/localStorage-fallback load. Ported the same table shape and routes here
(no need for Charts' `/api/layouts` named-save feature — this course only ever has one state blob per user).

**What syncs:** theme (`THEME_KEY`), level filter (`LKEY`), module-completion progress (`KEY`), and quiz
results (`QUIZ_KEY`) — everything `course.js` already tracked in `localStorage`. No credentials or anything
sensitive involved (unlike CryptoPro Trader's equivalent pass in the same session, which had to explicitly
exclude Alpaca API keys — not a concern here).

**Change:** `src/db.js` — added the `layouts` table to `init()` plus `getLayout`/`putLayout` (`GUEST`/
`SESSION_NAME` constants already existed, unused, from the 2026-07-19 SSO port). `server.js` — imported
`currentUid`, added `/api/session` GET/PUT. `src/js/course.js` — new `apiGet`/`apiPut`/`debounce`/
`syncSnapshot`/`scheduleSync`/`loadSyncedState()` block; `save()` and `saveQuiz()` now call `scheduleSync()`
after writing to `localStorage` (covers `markDone()` and `resetProgress()` for free, since they go through
these); `setTheme()`/`setLevel()` call it directly since they don't. `loadSyncedState()` runs once at the
bottom of the script, after the existing synchronous local-state init — if the server has a row, it
overwrites the 4 `localStorage` keys and re-runs `setTheme()`/`applyLevel()`/`applyQuizState()` so the page
reflects the synced copy (server wins whenever present, matching Charts' `loadAutosave()` precedent exactly
— no merge/diff against local). Offline/signed-out/no-row cases silently no-op via try/catch, same as before
this change existed.

**`COURSE_VERSION`** bumped 2.0.5 → 2.0.6 (this file's constant — see the note in the previous entry about
why this needs bumping directly, not just the changelog header).

**Verified:** `npm --prefix client run build` (31 modules, 0 errors). `node --check` on `course.js`/
`server.js`/`db.js`. Booted the server locally with no DB configured and confirmed via `curl`: `/api/session`
GET/PUT both 500 (caught by the route's own try/catch and by the client's, falls back to `localStorage`
exactly as before — same unguarded-`dbEnabled()` behavior Charts' own routes already have), `/js/course.js`
still 200s unchanged.

## v2.0.5 — 2026-07-21 — Roadmap: header logo shrunk to match the footer

**Task:** "run the last roadmap item also for projects Charts and Training," follow-up to the same fix
already applied in CryptoPro Trader. Suite roadmap item: "In every project use the same height, font and
colors for the project logo in the header as in the footer." Trader was given three options (grow the
footer up, shrink the header down, or unify only icon radius + color) and chose shrinking the header down
to the existing footer style — applied the identical choice here, since Training's `Header.jsx`/`Footer.jsx`
already carry an explicit comment claiming parity with Trader's convention that wasn't actually true yet.

**Change:** `client/src/components/Footer.jsx` — footer's plain "CryptoPro Training" text gained the
missing `<span className="brand-cp">CryptoPro</span>` color split (previously uncolored, unlike the
header). `src/css/course.css` — `.brand` (header) shrunk from `gap:10px`/`font-size:17px`/
`font-weight:850`/`letter-spacing:-.2px` to `gap:6px`/`font-size:13px`/`font-weight:700` (letter-spacing
dropped), matching `.site-footer .footer-name` exactly; `.brand img` shrunk from `22px`/`border-radius:6px`
to `18px`/`border-radius:4px`, matching `.site-footer .footer-logo-icon`; `.brand .brand-cp{color:
var(--accent)}` unscoped to a plain `.brand-cp` selector so the same class colors "CryptoPro" in both the
header and the newly-added footer span.

**`COURSE_VERSION`** (`src/js/course.js`) bumped 2.0.2 → 2.0.5 — also corrects drift: the last two
changelog entries (v2.0.3, v2.0.4) bumped this file's own version header but never updated the constant the
footer actually reads, so the live footer had been showing a stale version for two releases.

**Verified:** `npm --prefix client run build` — succeeds, 31 modules, no JSX/CSS errors.

## v2.0.4 — 2026-07-20 — Roadmap rescan: duplicate title removed, sign-in error message fixed

**Task:** "rescan roadmap." Suite `CLAUDE.md` had two open items against this project: a roadmap item
("remove the duplicate CryptoPro Training title from the html body") and a bug ("sign-in doesn't work —
database error, please retry").

**Roadmap — duplicate title.** `client/src/components/PageIntro.jsx` had its own `<h1>CryptoPro
<span>Training</span></h1>` directly below `Header.jsx`'s sticky `.site-header` wordmark, which already
shows the exact same title — a leftover from the pre-2026-07-18 hero-banner design that the React
conversion carried over unnoticed. Removed the `<h1>` and its two now-dead CSS rules
(`src/css/course.css`). `npm --prefix client run build` succeeds; the tagline/stats/quiz-score readout
below it are unchanged.

**Bug — sign-in "database error."** Root-caused, not fully fixed (the actual cause is outside this
repo's code). `src/db.js`'s `normalizeSsl(null)` throws a `TypeError` (`Cannot read properties of null
(reading 'includes')`) when `connString()` finds no Postgres env var set at all — confirmed by direct
repro. That throw happens synchronously inside `getPool()`, which `register`/`login`'s try/catch turns
into exactly the reported "Sign-in failed — database error, please retry." This matches the still-open
manual TO DO in `CryptoPro Suite/CLAUDE.md`: this project's deployed (Vercel) environment was never
confirmed to have `DBCRYPTOCHARTS_POSTGRES_URL[_NON_POOLING]` set, unlike Charts/Trader. Added the same
`db.dbEnabled()` guard `CryptoPro Suite/src/auth.js` already had to `register`/`login` here, so a missing
connection string now fails fast with a distinct, honest 503 "Accounts are unavailable right now" instead
of the misleading generic message — makes the real gap diagnosable without needing to read server logs.
**Still needs a human:** confirm/set the Vercel env var; this repo's code cannot verify or fix that itself.

**Also (Suite-side, not this repo):** Suite's landing page was linking to this project's *old* GitHub
Pages URL (`ekuipers.github.io/crypto-pro-training/crypto-trading-course.html`), deleted during the
2026-07-18 conversion and confirmed 404 — repointed to the live `crypto-pro-training.vercel.app` and
added to the SSO auto-sign-in host list. See `CryptoPro Suite/memory/memory.md`.

**Verified:** `node --check src/auth.js`, `npm --prefix client run build`.

## v2.0.3 — 2026-07-20 — Roadmap: cross-project auto sign-in (SSO ticket handoff)

**Task:** "rescan roadmap," run from CryptoPro Trader with write access to all 4 suite repos. Suite roadmap
item: "Whenever the user is signed in to the Suite, automatically sign in to other projects." Full
cross-repo narrative + security review logged in `CryptoPro Suite/memory/memory.md`; this entry covers only
the slice added here. (Suite's other open bug against this project — "sign-in doesn't work — database
error" — was explicitly scoped out of this rescan and is still open.)

**Change:** `src/db.js` gained a `sso_tickets` table (token PK, uid FK, expires_at, used) created
idempotently in `init()`, plus `createSsoTicket`/`consumeSsoTicket` (atomic single-use `UPDATE ...
RETURNING uid`). `src/auth.js` gained `POST /api/auth/sso-ticket` (mints a 60s single-use ticket for the
signed-in caller) and an `app.use` middleware — registered before the static routes in `server.js` — that
consumes a `?sso=<token>` param on any GET request, mints a normal local session if valid, and always
302-redirects to a clean URL. This app only gained the *consuming* side for now; nothing here calls
`/api/auth/sso-ticket` to issue one yet.

**Verified:** `node --check` on both edited files. No existing test suite in this project to run against.

## v2.0.2 — 2026-07-19 — Suite TO DO item 1: SSO with CryptoPro Charts/Suite

**Task:** explicit user request ("implement one roadmap item from the Suite project" → chose "SSO across
all projects" over smaller alternatives — email-in-profile, test 2FA, social login). This project had no
auth code at all; CryptoPro Charts and CryptoPro Suite already share one Postgres accounts/sessions
database with username/password login + optional TOTP 2FA. Ported that exact pattern here (and,
identically, into CryptoPro Trader — see that project's own `memory.md` for its side of this change).

**Change:** added `src/auth.js`, `src/db.js` (accounts/sessions tables only), `src/totp.js` (all
near-verbatim ports from CryptoPro Charts). `server.js` gained `app.set('trust proxy', 1)`, a CSRF
Origin/Referer host-check middleware, `express.json()`, `installAuthRoutes(app)`, and `db.init()`. Added
`pg` to `package.json` and a new `.env.example`. Client: a `👤 Sign in` button in `Header.jsx`, a new
`AuthModal.jsx` component (this project had no existing modal system to plug into, unlike Trader — added
the same `#authModalBackdrop`/`#authModalBody` shell pattern), a `loadAuthScript()` added to
`scriptLoader.js` (mirroring the existing `loadCourseScript()`) called from `App.jsx`'s `useEffect`, a new
`src/js/auth.js` classic script (ported from Charts' client auth.js, adapted to `style.display`
modal-toggling instead of Charts' `showModal()/closeModal()` helpers), and a new `.modal-backdrop`/
`.acct-*`/`.auth-*` CSS block appended to `src/css/course.css` (this project had no prior modal CSS at
all). Course progress itself is untouched — still plain browser `localStorage`, independent of sign-in
state.

**`db.js`'s `CONN_VARS` priority:** `DBCRYPTOCHARTS_POSTGRES_URL[_NON_POOLING]` (the suite's shared-DB
identifier) first, then generic `POSTGRES_URL`/`DATABASE_URL`. **Not done yet — a manual, outside-of-code
step:** this project has no Postgres env vars configured anywhere yet; the deployed environment needs
`DBCRYPTOCHARTS_POSTGRES_URL[_NON_POOLING]` added, pointed at the same Supabase project Charts uses, or
sign-in here will just 503 until then.

**Security review:** ran the security-reviewer agent over both projects' new auth files together (identical
code). Found and fixed: (1) **CRITICAL** — `GET /api/me` had no try/catch around `parseCookies()`'s
`decodeURIComponent()`, so one malformed cookie crashed the whole Node process via an unhandled promise
rejection — fixed by wrapping the per-cookie decode in its own try/catch, skipping just the bad cookie.
(2) Login leaked a timing side-channel for username enumeration — fixed by always paying the same scrypt
cost against a fixed dummy salt/hash when the account doesn't exist. (3) TOTP code comparison used `===`
instead of `crypto.timingSafeEqual` — fixed. Flagged but not fixed (inherited from the already-deployed
Charts/Suite pattern): the in-memory rate limiter doesn't survive across Vercel serverless instances, and
the CSRF check fails open when a request has neither Origin nor Referer header (reachable only on
login/register, which don't require an existing session cookie).

**Verified:** `node --check` on every new/changed `.js` file; `node -e "import('./server.js')"` boots
clean with the DB gracefully disabled; `npm --prefix client run build` succeeds. No existing test suite in
this project to re-run.

## v2.0.1 — 2026-07-19 — Roadmap: suite-wide workflow-rules verification pass

**Task:** "rescan roadmap." Own Roadmap/Bugs were empty. The only open item across the whole suite was
the Suite-level roadmap: "Verify all projects against the workflow rules in this file" — full audit +
findings logged in `CryptoPro Suite/memory/memory.md`.

**Gaps found and fixed here:**
- Rule 3 (donation link in footer): `client/src/components/Footer.jsx` had title/creator/version but no
  donation link. Added a `☕ Donate` link to `https://buymeacoffee.com/erikkuipers` + a matching
  `.footer-donate` style in `src/css/course.css` (amber `#e0b45c`, matching Suite's own donate-link color).
- Rule 14 ("CryptoPro" a different color than the extension text): `Header.jsx` rendered
  `CryptoPro Training` as one plain text node — no color split. Wrapped `CryptoPro` in a
  `<span className="brand-cp">`, colored `var(--accent)` (already theme-aware — changes per the 5 existing
  theme swatches) via `.brand .brand-cp` in `src/css/course.css`.

**Not touched, correctly out of scope:** rule 18 (single Supabase DB / SSO) work is already tracked as its
own `TO DO` items in Suite's `CLAUDE.md`, explicitly marked "don't implement, for planning only."

**Verified:** `npm --prefix client run build` — succeeds, no JSX/CSS errors. Version bumped v2.0.0 →
v2.0.1 (`COURSE_VERSION` in `src/js/course.js` — the footer reads this constant directly, single source
of truth, no separate footer edit needed).

## v2.0.0 — 2026-07-19 — Converted to Node.js + React (Suite roadmap items 1 & 2)

**Task:** "rescan roadmap." CryptoPro Suite's `CLAUDE.md` roadmap listed two open items for this project:
(1) convert to a React frontend + Node.js backend (Suite rules 24/25), and (2) make the web layout
consistent with CryptoPro Charts and Trader (Suite rule 17: same title-bar/footer height, same font,
favicon-as-logo). Both implemented in this pass, mirroring the conversion CryptoPro Trader went through
earlier the same day.

**What changed (mechanical extraction, zero content/logic change):**

- The single 1,275-line `docs/crypto-trading-course.html` was split: the inline `<style>` block →
  `src/css/course.css`; the `COURSE`/`GLOSSARY` data arrays + all rendering, quiz, progress-persistence,
  and calculator logic (`setTheme`, `setLevel`, `renderTool`, `calc_*`, etc.) → `src/js/course.js`,
  copied verbatim via `sed` (not retyped) to avoid transcription risk. None of the 67 modules' content,
  the 5-theme system, the 3 calculators, or the localStorage-backed progress/quiz state changed.
- `client/` — new Vite + React shell (`package.json`, `vite.config.js`, `index.html`, `main.jsx`,
  `App.jsx`), same bridge pattern as CryptoPro Trader: React owns only the header/footer chrome;
  `course.js` is loaded as a classic script after React's first commit (`scriptLoader.js`) and queries
  `#course`/`#glossary`/etc. synchronously, unchanged.
- `server.js` + root `package.json` — Express entrypoint serving `client/dist`, `src/js`, `src/css`, and
  `docs/` (remaining static assets: favicons, `trading-journal.xlsx`), identical structure to Trader's.

**Layout-consistency redesign (roadmap item 2) — supersedes the v1.41.1 "intentional exception":**
That earlier entry explicitly declined to flatten the hero-banner header, reasoning this was a
"marketing-style landing page," not a utility bar like the other sub-projects, and left it as a
documented exception. The Suite roadmap re-raised the same ask, so this pass reverses that decision:
removed the SVG candlestick banner art, the gradient hero background, and the multi-part banner/topbar/
quizbar stack; replaced with a single-row `.site-header` (favicon + "CryptoPro Training" wordmark, theme
swatches, level picker) using the exact padding/sticky/font convention as Trader's header, and a
single-line `.site-footer` matching Trader's footer classes (`footer-name`, `footer-sep`,
`footer-logo-icon`). The page title, tagline, module-count stats, and quiz-score readout moved into a
plain `.page-intro` above the module list instead of a hero banner. All functional element IDs
(`#themes`, `#tname`, `#levels`, `#lvlDesc`, `#quizCorrect`/`#quizWrong`/`#quizAcc`/`#quizTotal`,
`#statTracks`/`#statModules`/`#statFooter`, `#courseVersion`) were preserved exactly so `course.js`
needed zero changes beyond the version bump below.

**Hosting:** GitHub Pages (`.github/workflows/static.yml`) removed — it can only serve static files and
this is now a Node/Express app. **Not yet done:** linking a new Vercel project (or equivalent Node host)
for live hosting — the old `https://ekuipers.github.io/crypto-pro-training/...` URL will go stale once
this is pushed; Suite's sub-project link needs updating once a new URL exists. `docs/crypto-trading-course.html`
and `docs/index.html` (the old GH-Pages redirect) were deleted; `docs/` now holds only favicons and
`trading-journal.xlsx`, same role it plays in Trader.

**`COURSE_VERSION`** bumped 1.41.1 → 2.0.0 (architecture change, not a content change).

**Verified:** `npm run build` succeeds (client installs + `vite build`, 30 modules transformed); local
`node server.js` smoke test — homepage, `/js/course.js`, `/css/course.css`, favicons, and
`trading-journal.xlsx` all return 200 with expected content; `node --check src/js/course.js` passes.
**Not verified:** an actual browser click-through (no browser tool available this session) — exercise
theme switching, level filtering, module open/close, quiz answers, the three calculators, and progress
persistence across reloads before relying on this for real course delivery.

Note: `CLAUDE.md` referenced a prior `v1.35.1` bug-fix entry, but this file was found empty at the
start of this session (2026-07-18) — no earlier history survived. Versioning restarts here at
v1.36.0 and this file is now the source of truth going forward.

## 2026-07-19 — Workflow rules deduped against CryptoPro Suite's master list (no version bump — docs only)

**Change:** CryptoPro Suite roadmap item — "Add the Workflow rules from project CryptoPro Suite as reference
to the sub-project's workflow rules. Remove every duplicate workflow rule from the sub-projects." `CLAUDE.md`'s
numbered rules 1–5, 7–14 were near-verbatim duplicates of Suite `CLAUDE.md` rules 1, 2, 15, 4, 5, 6, 8, 9, 10,
11, 12, 13, 14 (memory.md changelog discipline, local-node-server-for-testing-only, move-completed-items-to-
memory, auto-commit/sync, update-documentation, roadmap-scan-triggers-implementation, allow-all-edits, JS file
placement, favicon-as-logo, compact-command, skills directory, HTML-in-/docs, title-in-description). Replaced
with a pointer to Suite's `CLAUDE.md` on GitHub; kept only rule 6 ("Update version number in the footer with
the latest version in the change log"), which has no Suite equivalent.
**Verified:** no site code touched — `CLAUDE.md` diff only; `## Roadmap`/`## Bugs` sections unaffected.

## v1.41.1 — 2026-07-18 — Cross-suite title-bar/footer branding consistency

**Driven by:** a CryptoPro Suite workflow-rules audit (rules 7 + 17: consistent title-bar/footer
design, favicon-as-logo at a consistent size, same font, across all sub-projects).

### Changes

- The `.brand` eyebrow label inside the hero banner read "Crypto Academy" instead of "CryptoPro
  Training" — a naming inconsistency versus the page's own `<title>`, the `.page-title` `<h1>` (added
  in v1.41.0), and every other sub-project's header/logo text. Fixed to "CryptoPro Training".
- `.brand` favicon icon bumped 20px → 22px with `border-radius:6px` added, matching the icon
  treatment now used in CryptoPro Suite's and CryptoPro Trader's headers.
- Footer previously had no favicon logo and no creator credit (rule 3/10 gap). Added a 16px favicon
  icon and a "Created by Erik Kuipers ·" line before the version span.
- Left the overall page structure untouched: this is a hero/marketing-style course landing page (large
  `.page-title` heading + decorative banner), not a slim persistent utility header bar like the other
  three sub-projects, and the multi-line footer (module stats + risk disclaimer + version) can't be
  collapsed to a single-line height without cutting the risk warning. Forcing pixel-identical bar
  heights here would mean gutting a working, appropriate design for this page's genre — left as a
  documented, intentional exception rather than attempted.
- Font-family was already the canonical stack shared by every sub-project
  (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`) — no change
  needed.
- `COURSE_VERSION` bumped 1.41.0 → 1.41.1.

**Verified:** grep-confirmed no remaining "Crypto Academy" references in the live HTML/JS (only this
changelog's historical entries below still mention it, left as-is since it's a record of past state).

## v1.41.0 — 2026-07-18 — Site title moved out of the banner

**Roadmap item implemented:** "The Title of the web app sits still in the banner. Move it to the top
left of the page." (Follow-up to v1.39.0: the title text/size was fixed, but it was still living
inside `<header class="top">` — the decorative banner element — not actually outside/above it.)

### Changes

- Added `.page-title`, a new element rendered as the **first child of `<body>`**, before
  `<header class="top">` entirely, so the title now sits on the plain page background rather than
  the banner gradient/art. Moved the `<h1>CryptoPro <span>Training</span></h1>` markup there from
  inside `.banner-inner > .banner-text`.
- Moved the corresponding CSS (`font-size:2.9rem`, the gradient `span`, and the 720px mobile
  fallback) from `header.top h1` to `.page-title h1` / `.page-title` selectors.
- The banner itself keeps its small "🪙 Crypto Academy" brand kicker, the descriptive tagline
  paragraph, and the stats row — just without the big duplicate title.
- Version bump: `COURSE_VERSION` 1.40.0 → 1.41.0.

### Verification

- `node --check` on the extracted `<script>` block — syntax OK.
- Loaded the actual rendered file with `jsdom` (`runScripts:'dangerously'`) and asserted:
  `.page-title` exists and is `document.body.firstElementChild`; `header.top` does **not** contain it
  (`header.contains(pageTitle) === false`) and no longer contains any `<h1>`; `.page-title` precedes
  `header.top` in document order; the h1's computed font-size is `2.9rem` and text reads
  "CryptoPro Training"; `document.title` unchanged; module/track counts unchanged (67/9) confirming
  no regression elsewhere on the page.

## v1.40.0 — 2026-07-18 — All-levels filter + theme bar as top row

**Roadmap items implemented:**
3. "Add the option to select all module of all levels in the module filter section."
4. "Move the theme bar to the top row of the web app."

### Changes

- **New "🔷 All levels" button** in the level picker (`setLevel('all')`). `currentLevel` can now hold
  the sentinel string `'all'` alongside the existing numeric 1/2/3. Every place that branched on
  `currentLevel` was updated to special-case it: `applyLevel()`'s module-visibility check, the active-button
  highlighting (switched from numeric `+b.dataset.l===currentLevel` to `b.dataset.l===String(currentLevel)`
  so it works for both numbers and the `'all'` string), `applyState()`'s progress-bar denominator, and the
  initial load from `localStorage` (previously `+(localStorage.getItem(LKEY))||1` would have silently
  coerced a saved `'all'` back to `1` via `NaN||1` — fixed to check for the string first).
- **Theme bar moved to the top row.** `.topbar` (theme picker) now renders before `.quizbar` (quiz score,
  added in v1.38.0) in the header markup, so it's the first strip visitors see, above the quiz score bar.
- Added `LEVEL_NAMES.all` / `LEVEL_DESC.all` for the picker's label and description text.
- Version bump: `COURSE_VERSION` 1.39.0 → 1.40.0.

### Note on v1.39.0 (site title + track collapse)

Two more roadmap items — "put the site title top-left at 2x size" (using `CryptoPro Training`, the
`Title:` field from `CLAUDE.md`'s own description, per workflow rule #14) and "add the option to
collapse tracks the same way modules collapse" — were implemented in this same working tree but ended
up bundled into a separate concurrent commit (`ecd7c08`, "replace Bitcoin badge with graduation cap")
whose own changelog entry only covers the favicon. Recording what that commit's diff actually contains,
for the record: `<title>`/`<h1>` changed to "CryptoPro Training" (h1 font-size 1.45rem → 2.9rem, with a
1.9rem mobile fallback under 720px), footer branding updated to match, and each track's `<h2>` became
clickable (`toggleTrack()`) collapsing a new `.track-body` wrapper around its modules — mirroring the
existing per-module collapse — with a rotating chevron matching the module chevron's visual language.

### Verification

- `node --check` on the extracted `<script>` block — syntax OK.
- Installed `jsdom` in the scratch directory and loaded the **actual rendered file** (not copied logic)
  with `runScripts:'dangerously'`, then drove it through `window.setLevel`/`window.toggleTrack` and read
  back real computed styles and `localStorage`. Confirmed: 67 modules / 9 tracks render; `setLevel(1)`
  shows only lvl 0/1 modules; `setLevel('all')` shows all 67 and marks the "All levels" button active;
  the progress counter denominator matches the total under "all"; `'all'` round-trips through
  `localStorage`; switching back to `setLevel(2)` still correctly filters to lvl 0/2; `toggleTrack()`
  collapses/expands a track with `track-body` computing to `display:none` via the real CSS cascade;
  `.topbar` now precedes `.quizbar` in document order; `document.title` and the `<h1>` both read
  "CryptoPro Training". All assertions passed with no failures logged.

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
