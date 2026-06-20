---
title: "The Anatomy of an Integration Test"
slug: anatomy-of-an-integration-test
description: "Once you see the five-part shape every integration test shares, writing them stops being creative work and becomes mechanical — in the good way."
author: Mike Sell
date: 2026-01-07T00:00:00.000Z
tags: testing, qa, integration-tests
---

# The Anatomy of an Integration Test

People treat writing tests as a creative act, agonising over each one from a blank file. It isn't. A good integration test has the same five-part skeleton every time. Once you internalise the shape, writing tests becomes mechanical — and mechanical is exactly what you want, because it means you spend your thinking on *what* to test, not *how* to structure it.

Here are the five parts.

## 1. Fixtures

Declare what the test needs: an authenticated user, a way to execute requests against the system, and a setup fixture that decides how your test database is isolated. Fixtures are the test's inputs — the boundary where you stand in for things outside the system (like an auth token) without faking the system itself.

## 2. Setup

Get the data the test will act on. Either the default seed data is enough, or you find a real record in the test database, or you create one with a factory helper. The rule that keeps this honest: don't hardcode IDs. A UUID pasted into a test only exists in one database on one machine, so the test becomes flaky or fails outright in anyone else's environment. Pull a real record instead.

## 3. Load and execute

Load the request — the query or mutation — and its input payload, patch in whatever this particular test needs, and run it against the real system. This is the line where the work actually happens.

## 4. Assert the response

Check the result, and check errors *first*. Assert there were no errors before you reach into the response data — otherwise a failed call throws a confusing `KeyError` or `None` access instead of a clear "this returned an error" failure. Then verify the shape, the values, and the counts you expect.

## 5. Verify the state (writes only)

For anything that mutates data, the response saying "OK" isn't proof. Go to the database and confirm the change actually landed — the node exists, the field holds the value you sent. Read-only tests stop at step 4; write tests don't get to skip step 5.

## What it looks like together

```python
async def test_create_order(self, admin_auth, execute, db_defaults, db, test_db):
    # 2 — setup (default seed data is enough here)

    # 3 — load & execute
    mutation, data = load_assets("order", "create_order")
    data["details"]["name"] = "Test Order"
    response = await execute(mutation, data)

    # 4 — assert the response (errors first!)
    assert response.errors is None
    uuid = response.data["upsertOrder"]["uuid"]
    assert uuid is not None

    # 5 — verify the database state
    with db.session(database=test_db) as session:
        row = session.run(
            "MATCH (s:Order {uuid: $uuid}) RETURN s.name AS name",
            uuid=uuid,
        ).single()
        assert row["name"] == "Test Order"
```

Fixtures, setup, execute, assert, verify. Every test you write fits this mould, and the ones that don't are usually the ones hiding a problem — a missing state check, a hardcoded ID, an assertion that never looks at the data. Learn the skeleton, and writing tests becomes filling in five blanks instead of facing an empty file.
