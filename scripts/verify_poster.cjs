#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

function parseArgs(argv) {
  const positional = [];
  const options = { selector: ".poster", minFont: 12, tolerance: 1, allowPlaceholders: false };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--selector") options.selector = argv[++index];
    else if (value === "--min-font") options.minFont = Number(argv[++index]);
    else if (value === "--tolerance") options.tolerance = Number(argv[++index]);
    else if (value === "--allow-placeholders") options.allowPlaceholders = true;
    else positional.push(value);
  }
  if (positional.length !== 1) return null;
  return { html: positional[0], ...options };
}

async function launchChromium(chromium) {
  const executablePath = process.env.BROWSER_EXECUTABLE;
  if (executablePath) return chromium.launch({ headless: true, executablePath });
  for (const channel of ["msedge", "chrome"]) {
    try {
      return await chromium.launch({ headless: true, channel });
    } catch (_) {
      // Try the next installed browser.
    }
  }
  return chromium.launch({ headless: true });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args) {
    process.stderr.write("Usage: node verify_poster.cjs <poster.html> [--selector .poster] [--min-font 12] [--allow-placeholders]\n");
    process.exitCode = 2;
    return;
  }
  const htmlPath = path.resolve(args.html);
  if (!fs.existsSync(htmlPath)) throw new Error(`HTML not found: ${htmlPath}`);

  let chromium;
  try {
    ({ chromium } = require("playwright"));
  } catch (error) {
    throw new Error(`Cannot resolve Playwright. Set NODE_PATH to the bundled workspace node_modules directory. ${error.message}`);
  }

  const browser = await launchChromium(chromium);
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const consoleErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  try {
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images).map((image) => image.complete ? null : new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      })));
    });

    const report = await page.evaluate(({ selector, minFont, tolerance }) => {
      const poster = document.querySelector(selector);
      if (!poster) return { missingPoster: true };
      const posterRect = poster.getBoundingClientRect();
      const brokenImages = Array.from(document.images)
        .filter((image) => !image.complete || image.naturalWidth === 0 || image.naturalHeight === 0)
        .map((image) => image.getAttribute("src") || "<missing src>");
      const overflow = [];
      const smallText = [];
      for (const element of poster.querySelectorAll("*")) {
        const style = getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) continue;
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.left < posterRect.left - tolerance || rect.right > posterRect.right + tolerance || rect.top < posterRect.top - tolerance || rect.bottom > posterRect.bottom + tolerance) {
          overflow.push({ tag: element.tagName.toLowerCase(), className: String(element.className || ""), left: Math.round(rect.left - posterRect.left), right: Math.round(rect.right - posterRect.right), top: Math.round(rect.top - posterRect.top), bottom: Math.round(rect.bottom - posterRect.bottom) });
        }
        if (element.children.length === 0 && element.textContent.trim()) {
          const fontSize = Number.parseFloat(style.fontSize);
          if (fontSize < minFont) smallText.push({ text: element.textContent.trim().slice(0, 80), fontSize, tag: element.tagName.toLowerCase() });
        }
      }

      const placeholders = Array.from(poster.querySelectorAll("*"))
        .filter((element) => element.children.length === 0 && /\[\[[^\]]+\]\]/.test(element.textContent))
        .map((element) => element.textContent.trim().slice(0, 100));
      const unexpectedLatin = [];
      const walker = document.createTreeWalker(poster, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const parent = node.parentElement;
        const text = node.textContent.replace(/\s+/g, " ").trim();
        if (!parent || !text || !/[A-Za-z]/.test(text)) continue;
        if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) continue;
        const style = getComputedStyle(parent);
        if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) continue;
        const allowed = parent.closest("[data-allow-latin]");
        if (allowed && allowed.children.length === 0) continue;
        unexpectedLatin.push({ text: text.slice(0, 100), tag: parent.tagName.toLowerCase(), className: String(parent.className || "") });
      }

      return {
        missingPoster: false,
        dimensions: { width: poster.offsetWidth, height: poster.offsetHeight },
        brokenImages,
        overflowCount: overflow.length,
        overflow: overflow.slice(0, 50),
        smallText: smallText.slice(0, 50),
        placeholderCount: placeholders.length,
        placeholders: placeholders.slice(0, 50),
        unexpectedLatinCount: unexpectedLatin.length,
        unexpectedLatin: unexpectedLatin.slice(0, 50),
        fontStatus: document.fonts.status,
      };
    }, { selector: args.selector, minFont: args.minFont, tolerance: args.tolerance });

    const p0 = [];
    if (report.missingPoster) p0.push(`Missing poster selector: ${args.selector}`);
    if (report.brokenImages?.length) p0.push(`${report.brokenImages.length} broken image(s)`);
    if (report.overflowCount) p0.push(`${report.overflowCount} element(s) overflow poster bounds`);
    if (consoleErrors.length) p0.push(`${consoleErrors.length} console/page error(s)`);
    if (report.unexpectedLatinCount) p0.push(`${report.unexpectedLatinCount} visible Latin text node(s) without leaf-level data-allow-latin`);
    if (report.placeholderCount && !args.allowPlaceholders) p0.push(`${report.placeholderCount} unresolved placeholder(s)`);

    const warnings = [];
    if (report.smallText?.length) warnings.push(`${report.smallText.length} text leaf/leaves below ${args.minFont}px`);
    if (report.placeholderCount && args.allowPlaceholders) warnings.push(`${report.placeholderCount} unresolved placeholder(s) allowed for draft verification`);
    process.stdout.write(`${JSON.stringify({ html: htmlPath, passed: p0.length === 0, p0, warnings, consoleErrors, report }, null, 2)}\n`);
    if (p0.length) process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
