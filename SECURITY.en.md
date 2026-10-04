# Reporting security issues

[简体中文](SECURITY.md) | **English**

## Report vulnerabilities privately

For exposed credentials, arbitrary code execution, user data exposure or unauthorized publishing access, contact the maintainer privately at [hfutqdm@163.com](mailto:hfutqdm@163.com). Do not first post exploitable details, tokens or private data in public Issues, PRs or discussions.

Include the affected page or file, the impact and steps to reproduce. Use redacted or synthetic data in examples; do not send live credentials or other people's private information.

For ordinary gameplay problems, feature requests or documentation errors, use the repository's [Issue templates](https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io/issues/new/choose). Include the page URL, version, device and reproduction steps.

## Review external contributions safely

Maintainers should independently review the code, workflows and build scripts in external PRs. Passing CI with limited permissions does not establish that code is trustworthy. Do not execute unreviewed code in an environment with deployment credentials or write access.

Contributors and maintainers should understand and review external contribution scripts before deciding to run them. Do not run unfamiliar scripts directly on your personal computer. If execution is needed for review, use an isolated environment without credentials, private data or write access.
