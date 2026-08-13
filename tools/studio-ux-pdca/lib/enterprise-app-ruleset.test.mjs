#!/usr/bin/env node
import assert from "node:assert/strict";
import test from "node:test";
import {
  formatRulesetPromptAppendix,
  isAllowedRuleId,
  loadEnterpriseAppRuleset,
  ruleIdsInPack,
} from "./load-ruleset.mjs";

test("enterprise app ruleset loads", () => {
  const rs = loadEnterpriseAppRuleset();
  assert.equal(rs.schemaVersion, 1);
  assert.ok(rs.rules.length >= 20);
  assert.ok(rs.enterpriseAppContractsPath);
});

test("studio rules are in pack", () => {
  const ids = ruleIdsInPack();
  assert.ok(ids.includes("DET.STUDIO.JOB_BUDGET"));
  assert.ok(ids.includes("DET.STUDIO.TITLE_NAV_MATCH"));
  assert.ok(!ids.includes("DET.SECTION.SINGLE_JOB"));
});

test("widened DET.APP and FORM rules are in pack", () => {
  const ids = ruleIdsInPack();
  for (const id of [
    "DET.APP.BULK_ACTION_SCOPE",
    "DET.APP.DATA_REFRESH_STALENESS",
    "DET.APP.EMPTY_LOADING_ERROR_SUCCESS",
    "DET.APP.DISABLED_REASON",
    "DET.APP.TOAST_LIFECYCLE",
    "DET.APP.PRIMARY_STATE",
    "DET.APP.WORK_STATE_PERSISTENCE",
    "DET.APP.AI_PROVENANCE",
    "DET.FORM.LABEL_ERROR_SUMMARY",
  ]) {
    assert.ok(ids.includes(id), `missing ${id}`);
  }
});

test("ksComponents include React primitives", () => {
  const rs = loadEnterpriseAppRuleset();
  const ids = rs.ksComponents.map((c) => c.id);
  for (const hash of ["Frh", "Fsb", "Fwb", "Dtb", "Swz", "Fpw", "Fix", "Fai", "Fqw", "Fes"]) {
    assert.ok(ids.includes(hash), `missing ksComponent ${hash}`);
  }
});

test("rules may include principles field", () => {
  const rs = loadEnterpriseAppRuleset();
  const bulk = rs.byId.get("DET.APP.BULK_ACTION_SCOPE");
  assert.ok(bulk?.principles?.includes("ENT.APP.05"));
});

test("prompt appendix mentions JOB_BUDGET and enterprise-app path", () => {
  const md = formatRulesetPromptAppendix("https://ks.forgesdlc.com");
  assert.match(md, /DET\.STUDIO\.JOB_BUDGET/);
  assert.match(md, /det-studio-job-budget\.html/);
  assert.match(md, /DET\.FORM\.LABEL_ERROR_SUMMARY/);
  assert.match(md, /enterprise-app\/README\.md/);
  assert.doesNotMatch(md, /\| `DET\.SECTION\.SINGLE_JOB`/);
});

test("isAllowedRuleId", () => {
  assert.equal(isAllowedRuleId("DET.APP.PRIMARY_CTA"), true);
  assert.equal(isAllowedRuleId("DET.FORM.LABEL_ERROR_SUMMARY"), true);
  assert.equal(isAllowedRuleId("DET.SECTION.SINGLE_JOB"), false);
  assert.equal(isAllowedRuleId(null), true);
});
