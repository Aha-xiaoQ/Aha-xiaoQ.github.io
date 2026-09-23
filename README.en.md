# XiaoQ · Pixel Workshop

[简体中文](README.md) | **English**

A personal portfolio of browser games, useful tools, development notes, and interactive experiments.

[Website](https://aha-xiaoq.github.io/) · [Projects](https://aha-xiaoq.github.io/projects/) · [Games](https://aha-xiaoq.github.io/games/) · [Tools](https://aha-xiaoq.github.io/tools/) · [Development](https://aha-xiaoq.github.io/notes/) · [Lab](https://aha-xiaoq.github.io/notes/lab/)

## Explore

| Goal | Start here |
| --- | --- |
| Play a game or use a tool | [Project directory](https://aha-xiaoq.github.io/projects/) |
| Explore Mario Mix | [Project overview](https://aha-xiaoq.github.io/notes/mario-mix/) |
| Work with the Episode 3 development source | [M07 candidate source and setup](https://aha-xiaoq.github.io/notes/mario-mix/docs/terra-source/) |
| Work with Episode 4 | [R43 source guide](https://aha-xiaoq.github.io/notes/mario-mix/docs/episode-4-source/) · [Download R43 source](https://aha-xiaoq.github.io/downloads/source/MarioMix_Episode4_R43_Source.zip) |
| Create a level | [Map Workshop](https://aha-xiaoq.github.io/packages/mario-mix-worlds/atlas/editor.html) |
| Read a prompt and run its result | [Pelican bicycle experiment](https://aha-xiaoq.github.io/notes/lab/docs/pelican-bicycle/) |
| Modify the website | [Website guides](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/) |

Released games and development source packages are maintained separately. Consult each project guide for its version and supported scope. Reference maps and editor features do not imply a complete recreation of every original level.

<!-- XIAOQ:VIDEOS:START -->
## Current videos

| Content | Website | Video |
| --- | --- | --- |
| Episode 4: Sonic × Ori | [Open](https://aha-xiaoq.github.io/games/mario-mix-4/) | [Watch video](https://www.bilibili.com/video/BV1JBhh6iEXS/) |
| Mario Map Workshop | [Open](https://aha-xiaoq.github.io/packages/mario-mix-worlds/atlas/editor.html) | [Watch video](https://www.bilibili.com/video/BV1kLha63EyV/) |
<!-- XIAOQ:VIDEOS:END -->

## Run locally

Use Node.js 22 or newer. The website scripts have no third-party npm dependencies; `npm install` is not required.

```sh
git clone https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io.git
cd Aha-xiaoQ.github.io
npm run dev
```

Open <http://127.0.0.1:4173/>. Use `npm run dev -- --port 4174` when the default port is occupied. Windows users can also run `start-dev.cmd`. Start from the complete repository root so shared resources resolve correctly.

## Edit and build

`content/` and `config/` are the primary content sources. `assets/` contains shared UI, `notes/` contains generated development pages, `experiments/` contains standalone experiments, and `games/` and `packages/` hold game entries and independent projects.

After editing source content:

```sh
npm run journal:build
npm run site:build
npm run check
npm test
```

[Website structure](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/architecture/) · [Content editing](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/content/) · [Publishing](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/publishing/) · [Maintenance index](docs/README.md)

## Contribute

Include the page URL, device, and reproduction steps when reporting a problem. Read [CONTRIBUTING.md](CONTRIBUTING.md) before contributing, and discuss substantial changes in an Issue.

## Licenses and assets

See [LICENSE](LICENSE), [LICENSE.collab](LICENSE.collab), and [RIGHTS.md](RIGHTS.md) for their respective scope. Third-party game assets, artwork, fonts, and downloads retain their own terms.

[Font licenses](assets/FONT_LICENSES.md) · [Changelog](CHANGELOG.md)
