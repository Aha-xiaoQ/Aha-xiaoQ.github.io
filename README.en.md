# XiaoQ · Pixel Workshop

[简体中文](README.md) | **English**

A personal website and project workspace featuring browser games, a desktop pet, developer tools, development notes, and source packages.

[Website](https://aha-xiaoq.github.io/?lang=en) · [Projects](https://aha-xiaoq.github.io/projects/?lang=en) · [Games](https://aha-xiaoq.github.io/games/?lang=en) · [Tools](https://aha-xiaoq.github.io/tools/?lang=en) · [Development](https://aha-xiaoq.github.io/notes/?lang=en)

## What's included

- **Personal website**: project showcases, game and tool entries, development notes, an about page, and a guestbook. The site supports Chinese and English.
- **Mario Mix**: three independently playable episodes, plus development source, contribution guides, and task records for episode 3.
- **Level atlas**: reference templates for 32 levels across eight worlds, for inspecting geometry and creating adaptations.
- **Q Mimi and other projects**: desktop pet assets, project introductions, and downloads.

## Mario Mix status

| Component | Version and scope |
| --- | --- |
| Online games | [Episode 1](https://aha-xiaoq.github.io/games/mario-mix/) · [Episode 2](https://aha-xiaoq.github.io/games/mario-mix-2/) · [Episode 3](https://aha-xiaoq.github.io/games/mario-mix-3/); each retains its own implementation |
| Episode 3 development source | **M07 / 0.4.3**, a candidate awaiting acceptance, maintained separately from the online game |
| Level templates | **W02 / 0.2.0**, 32 reference templates using a fixed M06 runtime; not yet a complete eight-world game |

[Source and setup](https://aha-xiaoq.github.io/notes/mario-mix/docs/terra-source/) · [Level atlas and integration](https://aha-xiaoq.github.io/notes/mario-mix/docs/terra-stages/) · [Current tasks](https://aha-xiaoq.github.io/notes/mario-mix/tasks/)

Detailed project records and most development guides are currently in Chinese.

## Run locally

Requires **Node.js 22 or later**. The website tooling has no third-party npm dependencies; `npm install` is not required.

```sh
git clone https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io.git
cd Aha-xiaoQ.github.io
npm run dev
```

Open <http://127.0.0.1:4173/> for the homepage or <http://127.0.0.1:4173/notes/> for development notes. Start from the repository root so shared resources resolve correctly.

If the port is occupied, run `npm run dev -- --port 4174`. On Windows, you can also double-click `start-dev.cmd`.

## Development and checks

| Command | Purpose |
| --- | --- |
| `npm run check` | Validate data, paths, script syntax, and generated-file consistency |
| `npm test` | Run automated tests |
| `npm run site:build` | Regenerate website showcase pages |
| `npm run journal:build` | Regenerate development notes and guide pages |
| `npm run terra:dev` | Start the episode 3 development candidate; use the URL printed in the terminal |
| `npm run doctor` | Check website and game entry files |

Automated tests do not replace playthroughs or testing with physical controllers, audio, and real browser interactions.

## Repository map

| Directory | Contents |
| --- | --- |
| [content/](content/) | Website content, presentation settings, and project state |
| [assets/](assets/) | Shared styles, scripts, and assets |
| [games/](games/) | Published game introductions and playable pages |
| [packages/](packages/) | Game development projects and level-template tools |
| [notes/](notes/) | Generated development notes and project guides |
| [scripts/](scripts/) · [tests/](tests/) | Build tools, validation, and automated tests |
| [downloads/](downloads/) | Visitor-facing downloads |
| [docs/](docs/) | Maintenance guides, design records, and acceptance notes |

## Contributing and maintenance

Start with the [contribution guide](CONTRIBUTING.md). For game development, see the [episode 3 source guide](packages/mario-mix-terra/START_HERE.md) and the [level-template guide](packages/mario-mix-worlds/START_HERE.md).

Development pages display repository snapshots. Browser edits create local drafts; export, validate, and commit them to update shared records.

[Website publication workflow](docs/release-r24/START_HERE.md) · [R25 maintenance notes](docs/showcase-r25/HANDOFF_R25.md) · [Changelog](CHANGELOG.md) · [Archived README](docs/history/README-before-reorganization.md)

Incremental update packages only replace listed files and are not full repository backups. Historical versions and installation records remain in docs.

## Licensing and assets

The specified original website code is [MIT-licensed](LICENSE). Avatars, logos, articles, artwork, game assets, and downloads are excluded from that grant. See [rights and reuse](RIGHTS.md) for the exact scope and third-party terms. Added collaboration tooling is covered by [LICENSE.collab](LICENSE.collab).

The website uses LXGW WenKai; see the [font licenses](assets/FONT_LICENSES.md). Mario Mix is an unofficial fan work. Game assets belong to their respective rights holders; individual game pages provide attribution and rights-contact information.
