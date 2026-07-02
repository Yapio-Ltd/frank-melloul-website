/**
 * Measure idle performance metrics for a running page.
 * Usage: node scripts/perf-measure.mjs [url]
 */
import puppeteer from "puppeteer";

const url = process.argv[2] ?? "http://localhost:3000";

async function runLighthouse(targetUrl) {
  const { default: lighthouse } = await import("lighthouse");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const result = await lighthouse(targetUrl, {
      port: Number(new URL(browser.wsEndpoint()).port),
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance"],
    });

    const audit = result.lhr.audits;
    return {
      tbt: audit["total-blocking-time"]?.numericValue ?? null,
      mainThreadWork: audit["mainthread-work-breakdown"]?.numericValue ?? null,
      jsExecutionTime: audit["bootup-time"]?.numericValue ?? null,
      performanceScore: Math.round(result.lhr.categories.performance.score * 100),
    };
  } finally {
    await browser.close();
  }
}

async function measurePage(targetUrl) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 120_000 });

    await new Promise((r) => setTimeout(r, 6000));

    const pageMetrics = await page.evaluate(async () => {
      let rafCount = 0;
      const start = performance.now();

      await new Promise((resolve) => {
        const sample = () => {
          rafCount += 1;
          if (performance.now() - start < 5000) {
            requestAnimationFrame(sample);
          } else {
            resolve(undefined);
          }
        };
        requestAnimationFrame(sample);
      });

      const canvasCount = document.querySelectorAll("canvas").length;
      const scripts = performance
        .getEntriesByType("resource")
        .filter((e) => e.initiatorType === "script")
        .map((e) => ({ name: e.name.split("/").pop(), duration: Math.round(e.duration) }));

      const unicornScript = scripts.find((s) => s.name?.includes("unicorn"));

      return {
        rafPerSecond: Math.round(rafCount / 5),
        canvasCount,
        unicornScriptLoaded: Boolean(unicornScript),
        unicornScriptMs: unicornScript?.duration ?? null,
        jsHeapMB: performance.memory
          ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
          : null,
      };
    });

    const lhMetrics = await runLighthouse(targetUrl);
    return { url: targetUrl, ...pageMetrics, ...lhMetrics };
  } finally {
    await browser.close();
  }
}

measurePage(url)
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
