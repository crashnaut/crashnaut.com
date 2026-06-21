## TL;DR

The blank test file is a trap. A lot of low-value testing comes from _unnecessary_ tests that re-cover covered paths. Two questions prevent it.

**1. Does a test for this area already exist?**

- Yes → extend it / add a case. Stop here.
- No → question 2.

**2. Will this test increase coverage?** (exercise a path nothing else does)

- Yes → write it, following existing patterns.
- No → reconsider. Duplicate coverage = runtime + maintenance forever, protection of nothing.

```
need a test → exists? ─yes→ extend it
                │no
                ▼
           increases coverage? ─no→ reconsider (noise)
                │yes
                ▼
           write it, match the patterns
```

Reframe from "produce more tests" to "protect more behaviour." Start by looking for the test that might already exist, not with an empty file.
