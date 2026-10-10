---
title: "Every Integration Test Has the Same Five Parts"
slug: anatomy-of-an-integration-test
description: "Two questions to ask before you write a test, then the five parts every one shares, worked through a create-payment test that checks the ledger."
author: Mike Sell
date: 2026-05-21T00:00:00.000Z
tags: Testing Strategy, Playwright, GraphQL, TypeScript
---

The integration tests I trust least share one gap: they check the response and never look at what landed in the database. In a payments API, that's the test that stays green while a retry posts the same debit twice. This post gives you two questions to ask before you write a test, then the five-part shape I use for every one, worked through a "create payment" mutation in TypeScript: Playwright's `request` fixture against a GraphQL API, with the balance checked in Neo4j (and a short pytest version at the end).

## Two questions before you open a file

People treat writing tests as a creative act and start from a blank file. A lot of low-value testing comes from tests that didn't need to exist: they re-cover paths something else already covers, and add runtime and noise without adding protection. Two questions, asked before you type anything, prevent most of it.

### Does a test for this area already exist?

Go and look where tests for this domain live. Often there's a test already exercising the flow you care about, and the right move is a new case or a new assertion inside it. A near-duplicate is a second thing to maintain, and a second thing that breaks when the behavior changes. Keeping related coverage in one place means the next person can find it.

### Will it cover a path nothing else covers?

The question is whether it protects something, not whether it will pass. If you can't point to the behavior this test protects that no current test does, you're about to write duplicate coverage in a fresh disguise. That costs runtime on every CI run and maintenance forever, in exchange for nothing. The right answer is sometimes to write no test at all.

<figure class="diagram">
<svg viewBox="0 0 640 404" role="img" aria-label="Decision flow: if a test for the area exists, extend it; if a new test would not cover a new path, rescope or skip; otherwise write it in the five-part shape">
  <rect class="d-box" x="220" y="16" width="200" height="40" rx="6"/>
  <text class="d-text" x="320" y="41" text-anchor="middle">I need to add a test</text>
  <path class="d-line" d="M320,56 L320,72"/>
  <path class="d-arrow" d="M320,80 l -4,-8 l 8,0 z"/>
  <polygon class="d-box" points="320,80 470,130 320,180 170,130"/>
  <text class="d-text-sm" x="320" y="126" text-anchor="middle">Does a test for this</text>
  <text class="d-text-sm" x="320" y="141" text-anchor="middle">area already exist?</text>
  <path class="d-line" d="M470,130 L492,130"/>
  <path class="d-arrow" d="M500,130 l -8,-4 l 0,8 z"/>
  <text class="d-edge" x="472" y="120">yes</text>
  <rect class="d-box-green" x="502" y="106" width="128" height="48" rx="6"/>
  <text class="d-text-sm" x="566" y="126" text-anchor="middle">Add a case to it,</text>
  <text class="d-text-sm" x="566" y="141" text-anchor="middle">then stop</text>
  <path class="d-line" d="M320,180 L320,214"/>
  <path class="d-arrow" d="M320,222 l -4,-8 l 8,0 z"/>
  <text class="d-edge" x="330" y="205">no</text>
  <polygon class="d-box" points="320,222 470,272 320,322 170,272"/>
  <text class="d-text-sm" x="320" y="268" text-anchor="middle">Does it cover a path</text>
  <text class="d-text-sm" x="320" y="283" text-anchor="middle">nothing else covers?</text>
  <path class="d-line" d="M170,272 L148,272"/>
  <path class="d-arrow" d="M140,272 l 8,-4 l 0,8 z"/>
  <text class="d-edge" x="146" y="262">no</text>
  <rect class="d-box-red" x="10" y="248" width="128" height="48" rx="6"/>
  <text class="d-text-sm" x="74" y="268" text-anchor="middle">Rescope it, or</text>
  <text class="d-text-sm" x="74" y="283" text-anchor="middle">write no test</text>
  <path class="d-line" d="M320,322 L320,342"/>
  <path class="d-arrow" d="M320,350 l -4,-8 l 8,0 z"/>
  <text class="d-edge" x="330" y="338">yes</text>
  <rect class="d-box-green" x="200" y="350" width="240" height="44" rx="6"/>
  <text class="d-text-sm" x="320" y="376" text-anchor="middle">Write it in the five-part shape</text>
