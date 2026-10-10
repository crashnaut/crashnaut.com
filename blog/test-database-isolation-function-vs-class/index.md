---
title: "Test Database Isolation in pytest: Reads Share, Writes Get Their Own"
slug: test-database-isolation-function-vs-class
description: "Share one test database and tests leak state into each other. Give each its own and the suite crawls. Match pytest fixture scope to what each test does."
author: Mike Sell
date: 2026-10-10T11:00:00.000Z
tags: Testing Strategy, Test Architecture, pytest
---

Share one database across your integration tests and one test's writes break another test's assertions, in an order you'll only see on CI. Give every test a fresh database and the flakiness goes away, but the suite crawls. The examples here are Python and pytest against a GraphQL API backed by Neo4j, with a PostgreSQL rollback variant and a short Playwright fixture version for TypeScript readers. You'll leave with two fixture scopes, a naming rule, and a clear idea of when a transaction rollback is the cheaper option.

## The bug: state that outlives its test

Say a test credits an account with $100 and doesn't clean up. The next test in the same class creates a "new" account, expects a zero balance, and finds $100 that no code path in that test put there. Run the two tests in the other order and both pass.

<figure class="diagram">
<svg viewBox="0 0 700 310" role="img" aria-label="Timeline of two tests sharing one class-scoped database: test 1 credits 100 dollars, the balance stays in the shared database, and test 2 fails because it expected zero">
  <rect class="d-box-amber" x="270" y="44" width="420" height="222" rx="6"/>
  <text class="d-text-sm" x="480" y="62" text-anchor="middle">hazard band: state test 1 left behind</text>
  <text class="d-text-sm" x="10" y="103">test 1</text>
  <text class="d-text-sm" x="10" y="173">test 2</text>
  <text class="d-text-sm" x="10" y="240">class DB</text>
  <rect class="d-box" x="90" y="80" width="170" height="40" rx="5"/>
  <text class="d-text" x="175" y="105" text-anchor="middle">credit +$100</text>
  <rect class="d-box-red" x="300" y="150" width="230" height="40" rx="5"/>
  <text class="d-text" x="415" y="175" text-anchor="middle">expects balance $0</text>
  <circle class="d-node-red" cx="590" cy="170" r="20"/>
  <text class="d-on-fill" x="590" y="174" text-anchor="middle">FAIL</text>
  <rect class="d-box-green" x="90" y="220" width="170" height="34" rx="5"/>
  <text class="d-text" x="175" y="242" text-anchor="middle">balance $0</text>
  <rect class="d-box-red" x="280" y="220" width="390" height="34" rx="5"/>
  <text class="d-text" x="475" y="242" text-anchor="middle">balance $100 (phantom)</text>
  <path class="d-line" d="M260,110 L284,210"/>
  <path class="d-arrow" d="M286,218 l -7,-7 l 8,-2 z"/>
  <text class="d-edge" x="282" y="150" text-anchor="end">writes</text>
  <path class="d-line" d="M415,218 L415,198"/>
  <path class="d-arrow" d="M415,190 l -4,8 l 8,0 z"/>
  <text class="d-edge" x="425" y="211">reads</text>
  <path class="d-line" d="M90,286 L672,286"/>
  <path class="d-arrow" d="M680,286 l -8,-4 l 0,8 z"/>
  <text class="d-text-sm" x="380" y="302" text-anchor="middle">time: one test class, run order 1 then 2</text>
</svg>
<figcaption>Test 1 never cleans up, so everything to its right runs inside the hazard band. Test 2's failure has nothing to do with test 2's code.</figcaption>
</figure>

In a payments codebase this is the worst kind of red build, because a phantom balance looks exactly like a real ledger bug. Someone loses a morning finding out it was the test suite.

## Two isolation levels, chosen per test

Both extremes are wrong. Stop picking one strategy for the whole suite, give yourself two fixtures, and let each test choose.

**Class-scoped, for read-only tests.** One database is created once, seeded, and shared by every test in the class. Read-only tests only query it, so they can't corrupt it, and there's no reason to pay for a fresh database per test. pytest tears a `class` fixture down after the last test in the class.

**Function-scoped, for anything that writes.** Every mutation test gets a brand-new database, created before the test and dropped after it. `function` is pytest's default scope. Nothing is shared, so a write can't leak and the tests can run in any order, or in parallel.

```python:tests/test_orders.py
class TestOrderQueries:
    # read-only: class scope, one shared DB, fast
    def test_order_has_fields(self, db_query_defaults):
        result = run_query(order_query, data, database=db_query_defaults)
        assert result.errors is None

class TestOrderMutations:
    # writes: function scope, fresh DB per test, isolated
    def test_create_order(self, db_defaults):
        result = run_mutation(create_order, data, database=db_defaults)
        assert result.errors is None
        # safe to check DB state: nothing else touched this DB
```

