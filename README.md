<div align="center">
  
  <h1>MailJi — AI-Powered Gmail Spam Classifier</h1>
<a href="#"><img src="https://i.ibb.co/CTtwXyT/Untitled-design-1-Photoroom.png" alt="MailJi Logo" border="0" width="150px"></a>
  <p><em>Namaste, Dost. Your inbox is safe, Ji.</em></p>

  <p>
    <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
    <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
    <img src="https://img.shields.io/badge/Chrome_Extension-MV3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white"/>
    <img src="https://img.shields.io/badge/Scikit--Learn-1.4-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white"/>
    <img src="https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white"/>
  </p>

  <p>
    <strong>MailJi</strong> is a full-stack AI application that classifies your Gmail inbox emails as <strong>Spam</strong> or <strong>Ham</strong> — with explainability.<br/>
    It ships as a <strong>React + FastAPI web app</strong> and a <strong>Chrome Extension</strong> that injects a live classifier directly into Gmail's sidebar.
  </p>

  <br/>
</div>

---

## 📋 Table of Contents

- [✨ Features Overview](#-features-overview)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🐍 Backend — FastAPI](#-backend--fastapi)
- [⚛️ Frontend — React Web App](#️-frontend--react-web-app)
- [🔌 Chrome Extension](#-chrome-extension)
- [🤖 ML Model & Explainability](#-ml-model--explainability)
- [🔐 Authentication & OAuth](#-authentication--oauth)
- [🚀 Getting Started](#-getting-started)
- [☁️ Deployment (Render)](#️-deployment-render)
- [🌐 API Reference](#-api-reference)
- [⚙️ Environment Variables](#️-environment-variables)
- [🛠️ Tech Stack](#️-tech-stack)

---

## ✨ Features Overview

### 🌐 Web Application
| Feature | Detail |
|---|---|
| **Google OAuth Login** | One-click sign-in via Google; read-only Gmail access |
| **Inbox Scanning** | Fetch and classify 1–100 emails per scan with configurable range |
| **Spam / Ham Classification** | Multinomial Naive Bayes trained on the Enron dataset (99.3% accuracy) |
| **AI Explainability** | LIME (Local Interpretable Model-agnostic Explanations) highlights exact words that triggered the spam verdict |
| **TF-IDF Fallback Explanation** | When LIME is unavailable, top TF-IDF weighted words are shown |
| **Donut Chart** | Interactive Recharts pie chart showing spam vs. ham ratio |
| **Paginated Email Browser** | Page through emails in batches of 10 / 20 / 30 / 50 |
| **Email Detail Panel** | Click any email row to expand full details and flagged word list |
| **Filter: All / Spam / Safe** | Instant client-side filter tabs with live count badges |
| **Search** | Real-time subject and sender search across fetched emails |
| **Stats Cards** | Total scanned, spam count, ham count, detection accuracy |
| **Loading Skeletons** | Shimmer placeholder UI while emails are loading |
| **Luxury Dark UI** | Montserrat + Cormorant Garamond · gold `#C9A84C` accents · dark `#0A0A0A` base |
| **Framer Motion** | Page-level and element-level animation on all views |
| **Responsive Design** | Grid-collapsing layouts for mobile, tablet, and desktop |

### 🔌 Chrome Extension
| Feature | Detail |
|---|---|
| **Gmail Sidebar Injection** | Adds a live "MailJi" section to the Gmail left nav via DOM manipulation |
| **Logo & Namaste Mascot** | MailJi logo in the sidebar header; mascot speech bubble on the login screen |
| **Email Range Selector** | Quick-pick pills (10 / 20 / 30 / 50) + custom numeric input (1–100) |
| **Gold Shine Button** | Animated left-to-right shine sweep on all primary CTA buttons |
| **Gmail-native White Theme** | White `#ffffff` surface, `#f6f8fc` card bg, `#e0e0e0` borders — matches Gmail exactly |
| **5-Minute Result Cache** | `chrome.storage.local` caches classified emails to avoid redundant API calls |
| **Spam / Ham Filter Tabs** | Filter the sidebar list with live counts |
| **Confidence % Badge** | Each email row shows spam probability in red or green |
| **LIME Word Explanation** | Expandable row reveals flagged spam keywords |
| **Click-to-Open Email** | Clicking a row navigates Gmail to that email's thread |
| **OAuth via Backend** | Opens Google login in a new tab; auto-detects redirect and stores `user_id` |
| **Auto-reinject** | `MutationObserver` re-injects the sidebar after Gmail SPA navigations |
| **Popup Panel** | Toolbar icon shows backend status (green/orange/red dot), user email, spam stats, refresh and logout buttons |
| **Backend Health Check** | Detects Render cold-start with 35s timeout; shows friendly "waking up" message |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER'S BROWSER                             │
│                                                                     │
│   ┌──────────────────────┐        ┌──────────────────────────────┐  │
│   │   React Web App      │        │   Chrome Extension           │  │
│   │   (Vite · Port 5173) │        │   (Gmail Sidebar Injection)  │  │
│   │                      │        │                              │  │
│   │  LandingPage.jsx ────┼──┐     │  content.js  (DOM inject)    │  │
│   │  Dashboard.jsx    ───┼──┼──── │  background.js (SW + Auth)   │  │
│   │  SpamDonut.jsx    ───┼──┤     │  popup.html/js (toolbar UI)  │  │ 
│   │  EmailRow.jsx     ───┼──┤     │  mailji.css  (injected CSS)  │  │
│   └──────────────────────┘  │     └──────────────────────────────┘  │
│                             │                    │                  │
└─────────────────────────────┼────────────────────┼──────────────────┘
                              │   REST API         │   REST API
                              ▼                    ▼
                  ┌────────────────────────────────────┐
                  │      FastAPI Backend (Python)      │
                  │      https://mailji.onrender.com   │
                  │                                    │
                  │  /auth/login    → OAuth2 URL       │
                  │  /auth/callback → Token exchange   │
                  │  /emails/{uid}  → Fetch + Classify │
                  │  /predict       → Direct classify  │
                  │  /model/status  → Health check     │
                  │  /auth/logout   → Session clear    │
                  │                                    │
                  │  ┌──────────────────────────────┐  │
                  │  │  ML Pipeline                 │  │
                  │  │  TF-IDF Vectorizer           │  │
                  │  │  Multinomial Naive Bayes     │  │
                  │  │  LIME Text Explainer         │  │
                  │  │  Keyword Fallback            │  │
                  │  └──────────────────────────────┘  │
                  └────────────────────────────────────┘
                               │
                               ▼
                  ┌────────────────────────────────────┐
                  │         Gmail API (Google)         │
                  │  Scopes: gmail.readonly            │
                  │          userinfo.email            │
                  │          userinfo.profile          │
                  └────────────────────────────────────┘
```

---

## 📁 Project Structure

```
MailJi/
│
├── backend/                          # FastAPI Python backend
│   ├── main.py                       # App entry point — routes, ML, Gmail helpers
│   ├── train_model.py                # Standalone script to build .pkl files
│   ├── spam_model.pkl                # Pre-trained Naive Bayes model
│   ├── vectorizer.pkl                # Pre-fitted TF-IDF vectorizer
│   ├── enron_combined_dataset.csv    # Training dataset (Enron corpus)
│   ├── requirements.txt              # Python dependencies
│   └── .env.example                  # Environment variable template
│
├── frontend/                         # React + Vite web application
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx                  # App entry — ReactDOM render
│       ├── App.jsx                   # Router setup (Landing / Dashboard)
│       ├── index.css                 # Global resets
│       ├── pages/
│       │   ├── LandingPage.jsx       # Marketing page with hero, features, steps, CTA
│       │   └── Dashboard.jsx         # Main email scanning and classification UI
│       ├── components/
│       │   ├── EmailRow.jsx          # Single email list item with expand/collapse
│       │   ├── EmailDetail.jsx       # Expanded email panel with LIME explanation
│       │   ├── SpamDonut.jsx         # Recharts donut chart (spam/ham ratio)
│       │   ├── StatsCard.jsx         # Metric card (total, spam, ham, accuracy)
│       │   └── LoadingSkeleton.jsx   # Shimmer placeholder during API fetch
│       └── hooks/
│           └── useUser.js            # User session state (user_id, email, name, picture)
│
└── mailji_extension/                 # Chrome Extension (Manifest V3)
    ├── manifest.json                 # Extension config — permissions, content scripts
    ├── background.js                 # Service worker — auth flow, API calls, caching
    ├── content.js                    # Gmail DOM injector — sidebar UI logic
    ├── mailji.css                    # Injected styles (Gmail-native white theme)
    ├── popup/
    │   ├── popup.html                # Toolbar icon popup markup
    │   └── popup.js                  # Popup logic — status, stats, login/logout
    └── icons/
        ├── icon16.png
        ├── icon48.png
        └── icon128.png
```

---

## 🐍 Backend — FastAPI

### Tech Stack
- **FastAPI 0.111** — async REST API framework
- **Uvicorn** — ASGI server
- **scikit-learn 1.4** — TF-IDF vectorizer + Multinomial Naive Bayes
- **LIME 0.2** — local explainability for spam predictions
- **Google API Python Client** — Gmail REST API integration
- **google-auth-oauthlib** — OAuth 2.0 authorization code flow
- **joblib** — model serialization (`.pkl` files)
- **python-dotenv** — environment variable management

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Root health check — model status, source, LIME availability |
| `GET` | `/auth/login` | Returns Google OAuth authorization URL |
| `GET` | `/auth/callback` | Handles OAuth token exchange; redirects to frontend with `user_id` |
| `GET` | `/auth/user/{user_id}` | Returns stored user info (email, name, picture) |
| `GET` | `/emails/{user_id}` | Fetches and classifies Gmail inbox emails |
| `POST` | `/predict` | Direct classification endpoint for arbitrary email text |
| `GET` | `/model/status` | Model health — vocab size, pkl availability, LIME availability |
| `DELETE` | `/auth/logout/{user_id}` | Clears in-memory token store for user |

### `/emails/{user_id}` Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | `int` | `30` | Number of emails to fetch (1–100) |
| `offset` | `int` | `0` | Skip N emails (pagination) |
| `use_lime` | `bool` | `true` | Enable LIME explanations (slower, richer) |

### ML Pipeline

```
Raw Email Text
      │
      ▼
  clean_text()
  ├── Strip email headers (From, To, Cc, Date, X-headers…)
  ├── Lowercase
  ├── Remove punctuation + digits
  └── Collapse whitespace
      │
      ▼
  TF-IDF Vectorizer
  ├── stop_words = "english"
  ├── max_df = 0.90
  ├── min_df = 2
  ├── ngram_range = (1, 2)
  └── sublinear_tf = True
      │
      ▼
  Multinomial Naive Bayes (alpha=0.1)
      │
      ▼
  predict_proba() → spam probability score
      │
      ├── prob > 0.5 → "spam"
      │     └── LIME explanation (top 6 spam-contributing words)
      │         └── fallback: TF-IDF top-weighted words
      │             └── fallback: keyword match list
      └── prob ≤ 0.5 → "ham"
            └── TF-IDF top words shown
```

### Model Loading Strategy

1. **Primary** — load pre-trained `spam_model.pkl` + `vectorizer.pkl` (instant, ~0ms)
2. **Fallback** — train in-memory from `enron_combined_dataset.csv` (~20–60s on cold start)
3. **Final fallback** — keyword-based heuristic classifier (no ML required)

---

## ⚛️ Frontend — React Web App

### Tech Stack
- **React 18** with functional components and hooks
- **React Router v6** — client-side routing (Landing ↔ Dashboard)
- **Vite 5** — build tool and dev server
- **Framer Motion 11** — page transitions, scroll animations, stagger reveals
- **Recharts 2** — donut chart for spam ratio visualization
- **Lucide React** — icon library
- **Axios** — HTTP client for API calls

### Pages

#### `LandingPage.jsx`
- Parallax hero section with **Namaste mascot** + animated speech bubble
- **Marquee ticker** — scrolling feature highlights
- **Stats bar** — 99.3% accuracy, `<1s` speed, 0 emails stored, 1-click setup
- **Feature grid** — 6 cards (Instant Detection, Explainability, Range Scan, Gmail Native, Accuracy, Zero Storage)
- **How It Works** — 3-step animated section
- **Comparison table** — MailJi vs. standard spam filters
- **Word Impact panel** — animated LIME-style bar chart visualizing spam signal words
- **Final CTA** — full-width conversion section
- **Fonts** — Montserrat (800/900 weight) + Cormorant Garamond (italic) + Pinyon Script

#### `Dashboard.jsx`
- Authenticated landing after OAuth redirect
- **User header** — avatar, name, email, logout
- **Stats cards** — total scanned, spam detected, safe emails, accuracy metric
- **SpamDonut** — live pie chart with custom tooltip
- **Range selector** — page size buttons (10 / 20 / 30 / 50)
- **Email list** — paginated with next / previous navigation
- **Filter tabs** — All / Spam / Safe with live count badges
- **Search bar** — real-time filter by subject or sender
- **Email rows** — sender, subject, spam badge, confidence score, expand button
- **EmailDetail panel** — full email preview + LIME explanation words

### Components

| Component | Purpose |
|-----------|---------|
| `EmailRow.jsx` | Renders a single classified email with badge, subject, sender, confidence |
| `EmailDetail.jsx` | Expanded view — full snippet, LIME-highlighted flagged words |
| `SpamDonut.jsx` | Recharts `PieChart` with custom tooltip, gold/red/green palette |
| `StatsCard.jsx` | Animated metric card with icon, value, and label |
| `LoadingSkeleton.jsx` | Shimmer animation placeholder cards shown during API fetch |

---

## 🔌 Chrome Extension

### Architecture (Manifest V3)

```
manifest.json
├── background.js          (Service Worker)
│   ├── OAuth flow management
│   ├── chrome.storage.local read/write
│   ├── fetch() to backend API
│   └── Message bus: GET_USER · LOGIN · LOGOUT · FETCH_EMAILS · CLEAR_CACHE
│
├── content.js             (Injected into mail.google.com)
│   ├── Waits for Gmail nav to render (MutationObserver + setInterval)
│   ├── Appends #mailji-sidebar-section to .aeN sidebar
│   ├── Renders: Login → Loading → Email List (state machine)
│   ├── Range selector: pills (10/20/30/50) + custom input (1–100)
│   ├── Filter tabs: All / Spam / Ham
│   ├── Email rows: badge, sender, subject, confidence, expandable LIME words
│   ├── 5-minute cache via chrome.storage.local
│   └── Re-injects on Gmail SPA navigation changes
│
├── mailji.css             (Injected stylesheet)
│   ├── Gmail-native white theme (#ffffff, #f6f8fc, #e0e0e0)
│   ├── Gold accent tokens (#C9A84C, #E2B84A, #8A6A20)
│   ├── Shine sweep animation on primary buttons (::after pseudo-element)
│   ├── Cormorant Garamond italic for stat numbers
│   └── All styles scoped under #mailji-sidebar-section to avoid Gmail conflicts
│
└── popup/
    ├── popup.html         (Toolbar icon click UI)
    │   ├── MailJi logo header with grid background + gold top bar
    │   ├── Status dot (green/orange/red) with animated blink
    │   ├── User card with avatar initial
    │   └── Spam/Ham stat chips
    └── popup.js
        ├── Backend health check (35s timeout for Render cold start)
        ├── Login / Logout buttons
        ├── Open Gmail shortcut
        └── Refresh emails (clears cache + reloads Gmail tab)
```

### Gmail Sidebar UI Flow

```
Extension loads on mail.google.com
        │
        ▼
waitForGmail() — polls for .aeN nav element
        │
        ▼
injectIntoGmail() — appends #mailji-sidebar-section
        │
        ▼
initMailji()
        │
        ├── GET_USER → no userId → renderLogin()
        │     └── [Sign in] → LOGIN → OAuth tab → auto-detect user_id in redirect
        │
        └── GET_USER → userId found
              │
              ▼
           loadEmails(offset, limit)
              ├── Check cache (< 5 min + same range) → renderEmailList()
              └── FETCH_EMAILS → backend → renderEmailList()
                                                │
                                                ├── logo panel + panel-tag
                                                ├── user row (avatar + email + refresh/logout)
                                                ├── range card (pills + custom input + Scan btn)
                                                ├── stats row (spam count / ham count / spam %)
                                                ├── progress bar
                                                ├── filter tabs
                                                ├── email rows (scrollable, max 300px)
                                                └── load more button
```

---

## 🤖 ML Model & Explainability

### Dataset
- **Enron Combined Dataset** — tens of thousands of real-world email messages
- Balanced spam/ham split with labeled `email` and `label` columns
- Training / test split: 80% / 20% stratified

### Model Performance
| Metric | Value |
|--------|-------|
| Algorithm | Multinomial Naive Bayes |
| Accuracy | **99.3%** on held-out test set |
| Vectorizer | TF-IDF (unigrams + bigrams) |
| Vocabulary | ~50,000+ features |
| Alpha (Laplace smoothing) | 0.1 |

### LIME Explainability
- Uses `lime.lime_text.LimeTextExplainer` on every **spam** prediction
- Generates 500 perturbed samples around the input text
- Returns the top 6 words with the highest positive contribution toward spam classification
- Falls back to TF-IDF top-weighted features when LIME is unavailable
- Final fallback: keyword match list (free, win, urgent, claim, prize…)

### Explanation Methods (in priority order)
```
1. LIME        → use_lime=True + spam predicted  → richest explanation
2. TF-IDF      → use_lime=False OR ham predicted → vocabulary-weighted top words
3. Keyword     → model unavailable               → hard-coded spam keyword match
```

---

## 🔐 Authentication & OAuth

MailJi uses **Google OAuth 2.0 Authorization Code Flow** with read-only Gmail access.

### Scopes Requested
```
https://www.googleapis.com/auth/gmail.readonly
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
openid
```

### Flow (Web App)
```
User clicks "Connect Gmail"
        │
        ▼
GET /auth/login → backend returns Google authorization URL
        │
        ▼
Browser redirects to accounts.google.com
        │
        ▼
User approves → Google redirects to /auth/callback?code=...
        │
        ▼
Backend: Flow.fetch_token() → stores credentials in TOKEN_STORE[user_id]
        │
        ▼
Backend redirects → /dashboard?user_id=&email=&name=&picture=
        │
        ▼
Dashboard reads URL params → useUser() hook → session established
```

### Flow (Chrome Extension)
```
[Sign in] button → chrome.tabs.create({ url: auth_url })
        │
        ▼
MutationObserver on new tab watches for URL containing user_id=
        │
        ▼
On match → chrome.storage.local.set({ mailji_user_id, mailji_user_info })
        │
        ▼
Tab auto-closes → content.js receives userId → loadEmails()
```

> **Security note:** MailJi requests **read-only** Gmail access. It never sends, modifies, labels, or deletes emails. Credentials are stored in-memory server-side (cleared on restart) and locally in `chrome.storage.local`.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Google Cloud project with OAuth 2.0 credentials and Gmail API enabled

### 1. Clone the repository
```bash
git clone https://github.com/your-username/mailji.git
cd mailji
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Google credentials (see Environment Variables section)

# Train the model (run once — builds spam_model.pkl + vectorizer.pkl)
python train_model.py

# Start the server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend

npm install
npm run dev
# Runs at http://localhost:5173
```

### 4. Chrome Extension Setup
```bash
# 1. Open Chrome and go to:
chrome://extensions/

# 2. Enable "Developer mode" (top-right toggle)

# 3. Click "Load unpacked"

# 4. Select the mailji_extension/ folder

# 5. Open Gmail → look for MailJi section at the bottom of the left sidebar
```

---

## ☁️ Deployment (Render)

### Backend on Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set the following:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add all environment variables in the **Environment** tab (see below)
5. Add `https://mailji.onrender.com/auth/callback` to **Authorized redirect URIs** in Google Cloud Console

### Extension for Production

Update these two lines in `background.js` and `popup/popup.js`:
```js
const BACKEND = "https://mailji.onrender.com";
```

Update `manifest.json` host permissions:
```json
"host_permissions": [
  "https://mail.google.com/*",
  "https://mailji.onrender.com/*"
]
```

Update CORS in `main.py` to allow the extension origin:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to chrome-extension://<your-id>
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

> **Render free tier note:** The backend may take 20–30 seconds to wake up from a cold start. The Chrome Extension handles this gracefully with a 35-second timeout and a "waking up" status indicator.

---

## 🌐 API Reference

### `GET /emails/{user_id}`

Fetches and classifies emails from the authenticated user's Gmail inbox.

**Example request:**
```
GET https://mailji.onrender.com/emails/abc123?limit=20&offset=0&use_lime=false
```

**Example response:**
```json
{
  "total": 20,
  "spam_count": 4,
  "ham_count": 16,
  "offset": 0,
  "limit": 20,
  "lime_used": false,
  "model_source": "pkl",
  "emails": [
    {
      "id": "18f9a2b3c4d5e6f7",
      "subject": "Congratulations! You WON $10,000",
      "sender": "prize@lottery-win.com",
      "date": "Mon, 10 Mar 2025 14:22:00 +0000",
      "snippet": "Click here to claim your prize...",
      "prediction": "spam",
      "probability": 0.9832,
      "explanation": ["won", "prize", "claim", "click", "free", "limited"],
      "explain_method": "lime"
    }
  ]
}
```

### `POST /predict`

Classify arbitrary email text directly.

**Request body:**
```json
{
  "email_text": "URGENT: Your account has been suspended. Click here to verify.",
  "use_lime": true
}
```

**Response:**
```json
{
  "prediction": "spam",
  "probability": 0.9714,
  "explanation": ["urgent", "suspended", "verify", "click"],
  "explain_method": "lime"
}
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
REDIRECT_URI=https://mailji.onrender.com/auth/callback
FRONTEND_URL=https://mailji.onrender.com
```

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret |
| `REDIRECT_URI` | Must exactly match an authorized redirect URI in Google Cloud Console |
| `FRONTEND_URL` | URL the backend redirects to after successful OAuth (with `?user_id=` params) |

> For local development, set `REDIRECT_URI=http://localhost:8000/auth/callback` and `FRONTEND_URL=http://localhost:5173`

---

## 🛠️ Tech Stack

### Backend
| Library | Version | Purpose |
|---------|---------|---------|
| FastAPI | 0.111.0 | REST API framework |
| Uvicorn | 0.29.0 | ASGI web server |
| scikit-learn | 1.4.2 | TF-IDF + Naive Bayes ML |
| LIME | 0.2.0.1 | Local explainability |
| NumPy | 1.26.4 | Numerical operations |
| joblib | 1.4.2 | Model serialization |
| google-api-python-client | 2.126.0 | Gmail REST API |
| google-auth-oauthlib | 1.2.0 | OAuth 2.0 flow |
| python-dotenv | 1.0.1 | Env var management |
| Pydantic | 2.7.1 | Data validation |

### Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| React | 18.3.1 | UI framework |
| React Router | 6.23.1 | Client-side routing |
| Vite | 5.2.12 | Build tool & dev server |
| Framer Motion | 11.2.10 | Animations & transitions |
| Recharts | 2.12.7 | Data visualization (donut chart) |
| Lucide React | 0.383.0 | Icon set |
| Axios | 1.7.2 | HTTP client |

### Chrome Extension
| Technology | Detail |
|------------|--------|
| Manifest Version | V3 (latest Chrome standard) |
| Background | Service Worker (`background.js`) |
| Content Script | `content.js` injected on `mail.google.com` |
| Storage | `chrome.storage.local` for user session + email cache |
| Permissions | `storage`, `identity`, `tabs`, `activeTab` |
| Host Permissions | `mail.google.com`, `mailji.onrender.com` |

---

## 📜 License

This project is for educational and portfolio purposes.

---

---

## 👥 Team & Contributors

<div align="center">

<table>
<tr>
<th>Member</th>
<th>Role</th>
<th>GitHub</th>
<th>LinkedIn</th>
</tr>
<tr>
<td><b>Vikrant Kadam</b></td>
<td>Lead Developer · Lead Full Stack</td>
<td><a href="https://github.com/VikrantKadam028"><img src="https://img.shields.io/badge/GitHub-VikrantKadam028-black?style=flat&logo=github" /></a></td>
<td><a href="https://www.linkedin.com/in/vikrantkadam028"><img src="https://img.shields.io/badge/LinkedIn-vikrantkadam028-blue?style=flat&logo=linkedin" /></a></td>
</tr>
<tr>
<td><b>Kartik Pagariya</b></td>
<td>Lead Developer · AI/ML Engineer</td>
<td><a href="https://github.com/kartikpagariya25"><img src="https://img.shields.io/badge/GitHub-kartikpagariya25-black?style=flat&logo=github" /></a></td>
<td><a href="https://www.linkedin.com/in/kartikpagariya1911"><img src="https://img.shields.io/badge/LinkedIn-kartikpagariya1911-blue?style=flat&logo=linkedin" /></a></td>
</tr>
<tr>
<td><b>Aditya Dengale</b></td>
<td>Lead Backend Engineer · DevOps Engineer</td>
<td><a href="https://github.com/DevXDividends"><img src="https://img.shields.io/badge/GitHub-DevXDividends-black?style=flat&logo=github" /></a></td>
<td><a href="https://www.linkedin.com/in/adityadengale"><img src="https://img.shields.io/badge/LinkedIn-adityadengale-blue?style=flat&logo=linkedin" /></a></td>
</tr>
<tr>
<td><b>Janhavi Pagare</b></td>
<td>Frontend Developer · UX Designer</td>
<td><a href="https://github.com/janhvi-2403"><img src="https://img.shields.io/badge/GitHub-janhvi--2403-black?style=flat&logo=github" /></a></td>
<td><a href="https://www.linkedin.com/in/janhvi-pagare-1196b62b8"><img src="https://img.shields.io/badge/LinkedIn-janhvi--pagare-blue?style=flat&logo=linkedin" /></a></td>
</tr>
<tr>
<td><b>Pranali Yelavikar</b></td>
<td>Data Analyst · Core Researcher</td>
<td><a href="https://github.com/pranaliyelavikar14"><img src="https://img.shields.io/badge/GitHub-pranaliyelavikar14-black?style=flat&logo=github" /></a></td>
<td><a href="https://www.linkedin.com/in/pranali-yelavikar-2b3178383"><img src="https://img.shields.io/badge/LinkedIn-pranaliyelavikar-blue?style=flat&logo=linkedin" /></a></td>
</tr>
</table>

</div>

---

<div align="center">
  <p>
    <strong>MailJi</strong> · Built with 🙏 by the MailJi Team<br/>
    <em>Aapka Inbox, Humari Zimmedaari.</em>
  </p>
</div>
