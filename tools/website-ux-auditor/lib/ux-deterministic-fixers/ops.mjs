import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * @param {string} filePath
 */
export async function readUtf8(filePath) {
  return fs.readFile(filePath, 'utf8');
}

/**
 * @param {string} filePath
 * @param {string} content
 */
export async function writeUtf8(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

/**
 * @param {string} html
 * @param {string} title
 */
export function setDocumentTitle(html, title) {
  const escaped = title.replace(/</g, '&lt;');
  if (/<title[^>]*>/i.test(html)) {
    return html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, `<title>${escaped}</title>`);
  }
  return html.replace(/<head([^>]*)>/i, `<head$1>\n  <title>${escaped}</title>`);
}

/**
 * @param {string} html
 * @param {string} description
 */
export function setMetaDescription(html, description) {
  const escaped = description.replace(/"/g, '&quot;');
  const tag = `<meta name="description" content="${escaped}" />`;
  if (/<meta[^>]+name=["']description["']/i.test(html)) {
    return html.replace(/<meta[^>]+name=["']description["'][^>]*\/?>/i, tag);
  }
  return html.replace(/<head([^>]*)>/i, `<head$1>\n  ${tag}`);
}

/**
 * Sync hash and data-ks-hash on an element opening tag string.
 * @param {string} openTag e.g. '<div hash="Abx" ...>'
 * @param {string} hash three-letter hash
 */
export function syncHashAttrsOnOpenTag(openTag, hash) {
  let tag = openTag;
  if (/hash=["']/i.test(tag)) {
    tag = tag.replace(/hash=["'][^"']*["']/i, `hash="${hash}"`);
  } else {
    tag = tag.replace(/^<(\w+)/, `<$1 hash="${hash}"`);
  }
  if (/data-ks-hash=["']/i.test(tag)) {
    tag = tag.replace(/data-ks-hash=["'][^"']*["']/i, `data-ks-hash="${hash}"`);
  } else {
    tag = tag.replace(/^<(\w+[^>]*)/, `<$1 data-ks-hash="${hash}"`);
  }
  return tag;
}

/**
 * @param {string} dir
 * @param {RegExp} pattern
 */
export async function findFilesRecursive(dir, pattern) {
  /** @type {string[]} */
  const out = [];
  async function walk(d) {
    let entries;
    try {
      entries = await fs.readdir(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules' || ent.name === '.git') continue;
        await walk(full);
      } else if (pattern.test(ent.name)) {
        out.push(full);
      }
    }
  }
  await walk(dir);
  return out;
}

/**
 * @param {string} repoRoot
 */
export function defaultWebsiteRoots(repoRoot) {
  return defaultAppRoots(repoRoot);
}

/**
 * HTML search roots for static sites and Forge app shells (Studio, etc.).
 * @param {string} repoRoot
 */
export function defaultAppRoots(repoRoot) {
  return [
    path.join(repoRoot, 'website'),
    path.join(repoRoot, 'showcase'),
    path.join(repoRoot, 'forge_accessibility', 'static'),
    path.join(repoRoot, 'forge_accessibility', 'static', 'partials'),
    repoRoot,
  ];
}
