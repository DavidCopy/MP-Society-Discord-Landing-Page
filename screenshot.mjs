/**
 * Screenshot script for MP Society landing page.
 * Spins up a static HTTP server, takes a full-page screenshot, then exits.
 * Usage: node screenshot.mjs [label]
 */
import puppeteer from '../1. Done/Webdesign/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3456;
const label = process.argv[2] ? `-${process.argv[2]}` : '';

// Determine output path — auto-increment so we never overwrite
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

let n = 1;
while (fs.existsSync(path.join(screenshotsDir, `screenshot-${n}${label}.png`))) n++;
const outFile = path.join(screenshotsDir, `screenshot-${n}${label}.png`);

// MIME types
const mime = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
};

// Simple static server
const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not found: ' + filePath);
  }
});

server.listen(PORT, async () => {
  console.log(`Server on http://localhost:${PORT}`);
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0', timeout: 30000 });
  // Force all scroll-reveal elements visible (IntersectionObserver doesn't fire headless)
  await page.evaluate(() => {
    document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
  });
  // Wait for images to fully load
  await page.evaluate(() => Promise.all(
    [...document.images].map(img => img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; }))
  ));
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: outFile, fullPage: true });
  await browser.close();
  server.close();
  console.log(`Saved: ${outFile}`);
});
