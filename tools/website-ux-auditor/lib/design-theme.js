import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KS_ROOT = path.resolve(__dirname, '../../..');
const THEMES_ROOT = path.join(KS_ROOT, 'docs/design/themes');

export const DEFAULT_DESIGN_THEME_ID = 'default';

function slugThemeId(raw) {
  const id = String(raw || DEFAULT_DESIGN_THEME_ID).trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(id)) {
    throw new Error(`Invalid design theme id: ${raw}`);
  }
  return id;
}

function sha256(text) {
  return crypto.createHash('sha256').update(String(text || ''), 'utf8').digest('hex');
}

function relFromKs(absPath) {
  return path.relative(KS_ROOT, absPath).replaceAll(path.sep, '/');
}

export function designThemesRoot() {
  return THEMES_ROOT;
}

export function designThemeGeneratedPath(themeId = DEFAULT_DESIGN_THEME_ID) {
  return path.join(THEMES_ROOT, slugThemeId(themeId), 'theme.generated.json');
}

export function designThemeSourcePath(themeId = DEFAULT_DESIGN_THEME_ID) {
  return path.join(THEMES_ROOT, slugThemeId(themeId), 'theme.yaml');
}

export function summarizeDesignTheme(theme) {
  if (!theme) return null;
  return {
    id: theme.id,
    name: theme.name,
    status: theme.status || null,
    source: theme.source || null,
    generatedPath: theme.generatedPath || null,
    fingerprint: theme.fingerprint || null,
    designStandardPath: theme.designStandardPath || null,
    tokensPath: theme.tokensPath || null,
    deterministicRulesPath: theme.deterministicRulesPath || null,
    aiPrinciplesPath: theme.aiPrinciplesPath || null,
  };
}

export async function loadDesignTheme(themeId = DEFAULT_DESIGN_THEME_ID) {
  const id = slugThemeId(themeId || DEFAULT_DESIGN_THEME_ID);
  const generatedPath = designThemeGeneratedPath(id);
  let parsed;
  try {
    parsed = JSON.parse(await fsp.readFile(generatedPath, 'utf8'));
  } catch (error) {
    if (id !== DEFAULT_DESIGN_THEME_ID) throw new Error(`Design theme not found: ${id} (${generatedPath})`);
    parsed = {
      schemaVersion: 1,
      id,
      name: 'Forge default',
      status: 'fallback',
      source: 'runtime-fallback',
      designStandardPath: 'docs/design/forge-enterprise-ai-website-standard.md',
      tokensPath: null,
      deterministicRulesPath: 'docs/design/ux-audit/deterministic-design-rules.md',
      aiPrinciplesPath: 'docs/design/ux-audit/ai-enabled-design-principles.md',
      cssFiles: [],
      rulePacks: [],
      fingerprint: null,
    };
  }

  const themeDir = path.dirname(generatedPath);
  const resolveMaybe = (value) => {
    if (!value) return null;
    const raw = String(value);
    return path.isAbsolute(raw) ? raw : path.resolve(KS_ROOT, raw);
  };

  const theme = {
    ...parsed,
    id,
    themeDir,
    generatedPath,
    sourcePath: designThemeSourcePath(id),
    designStandardAbsPath: resolveMaybe(parsed.designStandardPath),
    tokensAbsPath: resolveMaybe(parsed.tokensPath),
    deterministicRulesAbsPath: resolveMaybe(parsed.deterministicRulesPath),
    aiPrinciplesAbsPath: resolveMaybe(parsed.aiPrinciplesPath),
    contractOverlaysAbsDir: resolveMaybe(parsed.contractOverlaysDir),
  };
  if (theme.tokensAbsPath && fs.existsSync(theme.tokensAbsPath)) {
    try {
      theme.tokens = JSON.parse(fs.readFileSync(theme.tokensAbsPath, 'utf8'));
    } catch {
      theme.tokens = null;
    }
  }
  return theme;
}

export function generatedThemePayloadFromParts({
  id,
  name,
  status = 'draft',
  description = '',
  source = '',
  sourceUrl = '',
  themeDir,
  designStandardPath,
  tokensPath,
  deterministicRulesPath,
  aiPrinciplesPath,
  contractOverlaysDir,
  cssFiles = [],
  rulePacks = [],
  sourceFiles = [],
}) {
  const files = [
    designStandardPath,
    tokensPath,
    deterministicRulesPath,
    aiPrinciplesPath,
    ...cssFiles,
    ...rulePacks,
  ].filter(Boolean);
  const sourceMeta = files.map((rel) => {
    const abs = path.resolve(KS_ROOT, rel);
    let fileSha = null;
    let byteLength = 0;
    try {
      const text = fs.readFileSync(abs, 'utf8');
      fileSha = sha256(text);
      byteLength = Buffer.byteLength(text, 'utf8');
    } catch {
      fileSha = null;
    }
    return { path: rel, sha256: fileSha, byteLength };
  });
  const fingerprint = sha256(JSON.stringify({
    id,
    name,
    status,
    description,
    source,
    sourceUrl,
    designStandardPath,
    tokensPath,
    deterministicRulesPath,
    aiPrinciplesPath,
    contractOverlaysDir,
    cssFiles,
    rulePacks,
    sourceMeta,
  }));
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    generator: 'tools/design-themes/build-design-theme.mjs',
    id,
    name,
    status,
    description,
    source,
    sourceUrl,
    themeRoot: relFromKs(themeDir),
    designStandardPath,
    tokensPath,
    deterministicRulesPath,
    aiPrinciplesPath,
    contractOverlaysDir,
    cssFiles,
    rulePacks,
    sourceFiles,
    sources: sourceMeta,
    fingerprint,
  };
}
