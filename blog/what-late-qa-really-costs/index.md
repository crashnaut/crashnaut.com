---
title: "What Late QA Really Costs (It's Not the 100x Curve)"
slug: what-late-qa-really-costs
description: "The 1-10-100 bug curve is folklore. Late QA still costs you, in rework, escaped defects and regulator fines. Here's the evidence, charted."
author: Mike Sell
date: 2026-10-10T00:00:00.000Z
tags: QA, Testing Strategy, FinTech
---

A while ago I started keeping a list in my notes of how QA gets quietly removed from teams. Goodbye defect reports. Goodbye reproduction steps. Goodbye test cases and end-to-end runs. Hello "everyone is responsible for quality", which in practice means nobody is. The usual defence of QA in those conversations is one chart, and it turns out that chart is the weakest argument we have.

This post is about the business side, so there's no code. It covers where the famous cost curve came from, what the better evidence says, what late QA costs in FinTech specifically, and the cheap things I put in place on a new project so the costs never show up.

## The chart everyone shows

You've seen it in a slide deck. A bug costs 1 unit to fix in requirements, 10 in testing and 100 in production, credited to the "IBM Systems Sciences Institute".

Laurent Bossavit went looking for the source and traced it back to a 1987 textbook, which cites course notes from an IBM internal training programme. No underlying data has turned up ([The Register, 2021](https://www.theregister.com/2021/07/22/bugs_expense_bs/)). Hillel Wayne's verdict was that the chart is, as far as anyone can tell, made up ([2021](https://buttondown.com/hillelwayne/archive/i-ing-hate-science)).

The real research is more careful than the slide:

- **Boehm and Basili (2001)** wrote that a fix after delivery is *often* 100 times more expensive than one made in requirements or design, and that for small, non-critical systems the ratio is more like 5:1 ([IEEE Computer, PDF](https://condor.depaul.edu/dmumaugh/readings/handouts/SE425/J81.pdf)).
- **Menzies et al. (2016)** looked at 171 projects and about 47,000 defect logs, and found no delayed-issue effect. The median fix time for a coding defect went from 10 minutes in code review to 16 in acceptance testing ([arXiv](https://arxiv.org/abs/1609.04886)).
- **Capers Jones** calls the 100x claim an urban legend ([2012, PDF](https://www.ppi-int.com/wp-content/uploads/2021/01/Software-Quality-Metrics-Capers-Jones-120607.pdf)).

:::bar-chart log[How much more a late fix costs, by source (multiple of an early fix, log scale)]
The slide (no known data) | 100 | bad
Boehm, large systems ("often") | 100 | amber
Boehm, small systems | 5 | neutral
Menzies, 171 projects (median) | 1.6 | good
:::

These aren't measuring the same thing (Boehm talks about cost, Menzies about engineer minutes before release), so don't read the bars as like-for-like. What they agree on is that the engineer's fix time is not where the money goes. If you're arguing for QA with the 100x slide, a sharp engineering manager can take your case apart in one meeting.

## Where the money actually goes

Fixing the line of code costs about the same whenever you do it. What grows is everything around the fix.

<figure class="diagram">
<svg viewBox="0 0 700 330" role="img" aria-label="Stacked columns for six phases showing fix effort as a flat green layer, rework growing from build onwards, and incident, redress and regulator costs appearing only in production">
  <text class="d-text-sm" x="40" y="30">Illustrative shape, not measured data</text>
  <rect class="d-panel" x="555" y="55" width="110" height="205" rx="6"/>
  <text class="d-edge" x="610" y="48" text-anchor="middle">blast radius</text>
  <rect class="d-box-green" x="40" y="230" width="90" height="20"/>
  <rect class="d-box-green" x="145" y="230" width="90" height="20"/>
  <rect class="d-box-green" x="250" y="230" width="90" height="20"/>
  <rect class="d-box-amber" x="250" y="220" width="90" height="10"/>
  <rect class="d-box-green" x="355" y="230" width="90" height="20"/>
  <rect class="d-box-amber" x="355" y="205" width="90" height="25"/>
  <rect class="d-box-green" x="460" y="230" width="90" height="20"/>
  <rect class="d-box-amber" x="460" y="190" width="90" height="40"/>
  <rect class="d-box-red" x="460" y="165" width="90" height="25"/>
  <text class="d-text-sm" x="505" y="181" text-anchor="middle">incident</text>
  <rect class="d-box-green" x="565" y="230" width="90" height="20"/>
  <text class="d-text-sm" x="610" y="244" text-anchor="middle">fix</text>
  <rect class="d-box-amber" x="565" y="190" width="90" height="40"/>
  <text class="d-text-sm" x="610" y="214" text-anchor="middle">rework</text>
  <rect class="d-box-red" x="565" y="150" width="90" height="40"/>
  <text class="d-text-sm" x="610" y="174" text-anchor="middle">incident</text>
  <rect class="d-box-red" x="565" y="115" width="90" height="35"/>
  <text class="d-text-sm" x="610" y="137" text-anchor="middle">redress</text>
  <rect class="d-box-red" x="565" y="70" width="90" height="45"/>
  <text class="d-text-sm" x="610" y="97" text-anchor="middle">regulator</text>
  <path class="d-line" d="M30,250 L670,250"/>
  <text class="d-text-sm" x="85" y="270" text-anchor="middle">Requirements</text>
  <text class="d-text-sm" x="190" y="270" text-anchor="middle">Design</text>
  <text class="d-text-sm" x="295" y="270" text-anchor="middle">Build</text>
  <text class="d-text-sm" x="400" y="270" text-anchor="middle">Test</text>
  <text class="d-text-sm" x="505" y="270" text-anchor="middle">Release</text>
  <text class="d-text-sm" x="610" y="270" text-anchor="middle">Production</text>
  <rect class="d-box-green" x="40" y="296" width="12" height="12"/>
  <text class="d-text-sm" x="58" y="306">fix effort</text>
  <rect class="d-box-amber" x="150" y="296" width="12" height="12"/>
  <text class="d-text-sm" x="168" y="306">rework of work built on the bug</text>
  <rect class="d-box-red" x="370" y="296" width="12" height="12"/>
  <text class="d-text-sm" x="388" y="306">incident response, customer redress, fines</text>
</svg>
<figcaption>The green layer is the part the 100x slide argues about, and the evidence says it stays roughly flat. The amber and red layers are where late defects get expensive, and the red ones only exist once customers are involved.</figcaption>
</figure>

Four costs grow with time:

1. **Rework.** Boehm and Basili put avoidable rework at 40–50% of project effort, with about 80% of it coming from 20% of the defects. A wrong assumption in a story gets built on: screens, endpoints, reports and tests all inherit it.
2. **Escapes.** Every stage that doesn't catch a defect hands it to a later, wider audience. More on that below.
3. **Blast radius.** In nine large IBM products, about 0.3% of defects caused about 90% of the downtime (Boehm and Basili again). Most bugs are cheap. The few that reach production in the wrong place are not.
4. **Regulators.** In FinTech, a production failure can come with a fine, mandatory customer redress and a report you write for someone who doesn't care about your sprint.

## Testing at the end catches less

Capers Jones has benchmarked defect removal efficiency (DRE, the share of defects removed before release) across more than 13,000 projects. A pipeline that relies on testing alone removes about 85% of defects. Add design and code inspections and a disciplined process, and it's about 98% ([Jones, PDF](https://www.ppi-int.com/wp-content/uploads/2021/01/Software-Defect-Removal-Efficiency.pdf)).

That gap sounds small until you count what ships:

:::bar-chart[Defects delivered to customers per 1,000 function points (Capers Jones)]
Testing only (85% removed) | 613 | bad
Inspections + testing (98% removed) | 76 | good
:::

Jones's data also shows where the escaped defects start. Most come from before anyone writes code:

:::bar-chart[Where delivered defects originate (defects per function point, Capers Jones)]
Requirements | 0.23 | bad
Design | 0.19 | amber
Documents | 0.12 | neutral
Bad fixes | 0.12 | neutral
Coding | 0.09 | info
:::

Coding is the smallest bar. A QA process that only starts when the code is "done" is aiming at the smallest source of escaped defects and missing the two biggest.

## What it looks like in FinTech

Every one of these is a well-documented case. None was one engineer's typo found late. They were missing checks around deployments, configuration, migrations and UI, which is where early QA earns its keep.

| Incident | What happened | Cost | What would have caught it |
| --- | --- | --- | --- |
| Knight Capital, 2012 | New code wasn't copied to one of eight servers, and a reused flag woke up dead code. No written deployment procedure, no second-person review, and 97 warning emails before the market opened ([SEC](https://www.sec.gov/litigation/admin/2013/34-70694.pdf)) | Lost more than $460M in about 45 minutes, plus a $12M SEC penalty | A deployment checklist and a post-deploy smoke test |
| TSB migration, 2018 | A configuration difference between two data centres went undetected during testing ([TSB](https://www.tsb.co.uk/news-releases/slaughter-and-may/)) | £330.2M in post-migration costs in 2018, then £48.65M in fines in 2022 ([Bank of England](https://www.bankofengland.co.uk/news/2022/december/tsb-fined-for-operational-resilience-failings)) | Testing in an environment that matches production |
| RBS, NatWest and Ulster Bank, 2012 | A software upgrade left more than 6.5M customers unable to use their accounts, some for weeks. The FCA cited weak testing of software changes ([FCA](https://www.fca.org.uk/news/press-releases/fca-fines-rbs-natwest-and-ulster-bank-ltd-%C2%A342-million-it-failures)) | £56M in fines (FCA and PRA) | Change testing and a rollback plan |
| Citibank and Revlon, 2020 | An operator ticked one box out of three on a payments screen, and three approvers missed it. Citi sent about $894M of principal with a $7.8M interest payment ([The Register](https://www.theregister.com/2021/02/19/citibank_money_mistake/)) | About $500M was held by lenders until Citi won on appeal in 2022 | Usability testing of a high-risk screen |
| Commonwealth Bank, from 2012 | AUSTRAC alleged 53,506 missing threshold transaction reports. The bank blamed a coding error in a late-2012 update to its deposit machines ([CIO](https://www.cio.com/article/213753)) | Part of an A$700M AML penalty, which also covered other failings | A regression check on the compliance reports |

## Don't measure "cost per bug"

If your QA budget gets judged on cost per defect, it will look worse the better it works. Jones calls this the cost-per-defect paradox. Writing and running tests is a fixed cost, so the fewer defects there are left to find, the higher the cost per defect, even though every repair takes the same time.

:::bar-chart[Cost per defect by test stage when every repair costs the same $379 (Jones's illustrative model, US$)]
Unit test | 419 | good
Function test | 479 | info
Regression test | 579 | info
Performance test | 779 | amber
System test | 1045 | amber
Acceptance test | 2379 | bad
:::

Nothing about the repair changed between those rows. Only the number of defects left to find did. Track these three instead:

- **Defect removal efficiency:** bugs found before release divided by all bugs found, including the ones customers report.
- **Change failure rate:** the DORA metric for how often a release needs a hotfix or rollback.
- **Rework rate:** DORA added "deployment rework rate" as a fifth metric in 2024 ([DORA](https://dora.dev/guides/dora-metrics/history/)).

## What I put in place on a new project

None of this needs a test management tool or a big budget. Most of it comes from a QA guide I worked from years ago and kept using because it works.

<figure class="diagram">
<svg viewBox="0 0 700 260" role="img" aria-label="A delivery timeline from grooming to production with a QA checkpoint at each stage and a feedback loop from production back to grooming">
  <path class="d-flow" d="M40,120 L660,120"/>
  <path class="d-flow-head" d="M672,120 l -12,-6 l 0,12 z"/>
  <text class="d-text" x="80" y="98" text-anchor="middle">Grooming</text>
  <text class="d-text" x="215" y="98" text-anchor="middle">Build</text>
  <text class="d-text" x="350" y="98" text-anchor="middle">Handover</text>
  <text class="d-text" x="485" y="98" text-anchor="middle">Release</text>
  <text class="d-text" x="620" y="98" text-anchor="middle">Production</text>
  <circle class="d-node-green" cx="80" cy="120" r="11"/>
  <circle class="d-node-green" cx="215" cy="120" r="11"/>
  <circle class="d-node-green" cx="350" cy="120" r="11"/>
  <circle class="d-node-green" cx="485" cy="120" r="11"/>
  <circle class="d-node-red" cx="620" cy="120" r="11"/>
  <text class="d-edge" x="80" y="62" text-anchor="middle">QA starts here</text>
  <rect class="d-box" x="16" y="145" width="128" height="46" rx="5"/>
  <text class="d-text-sm" x="80" y="164" text-anchor="middle">QA reviews the</text>
  <text class="d-text-sm" x="80" y="180" text-anchor="middle">acceptance criteria</text>
  <rect class="d-box" x="151" y="145" width="128" height="46" rx="5"/>
  <text class="d-text-sm" x="215" y="164" text-anchor="middle">test cases written</text>
  <text class="d-text-sm" x="215" y="180" text-anchor="middle">before code is done</text>
  <rect class="d-box" x="286" y="145" width="128" height="46" rx="5"/>
  <text class="d-text-sm" x="350" y="164" text-anchor="middle">dev walks QA</text>
  <text class="d-text-sm" x="350" y="180" text-anchor="middle">through the change</text>
  <rect class="d-box" x="421" y="145" width="128" height="46" rx="5"/>
  <text class="d-text-sm" x="485" y="164" text-anchor="middle">smoke + post-deploy</text>
  <text class="d-text-sm" x="485" y="180" text-anchor="middle">on a prod-like env</text>
  <rect class="d-box-red" x="556" y="145" width="128" height="46" rx="5"/>
  <text class="d-text-sm" x="620" y="164" text-anchor="middle">tag where found,</text>
  <text class="d-text-sm" x="620" y="180" text-anchor="middle">root-cause escapes</text>
  <path class="d-line" d="M620,191 L620,225 L80,225 L80,199"/>
  <path class="d-arrow" d="M80,193 l -5,9 l 10,0 z"/>
  <text class="d-edge" x="350" y="245" text-anchor="middle">every escaped bug becomes a new grooming check</text>
</svg>
<figcaption>One cheap QA checkpoint per stage. The red one is the expensive place to find things, and the loop back to grooming is how you stop finding the same class of bug there twice.</figcaption>
</figure>

- **QA in grooming.** QA reads the stories and acceptance criteria before the sprint starts and asks the awkward questions (what happens on a timeout, a duplicate submit, a currency with no decimals). Requirements are the biggest source of escaped defects, so this is the cheapest hour of QA you'll buy.
- **Test cases before the code is done.** I keep them fast and dirty: a spreadsheet with ID, priority, component, title, steps, expected result, and four tick columns for smoke, full regression, post-deploy and automated. You don't need a tool on an early project. The tick columns tell you what to automate first.
- **A walkthrough before handover.** The developer shows QA the change for ten minutes before it's marked ready. The point is to find bugs while the change is still fresh, before it turns into rework.
- **Tag every bug with where it was found:** QA, release or production. After a couple of months you have your own cost-by-phase chart with real numbers, which beats any slide deck.
- **Root cause for anything found in UAT or production,** and feed the fix back into grooming as a question you'll always ask.

:::tip
Stop selling QA with the 100x curve. Sell it with rework, escapes and fines, and with your own "where was it found" numbers after a couple of months.
:::

## Why it matters more now

The 2024 DORA report found that more AI adoption came with lower delivery stability (−7.2% for every 25% increase in adoption) ([Google Cloud](https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report)). The 2025 report says throughput is up but instability keeps rising ([Google](https://blog.google/technology/developers/dora-report-2025/)). Teams are writing more code, faster, with less review per line. Every checkpoint in the timeline above gets more valuable, not less. (I wrote about [the review side of that](/blog/ai-code-smells-review-checklist) separately.)

**Why it matters for your team:** in software that moves money, the expensive defects are the ones regulators and customers find, and the cheapest place to stop them is a QA question asked before the code exists.

If you want the testing side of this in practice, [every integration test has the same five parts](/blog/anatomy-of-an-integration-test) and [the golden rule of mocking](/blog/the-golden-rule-of-mocking) are where I'd start.

## Sources

- Boehm and Basili, "Software Defect Reduction Top 10 List", IEEE Computer, January 2001 ([PDF](https://condor.depaul.edu/dmumaugh/readings/handouts/SE425/J81.pdf))
- Menzies, Nichols, Shull and Layman, "Are delayed issues harder to resolve?", Empirical Software Engineering, 2017 ([arXiv](https://arxiv.org/abs/1609.04886))
- Capers Jones, "Three Harmful Software Metrics", 2012 ([PDF](https://www.ppi-int.com/wp-content/uploads/2021/01/Software-Quality-Metrics-Capers-Jones-120607.pdf)) and "Software Defect Removal Efficiency", 2011 ([PDF](https://www.ppi-int.com/wp-content/uploads/2021/01/Software-Defect-Removal-Efficiency.pdf))
- The Register on the origin of the 1-10-100 curve, July 2021 ([link](https://www.theregister.com/2021/07/22/bugs_expense_bs/))
- SEC order on Knight Capital, October 2013 ([PDF](https://www.sec.gov/litigation/admin/2013/34-70694.pdf))
- Bank of England and FCA on TSB, December 2022 ([BoE](https://www.bankofengland.co.uk/news/2022/december/tsb-fined-for-operational-resilience-failings), [FCA](https://www.fca.org.uk/news/press-releases/tsb-fined-48m-operational-resilience-failings)); TSB Annual Report 2018 ([PDF](https://www.tsb.co.uk/content/dam/tsb-public/documents/investors/financial-results-and-reports/2018/tsb-bank-ara-2018.pdf))
- FCA on RBS, NatWest and Ulster Bank, November 2014 ([link](https://www.fca.org.uk/news/press-releases/fca-fines-rbs-natwest-and-ulster-bank-ltd-%C2%A342-million-it-failures))
- DORA metrics history ([link](https://dora.dev/guides/dora-metrics/history/)) and the 2024 and 2025 DORA reports
