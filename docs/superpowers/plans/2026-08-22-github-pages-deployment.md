# GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish Rational Numbers Quick Check from GitHub Pages with automated deployment on each push to the release branch.

**Architecture:** Keep the existing Vite application and USB build unchanged. Add a Pages-specific Vite configuration that emits the normal multi-file `dist` site under the repository subpath, then deploy that artifact with GitHub's official Pages Actions.

**Tech Stack:** Vite 7, KaTeX, GitHub Actions, GitHub Pages.

**Spec:** `C:\Users\ABC\.codex\attachments\3a1504d1-9c69-4c6d-bf5b-2759e5c6fb08\pasted-text.txt`

## Global Constraints

- Preserve Lesson 01–13, Easy/Challenge generators, bilingual UI, layout, KaTeX, keyboard controls, and USB build.
- Keep `npm run dev`, `npm run build`, and `npm run build:usb` working.
- Use GitHub's official checkout, setup-node, configure-pages, upload-pages-artifact, and deploy-pages Actions.
- Deploy the normal production artifact; never commit `dist` or `release-usb`.

---

### Task 1: Add a Pages-aware production build

**Files:**
- Modify: `vite.config.js`
- Modify: `package.json`
- Test: `test/pages-deploy.test.js`

- [ ] **Step 1: Write the failing test**

```js
assert.equal(packageJson.scripts['build:pages'], 'vite build --mode github-pages');
assert.match(viteConfig, /base:\s*isGitHubPages\s*\?\s*'\/rational-numbers-quick-check\/'/);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/pages-deploy.test.js`

Expected: FAIL because the Pages command and base-path logic do not yet exist.

- [ ] **Step 3: Implement the Pages build**

```js
export default defineConfig(({ mode }) => ({
  base: mode === 'github-pages' ? '/rational-numbers-quick-check/' : '/',
}));
```

Add `"build:pages": "vite build --mode github-pages"` to `package.json`.

- [ ] **Step 4: Run the focused test and build**

Run: `node --test test/pages-deploy.test.js; npm run build:pages`

Expected: PASS and `dist/index.html` references `/rational-numbers-quick-check/assets/`.

### Task 2: Add the official Pages workflow and live-site documentation

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Create or Modify: `README.md`
- Test: `test/pages-deploy.test.js`

- [ ] **Step 1: Extend the failing test**

```js
assert.match(workflow, /actions\/configure-pages@v5/);
assert.match(workflow, /actions\/deploy-pages@v4/);
assert.match(readme, /## Live Website/);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/pages-deploy.test.js`

Expected: FAIL because the workflow and Live Website section do not yet exist.

- [ ] **Step 3: Implement the workflow and README**

Create a workflow triggered by pushes to the repository default branch, with `pages: write` and `id-token: write` permissions. Build via `npm ci` and `npm run build:pages`, upload `dist`, then deploy it. Add a Live Website placeholder URL to README before repository ownership is known.

- [ ] **Step 4: Run focused test**

Run: `node --test test/pages-deploy.test.js`

Expected: PASS.

### Task 3: Create/connect GitHub repository and publish

**Files:**
- Modify: `.git/config` through Git remote configuration

- [ ] **Step 1: Verify available GitHub authentication**

Run: `gh auth status` or query configured Git credentials.

Expected: An authenticated GitHub account with repository creation and push permission.

- [ ] **Step 2: Create or connect repository**

Run: create public repository `rational-numbers-quick-check`, then add it as `origin`.

Expected: `git remote -v` lists the GitHub repository URL.

- [ ] **Step 3: Commit and push deployment configuration**

Run: `git add vite.config.js package.json .github/workflows/deploy-pages.yml README.md test/pages-deploy.test.js && git commit -m "feat: deploy Rational Numbers Quick Check to GitHub Pages" && git push -u origin <default-branch>`.

Expected: GitHub receives the source and starts the Pages workflow.

### Task 4: Verify published site

**Files:**
- No source changes expected.

- [ ] **Step 1: Check workflow and Pages deployment state**

Run: query GitHub Actions and Pages deployment status for the pushed commit.

Expected: workflow success and active Pages URL.

- [ ] **Step 2: Open public URL and perform classroom regression**

Run: browser test the live URL: Lesson 01–13, Easy/Challenge, New Question, Reveal/Hide, KaTeX, keyboard shortcuts, and the three specified viewports.

Expected: all controls work, no console errors, no resource 404s, no horizontal overflow.

- [ ] **Step 3: Record final live URL in README if repository owner differs**

Run: update README URL, commit, push, and confirm the same URL redeploys.

Expected: README displays the real permanent Pages URL.
