In a browser extension, **`background.js`** (or the **Service Worker** in MV3) is the central controller. It runs independently of web pages, handles persistent logic, and accesses privileged browser APIs.

---

## What `background.js` does

*   **Runs independently:** No DOM access; runs separately from tabs and pages.
*   **Full API access:** Can use `chrome.tabs`, `windows`, `storage`, `webRequest`, and other privileged APIs.
*   **Event-driven:** Responds to lifecycle events (`onInstalled`), UI interactions, and browser triggers (alarms, tab changes).
*   **Message Hub:** Acts as the communication backbone between content scripts and the popup/sidebar.

### Example (MV3)
```js
// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_USER") {
    sendResponse({ user: "ana" });
  }
});
```

---

## Background Script vs. Content Script

| Feature | Background Script | Content Script |
| :--- | :--- | :--- |
| **DOM Access** | No | Yes |
| **Extension APIs** | Full | Limited |
| **Lifecycle** | Event-based (ephemeral) | Tied to webpage |
| **Primary Role** | Central logic & state | Page interaction |

**Mental Model:** Background script = **Brain** | Content script = **Hands**

---

## chrome.storage.local

`chrome.storage.local` is a persistent **key-value storage API** for saving data on the user's device.

### Key Characteristics
*   **Persistent:** Data survives browser restarts and extension reloads.
*   **Shared:** Accessible from background scripts, content scripts, and popups.
*   **Capacity:** ~5MB (much larger than the 100KB limit of `chrome.storage.sync`).

### Basic Operations
```js
// Save
chrome.storage.local.set({ theme: "dark" });

// Read
chrome.storage.local.get(["theme"], (result) => {
  console.log(result.theme);
});

// Remove / Clear

chrome.storage.local.remove("theme");
chrome.storage.local.clear();
```

### When to use it
*   **Use for:** User settings, cached API data, and session state.
*   **Don't use for:** Plain-text passwords or extremely large binary blobs.
*   **MV3 Note:** Because Service Workers are ephemeral (they shut down when idle), you **must** use `chrome.storage.local` to persist state.

---
