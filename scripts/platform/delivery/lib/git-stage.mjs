/** Stage the allowlist and run the real Git whitespace check; never commit or push. */
import path from 'node:path';
import {assertScope} from './install.mjs';
import {writeAtomic} from './safe-path.mjs';

export async function stageAndCheck(git, paths, manifest, {pathspecFile, logFile, repositoryRoot=null}) {
  assertScope(paths, manifest, repositoryRoot);
  if (!paths.length) throw Error('没有待校验变更');
  // A NUL-delimited allowlist avoids Windows command-line length limits.
  writeAtomic(path.dirname(pathspecFile), path.basename(pathspecFile), Buffer.from(paths.join('\0')+'\0'));
  await git(['add','--pathspec-from-file='+pathspecFile,'--pathspec-file-nul'], {capture:true});
  const result = await git(['diff','--cached','--name-only','-z'], {capture:true});
  const staged = result.stdout.split('\0').filter(Boolean);
  assertScope(staged, manifest, repositoryRoot);
  if (!staged.length) throw Error('没有可提交变更');
  // Do not disable blank-at-eof or other whitespace/conflict-marker checks.
  await git(['diff','--cached','--check'], {capture:true, logFile});
  return staged;
}
