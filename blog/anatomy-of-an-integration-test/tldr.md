## TL;DR

Before you write a test:

1. **Does a test for this area exist?** Yes: add a case to it and stop.
2. **Will a new test cover a path nothing else covers?** No: rescope, or write no test.

Then every integration test has five parts:

1. **Fixtures:** auth, a way to call the API, an isolated database.
2. **Setup:** pull a real record from the seed data. Never paste an ID.
3. **Execute:** send the real mutation.
4. **Assert the response, errors first:** `errors` should be absent, then check the data.
5. **Verify state (writes only):** query the database and check the change landed.

```ts:tests/payments/create-payment.spec.ts
test("create payment debits the sender's ledger", async ({ gql, ledger, testDb }) => {
  const { records: [account] } = await ledger.executeQuery(
    "MATCH (a:Account) WHERE a.balance >= $min RETURN a.uuid AS uuid, a.balance AS balance LIMIT 1",
    { min: 5000 }, { database: testDb },
  )
  const uuid: string = account.get("uuid")
  const before: bigint = account.get("balance") // driver created with { useBigInt: true }

  const response = await gql(CREATE_PAYMENT, { input: { fromAccount: uuid, amount: 2500, currency: "USD" } })
  const body = await response.json()
  expect(body.errors).toBeUndefined() // errors first
  const payment = body.data.createPayment

  const { records: entries } = await ledger.executeQuery(
    "MATCH (a:Account {uuid: $uuid})-[:POSTED]->(e:LedgerEntry {paymentId: $paymentId}) RETURN a.balance AS balance, e.side AS side",
    { uuid, paymentId: payment.id }, { database: testDb },
  )
  expect(entries).toHaveLength(1) // catches a double post
  expect(entries[0].get("side")).toBe("DEBIT")
  expect(entries[0].get("balance")).toBe(before - 2500n)
})
```

Reads stop at step 4. Writes don't skip step 5.
