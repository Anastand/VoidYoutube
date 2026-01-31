A **content script** is an extension component that **runs inside web pages** to interact directly with their content.

---

## What a content script does 

### 1. Page Interaction
*   **Context:** Executes on specific pages defined via `matches` in `manifest.json`.
*   **DOM Access:** Can read and modify HTML/CSS, inject UI, and observe user actions (clicks, selections).

### 2. API Access & Communication
*   **Limited APIs:** Cannot access most extension APIs (like `chrome.storage` or `chrome.tabs`) directly.
*   **Standard Web APIs:** Can use DOM, `fetch`, and standard events.
*   **Messaging:** Communicates with background scripts or extension UI via **message passing**.

### 3. Isolation & Bridging
*   **Security:** Isolated from the page's JavaScript; it cannot directly access page variables.
*   **Bridge:** Acts as an intermediary between the webpage and the extension's background logic.

### 4. Common Use Cases
Ad blockers, password managers, grammar checkers, and UI overlays (like note-taking tools).

---

## Basic example

### `manifest.json`
```json
{
  "content_scripts": [{
    "matches": ["https://*.example.com/*"],
    "js": ["content.js"]
  }]
}
```

### `content.js`
```js
// Highlight paragraphs and notify background
const paragraphs = document.querySelectorAll("p");
paragraphs.forEach(p => p.style.backgroundColor = "yellow");

chrome.runtime.sendMessage({
  type: "PAGE_PARAGRAPHS",
  count: paragraphs.length
});
```

---

## Comparison

| Feature               | Content Script   | Background Script         |
| --------------------- | ---------------- | ------------------------- |
| Runs on web pages     | Yes              | No                        |
| Access DOM            | Yes              | No                        |
| Persistent            | No               | Yes (service worker)      |
| Access extension APIs | Limited          | Full                      |
| Use case              | Page interaction | Logic, state, permissions |
