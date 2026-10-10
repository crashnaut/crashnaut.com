---
title: "What Late QA Really Costs (It's Not the 100x Curve)"
slug: what-late-qa-really-costs
---

- **Drop the 1-10-100 slide.** It traces back to IBM course notes with no known data. Boehm said "often 100x" for large systems and about 5:1 for small ones. A 171-project study found median fix time barely grows before release (10 to 16 minutes).
- **Argue with the costs that do grow:** rework (40–50% of effort), escaped defects (testing alone removes ~85%, inspections plus testing ~98%), blast radius (0.3% of defects caused ~90% of downtime) and regulator fines.
- **Most escaped defects start in requirements and design,** so QA that starts when code is "done" aims at the smallest source.
- **FinTech examples:** Knight Capital lost more than $460M in about 45 minutes. TSB's migration cost £330.2M in 2018 plus £48.65M in fines. RBS was fined £56M for an upgrade failure.
- **Don't measure cost per bug.** It rises as quality improves. Track defect removal efficiency, change failure rate and rework rate instead.

On a new project:

1. QA reviews acceptance criteria in grooming.
2. Write fast-and-dirty test cases before the code is done: ID, priority, component, title, steps, expected, plus smoke / regression / post-deploy / automated ticks.
3. The developer walks QA through each change before handover.
4. Tag every bug with where it was found (QA, release, production).
5. Root-cause anything found in UAT or production, and turn it into a grooming question.
