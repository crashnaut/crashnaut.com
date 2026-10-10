---
title: "How to Run Preview Environments per PR With a Fixed Pool of Slots"
slug: ephemeral-preview-environments-slot-based-deploys
description: "A live preview URL for every pull request without a backend per branch: a fixed slot pool, a GitHub Actions claim step, Playwright on the slot, auto-release."
author: Mike Sell
date: 2026-10-10T13:00:00.000Z
tags: GitHub Actions, CI, Playwright
---

The dream is simple: open a branch, get a live URL where you (and the reviewer, and QA) can click around the actual change before it merges. The naive version, a complete environment for every branch, gets expensive and slow the moment more than a handful of PRs are open. This post shows a middle path: immutable artifacts, slug-based routing and a fixed pool of reusable backend slots, wired up in GitHub Actions with a slot-claiming step (AWS Systems Manager Parameter Store as the example store) and a Playwright (TypeScript) run against the slot URL.

## Build one immutable artifact per push

Every push to every branch produces one immutable, versioned artifact. Protected branches get no special treatment. A tag made from the commit date and short SHA does the job:

```text
ARTIFACT_TAG = <YYYY.MM.DD>-<short-sha>     # e.g. 2026.05.01-abc1234f
```

It's readable, sorts by date and traces back to the exact commit. That tag always points at that build. Mutable pointers like `latest` get pushed only on protected branches, where they belong, and everything downstream deploys by tag, never by a moving target.

## Route a subdomain from the branch name

To give a branch a URL, turn its name into a DNS-safe slug and route a subdomain to it:

```text
feature/new-report   →   feature-new-report   →   feature-new-report.preview.example.com
HOTFIX/ticket-42     →   hotfix-ticket-42     →   hotfix-ticket-42.preview.example.com
```

