## TL;DR

You own the loop; the AI assists within it. It fills gaps with plausible-looking code — review is what stops that reaching main.

**The nine AI code smells to watch for in review:**

1. **Abstraction Tax** — a helper/class/util used exactly once.
2. **Defensive Wall** — try/except and null checks on paths that can't fail.
3. **Rename Alias** — `result = response` with no transformation.
4. **Comment Echo** — comments that restate the code instead of the *why*.
5. **Complexity Mismatch** — a 60-line refactor for a 3-line fix.
6. **Hallucinated API** — a method/import that doesn't exist; grep to verify.
7. **Test Mannequin** — green test that asserts nothing meaningful.
8. **Catch-All Handler** — `except Exception: pass` hiding real errors.
9. **Polite Rewrite** — unrequested cleanup widening the diff.

None is automatically a bug — each is worth a second look. Ask: *intentional, or a gap the AI filled?*

**The upstream fix:** give context before implementing. Point the assistant at the best existing example — "follow this pattern" — and most smells never appear.
