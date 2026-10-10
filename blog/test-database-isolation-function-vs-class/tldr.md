## TL;DR

Testing against a real database? Don't pick one isolation strategy for the whole suite. Match the fixture scope to what each test does: **reads share, writes get their own.**

- **Class scope** (`@pytest.fixture(scope="class")`): one database, created once, shared by the class. For read-only tests.
- **Function scope** (the pytest default): a fresh database per test, dropped after. For any test that writes.

```python
class TestOrderQueries:      # class scope: fast
    def test_read(self, db_query_defaults): ...

class TestOrderMutations:    # function scope: isolated
    def test_write(self, db_defaults): ...
```

**Two rules:**

- Use a random name (`test-8a2f3c9d`). Neo4j database names can't contain underscores, and names with a dash need backticks in Cypher.
- Never hardcode the name. Read it from the fixture: `conn.session(database=db_defaults)`, not `database="main"`.

**On PostgreSQL, roll back instead** (psycopg 3). Nested `conn.transaction()` blocks become savepoints:

```python
@pytest.fixture
def pg_tx(pg):  # pg: session-scoped psycopg.connect(..., autocommit=True)
    with pg.transaction(force_rollback=True):
        yield pg
```

Limits: everything must use that one connection, deferred constraints never fire (nothing commits), and concurrency tests still need a real database per test.

**TypeScript (Playwright Test):** `{ scope: 'worker' }` fixture for shared read-only data, the default `test` scope for a fresh database per test.
