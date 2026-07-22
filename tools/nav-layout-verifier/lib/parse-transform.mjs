const DEG = Math.PI / 180;

/**
 * @typedef {object} ParsedTransform
 * @property {number|null} rotateX_deg
 * @property {number|null} rotateY_deg
 * @property {number|null} rotateZ_deg
 * @property {number|null} translateZ_px
 * @property {string} raw
 */

/**
 * @param {string} value
 * @returns {number}
 */
function toDegrees(value) {
  const trimmed = String(value).trim().toLowerCase();
  const match = trimmed.match(/^(-?\d*\.?\d+)(deg|rad|turn|grad)?$/);
  if (!match) {
    return Number.NaN;
  }
  const amount = Number(match[1]);
  const unit = match[2] || 'deg';
  switch (unit) {
    case 'rad':
      return amount / DEG;
    case 'turn':
      return amount * 360;
    case 'grad':
      return amount * 0.9;
    default:
      return amount;
  }
}

/**
 * @param {string} value
 * @returns {number}
 */
function toPixels(value) {
  const trimmed = String(value).trim().toLowerCase();
  const match = trimmed.match(/^(-?\d*\.?\d+)(px|rem|em)?$/);
  if (!match) {
    return Number.NaN;
  }
  const amount = Number(match[1]);
  const unit = match[2] || 'px';
  if (unit === 'px') {
    return amount;
  }
  return amount;
}

/**
 * @param {string} transform
 * @returns {ParsedTransform}
 */
export function parseTransformString(transform) {
  const raw = String(transform || 'none').trim();
  /** @type {ParsedTransform} */
  const out = {
    rotateX_deg: null,
    rotateY_deg: null,
    rotateZ_deg: null,
    translateZ_px: null,
    raw,
  };

  if (!raw || raw === 'none') {
    return out;
  }

  const rotateX = raw.match(/rotateX\(\s*([^)]+)\s*\)/i);
  if (rotateX) {
    out.rotateX_deg = toDegrees(rotateX[1]);
  }

  const rotateY = raw.match(/rotateY\(\s*([^)]+)\s*\)/i);
  if (rotateY) {
    out.rotateY_deg = toDegrees(rotateY[1]);
  }

  const rotateZ = raw.match(/rotateZ\(\s*([^)]+)\s*\)/i);
  if (rotateZ) {
    out.rotateZ_deg = toDegrees(rotateZ[1]);
  }

  const rotate = raw.match(/\brotate\(\s*([^)]+)\s*\)/i);
  if (rotate) {
    out.rotateZ_deg = toDegrees(rotate[1]);
  }

  const translate3d = raw.match(/translate3d\(\s*([^)]+)\s*\)/i);
  if (translate3d) {
    const parts = translate3d[1].split(',').map((part) => part.trim());
    if (parts[2]) {
      out.translateZ_px = toPixels(parts[2]);
    }
  }

  const translateZ = raw.match(/translateZ\(\s*([^)]+)\s*\)/i);
  if (translateZ) {
    out.translateZ_px = toPixels(translateZ[1]);
  }

  return out;
}

/**
 * @param {number[]} values
 * @returns {ParsedTransform}
 */
export function parseMatrix3d(values) {
  const nums = values.map((value) => Number(value));
  const raw = `matrix3d(${nums.join(', ')})`;

  const m11 = nums[0];
  const m12 = nums[1];
  const m13 = nums[2];
  const m21 = nums[4];
  const m22 = nums[5];
  const m23 = nums[6];
  const m43 = nums[14];

  const rotateY = Math.atan2(-m13, m11) / DEG;
  const rotateX = Math.atan2(m23, m22) / DEG;
  const rotateZ = Math.atan2(m12, m11) / DEG;

  return {
    rotateX_deg: Number.isFinite(rotateX) ? rotateX : null,
    rotateY_deg: Number.isFinite(rotateY) ? rotateY : null,
    rotateZ_deg: Number.isFinite(rotateZ) ? rotateZ : null,
    translateZ_px: Number.isFinite(m43) ? m43 : null,
    raw,
  };
}

/**
 * @param {number[]} values
 * @returns {ParsedTransform}
 */
export function parseMatrix2d(values) {
  const nums = values.map((value) => Number(value));
  const raw = `matrix(${nums.join(', ')})`;
  const [a, b] = nums;
  const rotateZ = Math.atan2(b, a) / DEG;
  return {
    rotateX_deg: null,
    rotateY_deg: null,
    rotateZ_deg: Number.isFinite(rotateZ) ? rotateZ : null,
    translateZ_px: null,
    raw,
  };
}

/**
 * @param {string} transform
 * @returns {ParsedTransform}
 */
export function parseTransform(transform) {
  const raw = String(transform || 'none').trim();
  if (!raw || raw === 'none') {
    return parseTransformString(raw);
  }

  const matrix3d = raw.match(/^matrix3d\((.+)\)$/i);
  if (matrix3d) {
    const values = matrix3d[1].split(',').map((part) => part.trim());
    return parseMatrix3d(values);
  }

  const matrix2d = raw.match(/^matrix\((.+)\)$/i);
  if (matrix2d) {
    const values = matrix2d[1].split(',').map((part) => part.trim());
    return parseMatrix2d(values);
  }

  return parseTransformString(raw);
}

/**
 * @param {number|null|undefined} value
 * @returns {number}
 */
export function normalizeAngleDeg(value) {
  if (value == null || Number.isNaN(value)) {
    return 0;
  }
  let angle = value % 360;
  if (angle > 180) {
    angle -= 360;
  }
  if (angle < -180) {
    angle += 360;
  }
  return angle;
}
