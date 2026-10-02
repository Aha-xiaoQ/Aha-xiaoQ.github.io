# XiaoQ · Pixel Workshop

[简体中文](README.md) | **English**

A personal portfolio of browser games, useful tools, development notes, and interactive experiments.

[Website](https://aha-xiaoq.github.io/?lang=en) · [Projects](https://aha-xiaoq.github.io/projects/?lang=en) · [Games](https://aha-xiaoq.github.io/games/?lang=en) · [Tools](https://aha-xiaoq.github.io/tools/?lang=en) · [Development](https://aha-xiaoq.github.io/notes/?lang=en) · [Lab](https://aha-xiaoq.github.io/notes/lab/?lang=en)

## Explore

| Goal | Start here |
| --- | --- |
| Play a game or use a tool | [Project directory](https://aha-xiaoq.github.io/projects/?lang=en) |
| Explore Mario Mix | [Project overview](https://aha-xiaoq.github.io/notes/mario-mix/?lang=en) |
| Work with the Episode 3 development source | [M07 candidate source and setup](https://aha-xiaoq.github.io/notes/mario-mix/docs/terra-source/?lang=en) |
| Work with Episode 4 | [R43 source guide](https://aha-xiaoq.github.io/notes/mario-mix/docs/episode-4-source/?lang=en) · [Download R43 source](https://aha-xiaoq.github.io/downloads/source/MarioMix_Episode4_R43_Source.zip) |
| Create a level | [Map Workshop](https://aha-xiaoq.github.io/packages/mario-mix-worlds/atlas/editor.html) |
| Read a prompt and run its result | [Pelican bicycle experiment](https://aha-xiaoq.github.io/notes/lab/docs/pelican-bicycle/?lang=en) |
| Modify the website | [Website guides](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/?lang=en) |

Released games and development source packages are maintained separately. Consult each project guide for its version and supported scope. Reference maps and editor features do not imply a complete recreation of every original level.

<!-- XIAOQ:VIDEOS:START -->
## Current videos

| Content | Website | Video |
| --- | --- | --- |
| Episode 4: Sonic × Ori | [Open](https://aha-xiaoq.github.io/games/mario-mix-4/?lang=en) | [Watch video](https://www.bilibili.com/video/BV1JBhh6iEXS/) |
| Mario Map Workshop | [Open](https://aha-xiaoq.github.io/packages/mario-mix-worlds/atlas/editor.html) | [Watch video](https://www.bilibili.com/video/BV1kLha63EyV/) |
<!-- XIAOQ:VIDEOS:END -->

## Run locally

Use Node.js 22 or newer. The website scripts have no third-party npm dependencies; `npm install` is not required.

```sh
git clone https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io.git
cd Aha-xiaoQ.github.io
npm run dev
```

Open <http://127.0.0.1:4173/?lang=en>. Use `npm run dev -- --port 4174` when the default port is occupied. Windows users can also run `start-dev.cmd`. Start from the complete repository root so shared resources resolve correctly.

## Edit and build

`content/` and `config/` are the primary content sources. `assets/` contains shared UI, `notes/` contains generated development pages, `experiments/` contains standalone experiments, and `games/` and `packages/` hold game entries and independent projects.

After editing source content, run the complete build and verification workflow:

```sh
npm run platform:verify
```

[Website structure](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/architecture/?lang=en) · [Content editing](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/content/?lang=en) · [Publishing](https://aha-xiaoq.github.io/notes/pixel-workshop/docs/publishing/?lang=en) · [Maintenance index](docs/README.en.md)

For a preview-only rebuild, use `npm run platform:build`. This does not replace verification. Existing individual build and test commands remain available. Module ownership, localization, and update packaging are documented in [Platform maintenance](docs/platform/README.en.md).

## Contribute

Include the page URL, device, and reproduction steps when reporting a problem. Read [CONTRIBUTING.md](CONTRIBUTING.md) before contributing, and discuss substantial changes in an Issue.

## Licenses and assets

Reviewed original components use MIT: original website/build tooling, native map-editor implementation, four geometric SVGs, the pelican HTML/SVG, and original optical-workshop implementation. See the [audit guide](docs/oss/README.md), [exact-file manifest](docs/oss/FILE_MANIFEST.json), and [RIGHTS.md](RIGHTS.md) for scope, baseline and source evidence.

This is not repository-wide MIT. Acorn retains upstream MIT; fonts retain their original terms. Third-party game maps/art/audio, manufacturer references and unverified archives receive no new grant. Existing Q咪 CC BY-NC 4.0 material notices remain; the local ZIP license and sprite identity are verified, while independent-repository comparison and coordinated changes remain separate. [LICENSE](LICENSE) covers the audited original scope; [LICENSE.collab](LICENSE.collab) preserves the existing collaboration grant.

[Reproduction and limitations](docs/oss/REPRODUCIBILITY.md) · [Maintainer and CI evidence](docs/oss/MAINTAINER_AND_CI.md) · Local license checks: `npm run oss:verify`

[Font licenses](assets/FONT_LICENSES.md) · [Changelog](CHANGELOG.md)
