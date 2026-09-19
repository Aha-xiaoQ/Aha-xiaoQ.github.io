import path from 'node:path';
import {stat} from 'node:fs/promises';

// GitHub Markdown can link to directories; website links require an entry page.
export async function localLink(root, source, relative) {
  const absolute = relative.startsWith('/') ? path.resolve(root, '.' + relative) : path.resolve(root, path.dirname(source), relative);
  if (absolute !== root && !absolute.startsWith(root + path.sep)) throw Error('link escapes repository');
  let target = absolute;
  const info = await stat(target).catch(() => null);
  if (source.endsWith('.md') && info?.isDirectory()) return {exists: true, path: path.relative(root, target)};
  if (absolute === root || relative.endsWith('/') || info?.isDirectory()) target = path.join(target, 'index.html');
  return {exists: await stat(target).then(s => s.isFile()).catch(() => false), path: path.relative(root, target).split(path.sep).join('/')};
}
