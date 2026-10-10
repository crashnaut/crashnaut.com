## TL;DR

"Every PR must raise coverage" sounds rigorous but rots your suite: people optimize for the number, not the code.

**Instead:** set a codebase-wide target (say 80%), reach it collectively, and read coverage as a trend against the work done.

- New code + its tests: ratio **steady**. Healthy, and the common case.
- Tests for previously untested code: ratio **climbs**. Healthy backfill.
- New code with no tests, or many tests with no movement: **investigate**.

**In CI:** check the patch (the lines a PR changed), report the project total without blocking.

```ts
// vitest.config.ts (npm i -D @vitest/coverage-v8)
export default defineConfig({
  test: { coverage: { provider: 'v8', reporter: ['text', 'lcov'], include: ['src'] } },
});
```

```yaml
# .github/workflows/test.yml (steps)
- run: npx vitest run --coverage
- uses: codecov/codecov-action@v7
  with:
    files: ./coverage/lcov.info
    token: ${{ secrets.CODECOV_TOKEN }}
```

```yaml
# codecov.yml
coverage:
  status:
    project:
      default:
        target: auto
        threshold: 1%
        informational: true   # always passes, still reported
    patch:
      default:
        target: 80%
```

Python: `pytest --cov=src --cov-report=xml:coverage.xml`, then upload `./coverage.xml`.

Coverage is a thermometer, not a turnstile.
