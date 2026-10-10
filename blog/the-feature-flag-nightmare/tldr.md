## TL;DR

A QA-seat companion to Jerome Dane's [Feature Flags are Dangerous](https://jeromedane.medium.com/feature-flags-are-dangerous-88ef9d6c9f04). Flags are dangerous to write, and hell to test.

The core problem: every independent on/off flag _doubles_ the test surface. `n` flags = `2ⁿ` configurations.

:::bar-chart log[Configurations to test grow as 2ⁿ (log scale)]
3 flags | 8 | info
5 flags | 32 | amber
8 flags | 256 | bad
10 flags | 1024 | bad
:::

It's worse in reality. Flags interact, and the matrix multiplies again across environments × roles × cache states. Three flags can mean ~200 real configurations.

So teams test all-off and all-on, and ship the rest blind. The combination a user hits in prod is one nobody ran, which is "testing in production" by accident.

Automation doesn't save you, because the matrix is still exponential. Pairwise/combinatorial testing is the honest mitigation (it won't catch everything): 4 flags need 5 runs instead of 16, 10 flags need as few as 6 instead of 1,024 (tools like Microsoft PICT generate the set).

What helps (and shrinks the grid):

- Fewer flags; prefer small releases and branches.
- Treat every live flag as a tested parameter, with pairwise coverage.
- Kill flags fast. Each one removed _halves_ the surface.
- Log which flags were on, so failures reproduce.
- Pin flag state in test runs.

Flags move risk into the tester's matrix, which grows exponentially. Fewer flags, killed fast, is the kindest thing you can do for QA.
