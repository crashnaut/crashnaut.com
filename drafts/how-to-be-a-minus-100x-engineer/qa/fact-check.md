# Fact-check: How to Be a -100x Engineer: Let the Agent Read Your Messages

Checked 2026-11-21 against fetched pages. Satire and the clearly labelled example are not facts, but the example's arithmetic was checked. Line numbers refer to index.md.

Sources fetched: taylor.town/-10x, taylor.town/about, HN Algolia API, changelog.com/news/zDX4, modelcontextprotocol.io intro, web search for Atlassian Rovo MCP and Slack MCP docs, web search for Brysbaert 2019 reading rate. None blocked or empty. taylor.town shows no date on the essay page.

| Claim | Verdict | Evidence (URL + short quote) | Replacement wording |
|---|---|---|---|
| L13 -10x engineer wastes 400 engineering hours a week [1] | OK | https://taylor.town/-10x "simply waste 400 engineering hours per week" | |
| L13 "the output of ten colleagues" | OK | taylor.town/-10x item 1 "Nullify 10 engineers' output" | |
| L13 "My QA peers joked ... -100x engineers in our midst" | UNVERIFIABLE | Author's own experience; nothing to fetch. Fine as first-person anecdote (TODO already asks Mike to confirm) | |
| L17 MCP is "an open-source standard for connecting AI applications to external systems" [2] | OK | https://modelcontextprotocol.io/docs/getting-started/intro "MCP (Model Context Protocol) is an open-source standard for connecting AI applications to external systems." (verbatim) | |
| L17 MCP servers exist for Jira and for Slack that let an agent read and post | OK | Atlassian Rovo MCP server GA https://www.atlassian.com/blog/announcements/atlassian-rovo-mcp-ga (AI clients "take action" in Jira); Slack MCP server https://docs.slack.dev/ai/slack-mcp-server/ ("search channels, send messages"). Uncited in post; optional to add | |
| L53 "600-word update takes about three minutes to read properly" | OK (example) | Brysbaert 2019 meta-analysis: adult silent reading of non-fiction averages 238 wpm (600 words = 2.5 min; range 175-300 wpm = 2-3.4 min). Inside a paragraph labelled "made-up but ordinary numbers" | |
| L53 arithmetic: 3 min x 40 readers = 2 hours | OK | 120 min = 2 h | |
| L53 10 posts/day = 20 h/day, about 100 h/week | OK | 10 x 2 h = 20 h; x 5 workdays = 100 h. "a week" assumes 5 working days, implicit | |
| L53 four engineers = a -10x engineer | OK | 4 x 100 h = 400 h, matches [1] | |
| L55-59 chart: 2/day = 20, 5/day = 50, 10/day = 100 h/week | OK | 2x2x5 = 20; 5x2x5 = 50; 10x2x5 = 100. Title begins "Example:" | |
| L53/L55 labelled as example | OK | "Take an example, with made-up but ordinary numbers"; chart "Example: ..."; diagram "Illustrative, not measured" | |
| L61 "The original -10x engineer had to write the long messages by hand [1]" | OK | taylor.town/-10x: "write lengthy messages/documents and share as widely as possible." | |
| L77 wall-of-text story (refused to read, called him, three questions, "crickets") | UNVERIFIABLE | Author's own anecdote; TODO already flags it | |
| L77 "The phrase is now quoted all over the org." | UNVERIFIABLE | Author's own claim; can't be checked and reads as fact. Hedge it | "The phrase still gets quoted around the org." |
| L108 FinTech tickets as audit record | OK | Opinion/hypothetical, not a cited fact | |
| L114 source 1 "undated" | FIX | First HN submission 2023-04-04 (875 pts) https://hn.algolia.com/api/v1/search?query=%22-10x%20Engineer%22&tags=story ; Changelog news 2023-04-06 https://changelog.com/news/zDX4 . taylor.town/about names Taylor Troesh | "Taylor Troesh, "How to be a -10x Engineer", taylor.town, 2023." |
| L115 source 2 title, URL, accessed date | OK | Page title "What is the Model Context Protocol (MCP)?" | |
| tldr L7 example: 10 posts/day, 600 words, 40 readers = about 100 team hours a week | OK | Matches L53 arithmetic; labelled "Example" | |
| tldr L8 "If they can't answer in a minute" | OK | Matches L79 | |
