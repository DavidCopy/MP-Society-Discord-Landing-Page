import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputFile = path.join(__dirname, 'index.html');
const outputFile = path.join(__dirname, 'index-ghl.html');

let html = fs.readFileSync(inputFile, 'utf8');

const imgRegex = /src="([^"]+\.(png|jpg|jpeg|svg|webp|gif|ico))"/gi;
let match;
let count = 0;

while ((match = imgRegex.exec(html)) !== null) {
  const srcAttr = match[0];
  const srcPath = match[1];

  // Skip absolute URLs
  if (srcPath.startsWith('http://') || srcPath.startsWith('https://') || srcPath.startsWith('data:')) continue;

  const filePath = path.join(__dirname, decodeURIComponent(srcPath));

  if (!fs.existsSync(filePath)) {
    console.warn(`  MISSING: ${srcPath}`);
    continue;
  }

  const ext = path.extname(filePath).toLowerCase().slice(1);
  const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml', webp: 'image/webp', gif: 'image/gif', ico: 'image/x-icon' };
  const mime = mimeMap[ext] || 'image/png';

  const data = fs.readFileSync(filePath);
  const b64 = data.toString('base64');
  const dataUrl = `data:${mime};base64,${b64}`;

  html = html.replace(srcAttr, `src="${dataUrl}"`);
  count++;
  console.log(`  Embedded: ${srcPath}`);
}

fs.writeFileSync(outputFile, html, 'utf8');
const sizeMB = (fs.statSync(outputFile).size / 1024 / 1024).toFixed(2);
console.log(`\nDone. ${count} images embedded.`);
console.log(`Output: index-ghl.html (${sizeMB} MB)`);
