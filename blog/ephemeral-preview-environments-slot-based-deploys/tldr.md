## TL;DR

A live URL per PR without a backend per PR: cheap per-branch frontends, a fixed pool of shared backend slots.

1. **Immutable artifact per push:** `ARTIFACT_TAG = <YYYY.MM.DD>-<short-sha>`. Deploy by tag, never `latest`.
2. **Slug routing:** lowercase the branch, replace non-alphanumerics with `-`, cap at 63 chars. `feature/new-report` → `feature-new-report.preview.example.com`. One wildcard cert, one edge rule.
3. **Slot pool:** each slot is a parameter `/preview/slots/<n>` that exists only while a PR owns it. Claim with a create-only write so exactly one PR wins. Frontend-only PRs share one slot.
4. **Release on close:** `pull_request` `closed` deletes the parameter and the route.
5. **Test the slot:** Playwright with `baseURL` from `BASE_URL`.

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, closed]

concurrency:
  group: preview-pr-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

```bash
# claim (in the claim job)
mine=$(aws ssm get-parameters-by-path --path "$POOL" \
  --query "Parameters[?Value=='$OWNER'].Name | [0]" --output text)
if [ "$mine" != "None" ]; then echo "slot=${mine##*/}" >> "$GITHUB_OUTPUT"; exit 0; fi
for n in $(seq 1 "$POOL_SIZE"); do
  if aws ssm put-parameter --name "$POOL/$n" --type String \
       --value "$OWNER" --no-overwrite > /dev/null 2>&1; then
    echo "slot=$n" >> "$GITHUB_OUTPUT"; exit 0
  fi
done
echo "::error::All preview slots are taken."; exit 1
```

```yaml
# deploy job
environment:
  name: preview-slot-${{ needs.claim.outputs.slot }}
  url: https://${{ needs.meta.outputs.slug }}.preview.example.com
```

```bash
# release job (on closed)
aws ssm delete-parameter --name "$POOL/$SLOT"
```

**Cost:** backends running × hours per month × hourly cost of one backend. A pool only wins when your usual count of open PRs needing a backend is above the pool size.
