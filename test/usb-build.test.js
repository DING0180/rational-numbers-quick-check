import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('USB build has a dedicated command and release folder configuration', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const config = fs.readFileSync(path.join(root, 'vite.usb.config.js'), 'utf8');

  assert.equal(packageJson.scripts['build:usb'], 'node scripts/build-usb.mjs');
  assert.match(config, /outDir:\s*'release-usb'/);
  assert.match(config, /viteSingleFile/);
});

test('USB release includes a Windows launcher that serves the bundled page locally', () => {
  const launcher = fs.readFileSync(path.join(root, 'tools', 'OfflineLauncher.cs'), 'utf8');

  assert.match(launcher, /TcpListener/);
  assert.match(launcher, /127\.0\.0\.1/);
  assert.match(launcher, /Process\.Start/);
});

test('USB entry page provides a visible local startup diagnostic', () => {
  const entryHtml = fs.readFileSync(path.join(root, 'Rational-Numbers-Quick-Check.html'), 'utf8');
  const mainScript = fs.readFileSync(path.join(root, 'src', 'main.js'), 'utf8');

  assert.match(entryHtml, /id="offline-launch-error"/);
  assert.match(entryHtml, /window\.addEventListener\('error'/);
  assert.match(mainScript, /offline-launch-error/);
  assert.match(mainScript, /document\.addEventListener\('DOMContentLoaded', start/);
});
