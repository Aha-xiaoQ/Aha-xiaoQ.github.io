# Offline playback contract for production sources

The current Mid-Autumn source download is `experiments/releases/mid-autumn-special/source-r49.zip`, registered in `content/experiments/mid-autumn-special.json`. The previous `source.zip` is retained as history but is no longer the current download target.

Fully extract the ZIP and open `MidAutumn_Final_Source/index.html`, or run `PLAY.cmd` on Windows. Keep `final.mp4` and `poster.jpg` alongside the entry. Watching needs no Python, FFmpeg, connection or font installation.

`BUILD.cmd` and `finalize.py` are optional rebuilding entry points. They require Python, FFmpeg and ffprobe and refuse to overwrite existing output. Redrawing alone needs the dependencies in drawing/requirements.txt and an installed CJK font whose actual cmap covers the film's Chinese text.

`config/lab-source-playback.json` records the entry, companion files and required source members. `scripts/platform/source-playback.mjs` checks ZIP CRC, exact site/source companion identities and local relative resource paths as part of the existing source gate. A valid ZIP container with a missing film, entry, wrong case, remote dependency or incorrect template is still rejected.

The confirmed 136-second final picture and Cai Yun Zhui Yue audio are preserved. This update does not replace the existing Bilibili upload. Report browser and device validation according to the checks actually executed.
