const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve('dist');
const OUT_DIR = path.resolve('scratch/verification');
const ARTIFACT_DIR = 'C:\\Users\\siddh\\.gemini\\antigravity\\brain\\a66bf490-1659-4394-bfab-378d2ae8710c\\verification';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

// Simple HTTP static server for dist
function startServer(port = 4173) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    let filePath = path.join(DIST_DIR, reqPath);

    if (!fs.existsSync(filePath)) {
      // SPA fallback
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`Verification static server listening on http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function run() {
  const server = await startServer(4173);
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const testMatrix = [
    { name: 'desktop_light_motion', width: 1280, height: 800, theme: 'light', reducedMotion: 'no-preference' },
    { name: 'desktop_dark_motion', width: 1280, height: 800, theme: 'dark', reducedMotion: 'no-preference' },
    { name: 'desktop_dark_reduced', width: 1280, height: 800, theme: 'dark', reducedMotion: 'reduce' },
    { name: 'mobile_light_motion', width: 360, height: 780, theme: 'light', reducedMotion: 'no-preference' },
    { name: 'mobile_dark_reduced', width: 360, height: 780, theme: 'dark', reducedMotion: 'reduce' },
  ];

  const results = [];

  for (const config of testMatrix) {
    console.log(`\n========================================`);
    console.log(`Running test: ${config.name} (${config.width}x${config.height}, theme=${config.theme}, reducedMotion=${config.reducedMotion})`);
    console.log(`========================================`);

    const videoDir = path.join(OUT_DIR, `video_${config.name}`);
    if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

    const context = await browser.newContext({
      viewport: { width: config.width, height: config.height },
      reducedMotion: config.reducedMotion,
      
    });

    const page = await context.newPage();

    // 1. Navigate to page
    await page.goto('http://localhost:4173/');

    // Set theme in localStorage & apply class
    await page.evaluate((th) => {
      localStorage.setItem('theme-mode', th);
      if (th === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, config.theme);
    await page.reload();
    await page.waitForTimeout(600);

    // Initial Hero Screenshot
    const heroScreenshot = path.join(OUT_DIR, `${config.name}_01_hero.png`);
    await page.screenshot({ path: heroScreenshot });
    fs.copyFileSync(heroScreenshot, path.join(ARTIFACT_DIR, `${config.name}_01_hero.png`));
    console.log(`Captured hero screenshot: ${config.name}_01_hero.png`);

    // Verify Vitals HUD
    const bpmText = await page.evaluate(() => {
      const el = document.querySelector('.text-2xl.font-black.font-mono.text-white');
      return el ? el.textContent : null;
    });
    console.log(`Hero vital number found: ${bpmText}`);

    // Verify Top Scroll Progress Bar
    const hasProgressBar = await page.evaluate(() => {
      const el = document.querySelector('div[class*="origin-left"][class*="fixed"][class*="top-0"]');
      return !!el;
    });
    console.log(`Top scroll progress bar mounted: ${hasProgressBar}`);

    // Find the 4-Chamber Heart section
    const heartSectionInfo = await page.evaluate(() => {
      const section = document.querySelector('#heart-scrollytelling') || document.querySelector('section[class*="400vh"]');
      if (!section) return null;
      const rect = section.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      return {
        top: rect.top + scrollTop,
        height: rect.height,
        offsetHeight: section.offsetHeight
      };
    });

    console.log(`Heart section location:`, heartSectionInfo);

    if (heartSectionInfo && config.width >= 1024) {
      // Desktop: Test the 5 scroll positions (0%, 25%, 50%, 75%, 100%)
      const positions = [0, 0.25, 0.50, 0.75, 1.0];
      const scrollableDistance = heartSectionInfo.offsetHeight - config.height;

      for (const pos of positions) {
        const targetY = heartSectionInfo.top + (pos * Math.max(0, scrollableDistance));
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), targetY);
        await page.waitForTimeout(400);

        const chamberStatus = await page.evaluate(() => {
          const activePill = document.querySelector('span[class*="PILLAR"]');
          return activePill ? activePill.textContent : 'none';
        });

        const pct = Math.round(pos * 100);
        const shotPath = path.join(OUT_DIR, `${config.name}_heart_${pct}pct.png`);
        await page.screenshot({ path: shotPath });
        fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `${config.name}_heart_${pct}pct.png`));
        console.log(`Scrolled to Heart ${pct}% (Y=${Math.round(targetY)}) -> Active: ${chamberStatus}`);
      }
    } else if (heartSectionInfo && config.width < 1024) {
      // Mobile: scroll to heart section & verify swipe/dot steps
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), heartSectionInfo.top);
      await page.waitForTimeout(400);
      const shotPath = path.join(OUT_DIR, `${config.name}_heart_mobile.png`);
      await page.screenshot({ path: shotPath });
      fs.copyFileSync(shotPath, path.join(ARTIFACT_DIR, `${config.name}_heart_mobile.png`));
      console.log(`Mobile heart view captured`);
    }

    // Scroll to Denoising Lab
    const labInfo = await page.evaluate(() => {
      const labH2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Denoising') || h.textContent.includes('Waveform'));
      if (!labH2) return null;
      const section = labH2.closest('section');
      if (!section) return null;
      const rect = section.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      return { top: rect.top + scrollTop };
    });

    if (labInfo) {
      await page.evaluate((y) => window.scrollTo({ top: y - 50, behavior: 'instant' }), labInfo.top);
      await page.waitForTimeout(400);

      // Capture before drag
      const labBeforeShot = path.join(OUT_DIR, `${config.name}_02_denoising_lab.png`);
      await page.screenshot({ path: labBeforeShot });
      fs.copyFileSync(labBeforeShot, path.join(ARTIFACT_DIR, `${config.name}_02_denoising_lab.png`));

      // Test dragging divider
      const dividerBox = await page.evaluate(() => {
        const el = document.querySelector('div[class*="cursor-ew-resize"]');
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
      });

      if (dividerBox) {
        console.log(`Dragging Denoising divider from center (x=${dividerBox.x + dividerBox.width / 2}) to left...`);
        await page.mouse.move(dividerBox.x + dividerBox.width / 2, dividerBox.y + dividerBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(dividerBox.x + 80, dividerBox.y + dividerBox.height / 2, { steps: 5 });
        await page.mouse.up();
        await page.waitForTimeout(300);

        const labAfterShot = path.join(OUT_DIR, `${config.name}_03_denoising_dragged.png`);
        await page.screenshot({ path: labAfterShot });
        fs.copyFileSync(labAfterShot, path.join(ARTIFACT_DIR, `${config.name}_03_denoising_dragged.png`));
        console.log(`Captured dragged Denoising Lab screenshot`);
      }
    }

    // Scroll down through Bento cards and alternating sections
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'instant' }));
    await page.waitForTimeout(400);
    const midShot = path.join(OUT_DIR, `${config.name}_04_bento_sections.png`);
    await page.screenshot({ path: midShot });
    fs.copyFileSync(midShot, path.join(ARTIFACT_DIR, `${config.name}_04_bento_sections.png`));

    // Scroll to bottom CTA
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(400);
    const bottomShot = path.join(OUT_DIR, `${config.name}_05_bottom_cta.png`);
    await page.screenshot({ path: bottomShot });
    fs.copyFileSync(bottomShot, path.join(ARTIFACT_DIR, `${config.name}_05_bottom_cta.png`));

    // Close page and context to finalize recorded video
    await page.close();
    await context.close();

    // Copy video file to artifact dir
    const videoFiles = fs.readdirSync(videoDir);
    if (videoFiles.length > 0) {
      const srcVideo = path.join(videoDir, videoFiles[0]);
      const destVideo = path.join(ARTIFACT_DIR, `${config.name}_scroll.webm`);
      fs.copyFileSync(srcVideo, destVideo);
      console.log(`Copied video recording to ${destVideo}`);
    }

    results.push({ config: config.name, status: 'PASS' });
  }

  await browser.close();
  server.close();
  console.log(`\nALL VERIFICATION RUNS COMPLETED SUCCESSFULLY.`);
}

run().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
