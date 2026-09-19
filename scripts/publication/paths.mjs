import fs from 'node:fs';import path from 'node:path';import{createHash}from'node:crypto';
import{safe,readOptional,entryStat}from'../lib/safe-path.mjs';
export{safe,readOptional};
export const sha=b=>createHash('sha256').update(b).digest('hex');
export const json=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
export function exactRead(root,p){
 const f=safe(root,p);let cursor=root;
 for(const part of p.split('/')){if(!entryStat(cursor))return null;const names=fs.readdirSync(cursor);if(!names.includes(part)){const near=names.find(n=>n.toLowerCase()===part.toLowerCase());if(near)throw Error('大小写不匹配：'+p+'（'+part+' / '+near+'）');return null;}cursor=path.join(cursor,part);}
 const st=entryStat(f);if(st?.nlink>1)throw Error('拒绝硬链接：'+p);return readOptional(root,p);
}
export function walk(root,rel){const f=safe(root,rel),st=entryStat(f);if(!st)return[];if(st.isSymbolicLink())throw Error('拒绝链接：'+rel);if(st.isFile())return[rel];if(!st.isDirectory())throw Error('不是普通目录：'+rel);return fs.readdirSync(f).sort().flatMap(n=>walk(root,rel+'/'+n));}
export const privatePath=p=>/(?:^|\/)(?:\.gitkeep|\.DS_Store|Thumbs\.db|desktop\.ini|\.gitignore|\.gitattributes)$/i.test(p)||/(?:^|\/)(?:[^/]+\.(?:test|spec)\.(?:js|mjs|cjs)|(?:test|fixture|debug)[-_][^/]*\.(?:js|mjs|json|html))$/i.test(p)||/^assets\/(?:site-dev(?:elopment|-[^/]+)|release\/public-content)\.(?:js|mjs|css)$/.test(p)||/(?:^|\/)(?:\.git|\.github|\.local|node_modules|tests?|test-results|validation|preview|fixtures?|backups?|integration|tooling)(?:\/|$)/i.test(p)||/\/manage(?:\/|$)/i.test(p)||/^dev\//.test(p)||/^(?:scripts|collab|config)\//.test(p)||/(?:^|\/)(?:AGENTS|HANDOFF[^/]*|INSTALLATION|SHA256SUMS|restore)\.(?:md|json|txt)$/i.test(p)||/\.(?:bak|tmp|log|map)$/.test(p)||/^(?:package(?:-lock)?\.json|README\.md)$/.test(p);
export function parseDataJS(text){const t=text.replace(/^\uFEFF/,'').replace(/^\s*\/\/[^\n]*\n/g,'').trim();const m=t.match(/^(?:globalThis\.|window\.)?SITE_DATA\s*=\s*([\s\S]*?);?\s*$/);if(!m)throw Error('SITE_DATA 必须是纯 JSON 赋值；未执行自定义脚本。');return JSON.parse(m[1].replace(/;\s*$/,''));}
export function scriptData(data){return Buffer.from('globalThis.SITE_DATA = '+JSON.stringify(data,null,2).replace(/</g,'\\u003c')+';\n');}
