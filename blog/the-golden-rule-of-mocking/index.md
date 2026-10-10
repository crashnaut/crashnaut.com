---
title: "The Golden Rule of Mocking: Mock the Boundary, Not the Code"
slug: the-golden-rule-of-mocking
description: "Mock the payment provider at the HTTP boundary, not your own client class. A TypeScript and MSW example of tests that can actually catch a Stripe bug."
author: Mike Sell
date: 2026-10-10T09:00:00.000Z
tags: Mocking, Testing Strategy, Test Architecture, TypeScript
---

I've reviewed a lot of test suites that pass green while production is on fire. Almost always the cause is the same: the tests mock too much, stubbing out the very code they claim to test, so the green checkmark proves only that the mock returned what the mock was told to return. This post shows the one rule that fixes it, using a Stripe payment flow in TypeScript with Vitest and MSW, plus the same idea in pytest at the end.

## One rule: mock the boundary

> **Mock the boundary, not the code.**

Draw a line around the system you own. Everything inside that line runs for real in tests: your handlers, your services, your validation, your database queries, your permission checks, and your wrapper around the payment SDK. Everything that crosses the line into something you don't control gets mocked.

For a payment flow, the line is the HTTPS request to `api.stripe.com`. The Stripe SDK isn't your code, but it runs in your process, so it runs for real too. The only thing you fake is the network reply.

<figure class="diagram">
<svg viewBox="0 0 700 330" role="img" aria-label="Call path from a payOrder handler through the service, your Stripe wrapper and the stripe-node SDK, across a hazard band marking the HTTP boundary, to api.stripe.com. A red mark shows where vi.mock cuts the path, above the wrapper.">
  <rect class="d-panel" x="16" y="40" width="440" height="260" rx="6"/>
  <text class="d-text-sm" x="32" y="62">IN YOUR PROCESS: RUNS FOR REAL</text>
  <rect class="d-box" x="40" y="78" width="300" height="36" rx="4"/>
  <text class="d-text" x="190" y="101" text-anchor="middle">payOrder handler</text>
  <rect class="d-box" x="40" y="134" width="300" height="36" rx="4"/>
  <text class="d-text" x="190" y="157" text-anchor="middle">chargeOrder() service</text>
  <rect class="d-box" x="40" y="190" width="300" height="36" rx="4"/>
  <text class="d-text" x="190" y="213" text-anchor="middle">PaymentsClient (your wrapper)</text>
  <rect class="d-box" x="40" y="246" width="300" height="36" rx="4"/>
  <text class="d-text" x="190" y="269" text-anchor="middle">stripe-node SDK</text>
  <path class="d-flow" d="M190,114 L190,126"/>
  <path class="d-flow-head" d="M190,134 l -5,-9 l 10,0 z"/>
  <path class="d-flow" d="M190,170 L190,182"/>
  <path class="d-flow-head" d="M190,190 l -5,-9 l 10,0 z"/>
  <path class="d-flow" d="M190,226 L190,238"/>
  <path class="d-flow-head" d="M190,246 l -5,-9 l 10,0 z"/>
  <path class="d-line" d="M354,180 L200,180"/>
  <circle class="d-node-red" cx="190" cy="180" r="8"/>
  <text class="d-on-fill" x="190" y="184" text-anchor="middle">✕</text>
  <rect class="d-box-red" x="354" y="158" width="94" height="44" rx="4"/>
  <text class="d-edge" x="401" y="176" text-anchor="middle">vi.mock()</text>
  <text class="d-text-sm" x="401" y="192" text-anchor="middle">cuts here</text>
  <rect class="d-box-amber" x="468" y="30" width="36" height="290" rx="4"/>
  <path class="d-line" d="M468,66 L504,30 M468,90 L504,54 M468,114 L504,78 M468,138 L504,102 M468,162 L504,126 M468,186 L504,150 M468,210 L504,174 M468,234 L504,198 M468,258 L504,222 M468,282 L504,246 M468,306 L504,270 M480,320 L504,296"/>
  <text class="d-text-sm" x="486" y="22" text-anchor="middle">HTTP BOUNDARY</text>
  <path class="d-flow" d="M340,264 L532,264"/>
  <path class="d-flow-head" d="M542,264 l -10,-5 l 0,10 z"/>
  <text class="d-edge" x="516" y="236">POST /v1/payment_intents</text>
  <rect class="d-box" x="544" y="246" width="140" height="36" rx="4"/>
  <text class="d-text" x="614" y="269" text-anchor="middle">api.stripe.com</text>
  <text class="d-text-sm" x="614" y="302" text-anchor="middle">MSW answers instead</text>
