chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "shark:guide_state" || sender.tab?.id == null) {
    return;
  }

  const key = `shark-guide-${sender.tab.id}`;
  const storage = chrome.storage.session;
  let operation;

  if (message.action === "save") {
    operation = storage.set({ [key]: message.state });
  } else if (message.action === "clear") {
    operation = storage.remove(key);
  } else if (message.action === "load") {
    operation = storage.get(key).then((result) => result[key] ?? null);
  } else {
    return;
  }

  operation.then(
    (state) => sendResponse({ ok: true, state }),
    (error) => sendResponse({ ok: false, error: error.message }),
  );

  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.session.remove(`shark-guide-${tabId}`);
});

importScripts("config.js");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "shark:navigate" || sender.tab?.id == null) {
    return;
  }

  fetch(NAVIGATE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message.request),
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Navigator returned HTTP ${response.status}`);
      }

      sendResponse({ ok: true, step: await response.json() });
    })
    .catch((error) => {
      sendResponse({ ok: false, error: error.message });
    });

  return true;
});