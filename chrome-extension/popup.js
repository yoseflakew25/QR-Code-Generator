const form = document.getElementById('generate-form');
const urlInput = document.getElementById('url');
const sizeSelect = document.getElementById('size');
const spinner = document.getElementById('spinner');
const output = document.getElementById('output');
const qrContainer = document.getElementById('qr-container');
const saveBtn = document.getElementById('save-btn');
const copyBtn = document.getElementById('copy-btn');

// Check for a pending URL from context menu first, then fall back to current tab
chrome.storage?.local.get('pendingUrl', (data) => {
  if (data.pendingUrl) {
    // Clear it so it doesn't persist
    chrome.storage.local.remove('pendingUrl');
    urlInput.value = data.pendingUrl;
    // Auto-generate the QR code
    form.dispatchEvent(new Event('submit'));
  } else {
    // Fall back to current tab URL
    chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs?.[0]?.url) {
        urlInput.value = tabs[0].url;
      }
    });
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const url = urlInput.value.trim();
  if (!url) {
    alert('Please enter a URL');
    return;
  }

  const size = Number(sizeSelect.value);

  // Show spinner, hide output
  spinner.classList.remove('hidden');
  output.classList.add('hidden');
  qrContainer.innerHTML = '';

  setTimeout(() => {
    QrCreator.render(
      {
        text: url,
        size,
        ecLevel: 'M',
        fill: '#000000',
        background: '#ffffff',
        radius: 0.0,
      },
      qrContainer
    );

    spinner.classList.add('hidden');
    output.classList.remove('hidden');
  }, 800);
});

saveBtn.addEventListener('click', () => {
  const canvas = qrContainer.querySelector('canvas');
  if (!canvas) return;

  const link = document.createElement('a');
  link.download = 'qrcode.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

copyBtn.addEventListener('click', async () => {
  const canvas = qrContainer.querySelector('canvas');
  if (!canvas) return;

  try {
    const blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png')
    );
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.textContent = 'Copy to Clipboard';
      copyBtn.classList.remove('copied');
    }, 2000);
  } catch (err) {
    alert('Failed to copy. Try downloading instead.');
  }
});
