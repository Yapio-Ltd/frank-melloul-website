/**
 * Local performance ablation runner.
 * Usage: node scripts/perf-ablation.mjs [url]
 */
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import puppeteer from "puppeteer";

const BASE_URL = process.argv[2] ?? "http://localhost:3000";

const SCENARIOS = [
  { name: "A — Baseline", env: {} },
  { name: "B — Sans Unicorn", env: { NEXT_PUBLIC_DISABLE_UNICORN: "1" } },
  { name: "C — Sans Lenis", env: { NEXT_PUBLIC_DISABLE_LENIS: "1" } },
  { name: "D — Sans LoadingScreen", env: { NEXT_PUBLIC_DISABLE_LOADING_SCREEN: "1" } },
  {
    name: "E — Sans Unicorn + Lenis",
    env: {
      NEXT_PUBLIC_DISABLE_UNICORN: "1",
      NEXT_PUBLIC_DISABLE_LENIS: "1",
    },
  },
];

async function runCommand(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: { ...process.env, ...env },
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function measurePage(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 120_000 });
    await delay(6000);

    const metrics = await page.evaluate(async () => {
      const rafSamples = [];
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
      const longTasks = await new Promise((resolve) => {
        const tasks = [];
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              tasks.push(entry.duration);
            }
          });
          observer.observe({ type: "longtask", buffered: true });
          setTimeout(() => {
            observer.disconnect();
            resolve(tasks);
          }, 100);
        } catch {
          resolve([]);
        }
      });

      const mem = performance.memory
        ? {
            usedJSHeapMB: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            totalJSHeapMB: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
          }
        : null;

      return {
        rafPerSecond: Math.round(rafCount / 5),
        canvasCount,
        longTaskCount: longTasks.length,
        longTaskTotalMs: Math.round(longTasks.reduce((a, b) => a + b, 0)),
        jsHeapMB: mem?.usedJSHeapMB ?? null,
      };
    });

    return metrics;
  } finally {
    await browser.close();
  }
}

async function runLighthouse(url) {
  const { default: lighthouse } = await import("lighthouse");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const result = await lighthouse(url, {
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
      performanceScore: result.lhr.categories.performance.score * 100,
    };
  } finally {
    await browser.close();
  }
}

async function main() {
  const results = [];

  for (const scenario of SCENARIOS) {
    console.log(`\n=== ${scenario.name} ===`);
    console.log("Building...");
    await runCommand("npm", ["run", "build"], scenario.env);

    console.log("Starting server...");
    const server = spawn("npm", ["run", "start"], {
      cwd: process.cwd(),
      env: { ...process.env, ...scenario.env, PORT: "3099" },
      stdio: "pipe",
    });

    await delay(4000);

    try {
      const url = BASE_URL.includes("localhost") ? "http://localhost:3099" : BASE_URL;
      console.log(`Measuring ${url}...`);
      const pageMetrics = await measurePage(url);
      const lhMetrics = await runLighthouse(url);

      results.push({
        scenario: scenario.name,
        ...pageMetrics,
        ...lhMetrics,
      });

      console.log(JSON.stringify({ scenario: scenario.name, ...pageMetrics, ...lhMetrics }, null, 2));
    } finally {
      server.kill("SIGTERM");
      await delay(2000);
    }
  }

  console.log("\n=== RÉSUMÉ ABLATION ===");
  console.table(
    results.map((r) => ({
      Scénario: r.scenario,
      "RAF/s": r.rafPerSecond,
      Canvas: r.canvasCount,
      "Long tasks": r.longTaskCount,
      TBT_ms: Math.round(r.tbt ?? 0),
      Score: Math.round(r.performanceScore ?? 0),
      "JS heap MB": r.jsHeapMB,
    }))
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
