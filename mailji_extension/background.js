// MailJi Extension - Background Service Worker
// Handles auth state, API calls, and message passing to content script

const BACKEND = "https://mailji.onrender.com";

async function getStoredUser() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["mailji_user_id", "mailji_user_info"], (data) => {
      resolve({
        userId: data.mailji_user_id || null,
        userInfo: data.mailji_user_info || null,
      });
    });
  });
}

async function setStoredUser(userId, userInfo) {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { mailji_user_id: userId, mailji_user_info: userInfo },
      resolve
    );
  });
}

async function clearStoredUser() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(["mailji_user_id", "mailji_user_info"], resolve);
  });
}

// ── OAuth login via backend ───────────────────────────────────────────────────

async function startLogin() {
  try {
    // 1. Get the auth URL from backend
    const res = await fetch(`${BACKEND}/auth/login`);
    const data = await res.json();
    const authUrl = data.auth_url;

    if (!authUrl) throw new Error("No auth_url from backend");

    // 2. Open the Google OAuth flow in a new tab
    //    We intercept the redirect back to localhost:8000/auth/callback
    return new Promise((resolve, reject) => {
      chrome.tabs.create({ url: authUrl }, (tab) => {
        const tabId = tab.id;

        const listener = (updatedTabId, changeInfo, updatedTab) => {
          if (updatedTabId !== tabId) return;
          if (changeInfo.status !== "complete") return;

          const url = updatedTab.url || "";

          // Catch any URL that has user_id= — this is the final dashboard redirect from backend
          if (url.includes("user_id=")) {
            chrome.tabs.onUpdated.removeListener(listener);
            chrome.tabs.remove(tabId).catch(() => {});

            const urlObj = new URL(url);
            const userId  = urlObj.searchParams.get("user_id");
            const email   = urlObj.searchParams.get("email");
            const name    = urlObj.searchParams.get("name");
            const picture = urlObj.searchParams.get("picture");

            if (userId) {
              const userInfo = { email, name, picture };
              setStoredUser(userId, userInfo).then(() => resolve({ userId, userInfo }));
            } else {
              reject(new Error("Login failed: no user_id in redirect"));
            }
          }
          // /auth/callback means backend is processing — keep listening for the redirect
        };

        chrome.tabs.onUpdated.addListener(listener);

        // Safety timeout
        setTimeout(() => {
          chrome.tabs.onUpdated.removeListener(listener);
          reject(new Error("Login timeout"));
        }, 120000);
      });
    });
  } catch (err) {
    throw new Error(`Login failed: ${err.message}`);
  }
}

// ── Fetch emails from backend ─────────────────────────────────────────────────

async function fetchEmailsFromBackend(userId, limit = 30, offset = 0) {
  const url = `${BACKEND}/emails/${userId}?limit=${limit}&offset=${offset}&use_lime=false`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Logout ────────────────────────────────────────────────────────────────────

async function logoutUser(userId) {
  try {
    await fetch(`${BACKEND}/auth/logout/${userId}`, { method: "DELETE" });
  } catch (_) {}
  await clearStoredUser();
}

// ── Message handler ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message;

  if (type === "GET_USER") {
    getStoredUser().then(sendResponse);
    return true;
  }

  if (type === "LOGIN") {
    startLogin()
      .then((result) => sendResponse({ success: true, ...result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (type === "LOGOUT") {
    getStoredUser().then(({ userId }) => {
      logoutUser(userId).then(() => sendResponse({ success: true }));
    });
    return true;
  }

  if (type === "FETCH_EMAILS") {
    const { userId, limit, offset } = payload;
    fetchEmailsFromBackend(userId, limit, offset)
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (type === "CLEAR_CACHE") {
    chrome.storage.local.remove(["mailji_emails_cache", "mailji_cache_time"], () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
