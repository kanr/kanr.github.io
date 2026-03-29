---
title: "Building Chrome Extensions with AI: A Step-by-Step Guide"
description: "A hands-on tutorial for building a useful Chrome extension from scratch using Claude as your coding partner. Covers Manifest V3, popups, content scripts, service workers, and chrome.storage."
pubDate: 2026-02-28
author: "Kanr"
tags: ["ai", "chrome extensions", "javascript", "tutorial", "claude"]
---

Chrome extensions are one of the most satisfying things to build. The scope is small, the feedback loop is instant, and within an hour you can have something that genuinely improves your daily browsing. Add an AI coding partner and that timeline shrinks to minutes. This tutorial walks you through building a real, working extension from scratch — prompts, code, and all.

## What We're Building

We're going to build **ReadWise** — a reading time estimator that injects a subtle badge at the top of any webpage showing how long the article will take to read. It also shows a live reading progress bar as you scroll, and lets you set your personal reading speed in a popup. Small, practical, and a great showcase of all the core extension concepts.

By the end you'll have:
- A popup for user settings
- A content script that measures and displays reading time
- A background service worker
- Persistent settings via `chrome.storage`

The full source is shown inline throughout. No handwaving.

## Prerequisites

- Chrome (or any Chromium browser)
- A text editor (VS Code recommended)
- Basic JavaScript knowledge
- A Claude.ai account or access to the Anthropic API

## Step 1 — The Manifest

The manifest is the extension's identity card. Every Chrome extension starts with a `manifest.json` file that tells Chrome what your extension is, what it needs, and where its files live.

**The prompt I used:**

> "Generate a `manifest.json` for a Chrome Manifest V3 extension called 'ReadWise'. It needs: a popup page at `popup.html`, a content script `content.js` that runs on all URLs, a background service worker at `background.js`, and permissions for `storage` and `activeTab`. Include a 16px and 48px icon."

Claude returned this, which needed zero edits:

```json
{
  "manifest_version": 3,
  "name": "ReadWise",
  "version": "1.0.0",
  "description": "Reading time estimator with live progress tracking.",
  "permissions": ["storage", "activeTab"],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "background": {
    "service_worker": "background.js"
  }
}
```

**Key fields explained:**

- `manifest_version: 3` — MV3 is the current standard. Google deprecated MV2 in 2023. Never start a new extension on MV2.
- `action.default_popup` — The HTML file Chrome opens when the user clicks the extension icon.
- `content_scripts.matches` — `"<all_urls>"` means injected on every page. You can restrict this to specific domains.
- `run_at: "document_idle"` — Runs after the page has fully loaded, so the DOM is ready.
- `background.service_worker` — MV3 replaced persistent background pages with event-driven service workers.

Create an `icons/` directory and drop two PNG icons inside. A free 48×48 PNG from any icon site works fine for development.

## Step 2 — The Popup

The popup is a small HTML page that appears when you click the extension icon. For ReadWise, it lets users adjust their reading speed (words per minute).

**The prompt:**

> "Write `popup.html` and `popup.js` for a Chrome extension popup. It should show the user's current reading speed in WPM (default 200), let them adjust it with +/- buttons, and save the value using `chrome.storage.sync`. Style it cleanly — dark background, white text, around 220px wide."

