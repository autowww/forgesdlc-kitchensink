import { spawnSync } from 'node:child_process';

/**
 * @param {string} cwd
 */
export function gitHead(cwd) {
  const r = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd, encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : 'unknown';
}
