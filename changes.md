# VoidTube Changes (Full Technical Log)

This document explains what was changed, how each change works, and why the change was necessary.
It is written as a build-history reference so you can explain the project clearly in interviews.

## 1) Core Navigation Logging Bug (Back Swipe / Fast Exit)

### What was happening
Watch time could be lost when the user left a playing video quickly, especially through browser back gesture or fast route transitions.

### Why it happened
The old logging path relied too heavily on `pause`. Not every exit path emits `pause` first.

### What was changed
In `/Users/aryanbhardwaj/Development/VoidYoutube/content-script.js`:

1. Logging was centralized through `logwatchTime(reason)`.
2. Session logging now triggers on multiple lifecycle signals:
- `pause`
- `yt-navigate-start`
- `pagehide`
- `popstate`
- `beforeunload`
- cleanup-time fallback when binding is disposed with active session
3. `startTime` is cleared immediately after calculating elapsed time to avoid double-logging.

### Why this was necessary
Different browser and YouTube SPA paths emit different events. Multi-event coverage is required for reliable session closure.

## 2) Final Metadata Sync Before Writing Session

### What was happening
Some sessions were stored with placeholder metadata (`Not-Recorded`) during fast navigation.

### Why it happened
YouTube metadata hydration can lag behind playback/lifecycle events.

### What was changed
Before writing a session, the script performs a last metadata sync and applies it only when session video id matches current page video id.

### Why this was necessary
Improves correctness of `videoTitle` and `creator` under fast page transitions.

## 3) Noise Cleanup in Storage (Preview Bursts + Placeholder Rows)

### What was happening
Storage contained noisy rows that reduced analytics quality.

### Why it happened
Short preview plays and placeholder metadata were being saved.

### What was changed
In `/Users/aryanbhardwaj/Development/VoidYoutube/background.js`:

1. Added `MIN_SESSION_SECONDS = 2`.
2. Any `elapsed < 2` seconds is ignored entirely.
3. Session rows are appended only when `videoTitle` and `creator` are valid and not `Not-Recorded`.
4. Existing stale `Not-Recorded` rows are filtered during writes.

### Why this was necessary
Keeps stored data useful for real behavior analysis and prevents junk entries from polluting dashboard/export output.

## 4) Dashboard Refresh Reliability

### What was happening
The refresh control was present, but user perception of a full re-fetch was weak.

### What was changed
In `/Users/aryanbhardwaj/Development/VoidYoutube/dashboard.js`:

1. Added `refreshDashboardNow()`.
2. Refresh button now enters temporary visual state: `[ REFRESHING... ]`.
3. Refresh re-runs data pull via `VoidtubeDashboard()`.
4. If dealer table is currently open, it is re-rendered in the same refresh cycle.

### Why this was necessary
Ensures visible and complete dashboard rehydration of both summary and detail components.

## 5) Home Feed Controls (Blocker + Blur)

### What was changed
In `/Users/aryanbhardwaj/Development/VoidYoutube/homeBlocker.css`:

1. Added hide rule: `body.vt-home-hide ytd-rich-grid-renderer { display: none !important; }`
2. Added blur rule: `body.vt-home-blur ytd-rich-grid-renderer { filter: blur(...); pointer-events: none; user-select: none; }`

In `/Users/aryanbhardwaj/Development/VoidYoutube/dashboard.js`:

1. Added `applyHomeSheetPreferences()`.
2. Reads `homeSheetHidden` and `homeSheetBlurred` from `chrome.storage.sync`.
3. Applies/removes body classes on initial load and route changes.
4. Reacts to popup toggles via `chrome.storage.onChanged`.

### Why this was necessary
Popup toggles need to affect actual YouTube UI behavior in real time, including SPA navigations.

## 6) Weekly Export + Retention Pipeline

### Requested behavior
After retention window, roll old daily data into weekly master keys and remove old raw day keys.

### What was changed
In `/Users/aryanbhardwaj/Development/VoidYoutube/background.js`:

1. Added retention constants:
- `RAW_RETENTION_DAYS = 5`
- `EXPORT_PREFIX = "weeklyExport:"`
2. Added maintenance functions for:
- day-key detection (`YYYY-MM-DD`)
- age filtering
- week grouping (Monday-Sunday, UTC)
- export object generation
- deleting eligible raw day keys post-export
3. Weekly export object includes:
- `type`
- `startDate`
- `endDate`
- `createdAt`
- `sourceDates`
- `totalTimeSeconds`
- `totalSessions`
- `dailyRecords`
4. Maintenance execution triggers:
- on install
- on browser startup
- periodic checks during runtime (throttled)

### Why this was necessary
Keeps storage bounded while preserving long-horizon reporting via compact weekly snapshots.

## 7) Popup Redesign (Inline Style, Dashboard-Coherent)

### What was changed
In `/Users/aryanbhardwaj/Development/VoidYoutube/popup.html`:

