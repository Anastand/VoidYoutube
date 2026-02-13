# 🌌 VoidTube: YouTube Productivity & Analytics Engine

**VoidTube** is a sophisticated Chrome Extension (Manifest V3) designed to transform YouTube from a distraction-filled rabbit hole into a controlled, analyzed utility. It tracks consumption patterns, enforces time limits, and provides deep insights into watch behavior directly within the YouTube UI.

---

## 🚀 Why this project? (Technical Highlights)

For recruiters and developers, this project demonstrates proficiency in:
- **Modern Extension Architecture:** Built using **Manifest V3**, utilizing Service Workers for background persistence and efficient resource management.
- **Dynamic DOM Injection:** Overcoming the challenges of YouTube’s Single-Page Application (SPA) architecture to inject a custom dashboard and progress tracking UI.
- **State Management & Persistence:** Implementing a robust data pipeline using `chrome.storage` to manage real-time session logs, weekly aggregations, and user configurations.
- **Advanced Event Handling:** Monitoring YouTube-specific lifecycle events (like `yt-navigate-start`) and browser events to ensure accurate data logging across multiple tabs.

---

## ✨ Key Features

- **⏱️ Real-Time Usage Tracking:** Precision logging of daily and weekly watch time.
- **📊 Creator Insights:** Automatically identifies and ranks your most-watched creators to help audit your "information diet."
- **🛡️ Void Mode (Distraction Blocking):** A customizable CSS-injection engine that blurs or hides the home feed to prevent doom-scrolling.
- **📉 Data Export:** A built-in pipeline to convert raw browser storage into structured Markdown summaries for external journaling or habit tracking.
- **⚠️ Smart Limits:** User-defined thresholds that trigger visual warnings when daily usage is exceeded.

---

## 🛠️ Technical Deep Dive

### 1. Handling SPA Navigation
YouTube doesn't trigger standard page reloads. VoidTube solves this by hooking into the `yt-navigate-start` and `beforeunload` events, ensuring that the "watch session" logic remains accurate even as the user clicks through videos.

### 2. The Data Pipeline
To prevent storage bloat, VoidTube implements a rolling log system:
- **Daily Log:** High-resolution tracking of every video session.
- **Weekly Rollup:** At the end of a cycle, the system aggregates daily data into a `weeklySummary` and clears the logs, maintaining a high-performance footprint.

### 3. Manifest V3 Service Workers
Utilizing `background.js` as a service worker to handle asynchronous messaging between the **Popup** (UI), **Content Scripts** (Logic), and **Storage API** without blocking the main browser thread.

---

## 🏗️ Installation (Development Mode)

1. Clone this repository: 
   ```bash
   git clone https://github.com/Anastand/VoidYoutube.git
   ```
Open Chrome and navigate to chrome://extensions/.
Enable "Developer mode" in the top right corner.
Click "Load unpacked" and select the project folder.

## 📈 Roadmap & Future Improvements

Data Visualization: Integration of Chart.js for visual trend analysis.

Categorization: Auto-tagging videos by category (Education, Entertainment) via the YouTube Data API.

Sync Support: Optional cloud sync for cross-browser usage statistics.

👨‍💻 Author
AryanBhardwaj
GitHub: @Anastand
LinkedIn: [AryanBhardwaj](https://www.linkedin.com/in/aryan-bhardwaj-56129422b/)
Note: This project was built to explore the constraints of Manifest V3 and the complexities of DOM manipulation in high-traffic web applications.
