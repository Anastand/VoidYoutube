# VoidTube Roadmap

## Phase 1: Core MVP (SHIPPED)
- [x] Daily time tracking with reset
- [x] Configurable limit via popup  
- [x] Real-time polling enforcement
- [x] Homepage CSS nuke
- [x] Dynamic limit update without refresh

### Known Issues (Deferred)
- [ ] **Multi-tab race condition:** Concurrent videos on 2+ tabs don't aggregate time correctly. Each tab checks limit individually.
- [ ] **Cross-midnight logging:** Videos playing across midnight log entirely to new day (acceptable edge case).
- [ ] **Input validation:** Negative numbers in popup aren't rejected (silently converted).

## Phase 2: Dashboard & Analytics
- [ ] Homepage overlay with "Time Spent Today" counter
- [ ] Percentage of limit used (progress bar)
- [ ] Snarky status messages based on usage
- [ ] Creator statistics (top channels by time)

## Phase 3: AI Integration  
- [ ] OpenRouter API integration for video categorization
- [ ] "Entertainment" vs "Educational" classification
- [ ] Different limits for different content types
- [ ] CSV export of "Intent vs Reality"

## Phase 4: Network Hardening
- [ ] declarativeNetRequest to block recommendation APIs
- [ ] Session mode (unlock for X minutes, then lock for Y minutes)
