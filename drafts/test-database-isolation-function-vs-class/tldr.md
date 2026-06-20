## TL;DR

Testing against a real DB? Don't pick one global isolation strategy. Match scope to what the test does.

> **Reads can share. Writes get their own.**

- **Class scope** — one DB created once, shared across the class. Use for read-only tests. Fast, and reads can't corrupt shared state.
- **Function scope** — a fresh DB per test, dropped after. Use for any write. Tests can't leak into each other; safe to run in any order or in parallel.

```python
class TestQueries:        # class scope → fast
    def test_read(self, db_query_defaults, db): ...

class TestMutations:      # function scope → isolated
    def test_write(self, db_defaults, db): ...
```

**Two non-negotiables:**

- Use a randomly named test DB (`test_8a2f3c9d`), never your default DB.
- Never hardcode the DB name — resolve it from a fixture, or you'll silently hit shared data.

```python
# ✗ hardcoded — hits the shared database
with conn.session(database="main") as session:
    ...

# ✓ always resolve the current test's database from a fixture
with conn.session(database=test_db_name) as session:
    ...
```

**Why not just mock the DB?** Mocks don't catch constraint violations, bad queries, or transaction edge cases. Real DB + right-sized isolation = honest tests without a slow suite.
