const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'chrome-extension');
const dest = path.join(root, 'public', 'qr-code-extension.zip');

// Ensure public dir exists
fs.mkdirSync(path.join(root, 'public'), { recursive: true });

// Remove old zip if present
if (fs.existsSync(dest)) fs.unlinkSync(dest);

// Build zip using PowerShell (Windows)
execSync(
  `powershell -Command "Compress-Archive -Path '${src}\\*' -DestinationPath '${dest}' -Force"`,
  { stdio: 'inherit' }
);

const size = (fs.statSync(dest).size / 1024).toFixed(1);
console.log(`Created public/qr-code-extension.zip (${size} KB)`);