The rule lowercases the name and replaces every non-alphanumeric character with a hyphen. That keeps the result inside a single DNS label (no stray dots), so one wildcard certificate and one edge-routing rule cover every preview. An edge function reads the subdomain and forwards to whichever slot is serving that branch. (Cap the slug at 63 characters, the DNS label limit, or someone's very descriptive branch name will break it.)

## Share the expensive part through a slot pool

This is what controls cost. Instead of one environment per branch, keep a fixed pool of backend slots, say eight, and assign a PR to a slot when it needs one. The frontend can be per-branch and cheap. The backend, with its database and queues, is shared across the pool.

A small bit of state in a parameter store records which PR owns which slot. Slots come in two modes:

- Exclusive slots: the PR gets a slot to itself because it needs an isolated backend (it changes a migration or shared state).
- Shared slot: PRs that only touch the frontend, or are read-safe, ride one shared backend slot and stretch the pool further.

<figure class="diagram">
<svg viewBox="0 0 700 340" role="img" aria-label="Open pull requests pass through a claim step into a fixed pool of eight backend slots; a full pool fails fast and closing a PR frees its slot">
  <rect class="d-panel" x="300" y="20" width="385" height="270" rx="6"/>
  <text class="d-text" x="492" y="44" text-anchor="middle">Slot pool: 8 backends, fixed size</text>
  <rect class="d-box-green" x="315" y="60" width="80" height="95" rx="4"/>
  <text class="d-text-sm" x="355" y="82" text-anchor="middle">slot 1</text>
  <text class="d-text" x="355" y="114" text-anchor="middle">PR #412</text>
  <text class="d-text-sm" x="355" y="134" text-anchor="middle">exclusive</text>
  <rect class="d-box-green" x="405" y="60" width="80" height="95" rx="4"/>
  <text class="d-text-sm" x="445" y="82" text-anchor="middle">slot 2</text>
  <text class="d-text" x="445" y="114" text-anchor="middle">PR #418</text>
  <text class="d-text-sm" x="445" y="134" text-anchor="middle">exclusive</text>
  <rect class="d-panel" x="495" y="60" width="80" height="95" rx="4"/>
  <text class="d-text-sm" x="535" y="82" text-anchor="middle">slot 3</text>
  <text class="d-text" x="535" y="114" text-anchor="middle">free</text>
  <rect class="d-box-green" x="585" y="60" width="80" height="95" rx="4"/>
  <text class="d-text-sm" x="625" y="82" text-anchor="middle">slot 4</text>
  <text class="d-text" x="625" y="114" text-anchor="middle">PR #420</text>
  <text class="d-text-sm" x="625" y="134" text-anchor="middle">exclusive</text>
  <rect class="d-box-green" x="315" y="175" width="80" height="95" rx="4"/>
  <text class="d-text-sm" x="355" y="197" text-anchor="middle">slot 5</text>
  <text class="d-text" x="355" y="229" text-anchor="middle">PR #425</text>
  <text class="d-text-sm" x="355" y="249" text-anchor="middle">exclusive</text>
  <rect class="d-panel" x="405" y="175" width="80" height="95" rx="4"/>
  <text class="d-text-sm" x="445" y="197" text-anchor="middle">slot 6</text>
  <text class="d-text" x="445" y="229" text-anchor="middle">free</text>
  <rect class="d-box-green" x="495" y="175" width="80" height="95" rx="4"/>
  <text class="d-text-sm" x="535" y="197" text-anchor="middle">slot 7</text>
  <text class="d-text" x="535" y="229" text-anchor="middle">PR #427</text>
  <text class="d-text-sm" x="535" y="249" text-anchor="middle">exclusive</text>
  <rect class="d-box-amber" x="585" y="175" width="80" height="95" rx="4"/>
  <text class="d-text-sm" x="625" y="197" text-anchor="middle">slot 8</text>
  <text class="d-text" x="625" y="229" text-anchor="middle">shared</text>
  <text class="d-text-sm" x="625" y="249" text-anchor="middle">3 PRs</text>
  <text class="d-text-sm" x="20" y="100">Open PRs</text>
  <rect class="d-box" x="20" y="118" width="120" height="36" rx="4"/>
  <text class="d-text" x="80" y="141" text-anchor="middle">PR #431</text>
  <rect class="d-box" x="20" y="166" width="120" height="36" rx="4"/>
  <text class="d-text" x="80" y="189" text-anchor="middle">PR #432</text>
  <path class="d-line" d="M140,136 L157,136"/>
  <path class="d-arrow" d="M163,136 l -8,-4 l 0,8 z"/>
  <path class="d-line" d="M140,184 L157,184"/>
  <path class="d-arrow" d="M163,184 l -8,-4 l 0,8 z"/>
  <rect class="d-box-amber" x="165" y="115" width="115" height="90" rx="4"/>
  <text class="d-text" x="222" y="145" text-anchor="middle">claim step</text>
  <text class="d-text-sm" x="222" y="165" text-anchor="middle">create-only</text>
  <text class="d-text-sm" x="222" y="181" text-anchor="middle">write wins</text>
  <path class="d-line" d="M280,160 L306,160"/>
  <path class="d-arrow" d="M312,160 l -8,-4 l 0,8 z"/>
  <path class="d-line" d="M222,205 L222,230"/>
  <path class="d-arrow" d="M222,236 l -4,-8 l 8,0 z"/>
  <text class="d-edge" x="214" y="224" text-anchor="end">no free slot</text>
  <rect class="d-box-red" x="20" y="238" width="260" height="50" rx="4"/>
  <text class="d-text" x="150" y="260" text-anchor="middle">Pool full: claim fails fast</text>
  <text class="d-text-sm" x="150" y="278" text-anchor="middle">with a clear error in the PR checks</text>
  <path class="d-line" d="M492,290 L492,306"/>
  <text class="d-edge" x="492" y="324" text-anchor="middle">PR closed: delete slot parameter, slot is free</text>
</svg>
<figcaption>New PRs go through the claim step into whichever slot is free. The amber shared slot carries several frontend-only PRs. When every exclusive slot is taken, the claim fails fast instead of queueing forever, and closing a PR returns its slot.</figcaption>
</figure>

## Make the claim a create-only write

The obvious claim step reads the pool, picks a free slot and writes the PR number into it. Two PRs opened a few seconds apart can both read "slot 3 is free", both write, and both deploy to slot 3. One of them then runs its Playwright suite against the other PR's build. The failure looks like a flaky test, which is the worst kind of failure to debug.

<figure class="diagram">
<svg viewBox="0 0 700 400" role="img" aria-label="Two CI swim-lanes per scenario: with read-then-overwrite both PRs claim slot 3 and one test run hits the other PR's build; with a create-only write the second PR is pushed to slot 6 and both pass">
  <rect class="d-panel" x="10" y="10" width="680" height="180" rx="6"/>
  <rect class="d-panel" x="10" y="210" width="680" height="180" rx="6"/>
  <rect class="d-box-amber" x="168" y="46" width="240" height="114" rx="4"/>
  <text class="d-text-sm" x="24" y="32">Read, then overwrite (no lock)</text>
  <text class="d-text-sm" x="24" y="232">Create-only write (the lock)</text>
  <text class="d-text" x="24" y="78">PR #A</text>
  <rect class="d-box" x="90" y="56" width="70" height="34" rx="4"/>
  <text class="d-text-sm" x="125.0" y="77" text-anchor="middle">build</text>
  <path class="d-line" d="M160,73 L167,73"/>
  <path class="d-arrow" d="M173,73 l -8,-4 l 0,8 z"/>
  <rect class="d-box" x="175" y="56" width="110" height="34" rx="4"/>
  <text class="d-text-sm" x="230.0" y="77" text-anchor="middle">read: 3 free</text>
  <path class="d-line" d="M285,73 L292,73"/>
  <path class="d-arrow" d="M298,73 l -8,-4 l 0,8 z"/>
  <rect class="d-box" x="300" y="56" width="100" height="34" rx="4"/>
  <text class="d-text-sm" x="350.0" y="77" text-anchor="middle">write 3</text>
  <path class="d-line" d="M400,73 L407,73"/>
  <path class="d-arrow" d="M413,73 l -8,-4 l 0,8 z"/>
  <rect class="d-box" x="415" y="56" width="80" height="34" rx="4"/>
  <text class="d-text-sm" x="455.0" y="77" text-anchor="middle">deploy</text>
  <path class="d-line" d="M495,73 L502,73"/>
  <path class="d-arrow" d="M508,73 l -8,-4 l 0,8 z"/>
  <rect class="d-box-red" x="510" y="56" width="110" height="34" rx="4"/>
  <text class="d-text-sm" x="565.0" y="77" text-anchor="middle">tests B's code</text>
  <path class="d-line" d="M620,73 L626,73"/>
  <path class="d-arrow" d="M632,73 l -8,-4 l 0,8 z"/>
  <circle class="d-node-red" cx="652" cy="73" r="18"/>
  <text class="d-on-fill" x="652" y="77" text-anchor="middle">FAIL</text>
  <text class="d-text" x="24" y="138">PR #B</text>
  <rect class="d-box" x="90" y="116" width="70" height="34" rx="4"/>
  <text class="d-text-sm" x="125.0" y="137" text-anchor="middle">build</text>
  <path class="d-line" d="M160,133 L167,133"/>
  <path class="d-arrow" d="M173,133 l -8,-4 l 0,8 z"/>
  <rect class="d-box" x="175" y="116" width="110" height="34" rx="4"/>
  <text class="d-text-sm" x="230.0" y="137" text-anchor="middle">read: 3 free</text>
  <path class="d-line" d="M285,133 L292,133"/>
  <path class="d-arrow" d="M298,133 l -8,-4 l 0,8 z"/>
  <rect class="d-box" x="300" y="116" width="100" height="34" rx="4"/>
  <text class="d-text-sm" x="350.0" y="137" text-anchor="middle">write 3</text>
  <path class="d-line" d="M400,133 L407,133"/>
  <path class="d-arrow" d="M413,133 l -8,-4 l 0,8 z"/>
  <rect class="d-box" x="415" y="116" width="80" height="34" rx="4"/>
  <text class="d-text-sm" x="455.0" y="137" text-anchor="middle">deploy</text>
  <path class="d-line" d="M495,133 L502,133"/>
  <path class="d-arrow" d="M508,133 l -8,-4 l 0,8 z"/>
  <rect class="d-box" x="510" y="116" width="110" height="34" rx="4"/>
  <text class="d-text-sm" x="565.0" y="137" text-anchor="middle">test</text>
  <path class="d-line" d="M620,133 L626,133"/>
  <path class="d-arrow" d="M632,133 l -8,-4 l 0,8 z"/>
  <circle class="d-node-green" cx="652" cy="133" r="18"/>
  <text class="d-on-fill" x="652" y="137" text-anchor="middle">PASS</text>
  <text class="d-edge" x="288" y="178" text-anchor="middle">hazard: both own slot 3</text>
  <text class="d-text" x="24" y="278">PR #A</text>
  <rect class="d-box" x="90" y="256" width="70" height="34" rx="4"/>
  <text class="d-text-sm" x="125.0" y="277" text-anchor="middle">build</text>
  <path class="d-line" d="M160,273 L167,273"/>
  <path class="d-arrow" d="M173,273 l -8,-4 l 0,8 z"/>
  <rect class="d-box-green" x="175" y="256" width="110" height="34" rx="4"/>
  <text class="d-text-sm" x="230.0" y="277" text-anchor="middle">write 3: ok</text>
  <path class="d-line" d="M285,273 L407,273"/>
  <path class="d-arrow" d="M413,273 l -8,-4 l 0,8 z"/>
  <rect class="d-box" x="415" y="256" width="80" height="34" rx="4"/>
  <text class="d-text-sm" x="455.0" y="277" text-anchor="middle">deploy</text>
  <path class="d-line" d="M495,273 L502,273"/>
  <path class="d-arrow" d="M508,273 l -8,-4 l 0,8 z"/>
  <rect class="d-box" x="510" y="256" width="110" height="34" rx="4"/>
  <text class="d-text-sm" x="565.0" y="277" text-anchor="middle">test</text>
  <path class="d-line" d="M620,273 L626,273"/>
  <path class="d-arrow" d="M632,273 l -8,-4 l 0,8 z"/>
  <circle class="d-node-green" cx="652" cy="273" r="18"/>
  <text class="d-on-fill" x="652" y="277" text-anchor="middle">PASS</text>
  <text class="d-text" x="24" y="338">PR #B</text>
  <rect class="d-box" x="90" y="316" width="70" height="34" rx="4"/>
  <text class="d-text-sm" x="125.0" y="337" text-anchor="middle">build</text>
  <path class="d-line" d="M160,333 L167,333"/>
  <path class="d-arrow" d="M173,333 l -8,-4 l 0,8 z"/>
  <rect class="d-box-red" x="175" y="316" width="110" height="34" rx="4"/>
  <text class="d-text-sm" x="230.0" y="337" text-anchor="middle">write 3: taken</text>
  <path class="d-line" d="M285,333 L292,333"/>
  <path class="d-arrow" d="M298,333 l -8,-4 l 0,8 z"/>
  <rect class="d-box-green" x="300" y="316" width="100" height="34" rx="4"/>
  <text class="d-text-sm" x="350.0" y="337" text-anchor="middle">write 6: ok</text>
  <path class="d-line" d="M400,333 L407,333"/>
  <path class="d-arrow" d="M413,333 l -8,-4 l 0,8 z"/>
  <rect class="d-box" x="415" y="316" width="80" height="34" rx="4"/>
  <text class="d-text-sm" x="455.0" y="337" text-anchor="middle">deploy</text>
  <path class="d-line" d="M495,333 L502,333"/>
  <path class="d-arrow" d="M508,333 l -8,-4 l 0,8 z"/>
  <rect class="d-box" x="510" y="316" width="110" height="34" rx="4"/>
  <text class="d-text-sm" x="565.0" y="337" text-anchor="middle">test</text>
  <path class="d-line" d="M620,333 L626,333"/>
  <path class="d-arrow" d="M632,333 l -8,-4 l 0,8 z"/>
  <circle class="d-node-green" cx="652" cy="333" r="18"/>
  <text class="d-on-fill" x="652" y="337" text-anchor="middle">PASS</text>
</svg>
<figcaption>Top: with read-then-overwrite, both PRs believe they own slot 3, and PR A's tests run against PR B's build. Bottom: with a create-only write, Parameter Store accepts exactly one writer for slot 3 and PR B moves on to slot 6.</figcaption>
</figure>

The fix is to let the store do the locking. Parameter Store's `PutParameter` doesn't overwrite by default and returns `ParameterAlreadyExists` if the name is taken ([API reference](https://docs.aws.amazon.com/systems-manager/latest/APIReference/API_PutParameter.html)). So each slot is a parameter, `/preview/slots/<n>`, that exists only while someone owns it. Claiming is "try to create it". Releasing is "delete it".

**GitHub Actions `concurrency` doesn't solve this on its own.** A per-PR concurrency group stops two runs of the same PR from racing, and `cancel-in-progress` drops a deploy that a newer push has already made stale. A pool-wide group with `queue: max` would serialize every claim across all PRs (up to 100 pending runs, per the [concurrency docs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)), but then every PR waits behind every other PR's claim. I'd rather have the atomic write and keep concurrency per PR.

## The workflow

One workflow handles the whole lifecycle. `pull_request` runs on `opened`, `synchronize` and `reopened` by default, so `closed` has to be listed to get the release ([events docs](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request)). The `scripts/*.sh` files stand in for your own build, deploy and teardown.

```yaml:.github/workflows/preview.yml
name: preview

on:
  pull_request:
    types: [opened, synchronize, reopened, closed]

concurrency:
  group: preview-pr-${{ github.event.pull_request.number }}
  cancel-in-progress: true

permissions:
  contents: read
  id-token: write # OIDC role for AWS

env:
  POOL: /preview/slots
  POOL_SIZE: 7 # exclusive slots; slot 8 is the shared one
  OWNER: pr-${{ github.event.pull_request.number }}

jobs:
  meta:
    runs-on: ubuntu-latest
    outputs:
      slug: ${{ steps.slug.outputs.slug }}
    steps:
      - id: slug
        env:
          HEAD_REF: ${{ github.head_ref }}
        run: |
          slug=$(echo "$HEAD_REF" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | cut -c1-63 | sed 's/-*$//')
          echo "slug=$slug" >> "$GITHUB_OUTPUT"

  build:
    if: github.event.action != 'closed'
    runs-on: ubuntu-latest
    outputs:
      tag: ${{ steps.tag.outputs.tag }}
    steps:
      - uses: actions/checkout@v7
        with:
          ref: ${{ github.event.pull_request.head.sha }} # the PR commit, not the merge commit
      - id: tag
        run: echo "tag=$(git log -1 --format=%cd --date=format:%Y.%m.%d)-$(git rev-parse --short=8 HEAD)" >> "$GITHUB_OUTPUT"
      - run: ./scripts/build-and-push.sh "${{ steps.tag.outputs.tag }}"

  claim:
    if: github.event.action != 'closed'
    runs-on: ubuntu-latest
    outputs:
      slot: ${{ steps.claim.outputs.slot }}
    steps:
      - uses: aws-actions/configure-aws-credentials@v6
        with:
          role-to-assume: ${{ vars.PREVIEW_ROLE_ARN }}
          aws-region: us-east-1
      - id: claim
        env:
          SHARED: ${{ contains(github.event.pull_request.labels.*.name, 'preview-shared') }}
        run: |
          if [ "$SHARED" = "true" ]; then echo "slot=8" >> "$GITHUB_OUTPUT"; exit 0; fi
          # Already holding a slot from an earlier push? Reuse it.
          mine=$(aws ssm get-parameters-by-path --path "$POOL" \
            --query "Parameters[?Value=='$OWNER'].Name | [0]" --output text)
          if [ "$mine" != "None" ]; then echo "slot=${mine##*/}" >> "$GITHUB_OUTPUT"; exit 0; fi
          # Create-only write: exactly one PR wins each slot.
          for n in $(seq 1 "$POOL_SIZE"); do
            if aws ssm put-parameter --name "$POOL/$n" --type String \
                 --value "$OWNER" --no-overwrite > /dev/null 2>&1; then
              echo "slot=$n" >> "$GITHUB_OUTPUT"; exit 0
            fi
          done
          echo "::error::All $POOL_SIZE preview slots are taken. Close a stale PR or label this one preview-shared."
          exit 1

  deploy:
    needs: [meta, build, claim]
    runs-on: ubuntu-latest
    environment:
      name: preview-slot-${{ needs.claim.outputs.slot }}
      url: https://${{ needs.meta.outputs.slug }}.preview.example.com
    steps:
      - uses: actions/checkout@v7
      - uses: aws-actions/configure-aws-credentials@v6
        with:
          role-to-assume: ${{ vars.PREVIEW_ROLE_ARN }}
          aws-region: us-east-1
      - run: ./scripts/deploy-slot.sh "${{ needs.claim.outputs.slot }}" "${{ needs.build.outputs.tag }}" "${{ needs.meta.outputs.slug }}"

  e2e:
    needs: [meta, deploy]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: lts/*
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          BASE_URL: https://${{ needs.meta.outputs.slug }}.preview.example.com
      - uses: actions/upload-artifact@v7
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/

  release:
    if: github.event.action == 'closed'
    needs: meta
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: aws-actions/configure-aws-credentials@v6
        with:
          role-to-assume: ${{ vars.PREVIEW_ROLE_ARN }}
          aws-region: us-east-1
      - run: |
          mine=$(aws ssm get-parameters-by-path --path "$POOL" \
            --query "Parameters[?Value=='$OWNER'].Name | [0]" --output text)
          ./scripts/teardown-route.sh "${{ needs.meta.outputs.slug }}"
          if [ "$mine" != "None" ]; then aws ssm delete-parameter --name "$mine"; fi
```

On the Playwright side, the config reads the slot URL from the environment:

```ts:playwright.config.ts
import { defineConfig } from "@playwright/test"

export default defineConfig({
  use: { baseURL: process.env.BASE_URL ?? "http://localhost:3000" },
})
```

A few things in there that are easy to miss:

- `environment.name` accepts an expression with the `needs` context, and `url` can be an expression too ([workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idenvironment)). A workflow that references an environment that doesn't exist creates it, so `preview-slot-3` appears on first use ([managing environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)). On GitHub Free, environments can only be configured for public repos.
- `closed` fires for merged and unmerged PRs alike. The release doesn't care which, so there's no `merged == true` check.
- PRs from forks don't get secrets (except `GITHUB_TOKEN`), so fork PRs won't get a preview. For a private FinTech repo that's usually fine.
- The branch name goes through `env`, not straight into the script, because a branch name is user input.

If your Playwright suite lives in its own repo, the dual checkout in [Run Playwright Tests from a Separate Repository in CI](/blog/cross-repo-playwright-ci) drops straight into the `e2e` job.

## Estimate the cost before you pick a pool size

I won't quote a price, because it depends entirely on what one backend is for you. The arithmetic is the same everywhere:

```text
monthly cost ≈ backends running × hours each runs per month × hourly cost of one backend
```

Per-PR environments make "backends running" equal to open PRs, including the stale ones nobody closed. A pool makes it the pool size, whether the slots are busy or not. So the pool is only cheaper when your typical number of open PRs that need a backend is above the pool size. Check that number before you buy anything (`gh pr list --state open --json number --jq length` gives today's count; sample it for a couple of weeks).

:::bar-chart[Backends running with 20 open PRs (worked example, not measured)]
One environment per PR | 20 | bad
Pool of 7 exclusive + 1 shared | 8 | good
:::

The assumptions behind that example: 20 PRs open at once, all of them needing a backend, and a backend costs the same whether it's busy or idle. Multiply each bar by your own hourly backend cost from the cloud bill. The other cost is people: when the pool is full, a PR has to wait or go shared. If that happens every day, the pool is too small, and the fix is one number in the workflow.

## Clean up automatically

Preview environments fail by piling up. Wiring the release to `closed` means no manual cleanup and no zombie environments quietly costing money. (A stale PR that stays open still holds its slot. A weekly job that closes PRs with no pushes in 30 days is a cheap fix.)

:::tip
Keep previews per branch, keep the expensive backend in a fixed pool, and make the slot claim a create-only write so two PRs can never own the same slot.
:::

For a payments team, that means a reviewer can push a test card through checkout on an isolated slot with its own database, without another PR's migration changing the ledger under them. The idea worth keeping even if you build none of this: previews need to be per-branch, but the expensive backend doesn't. And if feature flags are already making "it worked in preview" hard to trust, [the feature-flag post](/blog/the-feature-flag-nightmare) covers why.
