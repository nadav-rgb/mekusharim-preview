// מרנדר סצנת HTML לקובץ MP4, פריים אחר פריים, בזמן דטרמיניסטי.
// הסצנה חושפת window.DURATION (שניות) ו-window.seek(t) שמצייר את מצב הזמן t.
// שימוש: node engine/render.mjs <scene.html> <web|mobile> <out.mp4> [fps] [--from s] [--to s] [--still s out.png]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf(name);
  if (i < 0) return def;
  const v = args.splice(i, 2)[1];
  return v;
};
const from = parseFloat(flag('--from', '0'));
const toArg = flag('--to', null);
const still = flag('--still', null);
const [scene, format = 'web', out = 'out.mp4', fpsArg = '30'] = args;
const fps = parseInt(fpsArg, 10);
const size = format === 'mobile' ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 };

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
page.on('console', (m) => m.type() === 'error' && console.error('[page]', m.text()));
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
const url = pathToFileURL(path.resolve(scene)).href + `?format=${format}`;
await page.goto(url, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => typeof window.seek === 'function' && window.DURATION > 0);
const duration = await page.evaluate(() => window.DURATION);

if (still) {
  await page.evaluate((t) => window.seek(t), parseFloat(still));
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.screenshot({ path: out, type: 'png' });
  await browser.close();
  console.log(`still ${still}s -> ${out}`);
  process.exit(0);
}

const to = toArg ? parseFloat(toArg) : duration;
const total = Math.round((to - from) * fps);
const ff = spawn('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart', out,
], { stdio: ['pipe', 'inherit', 'inherit'] });

const t0 = Date.now();
for (let i = 0; i < total; i++) {
  const t = from + i / fps;
  await page.evaluate((t) => window.seek(t), t);
  const buf = await page.screenshot({ type: 'jpeg', quality: 94 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % fps === 0) process.stdout.write(`\r${format} ${(t).toFixed(0)}s/${to.toFixed(0)}s`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await browser.close();
console.log(`\n${out}: ${total} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
