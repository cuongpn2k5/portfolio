import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:5173/?intro=true';
const mobile = process.argv.slice(3).includes('mobile');
const captureMotion = process.argv.slice(3).includes('motion');
const reducedMotion = process.argv.slice(3).includes('reduced');
const softwareRenderer = process.argv.slice(3).includes('software');
const checkHero = process.argv.slice(3).includes('hero');
const resizeHero = process.argv.slice(3).includes('resize');
const directory = await mkdtemp(path.resolve('node_modules/.tmp/browser-smoke-'));
const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
  '--headless', '--no-first-run', '--no-default-browser-check',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows',
  ...(softwareRenderer ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : []),
  '--remote-debugging-port=0', `--user-data-dir=${directory}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
let socket;
let commandId = 0;
const pending = new Map();
const exceptions = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      port = Number((await readFile(path.join(directory, 'DevToolsActivePort'), 'utf8')).split('\n')[0]);
      break;
    } catch { await delay(100); }
  }
  if (!port) throw new Error('Headless Edge did not start');
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = targets.find(item => item.type === 'page');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const handlers = pending.get(message.id);
      pending.delete(message.id);
      if (handlers) clearTimeout(handlers.timer);
      if (message.error) handlers?.reject(new Error(JSON.stringify(message.error)));
      else handlers?.resolve(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') {
      const details = message.params.exceptionDetails;
      exceptions.push(details.exception?.description || details.text);
    }
  });
  socket.addEventListener('close', () => {
    for(const handlers of pending.values()) {
      clearTimeout(handlers.timer);
      handlers.reject(new Error('Headless browser disconnected'));
    }
    pending.clear();
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++commandId;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Browser command timed out: ${method}`));
    }, 15000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const waitFor = async expression => {
    for(let attempt=0;attempt<50;attempt++) {
      const result = await send('Runtime.evaluate', {expression,returnByValue:true});
      if (result.result.value) return true;
      await delay(100);
    }
    return false;
  };
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setFocusEmulationEnabled', {enabled:true});
  if (reducedMotion) {
    await send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  }
  await send('Emulation.setDeviceMetricsOverride', {
    width: mobile ? 390 : 1280, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile,
  });
  if (process.argv[3] !== 'reference') {
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `
      window.__motionSamples = [];
      const observer = new MutationObserver(() => {
        const introStart = document.querySelector('[data-intro-start]');
        if (!introStart) return;
        observer.disconnect();
        window.__motionStarted = Number(introStart.dataset.introStart);
        let previous = -100;
        const sample = () => {
          const time = performance.now() - window.__motionStarted;
          if (time >= previous + 20) {
            previous = time;
            const track = document.querySelector('[data-intro-track]');
            const intro = document.querySelector('[data-intro-panel]');
            const home = document.querySelector('[data-home-panel]');
            const heading = document.querySelector('#home h1 span');
            const canvas = document.querySelector('canvas');
            if (track && home) window.__motionSamples.push({
              time: time / 1000, stage: track.dataset.stage,
              card: track.dataset.cardEntrance, phase: canvas?.dataset.cardPhase,
              gap: intro?.getBoundingClientRect().bottom - home.getBoundingClientRect().top,
              homeTop: home.getBoundingClientRect().top,
              headingOpacity: heading && Number(getComputedStyle(heading).opacity),
              characterText: [...document.querySelectorAll('.hero-character')].map(el => el.textContent).join(''),
              characterOpacity: [...document.querySelectorAll('.hero-character')].map(el => Number(getComputedStyle(el).opacity)),
              descriptionLines: document.querySelectorAll('.hero-description-line').length,
              headingLabels: [...document.querySelectorAll('#home h1 [aria-label]')].map(el => el.getAttribute('aria-label')),
            });
          }
          if (time < 8000) requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      observer.observe(document, {childList:true,subtree:true,attributes:true,attributeFilter:['data-intro-start']});
    ` });
  }
  await send('Page.navigate', { url });
  if (process.argv[3] === 'reference') {
    await delay(1000);
    const result = await send('Runtime.evaluate', {
      expression: `(async () => {
        const video = document.querySelector('video');
        if (!video.readyState) await new Promise(resolve => video.addEventListener('loadedmetadata', resolve, {once:true}));
        const times = [0.1, 0.6, 1.2, 2, 2.8, 3.2, 3.5, 3.9, 4.3, 5, 6.7, 8, 9];
        const w = 320, h = Math.round(w * video.videoHeight / video.videoWidth);
        const canvas = document.createElement('canvas');
        canvas.width = w * 4; canvas.height = (h + 24) * Math.ceil(times.length / 4);
        const context = canvas.getContext('2d');
        context.fillStyle = '#eee'; context.fillRect(0,0,canvas.width,canvas.height);
        context.font = '16px sans-serif';
        for (let index = 0; index < times.length; index++) {
          const sought = new Promise(resolve => video.addEventListener('seeked', resolve, {once:true}));
          video.currentTime = times[index]; await sought;
          const x = index % 4 * w, y = Math.floor(index / 4) * (h + 24);
          context.drawImage(video, x, y + 24, w, h);
          context.fillStyle = '#111'; context.fillText(times[index] + 's', x + 8, y + 18);
        }
        return {width:video.videoWidth,height:video.videoHeight,duration:video.duration,data:canvas.toDataURL('image/png')};
      })()`, returnByValue: true, awaitPromise: true,
    });
    const value = result.result.value;
    const imagePath = path.join(directory, 'reference-contact-sheet.png');
    await writeFile(imagePath, Buffer.from(value.data.split(',')[1], 'base64'));
    console.log(JSON.stringify({width:value.width,height:value.height,duration:value.duration,imagePath}));
    await send('Browser.close');
    socket.close();
    process.exit(0);
  }
  const motionImages = [];
  if (captureMotion) {
    for (const time of [0.6, 1.2, 2, 2.8, 3.2, 3.5, 3.9, 4.3, 5, 6.7]) {
      for (let attempt = 0; attempt < 200; attempt++) {
        const clock = await send('Runtime.evaluate', {
          expression: 'window.__motionStarted === undefined ? -1 : (performance.now() - window.__motionStarted) / 1000',
          returnByValue: true,
        });
        if (clock.result.value >= time) break;
        await delay(50);
      }
      const screenshot = await send('Page.captureScreenshot', { format: 'png' });
      motionImages.push({time, data:screenshot.data});
      if (resizeHero && time === 5) {
        await send('Emulation.setDeviceMetricsOverride', {width: mobile ? 330 : 1050,height:mobile?844:900,deviceScaleFactor:1,mobile});
        await delay(250);
        const resized = await send('Page.captureScreenshot', {format:'png'});
        await writeFile(path.join(directory,'resized.png'),Buffer.from(resized.data,'base64'));
      }
    }
    if (resizeHero) await send('Emulation.setDeviceMetricsOverride', {width:mobile?390:1280,height:mobile?844:900,deviceScaleFactor:1,mobile});
    await delay(2500);
  } else {
    await delay(10000);
  }
  const inspect = async () => {
    const evaluated = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      rootChildren: document.getElementById('root')?.childElementCount,
      hero: document.querySelector('#home h1')?.textContent,
      intro: !!document.querySelector('[role="dialog"]'),
      canvas: [...document.querySelectorAll('canvas')].map(c => ({width:c.width,height:c.height,phase:c.dataset.cardPhase})),
      hiddenHero: [...document.querySelectorAll('#home h1 span')].some(el => getComputedStyle(el).opacity === '0'),
      sceneFailed: !!document.querySelector('[data-card-scene-fallback]'),
      bodyOverflow: getComputedStyle(document.body).overflow,
    })`, returnByValue: true,
    });
    return JSON.parse(evaluated.result.value);
  };
  const initial = await inspect();
  const recorded = await send('Runtime.evaluate', {
    expression: 'JSON.stringify(window.__motionSamples)', returnByValue: true,
  });
  const samples = JSON.parse(recorded.result.value);
  const sliding = samples.filter(sample => sample.stage === 'transitioning');
  const release = sliding.find(sample => sample.card === 'released');
  const motion = {
    slideStart: sliding[0]?.time,
    slideEnd: samples.find(sample => sample.stage === 'entered')?.time,
    releaseAt: release?.time,
    catchAt: samples.find(sample => sample.phase === 'rebound')?.time,
    maxPanelGap: Math.max(...sliding.map(sample => Math.abs(sample.gap))),
    cardFallsDuringSlide: sliding.some(sample => sample.card === 'released' && sample.phase === 'entrance'),
    headingRevealsDuringSlide: sliding.some(sample => sample.headingOpacity > 0),
  };
  const heroAnimation = {
    graphemeText: samples.find(sample => sample.characterText)?.characterText,
    accessibleLabels: samples.find(sample => sample.headingLabels?.length)?.headingLabels,
    sequentialCharacters: samples.some(sample => sample.characterOpacity?.some(opacity => opacity > 0.1 && opacity < 1) && sample.characterOpacity.some(opacity => opacity === 0)),
    descriptionLineCounts: [...new Set(samples.map(sample => sample.descriptionLines).filter(Boolean))],
  };
  if(checkHero && !reducedMotion && (!heroAnimation.sequentialCharacters || heroAnimation.graphemeText !== 'PhanNhậtCường.' || !heroAnimation.descriptionLineCounts.length)) process.exitCode = 1;
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const screenshotPath = path.join(directory, 'screenshot.png');
  await writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'));
  if (motionImages.length) {
    const sheet = await send('Runtime.evaluate', {
      expression: `(async () => {
        const frames = ${JSON.stringify(motionImages)};
        const width = 320, height = ${mobile ? Math.round(320 * 844 / 390) : 225};
        const canvas = document.createElement('canvas');
        canvas.width = width * 4; canvas.height = (height + 24) * Math.ceil(frames.length / 4);
        const ctx = canvas.getContext('2d'); ctx.fillStyle = '#eee'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.font = '16px sans-serif';
        for(let index=0;index<frames.length;index++) {
          const image = new Image(); image.src = 'data:image/png;base64,' + frames[index].data;
          await image.decode();
          const x = index % 4 * width, y = Math.floor(index / 4) * (height + 24);
          ctx.drawImage(image,x,y+24,width,height);
          ctx.fillStyle='#111';ctx.fillText(frames[index].time+'s',x+8,y+18);
        }
        return canvas.toDataURL('image/png');
      })()`, returnByValue: true, awaitPromise: true,
    });
    await writeFile(path.join(directory, 'motion-contact-sheet.png'), Buffer.from(sheet.result.value.split(',')[1], 'base64'));
  }
  const grab = { x: mobile ? 245 : 995, y: mobile ? 300 : 350 };
  let interactions;
  if (!reducedMotion) {
  await send('Input.dispatchMouseEvent', {type:'mouseMoved', ...grab});
  await delay(100);
  await send('Input.dispatchMouseEvent', {type:'mousePressed',button:'left',buttons:1,clickCount:1,...grab});
  await delay(150);
  await waitFor("document.querySelector('canvas')?.dataset.cardPhase === 'dragging'");
  const dragging = await send('Runtime.evaluate', {expression:"document.querySelector('canvas')?.dataset.cardPhase",returnByValue:true});
  for(let step=1;step<=8;step++) {
    await send('Input.dispatchMouseEvent', {type:'mouseMoved',buttons:1,x:grab.x-step*(mobile?12:30),y:grab.y+step*8});
    await delay(60);
  }
  const dragged = await send('Page.captureScreenshot', {format:'png'});
  await writeFile(path.join(directory,'dragging.png'),Buffer.from(dragged.data,'base64'));
  await send('Input.dispatchMouseEvent', {type:'mouseReleased',button:'left',buttons:0,clickCount:1,x:grab.x-8*(mobile?12:30),y:grab.y+64});
  await delay(150);
  await waitFor("document.querySelector('canvas')?.dataset.cardPhase === 'released'");
  const released = await send('Runtime.evaluate', {expression:"document.querySelector('canvas')?.dataset.cardPhase",returnByValue:true});
  const scroll = await send('Runtime.evaluate', {expression:"window.scrollTo({top:innerHeight,behavior:'instant'}); window.scrollY",returnByValue:true});
  interactions = {dragging:dragging.result.value, released:released.result.value,scrollY:scroll.result.value};
  await send('Runtime.evaluate', {expression:"window.scrollTo({top:0,behavior:'instant'})"});
  }
  await send('Page.navigate', { url: new URL('/', url).href });
  await send('Page.bringToFront');
  await delay(2500);
  const refreshImage = await send('Page.captureScreenshot', {format:'png'});
  await writeFile(path.join(directory,'refresh.png'),Buffer.from(refreshImage.data,'base64'));
  if (!reducedMotion) await waitFor("document.querySelector('canvas')?.width > 300 && document.querySelector('canvas')?.dataset.cardPhase");
  const refresh = await inspect();
  await send('Page.navigate', { url: new URL('/?intro=true', url).href });
  await send('Page.bringToFront');
  await delay(1000);
  const skip = await send('Runtime.evaluate', {
    expression: `(() => { const button = document.querySelector('[aria-label="Skip introductory animation"]'); button?.click(); return !!button; })()`,
    returnByValue: true,
  });
  await delay(2000);
  const skipImage = await send('Page.captureScreenshot', {format:'png'});
  await writeFile(path.join(directory,'skipped.png'),Buffer.from(skipImage.data,'base64'));
  if (!reducedMotion) await waitFor("document.querySelector('canvas')?.width > 300 && ['settling','released','interactive'].includes(document.querySelector('canvas')?.dataset.cardPhase)");
  const skipped = await inspect();
  // Exercise client-side unmount/remount, keeping the existing provider alive.
  await send('Runtime.evaluate', {expression:"history.pushState({}, '', '/motion-test-missing'); window.dispatchEvent(new PopStateEvent('popstate'))"});
  await waitFor("document.body.textContent.includes('Return to Homepage')");
  await send('Runtime.evaluate', {expression:"[...document.querySelectorAll('a')].find(a => a.textContent.includes('Return to Homepage'))?.click()"});
  if (!reducedMotion) await waitFor("document.querySelector('canvas')?.dataset.cardPhase");
  await delay(500);
  const returned = await inspect();
  console.log(JSON.stringify({ url, mobile, exceptions, motion, heroAnimation, interactions, initial, refresh, skipClicked: skip.result.value, skipped, returned, screenshotPath }, null, 2));
  if (!reducedMotion && (!motion.cardFallsDuringSlide || !motion.headingRevealsDuringSlide || motion.maxPanelGap > 0.5 ||
      interactions.dragging !== 'dragging' || interactions.released !== 'released' || interactions.scrollY <= 0)) process.exitCode = 1;
  if (exceptions.length || (!reducedMotion && !skip.result.value) || [initial, refresh, skipped, returned].some(report =>
    !report.hero || report.hiddenHero || report.intro || report.sceneFailed ||
    (!reducedMotion && !report.canvas.some(canvas => canvas.width >= (mobile ? 380 : 1200) && canvas.phase))
  )) process.exitCode = 1;
  await send('Browser.close');
} finally {
  socket?.close();
  browser.kill();
}
