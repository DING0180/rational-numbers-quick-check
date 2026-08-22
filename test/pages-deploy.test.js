import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('GitHub Pages has a dedicated subpath-aware production build', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const viteConfig = fs.readFileSync(path.join(root, 'vite.config.js'), 'utf8');

  assert.equal(packageJson.scripts['build:pages'], 'vite build --mode github-pages');
  assert.match(viteConfig, /mode === 'github-pages' \? '\/rational-numbers-quick-check\/' : '\/'/);
});

test('GitHub Pages deployment uses the official Actions workflow and documents the site', () => {
  const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'deploy-pages.yml'), 'utf8');
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');

  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v3/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /npm run build:pages/);
  assert.match(readme, /## Live Website/);
});
