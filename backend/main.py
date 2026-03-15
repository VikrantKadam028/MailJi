"""
Mailji AI - FastAPI Backend
============================
- Loads pre-trained model from spam_model.pkl + vectorizer.pkl (run train_model.py first)
- Falls back to in-memory training if .pkl files not found
- LIME explainability for every spam prediction
- Email range selection (offset + limit)

Run:
    venv\Scripts\activate
    python train_model.py          # once, to build .pkl files
    python -m uvicorn main:app --reload --port 8000
"""

import re
import os
import sys
import csv
import string
import base64
import numpy as np
from pathlib import Path
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from typing import Optional, List

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

import joblib
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# LIME — optional but used when available
try:
    from lime.lime_text import LimeTextExplainer
    LIME_AVAILABLE = True
except ImportError:
    LIME_AVAILABLE = False
    print("  LIME not installed. pip install lime  for richer explanations.")

load_dotenv()
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# ──────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────

BASE_DIR        = Path(__file__).parent
DATASET_PATH    = BASE_DIR / "enron_combined_dataset.csv"
MODEL_PATH      = BASE_DIR / "spam_model.pkl"
VECTORIZER_PATH = BASE_DIR / "vectorizer.pkl"
CREDS_FILE      = BASE_DIR / "credentials.json"

CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID",     "")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
REDIRECT_URI  = os.getenv("REDIRECT_URI",  "https://mailji.onrender.com/auth/callback")
FRONTEND_URL  = os.getenv("FRONTEND_URL",  "https://mailji-frontend.onrender.com")

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid",
]

TOKEN_STORE: dict = {}

# ──────────────────────────────────────────────
# TEXT CLEANING
# ──────────────────────────────────────────────

HEADER_RE = re.compile(
    r"^(From|To|Cc|Bcc|Subject|Date|Message-ID|Mime-Version|"
    r"Content-Type|Content-Transfer-Encoding|X-[\w-]+):.*$",
    flags=re.IGNORECASE | re.MULTILINE,
)

def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = HEADER_RE.sub("", text)
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation + string.digits))
    text = re.sub(r"\s+", " ", text).strip()
    return text

# ──────────────────────────────────────────────
# MODEL LOADING — pkl first, fallback to training
# ──────────────────────────────────────────────

MODEL      = None
VECTORIZER = None
MODEL_SOURCE = "none"

def load_from_pkl() -> bool:
    """Try to load pre-trained model from .pkl files. Returns True if successful."""
    global MODEL, VECTORIZER, MODEL_SOURCE
    if MODEL_PATH.exists() and VECTORIZER_PATH.exists():
        try:
            MODEL      = joblib.load(MODEL_PATH)
            VECTORIZER = joblib.load(VECTORIZER_PATH)
            MODEL_SOURCE = "pkl"
            print(f"  Loaded model from {MODEL_PATH.name} + {VECTORIZER_PATH.name}")
            print(f"  Vocabulary size: {len(VECTORIZER.vocabulary_):,}")
            return True
        except Exception as e:
            print(f"  Failed to load .pkl files: {e}")
            print("  Falling back to in-memory training...")
    return False