</svg>
<figcaption>Mock at the hazard band and all four layers run for real. Patch the wrapper and the test stops two layers short, before the code that builds the request and reads the reply.</figcaption>
</figure>

:::compare
::do[Mock these: you don't own them]

- Payment providers (Stripe and friends), at the HTTP call
- Other third-party APIs: KYC, FX rates, accounting
- Cloud storage reads and writes
- Email and notification sending
- Token validation against an external identity provider

::dont[Never mock these: they're yours]

- Your database queries
- Your resolvers, controllers or handlers
- Your service and business-logic layer
- Your wrapper around the payment SDK
- Your authorization logic

:::

## The trap: patching your own payments client

Say a checkout service with a `PaymentsClient` class that wraps stripe-node (an illustrative example, though the shape is common). The tempting test mocks that class:

```ts:tests/charge-order.patched.test.ts
import { vi, test, expect } from 'vitest'
import { chargeOrder } from '../src/payments/charge-order'

vi.mock('../src/payments/payments-client', () => ({
  PaymentsClient: class {
    charge = vi.fn().mockResolvedValue({ id: 'pi_123', status: 'succeeded' })
  },
}))

test('charges the order', async () => {
  const result = await chargeOrder('order-1')
  expect(result.status).toBe('succeeded') // true because we said so
})
```

A test exists to catch a regression in _your_ code. The moment you mock your own client to "return a payment intent", you've replaced the thing under test with a puppet. It can never fail, so it can never warn you.

The puppet also hides the code that matters most. The wrapper is where $20.00 becomes `2000` (Stripe takes [amounts in the smallest currency unit](https://docs.stripe.com/api/payment_intents/create)), where the currency gets lowercased (Stripe expects a lowercase ISO code), and where a declined card turns into your own domain error. None of that runs.

<figure class="diagram">
<svg viewBox="0 0 680 340" role="img" aria-label="A matrix of six things that can break in a payment flow, comparing a test that patches the wrapper against a test that mocks HTTP with MSW. The patched test exercises one, fakes one and misses four; the boundary mock exercises all six.">
  <text class="d-text-sm" x="24" y="50">WHERE A PAYMENT BUG CAN HIDE</text>
  <text class="d-text-sm" x="470" y="44" text-anchor="middle">Patch your wrapper</text>
  <text class="d-text-sm" x="470" y="58" text-anchor="middle">(vi.mock)</text>
  <text class="d-text-sm" x="600" y="44" text-anchor="middle">Mock HTTP</text>
  <text class="d-text-sm" x="600" y="58" text-anchor="middle">(MSW)</text>
  <path class="d-line" d="M20,68 L660,68"/>
  <text class="d-text" x="24" y="91">Handler validates the order ID</text>
  <circle class="d-node-green" cx="470" cy="87" r="11"/>
  <text class="d-on-fill" x="470" y="91" text-anchor="middle">✓</text>
  <circle class="d-node-green" cx="600" cy="87" r="11"/>
  <text class="d-on-fill" x="600" y="91" text-anchor="middle">✓</text>
  <path class="d-line" d="M20,106 L660,106"/>
  <text class="d-text" x="24" y="129">Service writes the order status</text>
  <circle class="d-node" cx="470" cy="125" r="11"/>
  <text class="d-text" x="470" y="129" text-anchor="middle">~</text>
  <circle class="d-node-green" cx="600" cy="125" r="11"/>
  <text class="d-on-fill" x="600" y="129" text-anchor="middle">✓</text>
  <path class="d-line" d="M20,144 L660,144"/>
  <text class="d-text" x="24" y="167">Wrapper converts $20.00 to 2000 cents</text>
  <circle class="d-node-red" cx="470" cy="163" r="11"/>
  <text class="d-on-fill" x="470" y="167" text-anchor="middle">✕</text>
  <circle class="d-node-green" cx="600" cy="163" r="11"/>
  <text class="d-on-fill" x="600" y="167" text-anchor="middle">✓</text>
  <path class="d-line" d="M20,182 L660,182"/>
  <text class="d-text" x="24" y="205">Wrapper sends the currency in lowercase</text>
  <circle class="d-node-red" cx="470" cy="201" r="11"/>
  <text class="d-on-fill" x="470" y="205" text-anchor="middle">✕</text>
  <circle class="d-node-green" cx="600" cy="201" r="11"/>
  <text class="d-on-fill" x="600" y="205" text-anchor="middle">✓</text>
  <path class="d-line" d="M20,220 L660,220"/>
  <text class="d-text" x="24" y="243">SDK turns a 402 into StripeCardError</text>
  <circle class="d-node-red" cx="470" cy="239" r="11"/>
  <text class="d-on-fill" x="470" y="243" text-anchor="middle">✕</text>
  <circle class="d-node-green" cx="600" cy="239" r="11"/>
  <text class="d-on-fill" x="600" y="243" text-anchor="middle">✓</text>
  <path class="d-line" d="M20,258 L660,258"/>
  <text class="d-text" x="24" y="281">Wrapper maps the decline to your error</text>
  <circle class="d-node-red" cx="470" cy="277" r="11"/>
  <text class="d-on-fill" x="470" y="281" text-anchor="middle">✕</text>
  <circle class="d-node-green" cx="600" cy="277" r="11"/>
  <text class="d-on-fill" x="600" y="281" text-anchor="middle">✓</text>
  <path class="d-line" d="M20,296 L660,296"/>
  <circle class="d-node-green" cx="32" cy="320" r="7"/>
  <text class="d-text-sm" x="46" y="324">runs for real</text>
  <circle class="d-node" cx="150" cy="320" r="7"/>
  <text class="d-text-sm" x="164" y="324">runs, on a reply you made up</text>
  <circle class="d-node-red" cx="350" cy="320" r="7"/>
  <text class="d-text-sm" x="364" y="324">never runs</text>
</svg>
<figcaption>The patched test covers the top row and half of the second. Every row below the patch, the part that handles money, never executes.</figcaption>
</figure>

## The fix: answer for Stripe at the network

[MSW](https://mswjs.io/docs/api/setup-server) intercepts outgoing requests in Node, so stripe-node makes a real HTTP call and MSW answers it. Watch the imports: MSW 3.0 moved `http` and `HttpResponse` to `msw/http` and renamed `onUnhandledRequest` to `onUnhandledFrame` (see the [2.x to 3.x migration guide](https://mswjs.io/docs/migrations/2.x-to-3.x)). Setting it to `'error'` means any call you forgot to mock fails loudly instead of reaching the real API.

```ts:tests/charge-order.test.ts
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw/http'
import { beforeAll, afterEach, afterAll, test, expect } from 'vitest'
import { chargeOrder } from '../src/payments/charge-order'
import { createOrder, getOrder } from './factories'

const stripe = setupServer()

beforeAll(() => stripe.listen({ onUnhandledFrame: 'error' }))
afterEach(() => stripe.resetHandlers())
afterAll(() => stripe.close())

test('a declined card leaves the order unpaid and records why', async () => {
  let sent: URLSearchParams | undefined

  stripe.use(
    http.post('https://api.stripe.com/v1/payment_intents', async ({ request }) => {
      sent = new URLSearchParams(await request.text())
      return HttpResponse.json(
        {
          error: {
            type: 'card_error',
            code: 'card_declined',
            decline_code: 'insufficient_funds',
            message: 'Your card was declined.',
          },
        },
        { status: 402 },
      )
    }),
  )

  const order = await createOrder({ total: '20.00', currency: 'USD' })
  await chargeOrder(order.id) // handler, service, wrapper, SDK: all real

  expect(sent?.get('amount')).toBe('2000')
  expect(sent?.get('currency')).toBe('usd')

  const saved = await getOrder(order.id)
  expect(saved.status).toBe('payment_failed')
  expect(saved.failureReason).toBe('insufficient_funds')
})
```

(`createOrder`, `getOrder` and `chargeOrder` stand in for your own factory and service code.)

The reply follows Stripe's documented [error object](https://docs.stripe.com/api/errors): status `402 Request Failed`, `type: 'card_error'`, and a `card_declined` [error code](https://docs.stripe.com/error-codes) with a [`decline_code`](https://docs.stripe.com/declines/codes). stripe-node maps a 402 to `StripeCardError`, so your wrapper's real `catch` block runs against the real error class. If someone breaks the cents conversion, the first `expect` fails. If someone swallows the decline, the last one does.

## The subtle part: mock payloads, not behavior

Mocking _input data_ is fine. Mocking _your code's behavior_ is not.

An auth fixture that hands your code a valid token payload is mocking input: it stands in for the identity provider at the boundary. That's correct. Reaching inside and stubbing your own permission check so it always returns `true` is mocking your code. Now the only thing under test is whether `true === true`.

Same with test data. Don't hardcode an order ID that only exists in one database on one machine. Create the record with a factory or pull a real one from your test database, so the test runs in anyone's environment. (I cover that step in [the anatomy of an integration test](/blog/anatomy-of-an-integration-test), and keeping the database clean between tests in [function vs class test database isolation](/blog/test-database-isolation-function-vs-class).)

## Why integration-first pays off

Once the boundary is the only thing you mock, integration tests become the natural default: a real request through routing, auth, service, wrapper and database, against an isolated database with real data. Unit tests still earn their place for pure utility functions used in many places, but they stop being the thing you reach for by reflex.

The payoff is trust. When the test goes green, the path a customer hits works. When it goes red, something real broke.

In a payments service the wrapper around Stripe is where dollars become cents and declines become order states, so a test that patches it out skips the code most likely to charge the wrong amount or lose a failed payment.

:::tip
If you own the code, let it run; mock only the request that leaves your system.
:::

## The same rule in pytest

The idea doesn't depend on the stack. stripe-python's sync client [uses `requests` by default](https://github.com/stripe/stripe-python), so [responses](https://github.com/getsentry/responses) can answer for Stripe the same way (use [RESPX](https://lundberg.github.io/respx/guide/) if your code calls Stripe through httpx):

```python:tests/test_pay_order.py
import responses

def test_declined_card_marks_order_failed(client, order, db):
    with responses.RequestsMock() as stripe:
        stripe.post(
            "https://api.stripe.com/v1/payment_intents",
            status=402,
            json={"error": {"type": "card_error", "code": "card_declined",
                            "decline_code": "insufficient_funds"}},
        )
        response = client.execute(pay_order_mutation, {"orderId": order.id})

    assert response.errors is None
    assert db.get_order(order.id).status == "payment_failed"
```

`RequestsMock` raises a `ConnectionError` for any request you didn't register, and by default fails the test if a registered one was never called, so it's strict in both directions.

When you're staring at a test wondering whether to patch something, ask one question: _do I own this?_ If yes, let it run.
