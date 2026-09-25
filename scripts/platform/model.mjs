/** Validate and plan the website pipeline. This module never runs a command. */
import {identifier,localFile} from '../../assets/platform/contracts.mjs';
export function ordered(nodes) {
  if (!Array.isArray(nodes) || nodes.length > 200) throw Error('Invalid graph');
  const byId = new Map();
  for (const node of nodes) {
    if (!identifier(node.id) || byId.has(node.id) || !Array.isArray(node.dependsOn)) throw Error('Invalid graph node');
    byId.set(node.id,node);
  }
  const visiting=new Set(),done=new Set(),out=[];
  function visit(id) {
    if (done.has(id)) return;
    if (visiting.has(id)) throw Error('Cyclic dependency: '+id);
    const node=byId.get(id); if (!node) throw Error('Unknown dependency: '+id);
    visiting.add(id); for (const dep of node.dependsOn) visit(dep);
    visiting.delete(id);done.add(id);out.push(node);
  }
  for (const node of nodes) visit(node.id);
  return out;
}
export function validateConfig(config) {
  if (!config || config.schemaVersion !== 1 || config.site?.repository !== 'Aha-xiaoQ/Aha-xiaoQ.github.io' || config.site?.branch !== 'main' || config.site?.origin !== 'https://aha-xiaoq.github.io') throw Error('Invalid platform/site identity');
  if (JSON.stringify(config.site.locales) !== '["zh","en"]' || config.site.defaultLocale !== 'zh') throw Error('Unsupported locale contract');
  if(typeof config.edition!=='string'||!/^R[0-9]+(?:[.-][A-Z0-9]+)*$/.test(config.edition))throw Error('Invalid platform edition');
  ordered(config.modules);
  const roots=new Set();
  for (const module of config.modules) {
    if (!Array.isArray(module.sourceRoots) || !module.responsibility) throw Error('Module ownership is required');
    for (const root of module.sourceRoots) {
      if (!localFile(root) || roots.has(root)) throw Error('Duplicate or unsafe module root');
      roots.add(root);
    }
  }
  const ids=new Set(config.modules.map(m=>m.id));
  const records=new Set();
  for (const record of config.generated || []) {
    if (!ids.has(record.owner) || !localFile(record.record) || records.has(record.record)) throw Error('Invalid generated-file ownership');
    records.add(record.record);
  }
  for (const list of [config.nativeEntries,config.protectedArtifacts]) {
    if (!Array.isArray(list) || new Set(list).size !== list.length || list.some(p=>!localFile(p) || !p.endsWith('.html'))) throw Error('Invalid entry or artifact paths');
  }
  for (const phase of ['build','verify']) planSteps(config.pipelines?.[phase]);
  return config;
}
export function planSteps(steps) {
  if (!Array.isArray(steps) || !steps.length) throw Error('Empty pipeline');
  const nodes=steps.map(step=>{
    if (!!step.file === !!step.script) throw Error('A step needs exactly one command');
    if (step.file && (!localFile(step.file) || !step.file.startsWith('scripts/') || !step.file.endsWith('.mjs'))) throw Error('Unsafe pipeline program');
    if (step.script && (!/^[a-z][a-z0-9:-]*$/.test(step.script) || /^platform:(?:build|verify|release|pack)$/.test(step.script))) throw Error('Unsafe or recursive npm script');
    if (step.args !== undefined && (!Array.isArray(step.args) || step.args.some(a=>typeof a !== 'string' || a.length > 300 || /[\x00\r\n]/.test(a)))) throw Error('Invalid command arguments');
    return {...step,dependsOn:step.after || []};
  });
  return ordered(nodes);
}
export async function runSteps(steps, execute) {
  if (typeof execute !== 'function') throw Error('Missing command executor');
  const order=planSteps(steps), results=[],byId=new Map();
  for (const step of order) {
    const blocked=step.dependsOn.filter(id=>byId.get(id)?.status !== 'passed');
    let result;
    if (blocked.length) result={id:step.id,status:'blocked',blockedBy:blocked};
    else {
      try {
        const r=await execute(step);
        if (!r || !Number.isInteger(r.code)) throw Error('Executor did not return an exit code');
        result={...r,id:step.id,status:r.code===0?'passed':'failed'};
      } catch (error) { result={id:step.id,status:'failed',code:null,error:String(error.message || error)}; }
    }
    results.push(result);byId.set(step.id,result);
  }
  return {ok:results.every(r=>r.status==='passed'),results};
}
