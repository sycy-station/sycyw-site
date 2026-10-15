#!/usr/bin/env node
"use strict";

// Validate the actual deployable files, without requiring a web server or npm.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const assert = require("assert/strict");
const ROOT = path.resolve(__dirname, "..", "dist");
assert(fs.existsSync(path.join(ROOT, ".site-build")), "Run node scripts/build.js --production first");
const files = [];
const walk = directory => {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) walk(file); else files.push(file);
  }
};
walk(ROOT);
let references = 0, compressed = 0, fingerprinted = 0;
const verifyReference = (reference, origin) => {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)) return;
  const filename = decodeURIComponent(reference.split(/[?#]/)[0]);
  if (!filename) return;
  const target = path.resolve(path.dirname(origin), filename);
  assert(target.startsWith(ROOT + path.sep), `Reference escapes dist: ${reference}`);
  assert(fs.existsSync(target), `Missing ${reference} in ${path.relative(ROOT, origin)}`);
  references++;
};
for (const file of files) {
  const buffer = fs.readFileSync(file);
  if (file.endsWith(".html")) {
    const html = buffer.toString("utf8");
    assert(!/\{\{[^}]+\}\}/.test(html), `Unexpanded template: ${file}`);
    for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) verifyReference(match[1], file);
    const resources = html.match(/<script type="application\/json" id="roomResources">([\s\S]*?)<\/script>/);
    if (resources) for (const reference of Object.values(JSON.parse(resources[1]))) verifyReference(reference, file);
  }
  if (file.endsWith(".css")) {
    for (const match of buffer.toString("utf8").matchAll(/url\(\s*["']?([^)"']+)["']?\s*\)/g)) verifyReference(match[1].trim(), file);
  }
  const hash = path.basename(file).match(/\.([0-9a-f]{12})\.[a-z\d]+$/);
  if (hash) {
    assert.equal(crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 12), hash[1], `Incorrect content hash: ${file}`);
    fingerprinted++;
  }
  if (/\.(?:html|css|js|json|xml|txt|svg)$/.test(file)) {
    assert.deepEqual(zlib.gunzipSync(fs.readFileSync(file + ".gz")), buffer, `Invalid gzip: ${file}`);
    assert.deepEqual(zlib.brotliDecompressSync(fs.readFileSync(file + ".br")), buffer, `Invalid Brotli: ${file}`);
    compressed++;
  }
}
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "asset-manifest.json"), "utf8"));
for (const reference of Object.values(manifest)) verifyReference(reference, path.join(ROOT, "asset-manifest.json"));
console.log(`Build OK: ${files.filter(f => f.endsWith(".html")).length} HTML files, ${references} local references, ${fingerprinted} hashed assets, ${compressed} gzip/Brotli pairs`);
