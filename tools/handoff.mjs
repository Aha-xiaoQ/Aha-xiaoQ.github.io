import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
const model=createRequire(import.meta.url)('../dev/model.js');
try {
  const p=model.assertProject(JSON.parse(await readFile(new URL('../collab/project.json',import.meta.url),'utf8')));
  console.log(model.resumeText(p));
} catch(e){console.error(e.message);process.exitCode=1;}
