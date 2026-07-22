import { normalizeAngleDeg, parseTransform } from './parse-transform.mjs';

/**
 * @typedef {object} ScenarioCheck
 * @property {string} field
 * @property {boolean} pass
 * @property {*} actual
 * @property {*} expected
 */

/**
 * @param {Record<string, unknown>} constraints
 * @param {import('./parse-transform.mjs').ParsedTransform} parsed
 * @returns {ScenarioCheck[]}
 */
function compareTransformConstraints(constraints, parsed) {
  const checks = [];
  const axes = ['rotateX', 'rotateY', 'rotateZ'];
  for (const axis of axes) {
    const value = parsed[`${axis}_deg`];
    const minKey = `${axis}_deg_min`;
    const maxKey = `${axis}_deg_max`;
    if (constraints[minKey] != null) {
      const actual = Math.abs(normalizeAngleDeg(value));
      const expected = Number(constraints[minKey]);
      checks.push({
        field: minKey,
        pass: actual >= expected,
        actual,
        expected: `>= ${expected}`,
      });
    }
    if (constraints[maxKey] != null) {
      const actual = Math.abs(normalizeAngleDeg(value));
      const expected = Number(constraints[maxKey]);
      checks.push({
        field: maxKey,
        pass: actual <= expected,
        actual,
        expected: `<= ${expected}`,
      });
    }
  }

  if (constraints.translateZ_px_min != null) {
    const actual = parsed.translateZ_px ?? 0;
    const expected = Number(constraints.translateZ_px_min);
    checks.push({
      field: 'translateZ_px_min',
      pass: actual >= expected,
      actual,
      expected: `>= ${expected}`,
    });
  }

  if (constraints.translateZ_px_max != null) {
    const actual = parsed.translateZ_px ?? 0;
    const expected = Number(constraints.translateZ_px_max);
    checks.push({
      field: 'translateZ_px_max',
      pass: actual <= expected,
      actual,
      expected: `<= ${expected}`,
    });
  }

  return checks;
}

/**
 * @param {Record<string, string>} expected
 * @param {Record<string, string>} actual
 * @returns {ScenarioCheck[]}
 */
function compareComputed(expected, actual) {
  const checks = [];
  for (const [key, expectedValue] of Object.entries(expected)) {
    const cssKey = key.replace(/_([a-z])/g, (_, ch) => ch.toUpperCase());
    const actualValue = actual[cssKey] ?? actual[key];
    checks.push({
      field: `computed.${key}`,
      pass: String(actualValue) === String(expectedValue),
      actual: actualValue,
      expected: expectedValue,
    });
  }
  return checks;
}

/**
 * @param {Record<string, string>} expected
 * @param {Record<string, string>} actual
 * @returns {ScenarioCheck[]}
 */
function compareAttributes(expected, actual) {
  const checks = [];
  for (const [key, expectedValue] of Object.entries(expected)) {
    const actualValue = actual[key];
    checks.push({
      field: `attributes.${key}`,
      pass: String(actualValue) === String(expectedValue),
      actual: actualValue,
      expected: expectedValue,
    });
  }
  return checks;
}

/**
 * @param {object} scenario
 * @param {object} collected
 * @returns {{ pass: boolean, score: number, checks: ScenarioCheck[], actual: object }}
 */
export function compareScenario(scenario, collected) {
  const expect = scenario.expect || {};
  /** @type {ScenarioCheck[]} */
  const checks = [];

  if (expect.computed) {
    checks.push(...compareComputed(expect.computed, collected.computed || {}));
  }

  if (expect.attributes) {
    checks.push(...compareAttributes(expect.attributes, collected.attributes || {}));
  }

  if (expect.transform) {
    const parsed = parseTransform(collected.transform || 'none');
    checks.push(...compareTransformConstraints(expect.transform, parsed));
    collected = { ...collected, parsedTransform: parsed };
  }

  const pass = checks.length > 0 && checks.every((check) => check.pass);
  const score = checks.length === 0 ? 0 : checks.filter((check) => check.pass).length / checks.length;

  return {
    pass,
    score,
    checks,
    actual: collected,
  };
}

/**
 * @param {object} oracle
 * @param {Array<{ id: string, collected: object }>} results
 * @returns {{ pass: boolean, score: number, scenarios: object[] }}
 */
export function compareOracle(oracle, results) {
  const threshold = oracle.threshold ?? 1;
  const byId = new Map(results.map((result) => [result.id, result.collected]));

  const scenarios = (oracle.scenarios || []).map((scenario) => {
    const collected = byId.get(scenario.id) || {};
    const compared = compareScenario(scenario, collected);
    return {
      id: scenario.id,
      pass: compared.pass,
      score: compared.score,
      checks: compared.checks,
      actual: compared.actual,
    };
  });

  const score =
    scenarios.length === 0
      ? 0
      : scenarios.reduce((sum, scenario) => sum + scenario.score, 0) / scenarios.length;
  const pass = score >= threshold && scenarios.every((scenario) => scenario.pass);

  return { pass, score, scenarios };
}
