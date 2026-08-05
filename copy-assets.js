const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'assets', 'arkient-logo.png');
const destDir = path.join(__dirname, 'assets');

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  if (fs.existsSync(src)) {
    const buf = fs.readFileSync(src);
    fs.writeFileSync(path.join(destDir, 'icon.png'), buf);
    fs.writeFileSync(path.join(destDir, 'adaptive-icon.png'), buf);
    fs.writeFileSync(path.join(destDir, 'logo.png'), buf);
    fs.writeFileSync(path.join(destDir, 'splash.png'), buf);
    console.log('[Assets] Successfully saved ARKIENT logo into assets/icon.png, assets/adaptive-icon.png, and assets/logo.png!');
  } else {
    console.warn('[Assets Warning] Source artifact image not found at:', src);
  }
} catch (err) {
  console.error('[Assets Error]', err);
}
