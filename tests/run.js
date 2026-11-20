'use strict';
// Usage: node tests/run.js   (no packages). Runs every tests/*.test.js against a fresh boot() per test.
const fs = require('fs');
const path = require('path');
const H = require('./harness');

Object.assign(globalThis, { test: H.test, eq: H.eq, ok: H.ok, makeApp: H.makeApp, boot: H.boot });

let passed = 0;
let failed = 0;
const files = fs.readdirSync(__dirname).filter(f => /\.test\.js$/.test(f)).sort();

for (const f of files) {
  const start = H.registry.length;
  console.log('\n' + f);
  try {
    require(path.join(__dirname, f));
  } catch (e) {
    failed++;
    console.log('  ✗ (could not load file)\n    ' + String(e && e.stack || e).split('\n').slice(0, 4).join('\n    '));
    continue;
  }
  for (const t of H.registry.slice(start)) {
    try {
      const app = H.boot();
      for (const g of ['Store', 'Auth', 'CGStorage', 'Util', 'SEED']) globalThis[g] = app[g];
      t.fn();
      passed++;
      console.log('  ✓ ' + t.name);
    } catch (e) {
      failed++;
      console.log('  ✗ ' + t.name + '\n    ' + String(e && e.message || e).split('\n').join('\n    '));
    }
  }
}

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
