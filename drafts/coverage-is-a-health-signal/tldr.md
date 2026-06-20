## TL;DR

"Every PR must raise coverage" sounds rigorous but rots your suite — people optimise for the number, not the code.

**Better:** set a codebase-wide target (e.g. 80%), reach it collectively, and read coverage as a trend vs the work done.

**Three patterns:**

- New code + its tests → ratio **steady**. Healthy, and the common case.
- Tests for previously untested code → ratio **climbs**. Healthy backfill.
- New code with no tests, or many tests with no movement → **investigate**. The only real signal.

**Why per-PR gates backfire:** padding trivial tests to tick the number up, avoiding legacy code, arguing about a percentage instead of test quality. The gate even reads the healthy "flat" case as a failure.

Coverage is a thermometer, not a turnstile. Read it, don't stand guard at it.
