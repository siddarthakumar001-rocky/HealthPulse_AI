const { chromium } = require('playwright');
const { spawn } = require('child_process');

async function runAudit() {
  console.log('Starting vite preview server...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    stdio: 'pipe'
  });

  server.stdout.on('data', data => {
    // console.log(`[server]: ${data}`);
  });

  // wait 3 seconds for server to start
  await new Promise(r => setTimeout(r, 3000));

  let browser;
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (e) {
    console.error('Failed to launch chrome:', e.message);
    server.kill();
    return;
  }

  const routes = ['/', '/login', '/dashboard'];
  const results = {};

  for (const route of routes) {
    const context = await browser.newContext({
      viewport: { width: 360, height: 640 }, // mobile viewport
      userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    });

    const page = await context.newPage();
    const client = await page.context().newCDPSession(page);

    // Apply 4x CPU slowdown
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    // Apply Slow 4G throttling: 400ms RTT, 400 Kbps down (50 KB/s), 400 Kbps up
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 400,
      downloadThroughput: (400 * 1024) / 8,
      uploadThroughput: (400 * 1024) / 8,
      connectionType: 'cellular3g'
    });

    // Capture Long Tasks
    let longTasks = [];
    await page.addInitScript(() => {
      window.__longTasks = [];
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__longTasks.push({ duration: entry.duration, startTime: entry.startTime });
        }
      });
      try {
        observer.observe({ type: 'longtask', buffered: true });
      } catch (e) {}
    });

    const startTime = Date.now();
    try {
      await page.goto(`http://localhost:4173${route}`, { waitUntil: 'load', timeout: 35000 });
    } catch (err) {
      console.warn(`Navigation to ${route} timed out or partial load: ${err.message}`);
    }

    // Wait 4 seconds for post-load hydration, scrollytelling, animations
    await page.waitForTimeout(4000);

    // Gather Web Vitals and Heap metrics
    const metrics = await page.evaluate(() => {
      let lcp = 0;
      let cls = 0;
      let fcp = 0;

      const entries = performance.getEntriesByType('paint');
      const fcpEntry = entries.find(e => e.name === 'first-contentful-paint');
      if (fcpEntry) fcp = fcpEntry.startTime;

      // CLS
      try {
        const layoutShifts = performance.getEntriesByType('layout-shift');
        for (const shift of layoutShifts) {
          if (!shift.hadRecentInput) cls += shift.value;
        }
      } catch (e) {}

      // LCP from buffered entries
      try {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          lcp = lcpEntries[lcpEntries.length - 1].startTime;
        }
      } catch (e) {}

      const heap = performance.memory ? {
        usedJSHeapSizeMB: (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2),
        totalJSHeapSizeMB: (performance.memory.totalJSHeapSize / (1024 * 1024)).toFixed(2)
      } : null;

      return {
        fcp: Math.round(fcp),
        lcp: Math.round(lcp || fcp),
        cls: Number(cls.toFixed(4)),
        heap,
        longTasks: window.__longTasks || []
      };
    });

    // Also get CDP Performance metrics
    const cdpMetrics = await client.send('Performance.getMetrics');
    const cdpMap = {};
    for (const m of cdpMetrics.metrics) {
      cdpMap[m.name] = m.value;
    }

    const cdpHeapMB = cdpMap['JSHeapUsedSize'] ? (cdpMap['JSHeapUsedSize'] / (1024 * 1024)).toFixed(2) : 'N/A';

    results[route] = {
      fcpMs: metrics.fcp,
      lcpMs: metrics.lcp,
      cls: metrics.cls,
      longTaskCount: metrics.longTasks.length,
      maxLongTaskDurationMs: metrics.longTasks.reduce((max, t) => Math.max(max, Math.round(t.duration)), 0),
      jsHeapMB: metrics.heap ? metrics.heap.usedJSHeapSizeMB : cdpHeapMB,
      cdpHeapMB
    };

    await context.close();
  }

  await browser.close();
  server.kill();

  console.log('\n=== AUDIT RESULTS (4x CPU slowdown, Slow 4G, 360x640 Mobile) ===');
  console.log(JSON.stringify(results, null, 2));
}

runAudit().catch(err => {
  console.error('Audit script failed:', err);
  process.exit(1);
});