def train_in_memory():
    """Train model from CSV when pkl files are missing/corrupt."""
    global MODEL, VECTORIZER, MODEL_SOURCE

    if not DATASET_PATH.exists():
        print(f"  Dataset not found at {DATASET_PATH}")
        print("  Using keyword fallback classifier.")
        return

    csv.field_size_limit(min(sys.maxsize, 2147483647))

    print(f"  Loading dataset: {DATASET_PATH.name}")
    texts, labels = [], []
    skipped = 0

    with open(DATASET_PATH, encoding="utf-8", errors="replace", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                label = row.get("label", "").strip().lower()
                email = row.get("email", "").strip()
                if label in ("spam", "ham") and email:
                    texts.append(clean_text(email))
                    labels.append(1 if label == "spam" else 0)
                else:
                    skipped += 1
            except Exception:
                skipped += 1

    spam_c = sum(labels)
    ham_c  = len(labels) - spam_c
    print(f"  Loaded {len(texts)} emails | spam={spam_c} ham={ham_c} skipped={skipped}")

    if len(texts) < 10:
        print("  Not enough data. Check CSV format.")
        return

    print("  Vectorizing...")
    VECTORIZER = TfidfVectorizer(
        stop_words="english", max_df=0.90, min_df=2,
        ngram_range=(1, 2), sublinear_tf=True,
    )
    X = VECTORIZER.fit_transform(texts)
    y = np.array(labels)

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("  Training Naive Bayes...")
    MODEL = MultinomialNB(alpha=0.1)
    MODEL.fit(X_tr, y_tr)
    MODEL_SOURCE = "in-memory"

    acc = accuracy_score(y_te, MODEL.predict(X_te))
    print(f"  Model ready! Accuracy: {acc*100:.2f}% | Vocab: {len(VECTORIZER.vocabulary_):,}")
    print("  Tip: Run train_model.py to save .pkl files for instant loading next time.")


def initialize_model():
    """Load pkl or train — called at startup."""
    print("\n" + "="*50)
    print("  Mailji AI - Starting up")
    print("="*50)
    if not load_from_pkl():
        train_in_memory()
    print("  Model source:", MODEL_SOURCE)
    print("="*50 + "\n")

# ──────────────────────────────────────────────
# LIME EXPLAINER
# ──────────────────────────────────────────────

LIME_EXPLAINER = None

def get_lime_explainer():
    global LIME_EXPLAINER
    if LIME_EXPLAINER is None and LIME_AVAILABLE:
        LIME_EXPLAINER = LimeTextExplainer(class_names=["ham", "spam"])
    return LIME_EXPLAINER

def lime_explain(text: str) -> List[str]:
    """Run LIME on cleaned text, return top spam-contributing words."""
    if not LIME_AVAILABLE or MODEL is None or VECTORIZER is None:
        return []

    explainer = get_lime_explainer()
    cleaned   = clean_text(text)

    if not cleaned.strip():
        return []

    def predict_fn(texts):
        vecs = VECTORIZER.transform([clean_text(t) for t in texts])
        return MODEL.predict_proba(vecs)

    try:
        exp = explainer.explain_instance(
            cleaned,
            predict_fn,
            num_features=8,
            num_samples=500,
            labels=(1,),  # explain spam class only
        )
        # Return words with positive contribution toward spam
        words = [
            word for word, weight in exp.as_list(label=1)
            if weight > 0 and len(word) > 2
        ]
        return words[:6]
    except Exception as e:
        print(f"  LIME error: {e}")
        return []

# ──────────────────────────────────────────────
# TFIDF FALLBACK EXPLANATION
# ──────────────────────────────────────────────

def tfidf_explain(vec) -> List[str]:
    """Top TF-IDF weighted words as fallback explanation."""
    if VECTORIZER is None:
        return []
    feature_names = VECTORIZER.get_feature_names_out()
    scores        = vec.toarray()[0]
    top_idx       = np.argsort(scores)[::-1][:8]
    return [
        feature_names[i] for i in top_idx
        if scores[i] > 0 and len(feature_names[i]) > 2
    ][:6]

# ──────────────────────────────────────────────
# SPAM KEYWORDS FALLBACK
# ──────────────────────────────────────────────

SPAM_KEYWORDS = [
    "free", "win", "winner", "won", "click", "prize", "offer",
    "congratulations", "limited", "urgent", "act now", "claim",
    "selected", "verify", "password", "bank", "cheap", "discount",
    "deal", "buy now", "million", "cash", "loan", "credit",
]

def keyword_fallback(text: str) -> dict:
    lower = text.lower()
    hits  = [kw for kw in SPAM_KEYWORDS if kw in lower]
    prob  = min(0.95, len(hits) * 0.14)
    return {
        "prediction":    "spam" if prob > 0.5 else "ham",
        "probability":   round(prob, 4),
        "explanation":   hits[:6] if hits else ["no suspicious words"],
        "explain_method": "keyword",
    }

# ──────────────────────────────────────────────
# MAIN PREDICTION
# ──────────────────────────────────────────────

def predict_spam(email_text: str, use_lime: bool = True) -> dict:
    """
    Classify email text.
    - use_lime=True  → LIME explanation (slower, richer)
    - use_lime=False → TF-IDF top words (fast fallback)
    """
    if MODEL is None or VECTORIZER is None:
        return keyword_fallback(email_text)

    cleaned    = clean_text(email_text)
    vec        = VECTORIZER.transform([cleaned])
    prob_spam  = float(MODEL.predict_proba(vec)[0][1])
    prediction = "spam" if prob_spam > 0.5 else "ham"

    # Choose explanation method
    explain_method = "tfidf"
    if use_lime and LIME_AVAILABLE and prediction == "spam":
        explanation    = lime_explain(email_text)
        explain_method = "lime"
    else:
        explanation = tfidf_explain(vec)

    # Final fallback if still empty
    if not explanation and prediction == "spam":
        hits = [kw for kw in SPAM_KEYWORDS if kw in cleaned]
        explanation    = hits[:6] if hits else ["suspicious pattern"]
        explain_method = "keyword"

    return {
        "prediction":     prediction,
        "probability":    round(prob_spam, 4),
        "explanation":    explanation,
        "explain_method": explain_method,
    }

# ──────────────────────────────────────────────
# GMAIL HELPERS
# ──────────────────────────────────────────────

def get_flow() -> Flow:
    if CREDS_FILE.exists():
        return Flow.from_client_secrets_file(
            str(CREDS_FILE), scopes=SCOPES, redirect_uri=REDIRECT_URI
        )
    client_config = {
        "web": {
            "client_id":     CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "auth_uri":      "https://accounts.google.com/o/oauth2/auth",
            "token_uri":     "https://oauth2.googleapis.com/token",
            "redirect_uris": [REDIRECT_URI],
        }
    }
    return Flow.from_client_config(
        client_config, scopes=SCOPES, redirect_uri=REDIRECT_URI
    )

def decode_body(payload: dict) -> str:
    if payload.get("body", {}).get("data"):
        data = payload["body"]["data"]
        return base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace")
    for part in payload.get("parts", []):
        if part.get("mimeType") in ("text/plain", "text/html"):
            data = part.get("body", {}).get("data", "")
            if data:
                return base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace")
        nested = decode_body(part)
        if nested:
            return nested
    return ""

def fetch_emails(
    creds: Credentials,
    max_results: int = 30,
    offset: int = 0,
    use_lime: bool = True,
) -> List[dict]:
    """
    Fetch emails from Gmail with pagination support.
    offset: skip this many messages before starting
    max_results: how many to fetch and classify
    use_lime: whether to run LIME for spam explanations
    """
    service = build("gmail", "v1", credentials=creds, cache_discovery=False)

    # Gmail API paginates via pageToken
    # We fetch offset + max_results, then slice
    fetch_count = min(offset + max_results, 100)  # hard cap at 100

    list_params = {
        "userId": "me",
        "maxResults": fetch_count,
        "labelIds": ["INBOX"],
    }

    result   = service.users().messages().list(**list_params).execute()
    all_msgs = result.get("messages", [])

    # Handle next page if offset pushes beyond first page
    while len(all_msgs) < fetch_count and "nextPageToken" in result:
        result   = service.users().messages().list(
            **list_params,
            pageToken=result["nextPageToken"]
        ).execute()
        all_msgs.extend(result.get("messages", []))

    # Apply offset slice
    msgs_to_process = all_msgs[offset: offset + max_results]

    emails = []
    for msg_ref in msgs_to_process:
        try:
            msg     = service.users().messages().get(
                userId="me", id=msg_ref["id"], format="full"
            ).execute()
            headers = {h["name"]: h["value"] for h in msg["payload"].get("headers", [])}
            subject = headers.get("Subject", "(no subject)")
            sender  = headers.get("From", "Unknown")
            date    = headers.get("Date", "")
            body    = decode_body(msg["payload"])
            pred    = predict_spam(f"{subject}\n{body}", use_lime=use_lime)

            emails.append({
                "id":             msg_ref["id"],
                "subject":        subject,
                "sender":         sender,
                "date":           date,
                "snippet":        msg.get("snippet", "")[:200],
                "prediction":     pred["prediction"],
                "probability":    pred["probability"],
                "explanation":    pred["explanation"],
                "explain_method": pred["explain_method"],
            })
        except Exception as e:
            print(f"  Skipping message {msg_ref['id']}: {e}")
            continue

    return emails

# ──────────────────────────────────────────────
# FASTAPI APP
# ──────────────────────────────────────────────

app = FastAPI(title="Mailji AI API", version="3.0.0")

# Build allowed origins list — FRONTEND_URL + localhost for dev + any EXTRA_ORIGINS env var
_extra = [o.strip() for o in os.getenv("EXTRA_ORIGINS", "").split(",") if o.strip()]
ALLOWED_ORIGINS = list({
    FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    *_extra,
})

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*",  # allow ALL https origins (covers any deployment)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    initialize_model()

# ── ROUTES ────────────────────────────────────

@app.get("/")
def root():
    return {
        "status":        "Mailji AI running",
        "model_loaded":  MODEL is not None,
        "model_source":  MODEL_SOURCE,
        "lime_available": LIME_AVAILABLE,
        "dataset_found": DATASET_PATH.exists(),
        "pkl_found":     MODEL_PATH.exists() and VECTORIZER_PATH.exists(),
    }


@app.get("/auth/login")
def auth_login():
    flow = get_flow()
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    TOKEN_STORE["__oauth_flow__"] = flow
    return {"auth_url": auth_url}


@app.get("/auth/callback")
def auth_callback(request: Request):
    flow = TOKEN_STORE.get("__oauth_flow__")
    if not flow:
        raise HTTPException(status_code=400, detail="OAuth flow missing. Please login again.")
    try:
        flow.fetch_token(authorization_response=str(request.url))
        creds = flow.credentials
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth error: {str(e)}")

    user_service = build("oauth2", "v2", credentials=creds, cache_discovery=False)
    user_info    = user_service.userinfo().get().execute()
    user_id      = user_info["id"]
    email        = user_info["email"]
    name         = user_info.get("name", email)
    picture      = user_info.get("picture", "")

    TOKEN_STORE[user_id] = {
        "token":         creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri":     creds.token_uri,
        "client_id":     creds.client_id,
        "client_secret": creds.client_secret,
        "scopes":        list(creds.scopes or SCOPES),
        "email":         email,
        "name":          name,
        "picture":       picture,
    }

    return RedirectResponse(
        url=f"{FRONTEND_URL}/dashboard?user_id={user_id}&email={email}&name={name}&picture={picture}"
    )


@app.get("/auth/user/{user_id}")
def get_user(user_id: str):
    if user_id not in TOKEN_STORE:
        raise HTTPException(status_code=401, detail="Not authenticated")
    s = TOKEN_STORE[user_id]
    return {
        "user_id": user_id,
        "email":   s["email"],
        "name":    s["name"],
        "picture": s["picture"],
    }


@app.get("/emails/{user_id}")
def get_emails(
    user_id:  str,
    limit:    int  = Query(default=30,  ge=1,  le=100, description="Number of emails to fetch"),
    offset:   int  = Query(default=0,   ge=0,  le=500, description="Skip this many emails (pagination)"),
    use_lime: bool = Query(default=True, description="Use LIME for spam explanation (slower but richer)"),
):
    """
    Fetch and classify Gmail emails.

    - limit:    how many emails to scan (1–100)
    - offset:   skip N emails first — use for pagination
    - use_lime: enable LIME XAI explanations (only for spam, adds ~1-2s per spam email)

    Example ranges:
      /emails/uid?limit=20&offset=0   → emails 1-20
      /emails/uid?limit=20&offset=20  → emails 21-40
      /emails/uid?limit=50&offset=50  → emails 51-100
    """
    if user_id not in TOKEN_STORE:
        raise HTTPException(status_code=401, detail="Not authenticated")

    s = TOKEN_STORE[user_id]
    creds = Credentials(
        token=s["token"], refresh_token=s["refresh_token"],
        token_uri=s["token_uri"], client_id=s["client_id"],
        client_secret=s["client_secret"], scopes=s["scopes"],
    )

    try:
        emails     = fetch_emails(creds, max_results=limit, offset=offset, use_lime=use_lime)
        spam_count = sum(1 for e in emails if e["prediction"] == "spam")
        ham_count  = len(emails) - spam_count

        return {
            "total":          len(emails),
            "spam_count":     spam_count,
            "ham_count":      ham_count,
            "offset":         offset,
            "limit":          limit,
            "lime_used":      use_lime and LIME_AVAILABLE,
            "model_source":   MODEL_SOURCE,
            "emails":         emails,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict")
def predict_endpoint(payload: dict):
    """
    Direct prediction endpoint for testing.

    Body: { "email_text": "...", "use_lime": true }
    """
    text     = payload.get("email_text", "")
    use_lime = payload.get("use_lime", True)

    if not text:
        raise HTTPException(status_code=400, detail="email_text is required")

    result = predict_spam(text, use_lime=bool(use_lime))
    return result


@app.get("/model/status")
def model_status():
    """Returns current model status and capabilities."""
    return {
        "model_loaded":    MODEL is not None,
        "model_source":    MODEL_SOURCE,
        "pkl_files_exist": MODEL_PATH.exists() and VECTORIZER_PATH.exists(),
        "lime_available":  LIME_AVAILABLE,
        "vocab_size":      len(VECTORIZER.vocabulary_) if VECTORIZER else 0,
        "dataset_exists":  DATASET_PATH.exists(),
    }


@app.delete("/auth/logout/{user_id}")
def logout(user_id: str):
    TOKEN_STORE.pop(user_id, None)
    return {"status": "logged out"}
