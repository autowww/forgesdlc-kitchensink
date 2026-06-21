import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  extractNavLinkRoutes,
  extractReactRouterPaths,
  generateViteReactSmokePlan,
  mergeCandidatesIntoPlan,
  pathFromPageFilename,
  scanConventionPageRoutes,
  scanReactRouterSourceFiles,
} from '../lib/vite-react-smoke-inference.mjs';
import { loadSmokePlan } from '../lib/smoke-plan.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROUTER_FIXTURE = path.join(__dirname, 'fixtures', 'vite-react-router');
const NAV_FIXTURE = path.join(__dirname, 'fixtures', 'vite-react-nav');
const PAGES_FIXTURE = path.join(__dirname, 'fixtures', 'vite-react-pages');
const MINI_PLAN = path.join(__dirname, 'fixtures', 'mini-smoke-plan.yaml');

test('extractReactRouterPaths reads Route and path objects', () => {
  const src = `
    <Route path="/dashboard" />
    { path: '/settings', element: <X /> }
    path: "/reports/:id"
  `;
  const paths = extractReactRouterPaths(src);
  assert.ok(paths.includes('/dashboard'));
  assert.ok(paths.includes('/settings'));
  assert.ok(paths.includes('/reports/:id'));
});

test('scanReactRouterSourceFiles loads fixture routes', async () => {
  const routes = await scanReactRouterSourceFiles(ROUTER_FIXTURE);
  const keys = routes.map((r) => r.navigate.path || r.navigate.hash);
  assert.ok(keys.includes('/dashboard'));
  assert.ok(keys.includes('/attention'));
});

test('extractNavLinkRoutes infers hash and path hrefs', async () => {
  const html = await fs.readFile(path.join(NAV_FIXTURE, 'shell.html'), 'utf8');
  const links = extractNavLinkRoutes(html);
  const hashes = links.filter((l) => l.navigate.hash).map((l) => l.navigate.hash);
  assert.ok(hashes.includes('dashboard-section'));
  assert.ok(hashes.includes('registry-section'));
  const paths = links.filter((l) => l.navigate.path).map((l) => l.navigate.path);
  assert.ok(paths.includes('/settings'));
});

test('scanConventionPageRoutes maps page filenames', async () => {
  const routes = await scanConventionPageRoutes(PAGES_FIXTURE);
  const paths = routes.map((r) => r.navigate.path);
  assert.ok(paths.includes('/dashboard'));
  assert.ok(paths.includes('/insights'));
});

test('pathFromPageFilename kebab-cases React page names', () => {
  assert.equal(pathFromPageFilename('DashboardPage.tsx'), '/dashboard');
  assert.equal(pathFromPageFilename('InsightsPage.tsx'), '/insights');
});

test('generateViteReactSmokePlan preserves human scenarios and adds candidates', async () => {
  const tmp = path.join(__dirname, 'fixtures', 'generated-smoke-plan.tmp.yaml');
  await fs.copyFile(MINI_PLAN, tmp);
  const result = await generateViteReactSmokePlan({
    appRoot: ROUTER_FIXTURE,
    smokePlanPath: tmp,
    shellPaths: [path.join(NAV_FIXTURE, 'shell.html')],
  });
  const home = result.plan.scenarios.find((s) => s.scenarioId === 'home-shell');
  assert.equal(home.status, 'implemented');
  const candidates = result.plan.scenarios.filter((s) => s.status === 'candidate');
  assert.ok(candidates.length >= 1);
  assert.ok(result.addedCount >= 1);
  await fs.unlink(tmp).catch(() => {});
});

test('mergeCandidatesIntoPlan does not duplicate existing navigate keys', async () => {
  const plan = await loadSmokePlan(MINI_PLAN);
  const merged = mergeCandidatesIntoPlan(
    { planId: 'x', scenarios: [...plan.scenarios] },
    [
      {
        routeKey: 'hash:registry-section',
        navigate: { hash: 'registry-section' },
        source: 'nav-link',
      },
    ],
  );
  assert.equal(merged.scenarios.length, plan.scenarios.length);
});
