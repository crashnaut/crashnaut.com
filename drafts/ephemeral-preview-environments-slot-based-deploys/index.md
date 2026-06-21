---
title: "Ephemeral Preview Environments with Slot-Based Deploys"
slug: ephemeral-preview-environments-slot-based-deploys
description: "Every branch deserves a live URL to review on — but a real environment per branch gets expensive fast. A small pool of reusable backend slots, plus immutable artifacts and slug-based routing, gives you preview environments without unbounded infrastructure."
author: Mike Sell
date: 2026-06-15T00:00:00.000Z
tags: ci-cd, devops, infrastructure
---

# Ephemeral Preview Environments with Slot-Based Deploys

The dream is simple: open a branch, get a live URL where you (and the reviewer, and the designer, and QA) can click around the actual change before it merges. The naive implementation of that dream — spin up a complete, dedicated environment for every branch — gets expensive and slow the moment more than a handful of branches are open at once.

There's a middle path that gives you the preview URLs without the unbounded cost. It rests on three ideas: immutable artifacts, slug-based routing, and a fixed pool of reusable backend _slots_.

## 1. Immutable, versioned artifacts on every push

Start by making every push to every branch produce one immutable, versioned artifact, rather than only building on protected branches. A tag derived from the commit timestamp and short SHA does the job:

```
ARTIFACT_TAG = <YYYY.MM.DD>-<short-sha>     # e.g. 2026.05.01-abc1234f
```

It's human-readable, sortable by date, and traceable back to the exact commit. Crucially it's _immutable_ — that tag always points at that build, forever. Mutable convenience pointers like `latest` are pushed only on protected branches, where they belong. Everything downstream deploys an artifact by its tag, never a moving target.

## 2. Slug-based routing

To give a branch a URL, turn its name into a DNS-safe slug and route a subdomain to it:

```
feature/new-report   →   feature-new-report   →   feature-new-report.preview.example.com
HOTFIX/ticket-42     →   hotfix-ticket-42      →   hotfix-ticket-42.preview.example.com
```

The slug rule lowercases and replaces every non-alphanumeric character with a hyphen, which keeps the result inside a single DNS label (no stray dots) so a wildcard certificate and a single edge-routing rule can cover every preview at once. An edge function reads the subdomain and forwards to whatever's currently serving that branch.

## 3. A pool of reusable slots

Here's the part that controls cost. Instead of one environment per branch, you keep a fixed pool of backend _slots_ — say eight — and assign an active branch to a slot when it needs one. The frontend can be per-branch and cheap; the expensive backend is shared across the pool.

A small bit of state in a parameter store tracks which branch owns which slot. Slots come in two modes:

- **Exclusive** — the branch gets a slot to itself (it needs an isolated backend, e.g. it changes a migration or shared state).
- **Shared** — branches that only touch the frontend or are read-safe can ride a shared backend slot, stretching the pool further.

When a branch needs an environment, an assignment step finds a free slot (or reuses the one it already holds), records the mapping, and the artifact deploys there. The pool size caps your spend no matter how many branches are open.

## 4. Clean up automatically

The failure mode of preview environments is that they pile up. Wire teardown to branch deletion: when a branch is deleted (or merged), the pipeline releases its slot back to the pool and clears the routing entry. No manual cleanup, no zombie environments quietly costing money.

## The shape of it

Put together, the flow is: every push builds an immutable artifact → a branch that wants a preview is assigned a slot from the pool → its slug routes a subdomain to that slot → deleting the branch releases the slot. You get a live URL per active branch, bounded infrastructure, and nothing to clean up by hand.

The insight worth keeping even if you implement none of the specifics: _previews need to be per-branch, but the expensive backend doesn't._ Separate the two — cheap per-branch frontends, a shared pool of backends — and "an environment for every branch" stops being a budget problem.
