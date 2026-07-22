#!/usr/bin/env node
/**
 * Normalize showcase URLs to /cases/showcase/ and update spatial hash → page mapping.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const BASE = 'https://ks.forgesdlc.com/cases/showcase';

const SPATIAL_PAGE = {
  Flp: 'spatial-surfaces.html',
  Tlz: 'spatial-surfaces.html',
  Hol: 'spatial-surfaces.html',
  Zzg: 'spatial-surfaces.html',
  Mpx: 'spatial-surfaces.html',
  Iso: 'spatial-surfaces.html',
  Cgb: 'spatial-controls.html',
  Vsw: 'spatial-controls.html',
  Rng: 'spatial-controls.html',
  Fch: 'spatial-controls.html',
  Dil: 'spatial-controls.html',
  Nsw: 'spatial-controls.html',
  Hbd: 'spatial-controls.html',
  Dpt: 'spatial-ambient.html',
  Tun: 'spatial-ambient.html',
  Pst: 'spatial-ambient.html',
  Flh: 'spatial-ambient.html',
  Cbg: 'spatial-rails.html',
  Dcb: 'spatial-rails.html',
  Srl: 'spatial-rails.html',
};

const NAV_PAGE = {
  Ssd: 'navigation.html',
  Stc: 'navigation.html',
  Bdt: 'navigation.html',
  Mns: 'navigation.html',
  Mmg: 'navigation.html',
  Ajm: 'navigation.html',
  Tsw: 'navigation.html',
  Svc: 'controls.html',
  Swz: 'controls.html',
  Pgt: 'controls.html',
  Fcs: 'controls.html',
  Gcb: 'controls.html',
  Dst: 'controls.html',
  Sab: 'controls.html',
  Cpb: 'layout-shells.html',
  Spr: 'layout-shells.html',
  Cps: 'overlays-transitions.html',
  Bsc: 'overlays-transitions.html',
  Vth: 'overlays-transitions.html',
  Epr: 'presentation.html',
};

function fixUrl(url, pageFile) {
  if (!url || typeof url !== 'string') return url;
  let u = url.replace(
    'https://ks.forgesdlc.com/showcase/',
    `${BASE}/`,
  );
  if (pageFile && u.includes('.html#')) {
    const anchor = u.split('#')[1];
    u = `${BASE}/${pageFile}#${anchor}`;
  } else if (pageFile && u.endsWith('.html')) {
    const anchor = u.includes('#') ? `#${u.split('#')[1]}` : '';
    u = `${BASE}/${pageFile}${anchor}`;
  }
  return u;
}

async function patchRegistry() {
  const p = path.join(REPO, 'docs/design/catalog/visual-registry.yaml');
  let text = await readFile(p, 'utf8');
  text = text.replaceAll(
    'https://ks.forgesdlc.com/showcase/',
    `${BASE}/`,
  );
  for (const [hash, page] of Object.entries(SPATIAL_PAGE)) {
    const re = new RegExp(
      `(showcase_url: ${BASE}/spatial-effects\\.html#sec-[^\\n]+)\\n(?=[^\\n]*hash: ${hash})`,
      'g',
    );
    text = text.replace(re, (m) => {
      const anchor = m.split('#')[1];
      return `showcase_url: ${BASE}/${page}#${anchor}`;
    });
  }
  for (const [hash, page] of Object.entries(NAV_PAGE)) {
    const re = new RegExp(
      `(showcase_url: [^\\n]+)\\n(?=[^\\n]*hash: ${hash})`,
      'g',
    );
    text = text.replace(re, (m) => {
      if (!m.includes('layout-shells') && !m.includes('overlays-transitions')) {
        const anchor = m.includes('#') ? m.split('#')[1] : '';
        if (anchor) return `showcase_url: ${BASE}/${page}#${anchor}`;
      }
      return m;
    });
  }
  text = text.replace(
    `showcase_url: ${BASE}/spatial-effects.html`,
    `showcase_url: ${BASE}/spatial-effects.html`,
  );
  await writeFile(p, text);
  console.log('patched visual-registry.yaml');
}

async function patchSpatialOracles() {
  const dir = path.join(REPO, 'docs/design/spatial/oracles');
  const files = await readdir(dir);
  for (const f of files.filter((x) => x.endsWith('.json'))) {
    const hash = f.replace('.json', '');
    const page = SPATIAL_PAGE[hash];
    if (!page) continue;
    const fp = path.join(dir, f);
    const data = JSON.parse(await readFile(fp, 'utf8'));
    data.showcase_page = page;
    await writeFile(fp, `${JSON.stringify(data, null, 2)}\n`);
  }
  console.log('patched spatial oracles');
}

async function patchNavOracles() {
  const dir = path.join(REPO, 'docs/design/nav-layout/oracles');
  try {
    const files = await readdir(dir);
    for (const f of files.filter((x) => x.endsWith('.json'))) {
      const hash = f.replace('.json', '');
      const page = NAV_PAGE[hash];
      if (!page) continue;
      const fp = path.join(dir, f);
      const data = JSON.parse(await readFile(fp, 'utf8'));
      data.showcase_page = page;
      await writeFile(fp, `${JSON.stringify(data, null, 2)}\n`);
    }
    console.log('patched nav-layout oracles');
  } catch {
    /* dir may not exist yet */
  }
}

async function patchMdGlob(dir, pageMap) {
  try {
    const files = await readdir(dir);
    for (const f of files) {
      if (!f.endsWith('.md')) continue;
      const fp = path.join(dir, f);
      let text = await readFile(fp, 'utf8');
      const before = text;
      text = text.replaceAll(
        'https://ks.forgesdlc.com/showcase/',
        `${BASE}/`,
      );
      for (const [hash, page] of Object.entries(pageMap)) {
        if (f.startsWith(`${hash}-`)) {
          text = text.replaceAll('spatial-effects.html', page);
        }
      }
      if (text !== before) await writeFile(fp, text);
    }
  } catch {
    /* skip */
  }
}

await patchRegistry();
await patchSpatialOracles();
await patchNavOracles();
await patchMdGlob(path.join(REPO, 'docs/design/catalog/components'), SPATIAL_PAGE);
await patchMdGlob(path.join(REPO, 'docs/design/catalog/components'), NAV_PAGE);
await patchMdGlob(path.join(REPO, 'docs/design/catalog/pages'), SPATIAL_PAGE);
await patchMdGlob(path.join(REPO, 'docs/design/catalog/pages'), NAV_PAGE);
await patchMdGlob(path.join(REPO, 'docs/design/catalog/styles'), SPATIAL_PAGE);
await patchMdGlob(path.join(REPO, 'docs/design/catalog/styles'), NAV_PAGE);
console.log('done');