</svg>
<figcaption>Only one path through this ends in a new test file. The other two end with less code in the suite, which is usually the better result.</figcaption>
</figure>

That moves the job from producing more tests to protecting more behavior. A suite can show a healthy coverage number and still be slow and redundant, because somebody treated those two goals as one.

## The five parts

Once you've decided a new test should exist, it has the same skeleton every time. Writing it becomes mechanical, and mechanical is what you want: your thinking goes on what to test, not how to lay it out.

<figure class="diagram">
<svg viewBox="0 0 720 290" role="img" aria-label="A test drawn as a crash run: setup holds fixtures and setup, impact is the execute step, inspect holds the response assertion and the state check, with read-only tests stopping before the state check">
  <rect class="d-panel" x="10" y="20" width="280" height="250" rx="6"/>
  <rect class="d-panel" x="300" y="20" width="130" height="250" rx="6"/>
  <rect class="d-panel" x="440" y="20" width="270" height="250" rx="6"/>
  <text class="d-text-sm" x="150" y="42" text-anchor="middle">SETUP</text>
  <text class="d-text-sm" x="365" y="42" text-anchor="middle">IMPACT</text>
  <text class="d-text-sm" x="575" y="42" text-anchor="middle">INSPECT</text>
  <text class="d-text-sm" x="150" y="118" text-anchor="middle">stand in at the boundary only</text>
  <text class="d-text-sm" x="365" y="118" text-anchor="middle">the real system</text>
  <text class="d-text-sm" x="642" y="118" text-anchor="middle">writes only</text>
  <path class="d-flow" d="M30,150 L688,150"/>
  <path class="d-flow-head" d="M700,150 l -12,-6 l 0,12 z"/>
  <path class="d-line" d="M575,70 L575,256"/>
  <text class="d-edge" x="575" y="64" text-anchor="middle">reads stop here</text>
  <circle class="d-node" cx="80" cy="150" r="14"/>
  <text class="d-text" x="80" y="155" text-anchor="middle">1</text>
  <circle class="d-node" cx="220" cy="150" r="14"/>
  <text class="d-text" x="220" y="155" text-anchor="middle">2</text>
  <circle class="d-node-red" cx="365" cy="150" r="14"/>
  <text class="d-on-fill" x="365" y="155" text-anchor="middle">3</text>
  <circle class="d-node-green" cx="508" cy="150" r="14"/>
  <text class="d-on-fill" x="508" y="155" text-anchor="middle">4</text>
  <circle class="d-node-green" cx="642" cy="150" r="14"/>
  <text class="d-on-fill" x="642" y="155" text-anchor="middle">5</text>
  <rect class="d-box" x="20" y="190" width="120" height="52" rx="6"/>
  <text class="d-text" x="80" y="211" text-anchor="middle">Fixtures</text>
  <text class="d-text-sm" x="80" y="230" text-anchor="middle">auth, API, DB</text>
  <rect class="d-box" x="155" y="190" width="130" height="52" rx="6"/>
  <text class="d-text" x="220" y="211" text-anchor="middle">Setup</text>
  <text class="d-text-sm" x="220" y="230" text-anchor="middle">real seed record</text>
  <rect class="d-box-red" x="305" y="190" width="120" height="52" rx="6"/>
  <text class="d-text" x="365" y="211" text-anchor="middle">Execute</text>
  <text class="d-text-sm" x="365" y="230" text-anchor="middle">send mutation</text>
  <rect class="d-box-green" x="448" y="190" width="120" height="52" rx="6"/>
  <text class="d-text" x="508" y="211" text-anchor="middle">Response</text>
  <text class="d-text-sm" x="508" y="230" text-anchor="middle">errors first</text>
  <rect class="d-box-green" x="582" y="190" width="120" height="52" rx="6"/>
  <text class="d-text" x="642" y="211" text-anchor="middle">State</text>
  <text class="d-text-sm" x="642" y="230" text-anchor="middle">check ledger</text>
