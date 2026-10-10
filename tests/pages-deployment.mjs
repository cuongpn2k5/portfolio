import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import puppeteer from 'puppeteer-core';

// Serve dist like Pages: missing BrowserRouter routes use 404.html, not
// Vite preview's automatic SPA rewrite.
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (!pathname.startsWith('/portfolio/')) {
    res.writeHead(404).end();
    return;
  }
  const file = pathname.slice('/portfolio/'.length) || 'index.html';
  const types = { js: 'text/javascript', css: 'text/css', html: 'text/html', jpg: 'image/jpeg' };
  try {
    const body = await readFile(new URL(`../dist/${file}`, import.meta.url));
    res.setHeader('Content-Type', types[file.split('.').pop()] || 'application/octet-stream');
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(await readFile(new URL('../dist/404.html', import.meta.url)));
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await puppeteer.launch({
    executablePath: process.env.BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    headless: true,
    timeout: 20000,
    protocolTimeout: 20000,
    args: ['--no-sandbox', '--disable-gpu', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const page = await browser.newPage();
  const errors = [];
  const assets = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.url().includes('/portfolio/assets/')) assets.push({ url: response.url(), status: response.status(), type: response.headers()['content-type'] });
  });
  await page.evaluateOnNewDocument(() => sessionStorage.setItem('pnc-portfolio-intro-seen', 'true'));
  const base = `http://127.0.0.1:${server.address().port}/portfolio/`;
  await page.goto(base, { waitUntil: 'networkidle0' });
  await page.waitForSelector('#home h1');
  const portrait = await page.evaluate(async () => {
    const image = new Image();
    image.src = '/portfolio/images/cuongpn.jpg';
    await image.decode();
    return image.naturalWidth;
  });
  assert.ok(portrait > 0);
  const links = await page.$$eval('nav a', nodes => nodes.map(node => node.getAttribute('href')));
  assert.ok(links.includes('/portfolio/#about'));
  const response = await page.goto(`${base}projects/e-commerce-platform-placeholder`, { waitUntil: 'networkidle0' });
  assert.equal(response.status(), 404);
  assert.ok((await page.$eval('body', node => node.textContent)).includes('E-Commerce Platform'));
  await page.goto(`${base}?intro=true`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[aria-label="Welcome Intro Screen"]');
  await page.waitForFunction(() => !document.querySelector('[aria-label="Welcome Intro Screen"]'), { timeout: 30000 });
  await page.waitForFunction(() => [...document.querySelectorAll('canvas')].some(canvas => canvas.width > 0 && canvas.dataset.cardPhase), { timeout: 15000 });
  assert.equal(await page.$('[data-card-scene-fallback]'), null);
  await page.goto(`${base}?intro=true`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[aria-label="Skip introductory animation"]');
  await page.click('[aria-label="Skip introductory animation"]');
  await page.waitForFunction(() => !document.querySelector('[aria-label="Welcome Intro Screen"]'));
  await page.reload({ waitUntil: 'networkidle0' });
  assert.ok((await page.$eval('body', node => node.textContent)).includes('E-Commerce Platform'));
  assert.ok(assets.some(asset => asset.type === 'text/javascript'));
  assert.ok(assets.some(asset => asset.type === 'text/css'));
  assert.ok(assets.every(asset => asset.status === 200));
  assert.deepEqual(errors, []);
  console.log('PASS: compiled JS/CSS, lazy chunks, portrait, base links, direct project route and refresh, intro completion/skip and active ID Card canvas.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