1. Moved popup design to inline styles to match dashboard style preference.
2. Applied black/red brutalist look for visual coherence.
3. Added control sections for limit, blocker/blur toggles, and export actions.

In `/Users/aryanbhardwaj/Development/VoidYoutube/popup.js`:

1. Toggle rendering uses inline button style mutation (no class dependency).
2. Status messaging and button states are handled directly in JS.

### Why this was necessary
You requested dashboard-style inline UI code and reduced popup CSS complexity.

## 8) Popup Control Semantics Update

### What was changed
1. `Home Sheet` label was renamed to **Home Sheet Blocker**.
2. Button state explicitly reflects ON/OFF.
3. Blur toggle remains independent (`Blur Home`).

### Why this was necessary
Makes behavior explicit: blocker controls visibility of home feed; blur is a separate behavior switch.

## 9) Export UX Expansion (Daily + Weekly + Today Quick Export)

### What was changed
In `/Users/aryanbhardwaj/Development/VoidYoutube/popup.js` and `/Users/aryanbhardwaj/Development/VoidYoutube/popup.html`:

1. Added `EXPORT TODAY (COPY MD)` button.
2. Added `SHOW ALL EXPORT KEYS` panel.
3. Export key list now includes both:
- daily keys (`YYYY-MM-DD`)
- weekly keys (`weeklyExport:...`)
4. Each key card has `COPY MARKDOWN` action.
5. Clipboard copy uses `navigator.clipboard` with fallback.

### Why this was necessary
You wanted fast daily export and per-key export access, not just weekly master snapshots.

## 10) Markdown Export Format (Instruction + Raw Data, No AI Summary)

### Current behavior
Copied markdown now starts with:

1. `# Instruction To AI`
2. explicit instruction asking the model to analyze brutally and honestly

Then data sections follow.

### Included sections
For daily exports:

1. Core metadata (date, generation time, total watch time, session count, limit)
2. `## Creators Watched`
3. `## Videos Watched`
4. `## Session-Level Rows`

For weekly exports:

1. Core metadata (range, totals, generation time)
2. `## Creators Watched`
3. `## Videos Watched`
4. `## Daily Breakdown`

### Important change
Generated **AI summary blocks were removed**. The markdown now contains instruction + structured raw data so external AI can generate its own interpretation.

## 11) Analytics Time Display Fix

### What was changed
In `/Users/aryanbhardwaj/Development/VoidYoutube/analytics.js`:

1. Normalized numeric parsing for durations.
2. Changed output format to:
- `Xh Ym` for hour-level
- `Xm Ys` for minute-level
- `Xs` for short durations

### Why this was necessary
Prevents confusing output such as `0m` for short watch spans.

## 12) Current Known Technical Gaps

1. Multi-tab race condition is still not fully solved.
2. Day-key partitioning currently uses UTC date boundaries.
3. Automated tests are not yet implemented for lifecycle and concurrency paths.

## 13) Log Mode (No-Limit Logging Mode)

### What was requested
You wanted a mode where YouTube is never blocked, but all watch behavior is still recorded.

### What was changed
In `/Users/aryanbhardwaj/Development/VoidYoutube/popup.html` and `/Users/aryanbhardwaj/Development/VoidYoutube/popup.js`:

1. Added a new popup control button (`LOG MODE: ON/OFF`; initially implemented as `VOID MODE` and later renamed in UI copy).
2. Added storage key: `noLimitModeEnabled` in `chrome.storage.sync`.
3. Added clear status feedback when mode changes.

In `/Users/aryanbhardwaj/Development/VoidYoutube/background.js`:

1. `check-block-status` now exits early with `blockYt: false` when void mode is enabled.
2. `log-watch-time` still stores sessions/totals as normal.
3. Limit enforcement is bypassed only for blocking response, not for logging pipeline.

In `/Users/aryanbhardwaj/Development/VoidYoutube/dashboard.js`:

1. Added `LOG MODE` badge in dashboard (renamed from `VOID MODE` in UI copy).
2. Dashboard reacts to mode toggles via `chrome.storage.onChanged`.
3. Header label switches from `% WASTED` to `% LOGGED` when mode is enabled.

### Why this was necessary
This gives a strict audit mode (full visibility) without active restriction, so behavior data remains complete even when enforcement is intentionally disabled.

## 14) Weekly Export Overwrite Bug Fix

### What was happening
When old day-keys aged into retention one-by-one, weekly export keys could be overwritten with only the newest eligible day.

### Why it happened
Weekly export writes rebuilt export objects only from currently eligible day keys and replaced existing export keys directly.

### What was changed
In `/Users/aryanbhardwaj/Development/VoidYoutube/background.js`:

1. Maintenance now loads existing weekly export rows (if present).
2. Existing daily records are merged by date with newly eligible day records.
3. Totals are recalculated from merged records.
4. Export now keeps original `createdAt` and adds `updatedAt`.

### Why this was necessary
Prevents historical data loss in weekly exports and keeps weekly snapshots additive/stable across retention runs.

These are the strongest next steps for production-grade robustness.
