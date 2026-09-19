/** Repository Markdown may link to directories; browser HTML needs an index. */
import path from 'node:path';
import {stat, realpath} from 'node:fs/promises';

export async function localLink(root, from, raw) {
  if (!raw || /^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(raw)) return null;
  let relative;
  try { relative = decodeURIComponent(raw.split(/[?#]/)[0]); }
  catch { throw Error('malformed link'); }
  if (/[\\\u0000-\u001f]/.test(relative)) throw Error('unsafe link');
  const base = path.resolve(root);
  const absolute = relative.startsWith('/')
    ? path.resolve(base, '.' + relative)
    : path.resolve(base, path.dirname(from), relative);
  const within = p => p === base || p.startsWith(base + path.sep);
  if (!within(absolute)) throw Error('link escapes repository');
  const markdown = /\.md$/i.test(from);
  let target = absolute;
  let info = await stat(target).catch(() => null);
  if (!markdown && (info?.isDirectory() || relative.endsWith('/') || target === base)) {
    target = path.join(target, 'index.html');
    info = await stat(target).catch(() => null);
  }
  const result = {path: path.relative(base, target).split(path.sep).join('/'), exists: false};
  if (!info) return result;
  // Directory links are allowed only in repository documents, never for HTML.
  if (!info.isFile() && !(markdown && info.isDirectory())) return result;
  const [realBase, realTarget] = await Promise.all([realpath(base), realpath(target)]);
  if (realTarget !== realBase && !realTarget.startsWith(realBase + path.sep))
    throw Error('link escapes repository through symlink');
  return {...result, exists: true, directory: info.isDirectory()};
}
