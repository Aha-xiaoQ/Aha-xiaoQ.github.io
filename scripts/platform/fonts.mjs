#!/usr/bin/env node
/** Missing letters/punctuation are blocking, not silently called system fallbacks. */
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {writeAtomic} from '../lib/safe-path.mjs';
import {ROOT,checkFontSupport} from './font-support.mjs';
export {ROOT};
export const reportFonts=checkFontSupport;
export function writeReport(root=ROOT){const report=reportFonts(root);writeAtomic(root,'.local/platform/font-coverage.json',Buffer.from(JSON.stringify(report,null,2)+'\n'));return report;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))try{
 if(process.argv.length>2)throw Error('Unsupported option');const r=writeReport();
 console.log(JSON.stringify({characters:r.characters,textSources:r.files,fonts:r.fonts.map(f=>({weight:f.weight,primaryCodepoints:f.primaryCodepoints,localSupplementFiles:f.supplementFiles.length,missingAfterRepair:f.missingAfterRepair.length})),systemSymbolCount:r.systemSymbols.length,errors:r.errors,ok:r.ok,report:'.local/platform/font-coverage.json',scope:'Local font bytes and active Unicode ranges; browser loading is checked by the later artifact gate'},null,2));if(!r.ok)process.exitCode=1;
}catch(e){console.error(e.message);process.exitCode=1;}
