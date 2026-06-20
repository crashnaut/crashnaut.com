## TL;DR

Want a live URL per branch without spinning a full environment per branch? Separate the cheap part (frontend) from the expensive part (backend) and share the backend via a slot pool.

**Three pieces:**

1. **Immutable artifacts** — every push to every branch builds one versioned, immutable tag. Deploy by tag, never a moving pointer.

```
ARTIFACT_TAG = <YYYY.MM.DD>-<short-sha>     # e.g. 2026.05.01-abc1234f
```

2. **Slug-based routing** — branch name → DNS-safe slug → subdomain. One wildcard cert + one edge rule covers all.

```
feature/new-report   →   feature-new-report   →   feature-new-report.preview.example.com
HOTFIX/ticket-42     →   hotfix-ticket-42      →   hotfix-ticket-42.preview.example.com
```

3. **Slot pool** — a fixed set of backend slots (e.g. 8); assign active branches to slots, tracked in a parameter store.
   - **Exclusive** slot — branch needs an isolated backend (migrations/shared state).
   - **Shared** slot — frontend-only/read-safe branches ride a shared backend.

**Auto-cleanup:** release the slot + clear routing on branch delete/merge. No zombie environments.

**The insight:** previews must be per-branch; the expensive backend doesn't have to be.
