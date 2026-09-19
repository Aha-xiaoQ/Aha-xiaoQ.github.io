import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {localLink} from '../tools/local-link.mjs';

test('repository directory links differ from website entry links', async () => {
  const root=await mkdtemp(path.join(tmpdir(),'local-links-'));
  try {
    await mkdir(path.join(root,'assets'));
    assert.equal((await localLink(root,'README.md','assets/')).exists,true);
    assert.equal((await localLink(root,'README.en.md','assets')).exists,true);
    assert.equal((await localLink(root,'README.md','missing/')).exists,false);
    assert.equal((await localLink(root,'index.html','assets/')).exists,false);
    await writeFile(path.join(root,'assets/index.html'),'ok');
    assert.equal((await localLink(root,'index.html','assets/')).exists,true);
    await assert.rejects(localLink(root,'README.md','../outside/'),/escapes/);
  } finally { await rm(root,{recursive:true,force:true}); }
});
