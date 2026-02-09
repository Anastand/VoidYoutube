# VoidTube Roadmap (Code-Aligned)

This README reflects the current state of the code in:
- `manifest.json`
- `background.js`
- `content-script.js`
- `dashboard.js`
- `popup.html`
- `popup.js`
- `homeBlocker.css`

## Current Build Snapshot
- Chrome Extension using Manifest V3.
- Watch-time logging in `chrome.storage.local` by date key (`YYYY-MM-DD`).
- Configurable daily limit stored in `chrome.storage.sync`.
- Block checks via message passing (`check-block-status`).
- Real-time polling while video is playing (10s interval).
- Homepage dashboard injection with percentage bar and snark message.
- Popup UI for setting the limit.

## Phase 1: Core MVP
- [x] Daily time tracking by day key in local storage
- [x] Configurable limit via popup
- [x] Real-time polling enforcement while playing
- [x] Dynamic limit update without page refresh (dashboard + polling behavior)
- [ ] Homepage CSS nuke (currently commented out in `homeBlocker.css`)
- [ ] fix the navigation logic

## Phase 2: Dashboard & Analytics
- [x] Homepage overlay/dashboard injected on YouTube home
- [x] Percentage of limit used (progress bar)
- [x] Snarky status messages based on usage tiers
- [x] Explicit "Time Spent Today" counter (minutes/seconds value not shown directly)
- [x] Creator/channel statistics (top channels by time)

## Phase 3: AI Integration
- [ ] Different limits for different content types
- [ ] CSV export of day

## Phase 4: Network Hardening
- [ ] Session mode (unlock for X minutes, then lock for Y minutes)

## Known Gaps In Current Code
- [ ] Multi-tab race condition: per-tab checks can miss combined concurrent watch time.
- [ ] Cross-midnight logging: active session is fully attributed to date at pause/log time.
- [ ] Input validation: popup accepts invalid values (`NaN`, negative, zero edge cases).
- [ ] Inconsistent default limit: background defaults to `40`, popup/dashboard imply `30`.
- [ ] Session-finalization gaps: watch time is mainly logged on `pause`, so abrupt tab close/navigation can miss time.

## Notes
- Additional working notes are in `readme/`:
- `background.md`
- `content-script.md`
- `idea.md`
- `reply.md`
