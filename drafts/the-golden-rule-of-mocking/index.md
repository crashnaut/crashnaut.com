---
title: "The Golden Rule of Mocking: Mock the Boundary, Not the Code"
slug: the-golden-rule-of-mocking
description: "Most flaky, hollow test suites share one root cause — they mock the wrong things. Here's the single rule that keeps integration tests honest: mock the boundary, not your own code."
author: Mike Sell
date: 2025-12-25T00:00:00.000Z
tags: testing, mocking, qa
---

# The Golden Rule of Mocking: Mock the Boundary, Not the Code

I've reviewed a lot of test suites that pass green while production is on fire. Almost always, the cause is the same: the tests mock too much. They stub out the very code they claim to be testing, so the green checkmark proves nothing except that the mock returned what the mock was told to return.

There's one rule that fixes this, and it fits in a sentence:

> **Mock the boundary, not the code.**

If it's your code, test it for real. If it's someone else's service, mock it.

## What that means in practice

Draw a line around the system you own. Everything inside that line — your business logic, your data-access layer, your validation, your query builders, your permission checks — runs for real in tests. Everything that crosses the line into something you don't control gets mocked.

:::compare
::do[Mock these — you don't own them]
- Cloud storage reads and writes (S3 and friends)
- Third-party APIs (payments, accounting, geocoding)
- Email and notification sending
- Any external HTTP service
- Token validation against an external identity provider
::dont[Never mock these — they're yours]
- Your database queries
- Your resolvers, controllers, or handlers
- Your business-logic models
- Your data transformations
- Your authorization logic
:::

The reason is simple. A test exists to catch a regression in *your* code. The moment you mock your own resolver to "return a UUID," you've replaced the thing under test with a puppet. It can never fail, so it can never warn you.

```python
# ✗ Don't do this — you're testing the mock, not the code
with patch("api.mutations.address.create_address") as mock:
    mock.return_value = {"uuid": "abc"}
    ...  # this asserts nothing real

# ✓ Do this — your code runs for real, only the external call is faked
def test_create_address(client, fake_geocoding):
    response = client.execute(create_address_mutation, data)
    assert response.errors is None
    # the address really went through your validation, your DB, your logic
```

## The subtle part: mock payloads, not your code

Here's the distinction that trips people up. Mocking *input data* is fine. Mocking *your code's behaviour* is not.

An auth fixture that hands your code a valid token payload is mocking input — it's standing in for the identity provider at the boundary. That's correct. But reaching inside and stubbing your own permission-checking function so it always returns `True` is mocking your code. Now you're not testing whether permissions work; you're testing whether `True == True`.

Same with finding test data. Don't hardcode a UUID that only exists in one database on one machine — that's a flaky test waiting to happen. Pull a real record from your test database instead, so the test works in anyone's environment.

## Why integration-first pays off

Once the boundary is the only thing you mock, integration tests become the natural default: run a real request through the whole pipeline — routing, auth, resolver, business logic, database — against a real (isolated) database with real data. Unit tests still earn their place for pure utility functions used in many places, but they stop being the thing you reach for by reflex.

The payoff is trust. When an integration test goes green, it means the actual path a user hits actually works. When it goes red, something real broke. That's the entire point of having tests, and it's exactly what over-mocking quietly takes away.

## The one rule to remember

If you're testing your own code, run it for real. If you're crossing a boundary into a third-party service, mock it. When you're staring at a test wondering whether to patch something, ask one question: *do I own this?* If yes, let it run.
