## TL;DR

Every integration test has the same five-part skeleton. Learn it and writing tests becomes mechanical.

1. **Fixtures** — what the test needs: auth, a way to execute, a DB-isolation setup fixture.
2. **Setup** — find or create the data. Never hardcode IDs; pull a real record so it runs anywhere.
3. **Load & execute** — load the request + payload, patch what this test needs, run it for real.
4. **Assert the response** — check **errors first**, then shape, values, counts.
5. **Verify state (writes only)** — go to the DB and confirm the change actually landed.

```python
async def test_create_order(self, admin_auth, execute, db_defaults, db, test_db):
    mutation, data = load_assets("order", "create_order")
    data["details"]["name"] = "Test Order"
    response = await execute(mutation, data)
    assert response.errors is None          # errors first
    uuid = response.data["upsertOrder"]["uuid"]
    with db.session(database=test_db) as session:   # verify state
        row = session.run("MATCH (s:Order {uuid:$u}) RETURN s.name AS name", u=uuid).single()
        assert row["name"] == "Test Order"
```

Reads stop at step 4; writes don't skip step 5.
