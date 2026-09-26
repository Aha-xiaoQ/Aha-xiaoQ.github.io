# Maintaining Lab videos

[中文](lab-videos.md) · [Architecture and maintenance](README.en.md)

## One catalog, two kinds of work

The Lab remains at `/notes/lab/`. `content/experiments/catalog.json` controls ordering; each row points to `content/experiments/<id>.json`. Existing records, or explicit `kind: "html"` records, keep their original prompt, model information and HTML byte identity. `kind: "video"` describes a Bilibili-hosted video and must not invent HTML downloads or one-prompt generation metadata.

| Work | Record ID | BVID |
| --- | --- | --- |
| Pipa Music \| Pelican Cycling | `pipa-pelican` | `BV1TvhU6aEci` |
| Mid-Autumn Special | `mid-autumn-special` | `BV1rHh16CE3T` |

## Add another video

Register a unique ID and its JSON file. Required fields are `schemaVersion: 1`, `kind: "video"`, `id`, `title`, `subtitle`, `visibility`, `createdAt`, `video`, `provenance` and `verification`. An optional `format` describes the work. `createdAt` is the listing date, not an inferred video publication date.

`video` accepts only `provider: "bilibili"` and a valid case-sensitive `bvid`. A shared function derives the canonical watch URL. Provide accurate descriptions and viewing notes rather than unverified durations, model settings, scores or licensing conclusions.

An optional `relatedExperimentId` links to a registered work. Public entries cannot point to private drafts. Drafts are excluded from public listings; archived entries keep historical detail pages but are absent from current listings and search.

## Build and verify

```sh
npm run journal:build
npm run site:build
npm run platform:verify
```

The shared registry projection feeds the directory, native detail pages and search. Never hand-edit `assets/journal/data/`, `notes/` or `content/search-index.json`. Video entries use native links without autoplaying players, remote thumbnails or video downloads. Add new interface copy to `content/locales/en.json`.

The video tests cover exact destinations, type boundaries, localization, search and original HTML preservation. Existing browser components use the same renderer, and the full published-page gate remains mandatory. Local tests do not establish remote playback availability, redistribution permission or deployment.

## Archived final production files

A video record can declare up to three local `resources`: one `html`, one `video` and one `source`. Each is confined to `/experiments/releases/<entry-id>/`, with the matching HTML, MP4 or ZIP extension, a byte length and SHA-256. The gallery does not fetch media. `platform:check` verifies file identity, and the publication audit continues to check links and archive contents. Invalid files stop the update.

The pelican HTML is the original WebGL program. The Mid-Autumn HTML is a player for the exact final film, not a JavaScript reconstruction. Its drawing Python source, captions, timeline and new soundtrack finalization script are preserved in the source ZIP. The Bilibili links are retained; a website soundtrack update does not replace the remote video upload.

The published pelican `animation.html` only adds a semantic heading and a built-in icon; its animation JavaScript, audio and layout are unchanged. The original offline HTML remains byte-for-byte inside the original source ZIP.
