import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UI_APP_AUDIT_ROOT = path.resolve(__dirname, '..');
export const KS_ROOT_DEFAULT = path.resolve(UI_APP_AUDIT_ROOT, '../..');
export const UX_AUDITOR_ROOT = path.resolve(UI_APP_AUDIT_ROOT, '../website-ux-auditor');
export const A11Y_AUDITOR_ROOT = path.resolve(UI_APP_AUDIT_ROOT, '../website-a11y-auditor');
