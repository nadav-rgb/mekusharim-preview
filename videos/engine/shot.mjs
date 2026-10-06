// צילום מסך של דף בגודל נתון: node engine/shot.mjs <path-under-videos> <width> <height> <out.png> [--full]
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');
const [rel, w, h, out] = process.argv.slice(2);
const full = process.argv.includes('--full');
const s = await serve();
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.goto(s.base + rel, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
// במצב full מצלמים את כל גובה המסך הפעיל (התוכן נגלל בתוך .screen)
if (full) {
  const hh = await page.evaluate(() => { const s = document.querySelector('.screen.active') || document.scrollingElement; return Math.max(s.scrollHeight + (s.getBoundingClientRect?.().top || 0), innerHeight); });
  await page.setViewportSize({ width: +w, height: Math.min(hh, 6000) });
}
await page.screenshot({ path: out });
await browser.close(); s.close();
console.log('->', out);
