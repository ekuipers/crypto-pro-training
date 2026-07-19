# Introduction

Description: Trading course for beginners, intermediate and advanced traders.
Title: CryptoPro Training
Creator: Erik Kuipers

## Workflow rules

> Master workflow rules shared across all CryptoPro sub-projects live in
> [CryptoPro Suite's CLAUDE.md](https://github.com/ekuipers/crypto-pro-suite/blob/main/CLAUDE.md)
> (memory.md changelog discipline, local-server, auto-commit/sync, documentation, roadmap-scan-triggers-implementation,
> allow-all-edits, JS file placement, favicon-as-logo, compact-command, skills directory, HTML-in-/docs,
> title-in-description, etc.). Only rules specific to this project are listed below.

1. Update version number in the footer with the lastest version in the change log.

## Hosting & frontend

- Node.js + Express (`server.js`) serves the built React app (`client/dist/`) + `src/js/course.js` (course data/logic, unchanged from the prior static-HTML version, loaded as a classic script after React mounts) + `src/css/course.css`, plus remaining static assets (favicons, `trading-journal.xlsx`) from `docs/`.
- `client/` is its own npm project — root `npm run build` runs `npm --prefix client install && npm --prefix client run build` (same pattern as CryptoPro Trader).
- No longer on GitHub Pages (static-only; `.github/workflows/static.yml` removed 2026-07-19) — needs a Node host (Vercel, matching Trader/Charts); **linking a new Vercel project is a manual step, not yet done.**
- Header/footer redesigned to the Suite's slim utility-bar convention (Suite CLAUDE.md rule 17) — supersedes the v1.41.1 "intentional exception" that kept the old hero-banner header. Browser click-through **not yet verified**.

## Roadmap

## Bugs

_No open bugs. Fixed bugs are logged in `memory.md` (see v1.36.0)._
