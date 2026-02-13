# VoidTube: YouTube Productivity & Analytics Engine

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/Anastand/VoidYoutube?color=blueviolet)](https://github.com/Anastand/VoidYoutube/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**VoidTube** is a sophisticated Chrome Extension (Manifest V3) designed to transform YouTube from a distraction-filled rabbit hole into a controlled, analyzed utility. It tracks consumption patterns, enforces time limits, and provides deep insights into watch behavior directly within the YouTube UI.

---

## Demo

| 🎥 Full Video Walkthrough |
| :---: |
| [![YouTube Demo](https://img.shields.io/badge/YouTube-Watch_Demo-red?style=for-the-badge&logo=youtube)](https://youtu.be/EFV6m1Znz7c) |

---

## Visual Gallery

| Dashboard (In-Page Injection) | Void Mode (Feed Blur) | Popup |
| :---: | :---: | :---: |
| <img src="https://lqjxvo6uxw.ufs.sh/f/sDONeWpE8ncq5kiIFos6ouykDtZrmK8CF3bhgAqn4jMv0L5i" width="280" alt="Dashboard" /> | <img src="https://lqjxvo6uxw.ufs.sh/f/sDONeWpE8ncqviik1BgEmkeAUxXInMfKTWpl0zuibSRBO3yY" width="280" alt="Void Mode" /> | <img src="https://lqjxvo6uxw.ufs.sh/f/sDONeWpE8ncq19OwKRIbgpzZ4L09m2yXIw7djAYUecT5MOQS" width="280" alt="Popup" /> |

---

## Engineering Highlights

This project demonstrates proficiency in browser environments and modern JavaScript:

- **Manifest V3 Architecture:** Utilizes Background Service Workers for non-blocking data processing and resource management.
- **SPA Lifecycle Management:** Overcomes YouTube's Single-Page Application (SPA) architecture by hooking into internal events like `yt-navigate-start` and `beforeunload` for high-accuracy session tracking.
- **Data Engineering:** Implemented a rolling data pipeline using `chrome.storage.local`. Daily logs are automatically aggregated into weekly summaries to optimize storage limits and performance.
- **Dynamic DOM Injection:** Built a custom UI dashboard that is seamlessly injected into the YouTube DOM without breaking existing site functionality or event listeners.

---

## Key Features

- **⏱️ Precision Tracking:** Accurate logging of daily and weekly watch time per creator.
- **📊 Creator Breakdown:** Automatically identifies "Top Creators" to help users audit their information diet.
- **🛡️ Void Mode:** A distraction-blocking engine that uses CSS injection to blur the home feed and sidebar.
- **📉 Markdown Export:** A built-in pipeline to export usage data into structured Markdown for personal journaling.
- **⚠️ Active Limiting:** Visual progress bars and warnings when user-defined daily limits are reached.

## Known Technical Debt
- multi tab race condition: doens't record watch time data for multiple yt tab 


---

## Technical Stack

- **Language:** JavaScript (ES6+)
- **API:** Web Extensions API (Manifest V3)
- **Styling:** CSS3 (Dynamic Injection)
- **Data:** Chrome Storage API

---

## Installation (Development Mode)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Anastand/VoidYoutube.git
   ```
- Open Extensions Page: Navigate to chrome://extensions/ in your Chrome browser.
- Enable Developer Mode: Toggle the switch in the top-right corner.
- Load Extension: Click "Load unpacked" and select the folder where you cloned the project.

## Author
- Aryan Bhardwaj
- GitHub: @anastand
- LinkedIn:[Aryan Bhardwaj](https://www.linkedin.com/in/aryan-bhardwaj-56129422b/)

Built to explore the boundaries of the Chrome Extension API and the complexities of high-traffic web applications.
code
