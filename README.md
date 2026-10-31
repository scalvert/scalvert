<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/banner-dark.svg">
  <img alt="Steve Calvert, software engineer at Glean" src="assets/banner-light.svg" width="100%">
</picture>

I build developer tools: test harnesses, linters, codemods, and lately the pieces that let AI agents work with code and docs. I mostly write TypeScript on Node.js, plus some Python.

I'm a software engineer at [Glean](https://www.glean.com). I work on the developer platform: the [Glean APIs](https://developers.glean.com), MCP, and the tools people use to build on Glean. Before that I worked on web infrastructure at LinkedIn. Much of that work is open source, including [Checkup](https://github.com/checkupjs/checkup), [lint-todo](https://github.com/lint-todo/utils) and a long run maintaining Ember's linting and testing libraries.

[LinkedIn](https://www.linkedin.com/in/stevecalvert/) · [npm](https://www.npmjs.com/~scalvert) · [Glean developer docs](https://developers.glean.com)

<!-- BEGIN:stats -->
The 68 packages I maintain on [npm](https://www.npmjs.com/~scalvert) get about 3.2M downloads a month. I've had 1,441 pull requests merged on GitHub, 1,132 of them in other people's projects.
<!-- END:stats -->

## What I'm building now

Most of my recent work is about AI agents: docs they can read, a review process they have to follow, and tests and evals that show whether they work.

<!-- BEGIN:now -->
| Project | What it does | Stars | npm/month |
| --- | --- | --: | --: |
| [docusaurus-plugin-mcp-server](https://github.com/scalvert/docusaurus-plugin-mcp-server) | Serves a Docusaurus site as an MCP server, so Claude, Cursor and other agents can search and read your docs. | 35 | 20k |
| [agent-review](https://github.com/scalvert/agent-review) | A code review harness that people and AI agents run through the same commands. Models make the findings. The harness enforces the steps, independent verification and human sign-off. |  |  |
| [skills](https://github.com/scalvert/skills) | Agent Skills for Claude Code and Codex: self-review, pull request review, working through review comments, and plain writing. |  |  |
| [mcp-server-tester](https://github.com/gleanwork/mcp-server-tester) | Playwright-based tests and evals for MCP servers, with an LLM judge. I'm its main author at Glean. | 19 |  |
| [oncue](https://github.com/scalvert/oncue) | Narrated explainer videos from code. Each visual lines up with the word it belongs to, and terminal and browser captures come from real runs. |  |  |
| [edd](https://github.com/scalvert/edd) | Eval-driven development for prompts. It runs test cases against an LLM judge, compares them to a baseline, and can fix regressions through Claude Code. |  |  |
| [signals](https://github.com/scalvert/signals) | Ranks what most needs a maintainer's attention across their repos, from a scheduled GitHub Action with no server. | 2 |  |
<!-- END:now -->

## Testing and release tools

These tools test against real files and real processes instead of mocks, and keep docs and releases in step with the code.

<!-- BEGIN:tools -->
| Project | What it does | Stars | npm/month |
| --- | --- | --: | --: |
| [fixturify-project](https://github.com/stefanpenner/node-fixturify-project) | Builds real npm projects on disk for tests. I co-maintain it. | 13 | 1.3M |
| [bintastic](https://github.com/scalvert/bintastic) | Runs your CLI as a subprocess against real files and captures the output, so CLI tests read like unit tests. | 4 | 918 |
| [markdown-code](https://github.com/scalvert/markdown-code) | Keeps code samples in Markdown in sync with real source files that you can lint and test. | 1 | 2.8k |
| [workspaces](https://github.com/release-it-plugins/workspaces) | A release-it plugin that publishes every package in a workspace. | 71 | 33k |
| [jest-to-vitest](https://github.com/scalvert/jest-to-vitest) | A jscodeshift codemod that moves Jest tests to Vitest. | 13 |  |
| [python-fixturify-project](https://github.com/scalvert/python-fixturify-project) | A Python port of fixturify-project. | 3 |  |
<!-- END:tools -->

## Earlier open source

Before Glean, most of my open source work was infrastructure for large Ember.js codebases: linting, accessibility testing, async test safety, and gradual adoption of new lint rules. I'm one of the main authors of each project below.

<!-- BEGIN:history -->
| Project | What it does | Stars | npm/month |
| --- | --- | --: | --: |
| [checkup](https://github.com/checkupjs/checkup) | A health checkup for JavaScript projects, with output in SARIF. I wrote most of it. | 78 |  |
| [lint-todo](https://github.com/lint-todo/utils) | Turns existing lint violations into todos with due dates, so a large codebase can adopt a new rule without fixing everything first. | 2 | 431k |
| [ember-template-lint](https://github.com/ember-template-lint/ember-template-lint) | The linter for Ember and Handlebars templates. I was a maintainer and added its todo support. | 265 | 668k |
| [ember-lifeline](https://github.com/ember-lifeline/ember-lifeline) | Manages the lifecycle of async work in Ember objects so tests do not leak. | 237 |  |
| [ember-a11y-testing](https://github.com/ember-a11y/ember-a11y-testing) | Runs axe accessibility audits inside Ember tests. | 136 |  |
| [ember-test-waiters](https://github.com/emberjs/ember-test-waiters) | Lets Ember's test helpers wait for async operations to finish. | 31 | 77k |
| [sarif-js-sdk](https://github.com/microsoft/sarif-js-sdk) | JavaScript tools for SARIF, the standard format for static analysis results. | 34 |  |
<!-- END:history -->

## Recent releases

<!-- BEGIN:releases -->
- [docusaurus-plugin-mcp-server v2.7.0](https://github.com/scalvert/docusaurus-plugin-mcp-server/releases/tag/v2.7.0) on Oct 30, 2026
- [skills v0.5.0](https://github.com/scalvert/skills/releases/tag/v0.5.0) on Oct 21, 2026
- [agent-review v0.3.0](https://github.com/scalvert/agent-review/releases/tag/v0.3.0) on Oct 21, 2026
- [bintastic v4.2.1](https://github.com/scalvert/bintastic/releases/tag/v4.2.1) on Aug 30, 2026
- [markdown-code v1.2.0](https://github.com/scalvert/markdown-code/releases/tag/v1.2.0) on Jul 21, 2026
- [docusaurus-plugin-search-glean v0.7.1](https://github.com/scalvert/docusaurus-plugin-search-glean/releases/tag/v0.7.1) on Jun 19, 2026
<!-- END:releases -->

<sub>This page updates itself every week. A [GitHub Action](.github/workflows/update-readme.yml) runs [`scripts/update-readme.mjs`](scripts/update-readme.mjs), which reads [`projects.json`](projects.json) and fills in stars, downloads and releases from GitHub and npm.</sub>