</svg>
<figcaption>A test as a crash run: rig the car, hit the wall once, then inspect the dummy and the car. A read-only test stops at the line. A write keeps going to step 5.</figcaption>
</figure>

### 1. Fixtures

Declare what the test needs: an authenticated client, a way to send requests to the system, and a database setup that decides how this test is isolated. Fixtures are where you stand in for things outside the system (like an auth token) without faking the system itself. That's [the golden rule of mocking](/blog/the-golden-rule-of-mocking), applied at the top of the file.

### 2. Setup

Get the data the test will act on. Either the default seed data is enough, you find a real record in the test database, or you create one with a factory. Don't hardcode IDs. A UUID pasted into a test only exists in one database on one machine, so the test fails in anyone else's environment. Pull a real record instead.

### 3. Execute

Load the mutation and its input, patch in whatever this test needs, and send it to the real system. This is the one line where the work happens.

### 4. Assert the response, errors first

The GraphQL spec says the `errors` entry "should not be present" when nothing went wrong, and a field error still comes back as a partial result. If you reach into `data` before checking, you get `Cannot read properties of null` instead of the actual error message. Check errors, then the shape, the values and the counts.

### 5. Verify the state (writes only)

For anything that mutates data, a 200 and a happy payload aren't proof. Go to the database and confirm the change landed. Read-only tests stop at step 4; write tests don't get to skip step 5.

## The whole test: create a payment

The fixtures come from `test.extend`. The ledger driver is created with `useBigInt: true`, which makes the Neo4j JavaScript driver return native `BigInt` for integer values. Money in cents should never pass through a float, and that includes your assertions.

```ts:tests/fixtures.ts
import { test as base, expect, type APIResponse } from "@playwright/test"
import neo4j, { type Driver } from "neo4j-driver"

type Gql = (query: string, variables: object) => Promise<APIResponse>

export const test = base.extend<{ gql: Gql; ledger: Driver; testDb: string }>({
  gql: async ({ request }, use) => {
    await use((query, variables) =>
      request.post("/graphql", { // baseURL comes from playwright.config.ts
        headers: { authorization: `Bearer ${process.env.TEST_ADMIN_TOKEN}` },
        data: { query, variables },
      }),
    )
  },
  ledger: async ({}, use) => {
    const driver = neo4j.driver(
      process.env.NEO4J_URI!,
      neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!),
      { useBigInt: true },
    )
    await use(driver)
    await driver.close()
  },
  testDb: async ({}, use) => {
    await use(process.env.TEST_DB!) // per-test databases: see the isolation post
  },
})
export { expect }
```