**`popup.html`:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ReadWise Settings</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 220px;
      padding: 16px;
      background: #1a1a2e;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    h1 { font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #a78bfa; }
    .label { font-size: 11px; color: #888; margin-bottom: 6px; }
    .counter {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #16213e;
      border-radius: 8px;
      padding: 8px 12px;
    }
    button {
      background: #7c3aed;
      color: white;
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      font-size: 18px;
      cursor: pointer;
      line-height: 1;
    }
    button:hover { background: #6d28d9; }
    #wpm {
      font-size: 22px;
      font-weight: 700;
      color: #fff;
    }
    .unit { font-size: 11px; color: #888; margin-top: 4px; text-align: center; }
    #saved {
      font-size: 11px;
      color: #34d399;
      text-align: center;
      margin-top: 10px;
      opacity: 0;
      transition: opacity 0.3s;
    }
    #saved.show { opacity: 1; }
  </style>
</head>
<body>
  <h1>ReadWise</h1>
  <p class="label">Your reading speed</p>
  <div class="counter">
    <button id="dec">−</button>
    <div>
      <div id="wpm">200</div>
      <div class="unit">WPM</div>
    </div>
    <button id="inc">+</button>
  </div>
  <div id="saved">Saved ✓</div>
  <script src="popup.js"></script>
</body>
</html>
```

**`popup.js`:**

```js
const wpmEl = document.getElementById('wpm');
const savedEl = document.getElementById('saved');
let wpm = 200;

chrome.storage.sync.get({ wpm: 200 }, (data) => {
  wpm = data.wpm;
  wpmEl.textContent = wpm;
});

function save() {
  chrome.storage.sync.set({ wpm }, () => {
    savedEl.classList.add('show');
    setTimeout(() => savedEl.classList.remove('show'), 1500);
  });
}

document.getElementById('inc').addEventListener('click', () => {
  wpm = Math.min(wpm + 10, 1000);
  wpmEl.textContent = wpm;
  save();
});

document.getElementById('dec').addEventListener('click', () => {
  wpm = Math.max(wpm - 10, 50);
  wpmEl.textContent = wpm;
  save();
});
```

## Step 3 — The Content Script

The content script runs in the context of every web page. It reads the page's text, calculates reading time, injects a badge into the DOM, and draws a progress bar.

**The prompt:**

> "Write `content.js` for a Chrome extension. It should: (1) count the words on the page (ignoring nav, header, footer, scripts), (2) fetch the user's WPM from `chrome.storage.sync`, (3) inject a fixed-position badge in the top-right showing '~X min read', and (4) add a thin progress bar at the very top of the page that fills as the user scrolls. Style everything with injected CSS — don't assume any external stylesheet exists."

**`content.js`:**

```js
(async () => {
  // Don't run on chrome:// or extension pages
  if (!document.body) return;

  const { wpm = 200 } = await chrome.storage.sync.get({ wpm: 200 });

  // Count words in readable content only
  const clone = document.body.cloneNode(true);
  ['script', 'style', 'nav', 'header', 'footer', 'aside', 'noscript'].forEach(tag => {
    clone.querySelectorAll(tag).forEach(el => el.remove());
  });
  const text = clone.innerText || clone.textContent || '';
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / wpm));

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #readwise-badge {
      position: fixed;
      top: 12px;
      right: 12px;
      background: rgba(124, 58, 237, 0.92);
      color: #fff;
      font: 600 12px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      padding: 6px 10px;
      border-radius: 20px;
      z-index: 2147483647;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      backdrop-filter: blur(4px);
    }
    #readwise-progress {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      width: 0%;
      background: linear-gradient(90deg, #7c3aed, #a78bfa);
      z-index: 2147483647;
      transition: width 0.1s linear;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  // Inject badge
  const badge = document.createElement('div');
  badge.id = 'readwise-badge';
  badge.textContent = `~${minutes} min read`;
  document.body.appendChild(badge);

  // Inject progress bar
  const bar = document.createElement('div');
  bar.id = 'readwise-progress';
  document.body.appendChild(bar);

  // Update progress on scroll
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${pct.toFixed(1)}%`;
  }, { passive: true });
})();
```

## Step 4 — The Background Service Worker

Our extension is simple, so the service worker is minimal — it just listens for the extension install event to set default storage values.

**The prompt:**

> "Write a minimal `background.js` service worker for a Chrome MV3 extension. On install, set `chrome.storage.sync` defaults for `wpm: 200`."

**`background.js`:**

```js
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.sync.set({ wpm: 200 });
  }
});
```

For more complex extensions — those that make API calls, handle cross-tab communication, or run timers — service workers do more heavy lifting. For ReadWise, this is all we need.

## Step 5 — Storage: chrome.storage vs localStorage

You saw `chrome.storage.sync` throughout this code. Here's why it matters:

| Feature | `chrome.storage.sync` | `localStorage` |
|---|---|---|
| Syncs across devices | ✅ | ❌ |
| Available to content scripts | ✅ | ❌ |
| Available to service workers | ✅ | ❌ |
| Size limit | 8 KB per item | ~5 MB |

`chrome.storage.local` exists if you need more storage without syncing. Always prefer `chrome.storage` over `localStorage` in extensions — `localStorage` is inaccessible from content scripts and service workers.

## Step 6 — Loading and Debugging

### Load the unpacked extension

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right)
3. Click **Load unpacked** and select your extension folder
4. Visit any article-heavy page — you should see the purple badge and progress bar

### Debugging tips

**Popup**: Right-click the extension icon → **Inspect popup**. Opens DevTools attached to the popup window.

**Content script**: Open DevTools on any page where the extension is running. In the **Sources** tab, look under **Content scripts** for your file. `console.log` from `content.js` appears in the regular page console.

**Service worker**: Go to `chrome://extensions`, find your extension, and click **Service Worker**. This opens a dedicated DevTools window for the background context.

**Common errors to watch for:**
- `Cannot read properties of undefined (reading 'sync')` — you're calling `chrome.storage` outside of an extension context (e.g., in a regular HTML file opened directly)
- Content Security Policy errors — extension pages have strict CSP; don't inject inline scripts
- Manifest permission errors — if a permission isn't declared in `manifest.json`, the API call will silently fail

## Step 7 — Polish

**Icons**: Generate a proper icon set with a tool like [favicon.io](https://favicon.io) or ask Claude to write an SVG and convert it. Minimum sizes: 16px, 48px, 128px.

**Error handling**: Wrap `content.js` in a try/catch — some pages (PDF viewers, `chrome://` pages) will throw on DOM access:

```js
(async () => {
  try {
    // ... all your content script code
  } catch (e) {
    // Silently fail on pages where we can't inject
  }
})();
```

**Edge cases**: Pages with little text (login pages, error pages) get `~1 min read`. Cap minutes at a sensible maximum if you want — some documentation pages might show `~45 min read`, which is accurate but alarming.

**Permissions audit**: Before publishing, audit every permission you've declared. Chrome Web Store reviewers and users both scrutinize permissions. `activeTab` is much less scary than `tabs`; `storage` is essential. Never request permissions you don't use.

## The Complete File Structure

```
readwise/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
└── icons/
    ├── icon16.png
    └── icon48.png
```

That's it — six files, under 200 lines of code total.

## What to Build Next

Once you're comfortable with this pattern, the possibilities expand quickly:

- **Save reading progress**: Store scroll position per URL so you can resume where you left off
- **Daily reading stats**: Track total words and minutes read across all pages using `chrome.storage.local`
- **Readability mode**: Add a button to strip ads and clutter from article pages (similar to Firefox Reader View)
- **Highlight-and-save**: Let users highlight text and save it to a sidebar, then export as Markdown
- **Word count for writing**: Detect if the user is on a text editor (Google Docs, Notion, etc.) and track their own writing progress

Each of these is one Claude conversation away. The pattern is always the same: describe what you want in plain English, ask Claude to generate a specific file, paste the result, load it in Chrome, and iterate based on what you observe in DevTools.

Chrome extensions remain one of the best projects for developers who want a quick win. The platform is mature, the documentation is excellent, and the scope is small enough to ship something real in a single session. With an AI pair programmer, even the boilerplate stops being annoying — you're back to just building things.
