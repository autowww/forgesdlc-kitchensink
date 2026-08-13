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
  assert.ok(rs.rules.length >= 10);
});

test("studio rules are in pack", () => {
  const ids = ruleIdsInPack();
  assert.ok(ids.includes("DET.STUDIO.JOB_BUDGET"));
  assert.ok(ids.includes("DET.STUDIO.TITLE_NAV_MATCH"));
  assert.ok(!ids.includes("DET.SECTION.SINGLE_JOB"));
});

test("prompt appendix mentions JOB_BUDGET", () => {
  const md = formatRulesetPromptAppendix("https://ks.forgesdlc.com");
  assert.match(md, /DET\.STUDIO\.JOB_BUDGET/);
  assert.match(md, /det-studio-job-budget\.html/);
});

test("isAllowedRuleId", () => {
  assert.equal(isAllowedRuleId("DET.APP.PRIMARY_CTA"), true);
  assert.equal(isAllowedRuleId("DET.SECTION.SINGLE_JOB"), false);
  assert.equal(isAllowedRuleId(null), true);
});
