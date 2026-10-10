## TL;DR

**The rule:** mock the boundary, not the code. For payments, the boundary is the HTTPS call to `api.stripe.com`.

1. **Own it? Let it run:** handlers, services, your Stripe wrapper, database queries, auth checks.
2. **Don't own it? Mock it at the network:** payment providers, other third-party APIs, cloud storage, email.
3. **Don't `vi.mock()` your own payments client.** A stubbed client can't fail, so it can't warn you, and it skips the cents conversion and decline handling.
4. **Mock payloads, not behavior.** A token payload from an auth fixture is fine. A permission check stubbed to `true` is not.
5. **Don't hardcode IDs.** Create records with a factory or pull real ones from the test database.

```ts:tests/charge-order.test.ts
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw/http' // MSW 3.x entrypoint

const stripe = setupServer()
beforeAll(() => stripe.listen({ onUnhandledFrame: 'error' }))
afterEach(() => stripe.resetHandlers())
afterAll(() => stripe.close())

test('a declined card leaves the order unpaid', async () => {
  stripe.use(
    http.post('https://api.stripe.com/v1/payment_intents', () =>
      HttpResponse.json(
        { error: { type: 'card_error', code: 'card_declined', decline_code: 'insufficient_funds' } },
        { status: 402 },
      ),
    ),
  )

  const order = await createOrder({ total: '20.00', currency: 'USD' })
  await chargeOrder(order.id) // your code runs for real

  expect((await getOrder(order.id)).status).toBe('payment_failed')
})
```

Same idea in pytest with `responses`:

```python
with responses.RequestsMock() as stripe:
    stripe.post("https://api.stripe.com/v1/payment_intents", status=402,
                json={"error": {"type": "card_error", "code": "card_declined"}})
    client.execute(pay_order_mutation, {"orderId": order.id})
```

**When in doubt:** ask _"do I own this?"_ If yes, let it run.
