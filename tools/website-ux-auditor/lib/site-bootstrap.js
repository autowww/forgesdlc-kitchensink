import { spawn } from 'node:child_process';

export function startServer(command, cwd) {
  if (!command) return null;
  const child = spawn(command, { cwd, shell: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, FORCE_COLOR: '0' } });
  child.stdout.on('data', (data) => process.stdout.write(`[site] ${data}`));
  child.stderr.on('data', (data) => process.stderr.write(`[site] ${data}`));
  return child;
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
