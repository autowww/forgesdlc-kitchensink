# axe rules without WCAG success-criterion tags

Generated from `export-axe-catalog.mjs`. **30** of **104** axe rules have no Deque WCAG tag mapping (`unmappable: true`).

These rules still run in the **axe** lane but do not appear as RTM rows tied to a WCAG SC. Treat them as best-practice or Deque-specific checks; document failures in audit reports under `AXE.*` without implying SC coverage.

| axe rule id | Description | Tags (sample) |
|-------------|-------------|---------------|
| `undefined` | Ensure every accesskey attribute value is unique | — |
| `undefined` | Ensure role="text" is used on elements with no focusable descendants | — |
| `undefined` | Ensure every ARIA treeitem node has an accessible name | — |
| `undefined` | Ensure role attribute has an appropriate value for the element | — |
| `undefined` | Ensure headings have discernible text | — |
| `undefined` | Ensure table headers have discernible text | — |
| `undefined` | Ensure elements in the focus order have a role appropriate for interactive content | — |
| `undefined` | Ensure <iframe> and <frame> elements contain the axe-core script | — |
| `undefined` | Ensure the order of headings is semantically correct | — |
| `undefined` | Inform users about hidden content. | — |
| `undefined` | Ensure image alternative is not repeated as text | — |
| `undefined` | Ensure that every form element has a visible label and is not solely labeled using hidden labels, or the title or aria-describedby attributes | — |
| `undefined` | Ensure the banner landmark is at top level | — |
| `undefined` | Ensure the complementary landmark or aside is at top level | — |
| `undefined` | Ensure the contentinfo landmark is at top level | — |
| `undefined` | Ensure the main landmark is at top level | — |
| `undefined` | Ensure the document has at most one banner landmark | — |
| `undefined` | Ensure the document has at most one contentinfo landmark | — |
| `undefined` | Ensure the document has at most one main landmark | — |
| `undefined` | Ensure the document has a main landmark | — |
| `undefined` | Ensure landmarks are unique | — |
| `undefined` | Ensure <meta name="viewport"> can scale a significant amount | — |
| `undefined` | Ensure every ARIA dialog and alertdialog node has an accessible name | — |
| `undefined` | Ensure that the page, or at least one of its frames contains a level-one heading | — |
| `undefined` | Ensure elements marked as presentational do not have global ARIA or tabindex so that all screen readers ignore them | — |
| `undefined` | Ensure all page content is contained by landmarks | — |
| `undefined` | Ensure the scope attribute is used correctly on tables | — |
| `undefined` | Ensure all skip links have a focusable target | — |
| `undefined` | Ensure tabindex attribute values are not greater than 0 | — |
| `undefined` | Ensure the <caption> element does not contain the same text as the summary attribute | — |

## Refresh

```bash
cd tools/website-a11y-auditor
npm run export-axe-catalog
```

