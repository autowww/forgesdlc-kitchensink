import { spawn } from 'node:child_process';
import { once } from 'node:events';

/**
 * Spawn `--start` fixture command (typically `python3 -m http.server`).
 *
 * Default stdio is fully discarded so `--start` cannot deadlock parent Node when stdout/stderr are
 * pipes (e.g. `./run-loop … 2>&1 | tee log`): forwarding `[site]` lines used to fill buffers while the
 * shell waited for the scorer to exit before tee consumed more bytes.
 *
 * Set `UX_AUDIT_FIXTURE_HTTP_VERBOSE=1` to surface `[site]` access-log-style lines again.
 *
 * @param {string | null | undefined} command
 * @param {string} cwd
 */
export function startServer(command, cwd) {
  if (!command) return null;
  const verbose = process.env.UX_AUDIT_FIXTURE_HTTP_VERBOSE === '1';
  /** @type {['ignore', 'pipe', 'pipe'] | ['ignore', 'ignore', 'ignore']} */
  const stdio = verbose ? ['ignore', 'pipe', 'pipe'] : ['ignore', 'ignore', 'ignore'];
  const child = spawn(command, {
    cwd,
    shell: true,
    stdio,
    env: { ...process.env, FORCE_COLOR: '0' },
  });
  if (verbose && child.stdout && child.stderr) {
    child.stdout.on('data', (data) => process.stdout.write(`[site] ${data}`));
    child.stderr.on('data', (data) => process.stderr.write(`[site] ${data}`));
  }
  return child;
}

/**
 * Wait for fixture HTTP server subprocess to exit (avoids zombies / stalled remediation loops).
 * @param {import('node:child_process').ChildProcess | null | undefined} server
 */
export async function stopStartedServer(server) {
  if (!server) return;
  if (server.exitCode !== null || server.signalCode !== null) return;
  try {
    server.kill('SIGTERM');
  } catch {
    return;
  }
  await Promise.race([
    once(server, 'exit'),
    new Promise((resolve) => setTimeout(resolve, 4000)),
  ]);
  if (server.exitCode === null && server.signalCode === null) {
    try {
      server.kill('SIGKILL');
    } catch {
      /* ignore */
    }
    await Promise.race([
      once(server, 'exit'),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
  }
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForReady(url, timeoutMs) {
  const started = Date.now();
  let lastError = '';
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status < 500) return;
      lastError = `HTTP ${res.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await sleep(800);
  }
  throw new Error(`Timed out waiting for ${url}. Last error: ${lastError}`);
}
