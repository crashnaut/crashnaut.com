---
title: "Test Database Isolation: Function vs Class Scope"
slug: test-database-isolation-function-vs-class
description: "Integration tests need a real database — but shared state makes them flaky and per-test databases make them slow. The fix is matching isolation scope to what the test actually does: reads share, writes get their own."
author: Mike Sell
date: 2026-02-03T00:00:00.000Z
tags: testing, databases, qa
---

# Test Database Isolation: Function vs Class Scope

If you test against a real database — and you should — you eventually hit the same fork in the road. Share one database across your tests and they start stepping on each other: one test's writes break another test's assertions, and you get failures that only appear in certain orders. Give every test its own fresh database and the flakiness disappears, but now your suite crawls because you're spinning up and tearing down a database hundreds of times.

Both extremes are wrong. The trick is to stop picking one globally and instead **match the isolation scope to what each test actually does.**

The rule of thumb:

> **Reads can share. Writes get their own.**

## Two isolation levels

Give yourself two setup fixtures and let each test choose.

**Class-scoped — for read-only tests.** One database is created once and shared across every test in the class. Read-only tests can't corrupt shared state — they only query it — so there's no reason to pay for a fresh database per test. Create it once, reuse it, tear it down when the class finishes.

**Function-scoped — for mutation tests.** Any test that writes gets a brand-new database, created before the test and dropped after. Because nothing is shared, a write in one test can never leak into another, and tests can run in any order (or in parallel) without interfering.

```python
class TestSubmissionQueries:
    # read-only → class scope, one shared DB, fast
    def test_submission_has_fields(self, db_query_defaults, db):
        result = run_query(submission_query, data)
        assert result.errors is None

class TestSubmissionMutations:
    # writes → function scope, fresh DB per test, isolated
    def test_create_submission(self, db_defaults, db):
        result = run_mutation(create_submission, data)
        assert result.errors is None
        # safe to verify DB state — nothing else touched this DB
```

The win is that you only pay the cost of full isolation where you actually need it. A suite that's mostly reads (and most are) stays fast, while the writes that genuinely need isolation get it.

## Use a randomly named database, never a fixed one

Whichever scope a test uses, point it at a database with a generated name — something like `test_8a2f3c9d` — rather than your default database. Two reasons:

- It guarantees a test can never accidentally hit shared or production data.
- It lets the function-scoped and class-scoped strategies coexist without colliding.

The one discipline this requires: **never hardcode the database name in a test.** Expose the current test's database through a fixture and always read it from there. Hardcode `"main"` or `"default"` and you'll silently reach into the shared database — exactly the bug isolation was meant to prevent.

```python
# ✗ hardcoded — hits the shared database
with conn.session(database="main") as session:
    ...

# ✓ always resolve the current test's database from a fixture
with conn.session(database=test_db_name) as session:
    ...
```

## Why bother instead of just mocking the DB?

Because a mocked database doesn't catch the bugs that actually happen — constraint violations, query mistakes, transaction edge cases, the gap between what your query *says* and what the engine *does*. Testing against a real database with real isolation is what makes an integration test worth running. The function-vs-class split is simply how you keep that honesty without making the suite painful to run.

Pick the scope per test, name the database randomly, and never hardcode it. That's the whole pattern.
