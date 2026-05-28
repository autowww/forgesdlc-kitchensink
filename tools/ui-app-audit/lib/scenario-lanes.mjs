/**
 * Merge CLI default lanes with per-scenario smoke-plan audit_lanes.
 * @param {string[]} cliLanes
 * @param {{ audit_lanes?: string[] } | null} scenario
 * @returns {Set<string>}
 */
export function resolveScenarioLanes(cliLanes, scenario) {
  const fromScenario = Array.isArray(scenario?.audit_lanes) ? scenario.audit_lanes : null;
  const list = fromScenario?.length ? fromScenario : cliLanes;
  return new Set(
    list
      .map((s) => String(s).trim().toLowerCase())
      .filter(Boolean),
  );
}
