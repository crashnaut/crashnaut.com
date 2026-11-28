# Fact-check: How to Be a -10x Engineering Manager When Code Is Cheap

Checked 2026-11-21 against pages fetched that day. Blocked or empty sources: none. (taylor.town/-10x has no author or date on the page; authorship confirmed via Sessionize "How to be a -10x Engineer" talk by Taylor Troesh, https://sessionize.com/s/surprisetalk/how-to-be-a-10x-engineer/87676.)

| Claim | Status | Evidence | Replacement wording |
| --- | --- | --- | --- |
| Classic -10x manager wasted time with meetings, rituals and decisions nobody had authority to make [1] | OK | https://taylor.town/-10x: "Meetings wreck calendars."; "Create pointless rituals"; "Ensure nobody has the authority to make any decisions" | |
| Source 1: Taylor Troesh, "How to be a -10x Engineer", undated | OK | Page title "How to be a -10x Engineer", no date; author per Sessionize listing | |
| Telemetry from over 10,000 developers; high-AI-adoption teams merge 98% more PRs while completing 21% more tasks [2] | OK | Faros: "telemetry from over 10,000 developers across 1,255 teams"; "Developers on teams with high AI adoption complete 21% more tasks and merge 98% more pull requests" | |
| Goodhart's law quote "When a measure becomes a target, it ceases to be a good measure" [3] | OK | https://en.wikipedia.org/wiki/Goodhart%27s_law: that wording is Marilyn Strathern's 1997 phrasing; Goodhart stated the law in 1975. "For decades" holds | Optional: "...in Marilyn Strathern's phrasing" if you want the attribution exact |
| Diagram: Average PR size +154% | SOFTEN | Faros: "AI adoption is consistently associated with a 9% increase in bugs per developer and a 154% increase in average PR size." Tied to AI adoption generally, not specifically to the high-adoption cohort | Keep number; see caption fix below |
| Diagram: PR review time +91% | OK | Faros: "PR review time increases 91%" (high-adoption teams) | |
| Diagram caption: "Same teams, same period (high-AI-adoption teams, June 2025 telemetry)" | FIX | Faros: data "covers up to two years of history, aggregated by quarter"; "This version of the report reflects analysis as of June 2025." Bugs and PR size are not high-adoption-only figures | "Faros AI telemetry, analysis as of June 2025" |
| "Bugs per developer rose 9% on high-adoption teams" [2] | SOFTEN | Faros: "AI adoption is consistently associated with a 9% increase in bugs per developer" (not scoped to high-adoption teams) | "AI adoption was associated with 9% more bugs per developer [2]" |
| "PR review time grew 91% on high-adoption teams" [2] | OK | Faros: "PR review time increases 91%", in the high-adoption findings | |
| Brooks wrote in 1975 why adding people to a late project makes it later [4] | OK | https://en.wikipedia.org/wiki/The_Mythical_Man-Month: Frederick P. Brooks Jr., Addison-Wesley, 1975; "Adding manpower to a late software project makes it later." | |
| 2025 DORA report: AI is "a mirror and a multiplier", boosts cohesive orgs, highlights weaknesses in fragmented ones [5] | OK | https://blog.google/technology/developers/dora-report-2025/ (Ryan J. Salva, September 23, 2025): AI can act as a "mirror and a multiplier." "In cohesive organizations, AI boosts efficiency. In fragmented ones, it highlights weaknesses." Quote is verbatim without the article "a" in the source; fine as used | |
| DORA tracks five software delivery metrics [6] | OK | https://dora.dev/guides/dora-metrics-four-keys/ (title "DORA's software delivery performance metrics") lists five | |
| Table: Change lead time = time from commit to running in production | OK | "time it takes for a change to go from committed to version control to deployed in production" | |
| Table: Deployment frequency = how often the team deploys | OK | "The number of deployments over a given period or the time between deployments." | |
| Table: Failed deployment recovery time = recover from a deployment that "needs intervention" | SOFTEN | "The time it takes to recover from a deployment that fails and requires immediate intervention." | "How long it takes to recover from a failed deployment" |
| Table: Change fail rate = share of deployments that need immediate intervention | OK | "The ratio of deployments that require immediate intervention following a deployment." | |
| Table: Deployment rework rate = share of deployments that are unplanned fixes for production incidents | OK | "The ratio of deployments that are unplanned but happen as a result of an incident in production." | |
| "Nobody notices for a quarter"; QA engineers "have found other jobs" | OK (satire) | Illustrative, not a factual claim | |
| tldr: "review time grew 91% and bugs per developer 9%" (under high-AI-adoption teams) | SOFTEN | As above: the 9% is tied to AI adoption generally | "...review time grew 91%; AI adoption also came with 9% more bugs per developer." |
