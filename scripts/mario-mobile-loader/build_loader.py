"""Build a local/public loader candidate without uploading or modifying the game.

python build_loader.py --html GAME.html --output NEW_DIRECTORY --version 0.8.13
Add --base-url https://HOST/PINNED_VERSION/ to use remote parts with local fallback.
"""
from pathlib import Path
import argparse
import gzip
import hashlib
import html
import json
import re
from urllib.parse import urljoin, urlparse

HERE = Path(__file__).resolve().parent


def build(game: Path, output: Path, version: str, base_url='./', offline_url='', chunk_bytes=20 * 1024 * 1024, timeout_ms=30000):
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]{0,70}', version):
        raise ValueError('version must be a short path-safe release identifier')
    parsed = urlparse(base_url)
    if base_url != './' and (parsed.scheme != 'https' or not parsed.netloc or parsed.query or parsed.fragment or not base_url.endswith('/')):
        raise ValueError('base-url must be ./ or an HTTPS directory ending in / without query/fragment')
    if offline_url and (urlparse(offline_url).scheme not in ('', 'https') or offline_url.startswith('//')):
        raise ValueError('offline-url must be relative or HTTPS')
    if chunk_bytes < 64 or not 100 <= timeout_ms <= 120000:
        raise ValueError('invalid chunk size or timeout')
    game = game.resolve()
    output = output.resolve()
    if output == game.parent or output == HERE:
        raise ValueError('output must be a separate candidate directory')
    if output.exists() and any(output.iterdir()):
        raise ValueError('output must be new or empty; accepted candidates are never overwritten')
    raw = game.read_bytes()
    raw.decode('utf8')
    compressed = gzip.compress(raw, compresslevel=6, mtime=0)
    output.mkdir(parents=True, exist_ok=True)
    parts = []
    for index, start in enumerate(range(0, len(compressed), chunk_bytes), 1):
        data = compressed[start:start + chunk_bytes]
        name = f'game-data-{index}.bin'
        (output / name).write_bytes(data)
        part = {'url': urljoin(base_url, name), 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}
        if base_url != './':
            part['fallback'] = './' + name
        parts.append(part)
    config = {'version': version, 'htmlBytes': len(raw), 'htmlSha256': hashlib.sha256(raw).hexdigest(), 'timeoutMs': timeout_ms, 'parts': parts}
    config_json = json.dumps(config, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    script = (HERE / 'loader.js').read_text(encoding='utf8').replace('__LOADER_CONFIG__', config_json)
    offline = f'<a href="{html.escape(offline_url, quote=True)}">下载离线游戏</a>' if offline_url else ''
    document = '''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>混合马里奥在下_小Q版</title><style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#101014;color:#fff;font:17px system-ui;line-height:1.65}main{width:min(30em,calc(100vw - 3em));padding:2em 0}h1{font-size:1.2em}progress{display:block;width:100%;height:12px;accent-color:#ffd76b}p{color:#c8c8d0}button{border:0;border-radius:6px;padding:.75em 1.4em;font:inherit;background:#ffd76b;color:#101014;cursor:pointer}a{color:#ffd76b;margin-left:1em}[hidden]{display:none!important}
</style></head><body><main><h1 id="status" role="status" aria-live="polite">正在加载游戏…</h1><progress id="progress" aria-label="游戏加载进度"></progress><p id="detail">正在准备下载。</p><button id="retry" hidden>重新加载</button>''' + offline + '</main><script>\n' + script + '\n</script></body></html>\n'
    (output / 'play.html').write_text(document, encoding='utf8', newline='\n')
    receipt = {**config, 'htmlBytes': len(raw), 'downloadBytes': len(compressed), 'loaderSha256': hashlib.sha256(document.encode('utf8')).hexdigest(), 'firstLoadPayloadReduced': False, 'stage': 'local-candidate-not-published'}
    (output / 'loader-manifest.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    return receipt


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--html', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--version', required=True)
    parser.add_argument('--base-url', default='./')
    parser.add_argument('--offline-url', default='')
    parser.add_argument('--chunk-bytes', type=int, default=20 * 1024 * 1024)
    parser.add_argument('--timeout-ms', type=int, default=30000)
    args = parser.parse_args()
    receipt = build(args.html, args.output, args.version, args.base_url, args.offline_url, args.chunk_bytes, args.timeout_ms)
    print(json.dumps({'output': str(args.output.resolve()), 'parts': len(receipt['parts']), 'downloadBytes': receipt['downloadBytes'], 'htmlSha256': receipt['htmlSha256'], 'stage': receipt['stage']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
