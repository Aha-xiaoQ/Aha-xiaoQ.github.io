/** Check rendered, visible source links rather than incidental words in Markdown. */
import assert from 'node:assert/strict';
import {readmeSiteURL, README_LOCALES} from '../../scripts/platform/readme-links.mjs';
import {decodeAttribute} from '../../scripts/lib/html-resources.mjs';
import {renderMarkdown} from '../../assets/journal/markdown.mjs';
const ORIGIN='https://aha-xiaoq.github.io';
export function requiredSourceLinks(project){
 assert.ok(project?.id&&project.currentRelease?.documentId,'Current development source metadata is required');
 const third=project.docs.find(d=>d.id===project.currentRelease.documentId);
 const fourth=project.docs.find(d=>d.id==='episode-4-source');
 assert.ok(third&&!third.archived,'The current development source guide must remain available');
 assert.ok(fourth&&!fourth.archived&&fourth.action?.href?.endsWith('.zip'),'The separate Episode 4 source archive must remain available');
 return [
  {kind:'current-source-guide',href:`${ORIGIN}/notes/${project.id}/docs/${third.id}/`},
  {kind:'episode4-source-guide',href:`${ORIGIN}/notes/${project.id}/docs/${fourth.id}/`},
  {kind:'episode4-source-archive',href:new URL(fourth.action.href,ORIGIN).href}
 ];
}
export function assertSourceReadme(text,project,file='README'){
 assert.equal(typeof text,'string',file+': expected Markdown');
 // Comments and code examples must not satisfy a real navigation requirement.
 const html=renderMarkdown(text.replace(/<!--[\s\S]*?-->/g,''));
 const links=[...html.matchAll(/<a href="([^"]+)">([\s\S]*?)<\/a>/g)].map(m=>({href:decodeAttribute(m[1]),label:m[2].replace(/<[^>]+>/g,'').trim()}));
 const expected=requiredSourceLinks(project);
 for(const target of expected){
  const destination=README_LOCALES[file]?readmeSiteURL(target.href,README_LOCALES[file]):target.href;
  const found=links.filter(l=>l.href===destination);
  assert.equal(found.length,1,`${file}: expected one visible ${target.kind} link: ${destination}`);
  assert.ok(found[0].label,`${file}: ${target.kind} needs a readable label`);
 }
 return expected.map(x=>x.href);
}
