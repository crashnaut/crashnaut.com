## TL;DR

**The rule:** Mock the boundary, not the code.

- **Own it?** Test it for real — your DB, resolvers, business logic, auth checks.
- **Don't own it?** Mock it — third-party APIs, cloud storage, email, payments.

**The trap:** Mocking your own code makes tests pass without proving anything. A stubbed resolver can't fail, so it can't warn you.

**The subtlety:** Mocking *input payloads* (e.g. an auth token at the boundary) is fine. Mocking *your code's behaviour* is not.

**Practical fixes:**

```python
# ✗ stubbing your own resolver — tests nothing
with patch("api.create_address") as mock:
    mock.return_value = {"uuid": "abc"}

# ✓ real code runs, only the external call is faked
response = client.execute(create_address_mutation, data)
assert response.errors is None
```

- Don't hardcode UUIDs — pull a real record from the test DB so tests run anywhere.
- Default to integration tests through the whole pipeline; keep unit tests for high-reuse utilities.

**When in doubt:** ask *"do I own this?"* If yes, let it run.
