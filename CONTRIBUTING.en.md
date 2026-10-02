# Contributing to Pixel Workshop

[简体中文](CONTRIBUTING.md) | **English**

Contributions include feedback, documentation, design, tests and focused code improvements for the website, tools and experiments. The four Mario Mix demos, Episode 3 M07 / 0.4.3 development candidate, Episode 4 R43 source project and map workshop are maintained separately. Licensing review of the complete games and all assets remains incomplete.

## Where to start

Read [Local setup](docs/collab/GETTING_STARTED.en.md), open [How to contribute](https://aha-xiaoq.github.io/notes/contribute/?lang=en), and choose a project and task. The [website guides](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/?lang=en) cover current content, structure and publishing. IDs in the [task summary (Chinese original)](collab/TASKS.md) are internal identifiers; they do not guarantee an existing GitHub Issue.

Discuss your intended scope in the task's Issue. If none exists, use the repository's task form and wait for the maintainer to confirm the scope. Discuss substantial features, characters, levels, engines or asset replacements first. Documentation corrections and focused fixes can go directly into a PR. Contributors use forks and feature branches and need no write access to the main repository; the maintainer reviews and merges changes.

## Keep a PR reviewable

Solve one problem at a time. Include the task, reason, reproduction steps, before/after behavior, checks actually run and devices not tested. Separate code changes from whole-file formatting, and preferably separate assets from gameplay changes. Do not submit another “final combined HTML” to bypass review of differences.

For website content, edit `content/`, `config/` or the relevant source document rather than generated pages. From a complete repository checkout, run:

```sh
npm run platform:verify
npm run oss:verify
```

`platform:verify` runs the existing builders, source checks and tests, publication-artifact checks and browser regressions. It does not commit, push or deploy. When changing `collab/project.json`, run `npm run collab:build` first and commit the source, `dev/project-data.js` and `collab/TASKS.md` together. Game projects have their own checks; website tests do not certify gameplay feel, natural completion or physical gamepads. List unexecuted checks honestly in the PR.

## Assets, upstream code and AI assistance

[LICENSE](LICENSE), [RIGHTS.md](RIGHTS.md) and the [exact-file audit](docs/oss/README.en.md) limit the original MIT scope. [LICENSE.collab](LICENSE.collab) retains its existing collaboration-tool grant. Third-party code, maps, artwork, audio, fonts, brands and unverified archives receive no new grant. A GitHub download, file-sharing link, game screenshot or AI output is not evidence of redistribution rights.

Register new material in `collab/assets-register.json` with source, author, license, allowed distribution, changes and attribution requirements. Keep unknown items pending and do not upload those assets. Discuss game changes with unclear licensing, or submit a written analysis; do not announce the entire game as open source without review.

AI assistance is welcome, but contributors must understand changes, check provenance and actually verify them. “AI says it was tested” is insufficient. Do not upload credentials, private meetings, chats or recordings.

## Project contribution guides

- [Episode 1 input-pilot guide (Chinese original)](packages/mario-mix/CONTRIBUTING.md) · [English website edition](https://aha-xiaoq.github.io/notes/mario-mix/docs/episode-one-contributing/?lang=en): historical R05 engineering scope, not the current state of every game.
- [Episode 3 contribution guide](https://aha-xiaoq.github.io/notes/mario-mix/docs/terra-contributing/?lang=en): source, tests and acceptance for the current M07 candidate. Merging and game publication are separate.
- [Website contributions](https://aha-xiaoq.github.io/notes/pixel-workshop/contribute/?lang=en) · [Lab contributions](https://aha-xiaoq.github.io/notes/lab/contribute/?lang=en).

## Status, attribution and conduct

After merging, the maintainer updates the appropriate project records and preserves authorship and contributions. A browser draft does not claim a remote Issue or notify others automatically. Completion needs reviewable evidence; a source merge does not imply deployment or device acceptance.

Respect contributors, discuss implementation and evidence, avoid personal attacks and do not expose private information. Report security issues through the channels in [SECURITY.md (Chinese original)](SECURITY.md).
