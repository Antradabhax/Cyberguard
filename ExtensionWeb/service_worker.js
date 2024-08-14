chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension instalada exitosamente");
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
.catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  // Enables the side panel on google.com
  if (url.origin === GOOGLE_ORIGIN) {
      await chrome.sidePanel.setOptions({
          tabId,
          path: 'sidepanel.html',
          enabled: true
      });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'authenticated') {
      chrome.storage.local.set({ authenticated: true }, () => {
          sendResponse({ status: 'success' });
      });
  }
  else if (message.action === 'abrirFormularioReporte') {
      const { tipo, contenido } = message;
      chrome.windows.create({
          url: `report.html?tipo=${tipo}&contenido=${encodeURIComponent(contenido)}`,
          type: 'popup',
          width: 600,
          height: 600
      });
  }
});
