import process from 'node:process';

/**
 * When stdout/stderr are pipes or files (non-TTY), the libc layer may fully buffer
 * writes — operators see no `[ux-audit]` lines until the process exits or the buffer fills.
 * Sitewide scorer stderr lines looked “live” while auditor stdout looked frozen after handoff.
 *
 * @see https://nodejs.org/api/process.html#a-note-on-process-io
 */
export function ensureBlockingStdio() {
  for (const stream of [process.stdout, process.stderr]) {
    try {
      if (stream.isTTY) continue;
      const handle = /** @type {{ setBlocking?: (b: boolean) => void }} */ (stream)._handle;
      if (handle && typeof handle.setBlocking === 'function') {
        handle.setBlocking(true);
      }
    } catch {
      /* ignore */
    }
  }
}
