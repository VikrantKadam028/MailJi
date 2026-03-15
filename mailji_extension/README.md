# MailJi Chrome Extension

AI-powered Gmail spam classifier that injects a **MailJi** section directly into the Gmail sidebar.

---

## What it does

- Scans your Gmail inbox on load via your MailJi backend
- Injects a **"MailJi"** section in the Gmail left sidebar
- Classifies every email as **SPAM** or **HAM** with confidence %
- Shows flagged spam keywords (LIME/TF-IDF explainability)
- Filter view by All / Spam / Ham
- 5-minute result cache (no re-fetching on every page load)
- Works with Gmail dark mode

---

## Setup

### 1. Update backend URL (before deploying)

In `background.js` and `popup/popup.js`, change:

```js
const BACKEND = "http://localhost:8000";
```

To your Render URL after deploying:

```js
const BACKEND = "https://your-mailji-backend.onrender.com";
```

Also update `manifest.json` → `host_permissions`:
```json
"host_permissions": [
  "https://mail.google.com/*",
  "https://your-mailji-backend.onrender.com/*"
]
```

### 2. Update CORS in your backend (`main.py`)

Add the extension's origin to allowed origins. Chrome extensions use `chrome-extension://<id>` as origin. 
Since this is unpredictable before loading, add a wildcard or handle it:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # or add chrome-extension://* after you know the ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Load in Chrome

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select this `MailJi_Extension` folder
5. Note your extension ID (shown on the card)

### 4. Run your backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 5. Open Gmail

Go to [mail.google.com](https://mail.google.com) — the **MailJi** section appears at the bottom of the left sidebar automatically.

---

## OAuth Note

The extension opens a new tab for Google OAuth (same flow as the web app). After login, the tab auto-closes and MailJi starts scanning.

---

## File Structure

```
MailJi_Extension/
├── manifest.json       — Extension config (MV3)
├── background.js       — Service worker: auth, API calls
├── content.js          — Gmail injector (sidebar UI)
├── mailji.css          — Injected styles
├── popup/
│   ├── popup.html      — Toolbar popup
│   └── popup.js        — Popup logic
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```
