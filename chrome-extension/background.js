// Register context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'generate-qr',
    title: 'Generate QR Code for "%s"',
    contexts: ['link'],
  });
});

// When user clicks the context menu, store the URL and open the popup
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'generate-qr' && info.linkUrl) {
    chrome.storage.local.set({ pendingUrl: info.linkUrl }, () => {
      // Open the popup by triggering the action
      chrome.action.openPopup();
    });
  }
});
