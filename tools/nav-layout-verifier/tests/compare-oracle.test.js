import assert from 'node:assert/strict';
import test from 'node:test';

import { compareOracle, compareScenario } from '../lib/compare-oracle.mjs';

test('compareScenario passes matching computed and attributes', () => {
  const scenario = {
    id: 'default_static',
    expect: {
      root_selector: '[data-ks-hash="Tlz"]',
      computed: { transform_style: 'preserve-3d' },
      attributes: { 'data-ks-type': 'component', 'data-ks-hash': 'Tlz' },
    },
  };

  const collected = {
    computed: { transformStyle: 'preserve-3d' },
    attributes: { 'data-ks-type': 'component', 'data-ks-hash': 'Tlz' },
  };

  const result = compareScenario(scenario, collected);
  assert.equal(result.pass, true);
  assert.equal(result.score, 1);
});

test('compareScenario enforces rotateY minimum', () => {
  const scenario = {
    id: 'tilted',
    expect: {
      transform: { rotateY_deg_min: 15 },
    },
  };

  const pass = compareScenario(scenario, {
    transform: 'rotateX(12deg) rotateY(-18deg) translateZ(24px)',
  });
  assert.equal(pass.pass, true);

  const fail = compareScenario(scenario, {
    transform: 'rotateY(5deg)',
  });
  assert.equal(fail.pass, false);
});

test('compareScenario enforces reduced-motion flat ceiling', () => {
  const scenario = {
    id: 'reduced_motion_flat',
    expect: {
      transform: { rotateY_deg_max: 5 },
    },
  };

  const pass = compareScenario(scenario, { transform: 'none' });
  assert.equal(pass.pass, true);

  const fail = compareScenario(scenario, {
    transform: 'rotateY(45deg)',
  });
  assert.equal(fail.pass, false);
});

test('compareOracle aggregates scenario scores', () => {
  const oracle = {
    hash: 'Tlz',
    slug: 'tilt-css',
    threshold: 1,
    scenarios: [
      {
        id: 'default_static',
        expect: {
          attributes: { 'data-ks-hash': 'Tlz' },
        },
      },
      {
        id: 'tilted',
        expect: {
          transform: { rotateY_deg_min: 10 },
        },
      },
    ],
  };

  const results = [
    {
      id: 'default_static',
      collected: {
        attributes: { 'data-ks-hash': 'Tlz' },
      },
    },
    {
      id: 'tilted',
      collected: {
        transform: 'rotateY(20deg)',
      },
    },
  ];

  const report = compareOracle(oracle, results);
  assert.equal(report.pass, true);
  assert.equal(report.score, 1);
  assert.equal(report.scenarios.length, 2);
});

test('compareOracle fails when below threshold', () => {
  const oracle = {
    threshold: 1,
    scenarios: [
      {
        id: 'only',
        expect: {
          attributes: { 'data-ks-hash': 'X' },
        },
      },
    ],
  };

  const report = compareOracle(oracle, [
    {
      id: 'only',
      collected: {
        attributes: { 'data-ks-hash': 'Y' },
      },
    },
  ]);

  assert.equal(report.pass, false);
  assert.equal(report.scenarios[0].pass, false);
});
