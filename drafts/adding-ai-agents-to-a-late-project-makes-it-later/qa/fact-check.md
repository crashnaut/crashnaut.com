# Fact check: Adding AI Agents to a Late Project Makes It Later

Checked 2026-11-21 against fetched pages only. Covers index.md and tldr.md.

| Claim | Verdict | Evidence (URL + short quote) | Replacement wording |
|---|---|---|---|
| Description: "Brooks's law is 50 years old" | SOFTEN | Wikipedia cites the 1975 book; 2026 − 1975 = 51 | "Brooks's law is over 50 years old" |
| "Fred Brooks wrote this down in 1975" | OK | https://en.wikipedia.org/wiki/Brooks%27s_law: "The Mythical Man-Month. 1995 [1975]" | — |
| Brooks's law quote "adding manpower to a late software project makes it later" [1] | OK | Wikipedia: "Adding manpower to a late software project makes it later." Verbatim (only the capital A differs, fine mid-sentence). The 1975 book itself wasn't fetched; the quote is checked via Wikipedia | — |
| "it rests on three costs [2]": ramp-up, communication channels, indivisible tasks | OK | Wikipedia: "Brooks points to the main factors…" (three numbered items); "Brooks calls this the 'ramp up' time"; "the number of different communication channels increases rapidly with the number of people" | — |
| "one person makes a baby in nine months, and nine people can't make one in a month" | SOFTEN | Wikipedia attributes the point to Brooks: "while it takes one woman nine months to make one baby, 'nine women can't make a baby in one month'". The attribution is fair. The paraphrase changes "women" to "person/people", and Wikipedia frames it as limited divisibility of tasks | "one woman makes a baby in nine months; nine women can't make one in a month." |
| Brooks called the law an "outrageous oversimplification" [2] | OK | Wikipedia: "According to Brooks himself, the law is an 'outrageous oversimplification'". Verbatim and attributed to Brooks. Wikipedia cites the 1995 edition, so the phrase is likely from the 20th-anniversary edition, not 1975; the draft doesn't claim a year | — |
| "It only applies to projects that are already late." | OK | Wikipedia: "Brooks's law only applies to projects that are already late." (This is Wikipedia's reading, cited to McConnell; it isn't Brooks's own caveat. The sentence order could imply Brooks said it, but it's acceptable.) | — |
| "it describes the general rule well enough" | OK | Wikipedia: "but it captures the general rule" | — |
| "The best-known criticism of the law is that it treats all added labor as equal [2]" | SOFTEN | Wikipedia: "The law assumes that all added labour is equal, which is not true." (Berkun 2006). The criticism is described accurately, but Wikipedia lists it as one criticism among several (McConnell, Hsia et al.), not the best-known | "One common criticism of the law is that it treats all added labor as equal [2]." |
| n(n−1)/2 values and bar chart: 3→3, 5→10, 8→28, 12→66 | OK | 3·2/2=3; 5·4/2=10; 8·7/2=28; 12·11/2=66. The formula is standard combinatorics; Wikipedia gives no formula, so it needs no citation | — |
| "Adding three people almost triples the coordination" | OK | 28/10 = 2.8× | — |
| "5 people: 10 lines" diagram | OK | The SVG path has 10 segments | — |
| "Nobody hires three contractors in week 10 anymore." | SOFTEN | The author can't know this; no source | "Fewer teams hire three contractors in week 10 now." |
| "When the session ends, the understanding it built goes with it." | SOFTEN | No source; agent memory and context files (which the previous sentence mentions) can persist some of it | "When the session ends, most of what it learned goes with it." |
| "They don't talk to each other" (agents) | SOFTEN | No source; multi-agent setups do exchange messages | "They mostly don't talk to each other" |
| "Telemetry from over 10,000 developers" [3] | OK | https://www.faros.ai/blog/ai-productivity-paradox-report-2025: "telemetry from over 10,000 developers across 1,255 teams" | — |
| "On teams with high AI adoption, developers merged 98% more pull requests … PR review time grew 91%" | OK | Faros: "Developers on teams with high AI adoption complete 21% more tasks and merge 98% more pull requests, but PR review time increases 91%". Methodology compares each team's lowest- and highest-adoption quarters | — |
| "[on teams with high AI adoption] average PR size grew 154%" | FIX | Faros doesn't tie this figure to high-adoption teams: "AI adoption is consistently associated with a 9% increase in bugs per developer and a 154% increase in average PR size." | "…developers merged 98% more pull requests and PR review time grew 91%; AI adoption was linked to 154% larger PRs." |
| "Output grew much faster than anyone's capacity to read it" | OK | An interpretation, supported by Faros: "revealing a critical bottleneck: human approval" | — |
| "late projects are usually late because of them [decisions]" | SOFTEN | No source. Wikipedia: "Scheduling mistakes account for a large number of late projects." | "and late projects are often late because of them." |
| "Brooks's advice mostly survives" (before a do/don't list) | SOFTEN | The list (cut scope, add early, cap WIP) isn't Brooks's own advice as fetched; "add people earlier" is Wikipedia's exceptions section, not Brooks | "The classic advice mostly survives" |
| "This is the economic change of the last two years" / "Reading … cost the same as before" | OK | Opinion, not presented as data | — |
| Source 3: Faros AI, "The AI Productivity Paradox Report 2025", July 23, 2025 | OK | The page shows "July 23, 2025" and the title "The AI Productivity Paradox Report 2025" | — |
| Source 1: Brooks, The Mythical Man-Month, Addison-Wesley, 1975 | OK | Wikipedia ref: "Addison-Wesley", "1995 [1975]". Not checked against the book itself | — |
| tldr.md: "High-AI-adoption teams merged 98% more PRs while review time grew 91%" | OK | Faros quote above | — |
| tldr.md: "ramp-up, communication overhead and indivisible work" | OK | Wikipedia's three factors | — |

## Sources blocked or empty
- None blocked. The Mythical Man-Month (1975) wasn't available to fetch, so its quotes were checked via Wikipedia only. Brooks's original child-bearing wording couldn't be confirmed from a primary source.
