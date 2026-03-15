"""
Mailji AI - Model Training Script
==================================
Run this ONCE to train and save the model.
After this, main.py will load from .pkl files instantly on every restart.

Usage:
    cd backend/
    venv\Scripts\activate
    python train_model.py

Outputs (saved to same folder as this script):
    spam_model.pkl
    vectorizer.pkl
"""

import re
import os
import sys
import csv
import string
import time
import joblib
import numpy as np
from pathlib import Path

from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score,
    recall_score, f1_score, classification_report, confusion_matrix,
)

# ──────────────────────────────────────────────
# CONFIG
# ──────────────────────────────────────────────

BASE_DIR        = Path(__file__).parent
DATASET_PATH    = BASE_DIR / "enron_combined_dataset.csv"
MODEL_PATH      = BASE_DIR / "spam_model.pkl"
VECTORIZER_PATH = BASE_DIR / "vectorizer.pkl"

TEST_SIZE    = 0.20
RANDOM_STATE = 42

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
# LOAD DATASET
# ──────────────────────────────────────────────

def load_dataset():
    if not DATASET_PATH.exists():
        print(f"ERROR: Dataset not found at {DATASET_PATH}")
        sys.exit(1)

    # Raise field size limit for large emails
    csv.field_size_limit(min(sys.maxsize, 2147483647))

    print(f"Loading: {DATASET_PATH}")
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

    print(f"\n  Dataset Summary")
    print(f"  ┌─────────────────────────────┐")
    print(f"  │  Total  : {len(texts):<18} │")
    print(f"  │  Spam   : {spam_c:<18} │")
    print(f"  │  Ham    : {ham_c:<18} │")
    print(f"  │  Skipped: {skipped:<18} │")
    print(f"  └─────────────────────────────┘\n")

    return texts, labels

# ──────────────────────────────────────────────
# TRAIN
# ──────────────────────────────────────────────

def train(texts, labels):
    print("Vectorizing with TF-IDF...")
    t0 = time.time()

    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_df=0.90,
        min_df=2,
        ngram_range=(1, 2),
        sublinear_tf=True,
    )

    X = vectorizer.fit_transform(texts)
    y = np.array(labels)

    print(f"  Vocabulary size : {len(vectorizer.vocabulary_):,}")
    print(f"  Feature matrix  : {X.shape[0]} x {X.shape[1]}")
    print(f"  Time            : {time.time()-t0:.1f}s\n")

    print("Splitting 80/20...")
    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    print(f"  Train: {X_tr.shape[0]}  |  Test: {X_te.shape[0]}\n")

    print("Training Multinomial Naive Bayes...")
    t0 = time.time()
    model = MultinomialNB(alpha=0.1)
    model.fit(X_tr, y_tr)
    print(f"  Time: {time.time()-t0:.2f}s\n")

    return model, vectorizer, X_te, y_te

# ──────────────────────────────────────────────
# EVALUATE
# ──────────────────────────────────────────────

def evaluate(model, X_te, y_te):
    y_pred = model.predict(X_te)

    acc  = accuracy_score(y_te, y_pred)
    prec = precision_score(y_te, y_pred)
    rec  = recall_score(y_te, y_pred)
    f1   = f1_score(y_te, y_pred)
    cm   = confusion_matrix(y_te, y_pred)

    print("  ┌──────────────────────────────────────┐")
    print("  │           Evaluation Results          │")
    print("  ├──────────────────────────────────────┤")
    print(f"  │  Accuracy   : {acc*100:>6.2f}%                │")
    print(f"  │  Precision  : {prec*100:>6.2f}%                │")
    print(f"  │  Recall     : {rec*100:>6.2f}%                │")
    print(f"  │  F1-Score   : {f1*100:>6.2f}%                │")
    print("  └──────────────────────────────────────┘\n")

    print("  Confusion Matrix:")
    print(f"                  Pred Ham   Pred Spam")
    print(f"  Actual Ham    :  {cm[0][0]:<8}   {cm[0][1]}")
    print(f"  Actual Spam   :  {cm[1][0]:<8}   {cm[1][1]}\n")

    print("  Full Report:")
    print(classification_report(y_te, y_pred, target_names=["ham", "spam"]))

# ──────────────────────────────────────────────
# SAVE
# ──────────────────────────────────────────────

def save(model, vectorizer):
    joblib.dump(model,      MODEL_PATH,      compress=3)
    joblib.dump(vectorizer, VECTORIZER_PATH, compress=3)
    print(f"  Saved -> {MODEL_PATH}")
    print(f"  Saved -> {VECTORIZER_PATH}\n")
    print("  Done! Restart main.py — it will load from .pkl files instantly.")

# ──────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────

def main():
    print("\n" + "="*50)
    print("  Mailji AI — Model Training")
    print("="*50 + "\n")

    texts, labels     = load_dataset()
    model, vec, Xte, yte = train(texts, labels)
    evaluate(model, Xte, yte)
    save(model, vec)

if __name__ == "__main__":
    main()