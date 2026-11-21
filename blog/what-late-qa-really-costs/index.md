---
title: "What Late QA Really Costs"
slug: what-late-qa-really-costs
description: "The 1-10-100 bug curve is folklore. Late QA still costs you, in rework, escaped defects and regulator fines."
author: Mike Sell
date: 2026-10-10T00:00:00.000Z
updated: 2026-11-21T00:00:00.000Z
tags: QA, Testing Strategy, FinTech
---

A while ago I started keeping a list in my notes of how QA gets quietly removed from teams. Goodbye defect reports. Goodbye reproduction steps. Goodbye test cases and end-to-end runs. Hello "everyone is responsible for quality", which in practice means nobody is. The usual defence of QA in those conversations is one chart, and that chart is the weakest argument we have.

This post is about the business side, so there's no code. Where the cost curve came from, what the evidence actually says, what late QA costs in FinTech, and the cheap checkpoints I put on a new project.

## The chart everyone shows

You've seen it in a slide deck. A bug costs 1 unit to fix in requirements, 10 in testing and 100 in production. The credit line usually says "IBM Systems Sciences Institute".

Nobody has turned up the underlying data. The trail stops at a 1987 textbook citing IBM internal course notes [1].

The careful research says something milder:

- A fix after delivery is *often* about 100 times more expensive than one made in requirements or design on large systems. On small, non-critical systems the ratio is closer to 5:1 [2].
- Across 171 projects and about 47,000 defect logs, median fix time for a coding defect barely moved: 10 minutes in code review, 16 in acceptance testing [3].

Treat the neat 1-10-100 progression as folklore [4].

:::bar-chart log[How much more a late fix costs, by source (multiple of an early fix, log scale)]
The slide (no known data) | 100 | bad
Large systems ("often") | 100 | amber
Small systems | 5 | neutral
171 projects (median fix time) | 1.6 | good
:::

These bars aren't like-for-like. One measures total cost. Another measures engineer minutes before release. What they agree on is that the engineer's fix time is not where the money goes. Argue with the 100x slide and a sharp engineering manager can take your case apart in one meeting.

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

1. **Rework.** Avoidable rework is often 40–50% of project effort, and about 80% of it comes from 20% of the defects [2]. A wrong assumption in a story gets built on: screens, endpoints, reports and tests all inherit it.
2. **Escapes.** Every stage that doesn't catch a defect hands it to a later, wider audience.
3. **Blast radius.** In nine large products, about 0.3% of defects caused about 90% of the downtime [2]. Most bugs are cheap. The few that reach production in the wrong place are not.
4. **Regulators.** In FinTech, a production failure can come with a fine, mandatory customer redress and a report you write for someone who doesn't care about your sprint.

## Testing at the end catches less

Defect removal efficiency (DRE) is the share of defects removed before release. Across more than 13,000 projects, a pipeline that relies on testing alone removes about 85% of defects. Add design and code inspections and a disciplined process, and it's about 98% [5].

That gap sounds small until you count what ships:

:::bar-chart[Defects delivered to customers per 1,000 function points]
Testing only (85% removed) | 613 | bad
Inspections + testing (98% removed) | 76 | good
:::

Most escaped defects start before anyone writes code [5]:

:::bar-chart[Where delivered defects originate (defects per function point)]
Requirements | 0.23 | bad
Design | 0.19 | amber
Documents | 0.12 | neutral
Bad fixes | 0.12 | neutral
Coding | 0.09 | info
:::

Coding is the smallest bar. A QA process that only starts when the code is "done" is aiming at the smallest source of escaped defects and missing the two biggest.

## What it looks like in FinTech

None of these was one engineer's typo found late. They were missing checks around deployments, configuration, migrations and UI.

| Incident | What happened | Cost | What would have caught it |
| --- | --- | --- | --- |
| Knight Capital, 2012 | New code missed one of eight servers; a reused flag woke dead code. No written deploy procedure, no second-person review, 97 warning emails before open [6]. | >$460M lost in ~45 minutes, plus a $12M SEC penalty | Deploy checklist and post-deploy smoke |
| TSB migration, 2018 | A config difference between two data centres went undetected in testing [7]. | £330.2M post-migration costs in 2018 [8], then £48.65M in fines in 2022 [9] | Test in an environment that matches production |
| RBS / NatWest / Ulster, 2012 | A software upgrade left more than 6.5M customers locked out of their accounts. The regulator cited weak change testing [10]. | £56M in fines | Change testing and a rollback plan |
| Citibank / Revlon, 2020 | An operator ticked one of three boxes on a payments screen; three approvers missed it. About $894M of principal went out with a $7.8M interest payment [11]. | ~$500M held by lenders until appeal in 2022 | Usability testing of a high-risk screen |
| Commonwealth Bank, from 2012 | A late-2012 deposit-machine update was blamed for 53,506 missing threshold transaction reports [12]. | Part of an A$700M AML penalty | Regression check on the compliance reports |

## Don't measure "cost per bug"

If your QA budget gets judged on cost per defect, it looks worse the better it works. Writing and running tests is a fixed cost. Fewer defects left to find means a higher cost per defect, even though every repair takes the same time. That's the cost-per-defect paradox [4].

