#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

function usage() {
  process.stderr.write(
    "Usage: node render_poster.cjs <poster.html> <poster.png> [--selector .poster] [--width 1200]\n",
  );
}

function parseArgs(argv) {
  const positional = [];
  const options = { selector: ".poster", width: 1200 };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--selector") options.selector = argv[++index];
    else if (value === "--width") options.width = Number(argv[++index]);
    else positional.push(value);
  }
  if (positional.length !== 2 || !Number.isFinite(options.width)) return null;
  return { html: positional[0], output: positional[1], ...options };
}

async function launchChromium(chromium) {
  const executablePath = process.env.BROWSER_EXECUTABLE;
  if (executablePath) return chromium.launch({ headless: true, executablePath });
  for (const channel of ["msedge", "chrome"]) {
    try {
      return await chromium.launch({ headless: true, channel });
    } catch (_) {
      // Try the next locally installed channel.
    }
  }
  return chromium.launch({ headless: true });
}

async function waitForVisualAssets(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((image) =>
        image.complete
          ? null
          : new Promise((resolve) => {
              image.addEventListener("load", resolve, { once: true });
              image.addEventListener("error", resolve, { once: true });
            }),
      ),
    );
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args) {
    usage();
    process.exitCode = 2;
    return;
  }

  const htmlPath = path.resolve(args.html);
  const outputPath = path.resolve(args.output);
  if (!fs.existsSync(htmlPath)) throw new Error(`HTML not found: ${htmlPath}`);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  let chromium;
  try {
    ({ chromium } = require("playwright"));
  } catch (error) {
    throw new Error(
      `Cannot resolve Playwright. Set NODE_PATH to the bundled workspace node_modules directory. ${error.message}`,
    );
  }

  const browser = await launchChromium(chromium);
  const page = await browser.newPage({
    viewport: { width: args.width, height: 900 },
    deviceScaleFactor: 1,
  });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  try {
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
    await waitForVisualAssets(page);
    const locator = page.locator(args.selector);
    if ((await locator.count()) !== 1) {
      throw new Error(`Expected one ${args.selector} element`);
    }
    const dimensions = await locator.evaluate((element) => ({
      width: element.offsetWidth,
      height: element.offsetHeight,
    }));
    await locator.screenshot({ path: outputPath });
    process.stdout.write(
      `${JSON.stringify({ html: htmlPath, output: outputPath, selector: args.selector, dimensions, consoleErrors }, null, 2)}\n`,
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});