The fixtures behind them, as a sketch with the official `neo4j` Python driver (connection config and seeding are yours to fill in):

```python:tests/conftest.py
import uuid
import pytest
from neo4j import GraphDatabase

@pytest.fixture(scope="session")
def conn():
    driver = GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH)
    yield driver
    driver.close()

def _create_db(conn):
    name = f"test-{uuid.uuid4().hex[:8]}"  # no underscores: Neo4j rejects them
    conn.execute_query(f"CREATE DATABASE `{name}` WAIT", database_="system")
    return name

def _drop_db(conn, name):
    conn.execute_query(f"DROP DATABASE `{name}` IF EXISTS", database_="system")

@pytest.fixture(scope="class")
def db_query_defaults(conn):
    name = _create_db(conn)
    seed_reference_data(conn, name)
    yield name
    _drop_db(conn, name)

@pytest.fixture  # function scope is the default
def db_defaults(conn):
    name = _create_db(conn)
    seed_reference_data(conn, name)
    yield name
    _drop_db(conn, name)
```

You only pay for full isolation where you need it. Most suites are mostly reads (mine are), so the suite stays fast and the writes still get a clean room. Two Neo4j details from the [naming rules](https://neo4j.com/docs/operations-manual/current/database-administration/standard-databases/naming-databases/): names allow letters, digits, dots and dashes but not underscores, and a name containing a dash has to be wrapped in backticks. The Neo4j docs also label [creating databases](https://neo4j.com/docs/operations-manual/current/database-administration/standard-databases/create-databases/) as an Enterprise Edition feature, so on Community Edition you'll need the cleanup approach further down.

## Use a random database name, and never hardcode it

Whichever scope a test uses, point it at a generated name like `test-8a2f3c9d`, never your default database. A test then can't reach shared or production data by accident, and the class-scoped and function-scoped databases can't collide.

The one discipline it needs: always read the name from the fixture.

:::compare
::do[Resolve the database from the fixture]

```python
with conn.session(database=db_defaults) as session:
    ...
```

::dont[Hardcode a database name]

```python
with conn.session(database="main") as session:
    ...
```

:::

Hardcode `"main"` and the test quietly runs against the shared database, which is the exact bug the fixtures exist to prevent. It passes locally, too, which is why it survives review.

## The cheaper option on PostgreSQL: roll back every test

Creating a database per test is the heavy option. On PostgreSQL there's a lighter one: open a transaction before each test and roll it back afterwards, whatever happened. With psycopg 3, `conn.transaction(force_rollback=True)` does exactly that, and any `conn.transaction()` block the code under test opens inside it [runs as a `SAVEPOINT`](https://www.psycopg.org/psycopg3/docs/basic/transactions.html) rather than a real commit.

```python:tests/conftest.py
import psycopg
import pytest

@pytest.fixture(scope="session")
def pg():
    with psycopg.connect(PG_DSN, autocommit=True) as conn:
        yield conn

@pytest.fixture
def pg_tx(pg):
    with pg.transaction(force_rollback=True):
        yield pg
```

```python:tests/test_ledger.py
def test_credit_posts_to_balance(pg_tx):
    credit(pg_tx, account_id=1, amount_cents=10_000)
    (balance,) = pg_tx.execute(
        "SELECT balance_cents FROM accounts WHERE id = 1"
    ).fetchone()
    assert balance == 10_000
```

<figure class="diagram">
<svg viewBox="0 0 700 290" role="img" aria-label="Lane diagram of a test inside an outer PostgreSQL transaction: the app code's own transaction becomes a savepoint, and the fixture rolls everything back so other sessions never see the rows">
  <text class="d-text-sm" x="10" y="71">fixture</text>
  <text class="d-text-sm" x="10" y="151">test</text>
  <text class="d-text-sm" x="10" y="238">other</text>
  <text class="d-text-sm" x="10" y="252">sessions</text>
  <rect class="d-box" x="90" y="52" width="70" height="30" rx="4"/>
  <text class="d-text" x="125" y="72" text-anchor="middle">BEGIN</text>
  <path class="d-flow" d="M160,67 L572,67"/>
  <path class="d-flow-head" d="M580,67 l -9,-5 l 0,10 z"/>
  <text class="d-edge" x="370" y="59" text-anchor="middle">outer transaction open</text>
  <rect class="d-box-red" x="582" y="52" width="100" height="30" rx="4"/>
  <text class="d-text" x="632" y="72" text-anchor="middle">ROLLBACK</text>
  <rect class="d-box" x="100" y="130" width="140" height="34" rx="4"/>
  <text class="d-text" x="170" y="152" text-anchor="middle">INSERT account</text>
  <path class="d-line" d="M240,147 L252,147"/>
  <path class="d-arrow" d="M260,147 l -8,-4 l 0,8 z"/>
  <rect class="d-box-amber" x="262" y="114" width="216" height="68" rx="5"/>
  <text class="d-edge" x="370" y="132" text-anchor="middle">SAVEPOINT</text>
  <text class="d-text" x="370" y="153" text-anchor="middle">credit(+$100)</text>
  <text class="d-edge" x="370" y="173" text-anchor="middle">RELEASE SAVEPOINT</text>
  <path class="d-line" d="M478,147 L490,147"/>
  <path class="d-arrow" d="M498,147 l -8,-4 l 0,8 z"/>
  <rect class="d-box-green" x="500" y="130" width="110" height="34" rx="4"/>
  <text class="d-text" x="555" y="152" text-anchor="middle">assert $100</text>
  <path class="d-line" d="M650,82 L650,212"/>
  <path class="d-arrow" d="M650,220 l -4,-8 l 8,0 z"/>
  <text class="d-edge" x="658" y="200">undo</text>
  <rect class="d-box-green" x="90" y="222" width="540" height="40" rx="5"/>
  <text class="d-text" x="360" y="247" text-anchor="middle">committed state: no rows from this test, ever</text>
</svg>
<figcaption>The app's own transaction runs as a savepoint inside the fixture's transaction. The test sees its $100; no other session ever does.</figcaption>
</figure>

It's fast, because nothing is created or dropped. It also has limits, and they matter for code that moves money:

- **Everything has to go through that one connection.** Code that opens its own connection or pool, or commits on its own, escapes the rollback.
- **Nothing is ever committed.** PostgreSQL checks [`DEFERRED` constraints at commit](https://www.postgresql.org/docs/current/sql-set-constraints.html), so a deferred foreign key or uniqueness rule never fires in this setup.
- **Concurrency tests don't fit.** A second session can't see uncommitted rows, so double-spend and locking tests need real commits and a function-scoped database.

Neo4j doesn't give you this trick. The Python driver allows [one open transaction per session](https://neo4j.com/docs/api/python-driver/current/api.html), so there's no nesting to hide the app's own transaction inside, and you can only roll back if the code under test accepts your transaction object. For Neo4j I stick with a database per mutation test. On Community Edition, the fallback is a function-scoped fixture that runs `MATCH (n) DETACH DELETE n` after each write test (slower, and you give up parallel runs).

| Strategy                 | Setup cost per test     | Catches                                   | Misses                                           |
| ------------------------ | ----------------------- | ----------------------------------------- | ------------------------------------------------ |
| Class-scoped shared DB   | none after the first    | query bugs on read paths                  | anything that writes                             |
| Function-scoped fresh DB | create and drop         | writes, constraints, commits, concurrency | very little                                      |
| Transaction rollback     | one BEGIN and ROLLBACK  | most write paths                          | deferred constraints, multi-connection behavior  |

## The same split in TypeScript

Playwright Test has the same idea under different names. A [`{ scope: 'worker' }` fixture](https://playwright.dev/docs/test-fixtures) is created once per worker process, and the default `test` scope gives every test its own. Worker scope is broader than a pytest class (it spans every test that worker runs), so keep it for read-only data.

```ts:tests/fixtures.ts
import { test as base } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createDatabase, dropDatabase } from './db'; // your helpers

type TestFixtures = { freshDb: string };
type WorkerFixtures = { sharedDb: string };

export const test = base.extend<TestFixtures, WorkerFixtures>({
  sharedDb: [async ({}, use, workerInfo) => {
    const name = await createDatabase(`test-w${workerInfo.workerIndex}-${randomUUID().slice(0, 8)}`);
    await use(name);
    await dropDatabase(name);
  }, { scope: 'worker' }],

  freshDb: async ({}, use) => {
    const name = await createDatabase(`test-${randomUUID().slice(0, 8)}`);
    await use(name);
    await dropDatabase(name);
  },
});
```

## Why not mock the database

A mocked database doesn't catch the bugs that actually happen: constraint violations, query mistakes, transaction edge cases, the gap between what your query says and what the engine does. I cover where the line sits in [the golden rule of mocking](/blog/the-golden-rule-of-mocking), and the "verify the state" step in [the five parts of an integration test](/blog/anatomy-of-an-integration-test) only means something when the database it reads is isolated like this. A real database with the right isolation is what makes those tests worth running. (Once they run, [read coverage as a trend](/blog/coverage-is-a-health-signal) rather than a number to push up.)

:::tip
Reads can share. Writes get their own.
:::

**Why it matters for your team:** a test that leaks a balance into the next one trains people to ignore red builds on the ledger, which is the one place you can't afford to.

Pick the scope per test, name the database randomly, and read the name from a fixture. That's the whole pattern.
