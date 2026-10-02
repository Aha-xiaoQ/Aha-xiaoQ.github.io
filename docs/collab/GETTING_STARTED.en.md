# Local setup and paths

[简体中文](GETTING_STARTED.md) | **English**

## Prerequisites

Use a complete repository checkout and Node.js 22+. Website and collaboration scripts use Node's standard library and require no third-party npm dependencies or `npm install`. The historical `collab-r01` incremental package omits games, fonts and complete downloads and cannot replace a full checkout. Historical Linux results do not establish native Windows acceptance.

## Start the server

From the complete repository root, run:

```sh
npm run dev
```

Open `http://127.0.0.1:4173/notes/?lang=en`. Windows users can use `start-dev.cmd`; if the port is occupied, use `npm run dev -- --port 4174`. The read-only server binds only to 127.0.0.1 and has no upload or write API. Stop it with Ctrl+C. Do not start a temporary server inside a game subdirectory; shared resources require the repository root.

| Purpose | Current path |
| --- | --- |
| Home | `/` |
| Development directory | `/notes/` |
| Contribution guide | `/notes/contribute/` |
| Website guides | `/notes/pixel-workshop/docs/` |
| Mario Mix guides | `/notes/mario-mix/docs/` |
| Four published demos | `/games/mario-mix/play.html`, `/games/mario-mix-2/play.html`, `/games/mario-mix-3/play.html`, `/games/mario-mix-4/play.html` |

`/dev/` and `/dev/guide.html` retain old-link compatibility and are no longer the primary starting point. URL parameters `lang=zh` / `lang=en` select the website language; games, original experiments and untranslated historical material retain their own language.

## Edit content and status

Edit website content in `content/` and `config/`, and project guides in `content/development/projects/`. Read the [current website guides](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/?lang=en), then run `npm run platform:verify`. It builds, checks, tests and runs browser regressions on the publication artifact; it does not automatically push or deploy.

Edit collaboration status in `collab/project.json`, checking the date, next task, delivery state and acceptance evidence. Run `npm run collab:build`, and commit the source, `dev/project-data.js` and `collab/TASKS.md` together. Browser drafts do not synchronize with GitHub. Export and compare an older conflicting draft before editing; do not overwrite newer source data.

`npm run check` and `npm test` now aggregate repository checks and tests beyond the old collaboration tools. `npm run doctor` checks entries and Git state; it does not download or repair missing files or certify gameplay. `npm run oss:verify` checks the exact license inventory and provenance consistency, not authorization of unknown assets.

## Verification limits

Restore missing games, fonts or downloads from the correct repository content; do not conceal missing files with fallbacks or substitutes. Develop through HTTP; double-clicking HTML does not verify every runtime mode. Automated tests cannot replace audio listening, natural completion, touch or physical-gamepad acceptance. Identify devices you have not tested.
