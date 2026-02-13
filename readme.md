# VoidTube (Code-Aligned README)

Manifest V3 Chrome extension for tracking YouTube watch behavior, enforcing a daily limit (optional), and exporting structured daily/weekly data.

## Implemented Features
- Daily logging in `chrome.storage.local` keyed by UTC date (`YYYY-MM-DD`).
- Limit config in `chrome.storage.sync` (`dailyLimitMinutes`, default `30`).
- Real-time limit checks from content script to background worker.
- Session close coverage on:
  - `pause`
  - `yt-navigate-start`
  - `pagehide`
  - `popstate`
  - `beforeunload`
- Filtering of noisy sessions:
  - ignore sessions shorter than `2s`
  - ignore placeholder metadata rows (`Not-Recorded`)
- Homepage controls:
  - Home Sheet Blocker (hide feed)
  - Blur Home (blur feed + disable interaction)
- Dashboard on YouTube home:
  - percentage bar
  - usage message
  - dealer table (top creators by time)
  - refresh button
  - mode badge (`VOID MODE: ON/OFF`)
- Popup controls:
  - set daily limit
  - toggle Home Sheet Blocker
  - toggle Blur Home
  - toggle Void Mode (no blocking, keep logging)
  - export today as markdown copy
  - list all export keys and copy markdown per key
- Retention/export pipeline in background:
  - raw day data retained for 5 days
  - old days rolled into weekly export keys (`weeklyExport:<start>_to_<end>`)
  - merged updates prevent weekly export overwrite

## Data Model
- Daily key (`YYYY-MM-DD`):
  - `date`
  - `totalTimeSeconds`
  - `session[]` with `{ videoTitle, creator, watchTime, videoUrl }`
- Weekly key (`weeklyExport:YYYY-MM-DD_to_YYYY-MM-DD`):
  - `type`
  - `startDate`, `endDate`
  - `createdAt`, `updatedAt`
  - `sourceDates[]`
  - `totalTimeSeconds`, `totalSessions`
  - `dailyRecords[]`

## Known Gaps
- Multi-tab concurrency can still lose increments because writes are read-modify-write without a lock.
- UTC day boundaries may not match local-day expectations.
- Cross-midnight sessions are attributed to the day at log time.
- No automated test suite yet for lifecycle and storage race paths.

## Project Files
- `manifest.json`
- `content-script.js`
- `background.js`
- `dashboard.js`
- `analytics.js`
- `popup.html`
- `popup.js`
- `homeBlocker.css`
- `changes.md`
