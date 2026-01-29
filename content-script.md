In a browser extension (Chrome, Firefox, Edge), a **content script** is the part of the extension that **runs inside web pages** and **interacts directly with their content**.

---

## What a content script does

### 1. Runs in the context of a web page

* It executes on specific pages you allow (via `matches` in `manifest.json`).
* It can **read and modify the DOM** (HTML, CSS).
* Example actions:

  * Read text from the page
  * Inject buttons or UI
  * Highlight elements
  * Observe user actions (clicks, selections)

---

### 2. Has limited access to browser APIs

Content scripts **cannot**:

* Access most Chrome extension APIs directly
* Access `chrome.storage`, `chrome.tabs`, etc. (except messaging)

Content scripts **can**:

* Use standard Web APIs (DOM, fetch, events)
* Communicate with:

  * **background scripts**
  * **service workers**
  * **extension UI (popup/sidebar)**

Communication is done via **message passing**.

---

### 3. Acts as a bridge between the page and the extension

Web pages and extensions are isolated for security.

A content script:

* Can **see and modify the page**
* Can **talk to the background script**
* Cannot directly call page JavaScript variables or functions

If needed, it can:

* Inject a `<script>` tag into the page to run page-level JS

---

### 4. Common use cases

* Ad blockers (hide elements)
* Grammar checkers (read user input)
* Password managers (detect login forms)
* Note-taking or highlighting tools
* Reading selected text and sending it to the extension

---

## Basic example

### `manifest.json`

```json
{
  "content_scripts": [
    {
      "matches": ["https://*.example.com/*"],
      "js": ["content.js"]
    }
  ]
}
```

### `content.js`

```js
// Runs inside the webpage
const paragraphs = document.querySelectorAll("p");
paragraphs.forEach(p => p.style.backgroundColor = "yellow");

// Send data to background
chrome.runtime.sendMessage({
  type: "PAGE_PARAGRAPHS",
  count: paragraphs.length
});
```

---

## Content script vs background script (quick comparison)

| Feature               | Content Script   | Background Script         |
| --------------------- | ---------------- | ------------------------- |
| Runs on web pages     | Yes              | No                        |
| Access DOM            | Yes              | No                        |
| Persistent            | No               | Yes (service worker)      |
| Access extension APIs | Limited          | Full                      |
| Use case              | Page interaction | Logic, state, permissions |
