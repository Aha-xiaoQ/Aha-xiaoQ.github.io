/** Local build path boundary. Shared by the installer and both site builders.
 * Checks directory entries with lstat; never uses exists/stat to authorize traversal.
 * This is not a sandbox against a process that races/replaces ancestor directories.
 */
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';

const reserved = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;
export function validateRelative(rel) {
  if (typeof rel !== 'string' || !rel || rel.length > 2048 ||
      path.posix.isAbsolute(rel) || path.win32.isAbsolute(rel) ||
      /[\\\x00-\x1f:*?"<>|]/.test(rel)) throw new Error('不安全的路径：' + rel);
  const parts = rel.split('/');
  for (const part of parts) {
    if (!part || part === '.' || part === '..' || /[ .]$/.test(part) ||
        ['.git', 'node_modules'].includes(part.toLowerCase()) ||
        part.toLowerCase().startsWith('.env') || reserved.test(part)) {
      throw new Error('不安全的路径段：' + rel);
    }
  }
  return parts;
}

/** Only a genuinely missing entry is optional. EACCES, ENOTDIR, ELOOP, etc. fail closed. */
export function entryStat(file) {
  try { return fs.lstatSync(file); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
function inspect(file, mustBeDirectory) {
  const stat = entryStat(file);
  if (stat?.isSymbolicLink()) throw new Error('拒绝符号链接（包括悬空链接或 junction）：' + file);
  if (stat && mustBeDirectory && !stat.isDirectory()) throw new Error('路径父级不是目录：' + file);
  return stat;
}

/** The workspace root and its ancestors must already be real directories.
 * Missing descendants are permitted for planned outputs; existing links never are.
 */
export function safe(root, rel) {
  const parts = validateRelative(rel);
  if (typeof root !== 'string' || !root || root.includes('\0')) throw new Error('工作区根目录无效');
  const base = path.resolve(root), volume = path.parse(base).root;
  let cursor = volume;
  if (!inspect(cursor, true)) throw new Error('工作区卷不存在：' + cursor);
  for (const part of base.slice(volume.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, part);
    if (!inspect(cursor, true)) throw new Error('工作区根目录或父级不存在：' + cursor);
  }
  for (let i = 0; i < parts.length; i++) {
    cursor = path.join(cursor, parts[i]);
    inspect(cursor, i < parts.length - 1);
  }
  return cursor;
}

export function readOptional(root, rel) {
  const file = safe(root, rel), stat = entryStat(file);
  if (!stat) return null;
  if (!stat.isFile()) throw new Error('不是普通文件：' + rel);
  // Reject link substitution at the leaf where supported. Parent races still require
  // a trusted, non-concurrently-modified workspace; documented in SECURITY_R08.md.
  const flags = fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0);
  const fd = fs.openSync(file, flags);
  try {
    if (!fs.fstatSync(fd).isFile()) throw new Error('不是普通文件：' + rel);
    return fs.readFileSync(fd);
  } finally { fs.closeSync(fd); }
}

/** Exclusive temp file + recheck + rename. Does not authorize overwriting user edits;
 * callers must compare content hashes and maintain their own rollback journal.
 */
export function writeAtomic(root, rel, bytes) {
  let file = safe(root, rel);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  file = safe(root, rel);
  const prior = entryStat(file);
  if (prior && !prior.isFile()) throw new Error('输出不是普通文件：' + rel);
  const tmpRel = rel + '.r08-' + randomUUID();
  let temporaryCreated = false;
  try {
    const tmp = safe(root, tmpRel);
    fs.writeFileSync(tmp, bytes, {flag: 'wx'});
    temporaryCreated = true;
    safe(root, rel); safe(root, tmpRel);
    fs.renameSync(tmp, file);
    temporaryCreated = false;
  } finally {
    if (temporaryCreated) {
      const tmp = safe(root, tmpRel);
      if (entryStat(tmp)) fs.unlinkSync(tmp);
    }
  }
}
