import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'xiaoq-symlink-probe-'));
try {
  fs.writeFileSync(path.join(dir,'target'),'probe');
  fs.symlinkSync(path.join(dir,'target'),path.join(dir,'link'),'file');
  if (!fs.lstatSync(path.join(dir,'link')).isSymbolicLink()) throw Error('Not a link');
} catch (e) { console.error('Symbolic-link test prerequisite: '+e.message); process.exitCode=10; }
finally { fs.rmSync(dir,{recursive:true,force:true}); }
