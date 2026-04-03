import puppeteer from '../1. Archived/MP Academy Landing Page/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3458;
const label = process.argv[2] || 'section';
const scrollY = parseInt(process.argv[3] || '0');

const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);
const outFile = path.join(screenshotsDir, `${label}.png`);

const mime = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(fs.readFileSync(filePath));
  } else { res.writeHead(404); res.end('nf'); }
});

server.listen(PORT, async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.evaluate(() => document.querySelectorAll('.rv').forEach(el => el.classList.add('in')));
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: outFile, clip: { x: 0, y: scrollY, width: 1440, height: 900 } });
  await browser.close();
  server.close();
  console.log(`Saved: ${outFile}`);
});
