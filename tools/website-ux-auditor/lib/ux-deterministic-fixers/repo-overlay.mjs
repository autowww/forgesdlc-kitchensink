import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Port of apply-harness-fixture-remediation.py remediate_repo_overlay + seed paths.
 * @param {string} ruleId
 * @param {string} overlayRoot
 */
export async function remediateRepoOverlay(ruleId, overlayRoot) {
  const root = path.resolve(overlayRoot);

  if (ruleId === 'DET.CONTRACT.PATH') {
    const dest = path.join(root, 'docs/design/catalog/harness/missing-contract.md');
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(
      dest,
      '# Harness missing contract (remediated)\n\n## Expected look\nNeutral card surface aligned to forge-section rhythm.\n\n## Responsive behavior\nStacks to single column below md breakpoint.\n',
      'utf8',
    );
    return;
  }
  if (ruleId === 'DET.CONTRACT.PLACEHOLDERS') {
    const dest = path.join(root, 'docs/design/catalog/contracts/harness-placeholder-stub.md');
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(
      dest,
      '# Harness placeholder contract (remediated)\n\n## Expected look\nTitle and body use product vocabulary; no lorem or bracket stubs.\n\n## Responsive behavior\nMaintains readable line length at all breakpoints.\n',
      'utf8',
    );
    return;
  }
  if (ruleId === 'DET.INVENTORY.CROSSWALK') {
    const inv = path.join(root, 'docs/design/catalog/visual-inventory.generated.json');
    await fs.mkdir(path.dirname(inv), { recursive: true });
    await fs.writeFile(
      inv,
      '{\n  "schemaVersion": 1,\n  "catalogCrosswalk": {\n    "showcase_dir": "showcase",\n    "showcase_hashes_not_in_registry": []\n  }\n}\n',
      'utf8',
    );
    const bad = path.join(root, 'showcase/harness-crosswalk-fail.html');
    try {
      await fs.unlink(bad);
    } catch {
      /* absent */
    }
    return;
  }
  if (ruleId === 'DET.TOKEN.NO_DRIFT') {
    const drift = path.join(root, 'css/harness-token-drift.css');
    await fs.writeFile(drift, '/* remediated: no ad-hoc colors */\n', 'utf8');
    return;
  }
  if (ruleId === 'DET.PY.KS_HASH_ATTRS') {
    const stub = 'from components.ks_hash_attrs import ks_hash_attrs\n\n# harness remediated\n';
    const rels = [
      'components/ks_hash_attrs.py',
      'components/ks_catalog_hashes.py',
      'components/layouts.py',
      'components/components.py',
      'generator/build-showcase.py',
      'generator/layout_previews.py',
      'forge-autodoc/forge_autodoc/page.py',
      'generator/harness_manual_hash_string.py',
    ];
    for (const rel of rels) {
      const p = path.join(root, rel);
      await fs.mkdir(path.dirname(p), { recursive: true });
      if (rel === 'components/ks_hash_attrs.py') {
        await fs.writeFile(
          p,
          'def ks_hash_attrs(h, t, n, name):\n    return f\'hash="{h}" data-ks-hash="{h}" data-ks-type="{t}" data-ks-name="{name}"\'\n',
          'utf8',
        );
      } else {
        await fs.writeFile(p, `${stub}MARKUP = ks_hash_attrs('Abx', 'demo', 'layout', '${rel}')\n`, 'utf8');
      }
    }
    return;
  }
  if (ruleId === 'DET.SCREENSHOT.STATUS') {
    const catalogDir = path.join(root, 'docs', 'design', 'catalog');
    await fs.mkdir(catalogDir, { recursive: true });
    const contract = path.join(catalogDir, 'contracts', 'harness-screenshot.md');
    await fs.mkdir(path.dirname(contract), { recursive: true });
    await fs.writeFile(
      contract,
      '# Harness screenshot contract\n\n## Expected look\nDocumented surface.\n',
      'utf8',
    );
    const registryDoc = {
      schemaVersion: 1,
      repoRoot: root,
      entries: [
        {
          hash: 'Hss',
          name: 'harness-screenshot-ok',
          status: 'active',
          contract_status: 'own',
          contract: 'docs/design/catalog/contracts/harness-screenshot.md',
          screenshot_status: 'planned',
          screenshot_reason: 'Harness fixture — capture deferred',
        },
      ],
    };
    await fs.writeFile(
      path.join(catalogDir, 'visual-registry.generated.json'),
      `${JSON.stringify(registryDoc, null, 2)}\n`,
      'utf8',
    );
    return;
  }

  throw new Error(`repo_overlay: no remediate for ${ruleId}`);
}

/**
 * @param {string} ruleId
 * @param {string} repoRoot
 */
export async function seedHarnessRepo(ruleId, repoRoot) {
  const catalogDir = path.join(repoRoot, 'docs', 'design', 'catalog');
  const writeRegistry = async (entries) => {
    await fs.mkdir(catalogDir, { recursive: true });
    const doc = { schemaVersion: 1, repoRoot, entries };
    await fs.writeFile(
      path.join(catalogDir, 'visual-registry.generated.json'),
      `${JSON.stringify(doc, null, 2)}\n`,
      'utf8',
    );
  };

  if (ruleId === 'DET.HASH.MARKERS') {
    await writeRegistry([
      { hash: 'Ldg', name: 'layout-landing', type: 'layout', status: 'active', contract_status: 'family-covered' },
      { hash: 'Vln', name: 'preview-landing', type: 'layout-preview', status: 'active', contract_status: 'family-covered' },
      { hash: 'Kpn', name: 'product-primary-nav', type: 'chrome-region', status: 'active', contract_status: 'family-covered' },
      { hash: 'Ksf', name: 'site-footer', type: 'chrome-region', status: 'active', contract_status: 'family-covered' },
    ]);
  }
}

/**
 * @param {{ ruleId: string, repoOverlay: string, fixtureDir?: string }} ctx
 */
export async function runRepoOverlayFixer(ctx) {
  const { ruleId, repoOverlay, fixtureDir } = ctx;
  if (!repoOverlay) {
    return { applied: false, error: 'repoOverlay path required' };
  }
  try {
    await remediateRepoOverlay(ruleId, repoOverlay);
    if (fixtureDir && ruleId === 'DET.HASH.MARKERS') {
      await seedHarnessRepo(ruleId, repoOverlay);
    }
    return { applied: true, adapter: 'repo_overlay' };
  } catch (err) {
    return { applied: false, error: String(err?.message || err) };
  }
}