```ts:tests/payments/create-payment.spec.ts
import { test, expect } from "../fixtures"
import { CREATE_PAYMENT } from "../assets/payment"

test("create payment debits the sender's ledger", async ({ gql, ledger, testDb }) => {
  // 2. Setup: a real funded account from the seed data, no pasted UUIDs
  const { records: accounts } = await ledger.executeQuery(
    `MATCH (a:Account) WHERE a.balance >= $min
     RETURN a.uuid AS uuid, a.balance AS balance LIMIT 1`,
    { min: 5000 },
    { database: testDb },
  )
  expect(accounts, "seed data has a funded account").toHaveLength(1)
  const uuid: string = accounts[0].get("uuid")
  const before: bigint = accounts[0].get("balance")

  // 3. Execute
  const response = await gql(CREATE_PAYMENT, {
    input: { fromAccount: uuid, amount: 2500, currency: "USD" },
  })

  // 4. Assert the response, errors first
  expect(response.ok()).toBe(true)
  const body = await response.json()
  expect(body.errors).toBeUndefined()
  const payment = body.data.createPayment
  expect(payment.amount).toBe(2500)

  // 5. Verify state: the ledger, not the response
  const { records: entries } = await ledger.executeQuery(
    `MATCH (a:Account {uuid: $uuid})-[:POSTED]->(e:LedgerEntry {paymentId: $paymentId})
     RETURN a.balance AS balance, e.amount AS amount, e.side AS side`,
    { uuid, paymentId: payment.id },
    { database: testDb },
  )
  expect(entries).toHaveLength(1)
  expect(entries[0].get("side")).toBe("DEBIT")
  expect(entries[0].get("amount")).toBe(2500n)
  expect(entries[0].get("balance")).toBe(before - 2500n)
})
```

The schema (`Account`, `LedgerEntry`, `POSTED`) and the amounts are examples; the five-part shape is the one I use. Where `testDb` comes from, and why writes get their own database while reads share one, is in [test database isolation: function vs class scope](/blog/test-database-isolation-function-vs-class). With per-test isolation, `before - 2500n` is safe because nothing else touched that account.

## What the ledger check catches

Step 5 is the step people skip, and in a payments service it's where the expensive bugs live.

:::compare
::do[Response plus ledger check]

- Fails when the mutation returned a payment but nothing posted
- Fails when a retry posted the same debit twice (`toHaveLength(1)`)
- Fails when the wrong account was debited, or the balance didn't move
  ::dont[Response check only]
- Proves the resolver returned the right shape
- Passes when the write failed after the reply was built
- Passes when a mock stood in for the store
  :::

The second column is what I'd flag in review as a [Test Mannequin](/blog/ai-code-smells-review-checklist): it asserts there were no errors and stops. It looks like coverage and won't catch a regression.

## The same test in pytest

If your API side is Python, the shape doesn't change. With `pytest-asyncio` in auto mode, async tests need no marker. In the Neo4j Python driver, `single(strict=True)` raises unless exactly one record is left, which turns a missing (or doubled) ledger entry into a clear failure instead of a `None` you subscript later.

```python:tests/payments/test_create_payment.py
async def test_create_payment(admin_auth, execute, db_defaults, db, test_db):
    with db.session(database=test_db) as session:  # 2. setup
        account = session.run(
            "MATCH (a:Account) WHERE a.balance >= $min "
            "RETURN a.uuid AS uuid, a.balance AS balance LIMIT 1",
            min=5000,
        ).single(strict=True)

    mutation, data = load_assets("payment", "create_payment")  # 3. execute
    data["input"]["fromAccount"] = account["uuid"]
    data["input"]["amount"] = 2500
    response = await execute(mutation, data)

    assert response.errors is None  # 4. errors first
    payment = response.data["createPayment"]

    with db.session(database=test_db) as session:  # 5. verify state
        entry = session.run(
            "MATCH (a:Account {uuid: $uuid})-[:POSTED]->(e:LedgerEntry {paymentId: $pid}) "
            "RETURN a.balance AS balance, e.side AS side",
            uuid=account["uuid"], pid=payment["id"],
        ).single(strict=True)
    assert entry["side"] == "DEBIT"
    assert entry["balance"] == account["balance"] - 2500
```

Fixtures, setup, execute, assert, verify. The tests that don't fit the mold are usually the ones hiding a problem: a missing state check, a hardcoded ID, an assertion that never looks at the data.

## Why it matters for your team

In a system that moves money, the API response is a claim and the ledger is the record, so a suite that only reads the claim will pass on the day a payment double-posts.

:::tip
Ask whether the test should exist, then fill in five blanks, and never let a write test skip the database check.
:::
