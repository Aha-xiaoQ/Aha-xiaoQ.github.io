#!/usr/bin/env node
/** Check source wiring and generated public pages without asserting a complete accessibility audit. */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const requireMatch=(s,re,message)=>{if(!re.test(s))throw Error(message);};
try{
 requireMatch(read('assets/experience/site-experience.css'),/site-refinement\.css\?v=site-r23/,'共享样式没有加载R23');
 requireMatch(read('assets/experience/runtime.mjs'),/mountNavigation\(scope\)/,'导航没有接入现有生命周期');
 const record=JSON.parse(read('docs/development/generated-pages.json'));
 for(const p of Object.keys(record.files)){if(!p.endsWith('.html'))continue;const html=read(p);requireMatch(html,/runtime\.mjs\?v=site-r23/,'页面资源版本未更新：'+p);if((html.match(/<main\b/g)||[]).length!==1)throw Error('主内容边界不唯一：'+p);}
 const index=read('notes/index.html');requireMatch(index,/data-project-result-status/,'缺少项目结果反馈');requireMatch(index,/class="j-search-label"/,'项目搜索缺少可见标签');
 requireMatch(read('notes/mario-mix/docs/terra-source/index.html'),/aria-current="page">第三期开发源码/,'当前资料缺少位置说明');
 console.log(JSON.stringify({result:'passed',pages:Object.keys(record.files).filter(p=>p.endsWith('.html')).length,scope:'R23 source and generated-page wiring; not a whole-site accessibility certification'},null,2));
}catch(e){console.error(e.message);process.exitCode=1;}