:::bar-chart[Cost per defect by test stage when every repair costs the same $379 (illustrative model, US$)]
Unit test | 419 | good
Function test | 479 | info
Regression test | 579 | info
Performance test | 779 | amber
System test | 1045 | amber
Acceptance test | 2379 | bad
:::

Nothing about the repair changed between those rows. Only the number of defects left to find did. Track these three instead:

- **Defect removal efficiency:** bugs found before release divided by all bugs found, including the ones customers report.
- **Change failure rate:** how often a release needs a hotfix or rollback.
- **Rework rate:** how often a deployment needs rework. DORA added this as a fifth metric in 2024 [13].

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

- **QA in grooming.** Read the stories and acceptance criteria before the sprint starts. Ask the awkward questions (timeout, duplicate submit, a currency with no decimals). Requirements are the biggest source of escaped defects, so this is the cheapest hour of QA you'll buy.
- **Test cases before the code is done.** Fast and dirty: a spreadsheet with ID, priority, component, title, steps, expected result, and tick columns for smoke, full regression, post-deploy and automated. No tool needed on an early project. The ticks tell you what to automate first.
- **A walkthrough before handover.** Ten minutes with the developer before the change is marked ready. Find bugs while the change is still fresh.
- **Tag every bug with where it was found:** QA, release or production. After a couple of months you have your own cost-by-phase chart, which beats any slide deck.
- **Root cause anything found in UAT or production,** and feed it back into grooming as a question you'll always ask.

:::tip
Stop selling QA with the 100x curve. Sell it with rework, escapes and fines, and with your own "where was it found" numbers after a couple of months.
:::

## Why it matters more now

The 2024 DORA report found that more AI adoption came with lower delivery stability: −7.2% for every 25% increase in adoption [14]. The 2025 report says throughput is up but instability keeps rising [15]. Teams are writing more code, faster, with less review per line. Every checkpoint in the timeline above gets more valuable, not less.

**Why it matters for your team:** in software that moves money, the expensive defects are the ones regulators and customers find, and the cheapest place to stop them is a QA question asked before the code exists.

Related: [Every Integration Test Has the Same Five Parts](/blog/anatomy-of-an-integration-test), [The Golden Rule of Mocking](/blog/the-golden-rule-of-mocking), [AI Code Smells: A Review Checklist](/blog/ai-code-smells-review-checklist).

## Sources

1. The Register, "Everyone cites that 'bugs are 100x more expensive to fix in production' research, but the study might not even exist", July 2021. <https://www.theregister.com/2021/07/22/bugs_expense_bs/>
2. Barry Boehm and Victor Basili, "Software Defect Reduction Top 10 List", IEEE Computer, January 2001. <https://condor.depaul.edu/dmumaugh/readings/handouts/SE425/J81.pdf>
3. Tim Menzies, William Nichols, Forrest Shull and Lucas Layman, "Are delayed issues harder to resolve?", Empirical Software Engineering, 2017 (arXiv preprint 2016). <https://arxiv.org/abs/1609.04886>
4. Capers Jones, "Three Harmful Software Metrics", 2012. <https://www.ppi-int.com/wp-content/uploads/2021/01/Software-Quality-Metrics-Capers-Jones-120607.pdf>
5. Capers Jones, "Software Defect Removal Efficiency", 2011. <https://www.ppi-int.com/wp-content/uploads/2021/01/Software-Defect-Removal-Efficiency.pdf>
6. SEC, Administrative Proceeding File No. 3-15555 (Knight Capital), October 2013. <https://www.sec.gov/litigation/admin/2013/34-70694.pdf>
7. TSB Bank, Slaughter and May summary of the 2018 IT migration. <https://www.tsb.co.uk/news-releases/slaughter-and-may/>
8. TSB Bank, Annual Report and Accounts 2018. <https://www.tsb.co.uk/content/dam/tsb-public/documents/investors/financial-results-and-reports/2018/tsb-bank-ara-2018.pdf>
9. Bank of England, "TSB fined for operational resilience failings", December 2022. <https://www.bankofengland.co.uk/news/2022/december/tsb-fined-for-operational-resilience-failings>
10. FCA, "FCA fines RBS, NatWest and Ulster Bank Ltd £42 million for IT failures", November 2014. <https://www.fca.org.uk/news/press-releases/fca-fines-rbs-natwest-and-ulster-bank-ltd-%C2%A342-million-it-failures>
11. The Register, "Citibank's $900m Revlon blunder: How three clicks and a bad UI cost a fortune", February 2021. <https://www.theregister.com/2021/02/19/citibank_money_mistake/>
12. CIO, coverage of Commonwealth Bank's AUSTRAC case and the deposit-machine coding error. <https://www.cio.com/article/213753>
13. DORA, "History of the DORA metrics". <https://dora.dev/guides/dora-metrics/history/>
14. Google Cloud, "Announcing the 2024 DORA report". <https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report>
15. Google, "DORA report 2025". <https://blog.google/technology/developers/dora-report-2025/>

---

*Updated 21 Nov 2026: rewrote in house voice. Names and links moved out of the prose; claims now use numbered citations. Dropped the "It's Not the 100x Curve" subtitle.*
