# E05 — Verify and build (ENT.APP Phase A)

**Phase:** E05  
**Executor:** Composer / Bash  
**Depends on:** E04

## Goal

Run verification bundle; fix any failures; Grok runs E06 consistency gate.

## Commands (run in order)

```bash
cd /home/lzvyahin/Code/forgesdlc-kitchensink

# Ruleset unit tests
node --test tools/studio-ux-pdca/lib/enterprise-app-ruleset.test.mjs

# Rule page manifest (FORM must not be missing)
cd tools/website-ux-auditor && npm run pagegen:manifest
cd ../..

# Confirm FORM rule status
node -e "
const m=require('./docs/design/ux-audit/rule-pages/rule-pages.manifest.json');
const r=m.rules.find(x=>x.id==='DET.FORM.LABEL_ERROR_SUMMARY');
console.log('FORM status:', r?.status);
if(r?.status==='missing') process.exit(1);
"

# Showcase build
python3 generator/build-showcase.py

# Python ruleset loader smoke
python3 -c "
import sys; sys.path.insert(0,'tools/studio-ux-pdca')
from lib.load_ruleset import format_prompt_appendix
a=format_prompt_appendix()
assert 'DET.STUDIO.JOB_BUDGET' in a
assert 'DET.SECTION.SINGLE_JOB' not in a
print('prompt appendix ok', len(a))
"
```

## E06 consistency checklist (for Grok)

- standard ↔ YAML ↔ ruleset JSON ↔ assess prompt aligned
- Phase B compositions only in `known_gaps` / backlog
- ux-audit README links enterprise-app folder

## On failure

Re-open the failing E0n spike with error output; do not skip gates.

## Report

Exit codes for each command; FORM manifest status; any showcase warnings.
