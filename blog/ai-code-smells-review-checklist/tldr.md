## TL;DR

You own the loop, and the AI assists within it. It fills gaps with plausible-looking code, and review is what stops that reaching main.

**The nine AI code smells to watch for in review:**

1. Abstraction Tax: a helper/class/util used exactly once.
2. Defensive Wall: try/catch and null checks on paths that can't fail.
3. Rename Alias: `const result = response` with no transformation.
4. Comment Echo: comments that restate the code instead of the _why_.
5. Complexity Mismatch: a 60-line refactor for a 3-line fix.
6. Hallucinated API: a method/import that doesn't exist; grep to verify.
7. Test Mannequin: a green test that asserts nothing meaningful.
8. Catch-All Handler: an empty `catch (e) {}` hiding real errors.
9. Polite Rewrite: unrequested cleanup widening the diff.

None is automatically a bug, but each is worth a second look. Ask: _intentional, or a gap the AI filled?_

The upstream fix is to give context before implementing. Point the assistant at the best existing example ("follow this pattern") and most smells never appear.
