import fs from 'node:fs/promises';

/**
 * Remove or mark completed todos for ruleIds that passed fixer verify.
 * @param {string} planPath forge-ux-remediation.plan.md
 * @param {string[]} fixedRuleIds rule ids with verifyOk
 */
export async function trimRemediationPlan(planPath, fixedRuleIds) {
  if (!fixedRuleIds.length) return { trimmed: 0 };
  let text;
  try {
    text = await fs.readFile(planPath, 'utf8');
  } catch {
    return { trimmed: 0, error: 'plan missing' };
  }

  const fixed = new Set(fixedRuleIds);
  let trimmed = 0;
  const lines = text.split('\n');
  const out = [];
  let inFront = false;
  let inTodos = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '---' && i < 30) {
      inFront = !inFront;
      out.push(line);
      continue;
    }
    if (inFront && line.startsWith('todos:')) {
      inTodos = true;
      out.push(line);
      continue;
    }
    if (inFront && inTodos) {
      const todoMatch = line.match(/^\s*-\s+id:\s*(ux-[\w.-]+)/);
      if (todoMatch) {
        const todoId = todoMatch[1];
        const ruleFromTodo = todoId.replace(/^ux-/, '').replace(/-/g, '.').replace(/\.([A-Z]{2,})\./g, '.$1.');
        // Match DET.HASH.MARKERS style: ux-det-hash-markers → DET.HASH.MARKERS
        const normalized = todoId
          .replace(/^ux-/, '')
          .split('-')
          .map((p, idx) => (idx === 0 ? p.toUpperCase() : p.toUpperCase()))
          .join('.')
          .replace(/^DET\./, 'DET.')
          .replace(/\.([a-z])/g, (_, c) => `.${c.toUpperCase()}`);
        let matchedRule = null;
        for (const rid of fixed) {
          const kebab = rid.toLowerCase().replace(/\./g, '-');
          if (todoId.includes(kebab) || todoId === `ux-${kebab}`) {
            matchedRule = rid;
            break;
          }
        }
        if (!matchedRule) {
          for (const rid of fixed) {
            if (line.toLowerCase().includes(rid.toLowerCase().replace(/\./g, '-'))) {
              matchedRule = rid;
              break;
            }
          }
        }
        if (matchedRule) {
          trimmed += 1;
          out.push(line);
          if (lines[i + 1]?.match(/^\s+status:/)) {
            i += 1;
            out.push('    status: completed');
            continue;
          }
          continue;
        }
      }
      if (inTodos && line.match(/^\S/) && !line.match(/^\s+-/)) {
        inTodos = false;
      }
    }
    out.push(line);
  }

  // Body section: mark sections for fixed rules
  let body = out.join('\n');
  for (const rid of fixed) {
    const slug = rid.toLowerCase().replace(/\./g, '-');
    const re = new RegExp(`(###\\s+${rid.replace(/\./g, '\\.')}[\\s\\S]*?)(?=###\\s+|$)`, 'g');
    body = body.replace(re, (block) => {
      if (block.includes('fixer: completed')) return block;
      return `${block.trim()}\n\n_fixer: completed (deterministic fixer verified)._ \n\n`;
    });
    if (!body.includes(rid)) {
      body = body.replace(new RegExp(`(${slug})`, 'gi'), `$1 _(fixer verified)_`);
    }
  }

  await fs.writeFile(planPath, body, 'utf8');
  return { trimmed, fixedRuleIds: [...fixed] };
}

/**
 * Simpler YAML todo status update by rule id substring in todo id/content.
 * @param {string} planPath
 * @param {Set<string>} verifiedRuleIds
 */
export async function markPlanTodosCompletedForRules(planPath, verifiedRuleIds) {
  let text = await fs.readFile(planPath, 'utf8');
  const fmEnd = text.indexOf('\n---', 4);
  if (fmEnd < 0) return { trimmed: 0 };
  const front = text.slice(0, fmEnd);
  const body = text.slice(fmEnd);

  let trimmed = 0;
  const lines = front.split('\n');
  const out = [];
  let currentTodoId = '';
  for (const line of lines) {
    const idM = line.match(/^\s*-?\s*id:\s*(\S+)/);
    if (idM) currentTodoId = idM[1];
    const statusM = line.match(/^(\s+)status:\s*(\S+)/);
    if (statusM && currentTodoId) {
      const hit = [...verifiedRuleIds].some((rid) => {
        const slug = rid.toLowerCase().replace(/\./g, '-');
        return currentTodoId.toLowerCase().includes(slug);
      });
      if (hit) {
        out.push(`${statusM[1]}status: completed`);
        trimmed += 1;
        continue;
      }
    }
    out.push(line);
  }
  await fs.writeFile(planPath, `${out.join('\n')}${body}`, 'utf8');
  return { trimmed };
}
