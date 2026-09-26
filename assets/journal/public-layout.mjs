/** Shared public layouts; no DOM or network work during import. */
import {EXPERIMENTS} from './data/experiments.mjs?v=dev-r44-279054bb1330294e';
import {experimentVideoURL} from '../platform/contracts.mjs';
const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=(p,d='')=>'/notes/'+p.id+'/'+(d?'docs/'+d+'/':'');
const a=(label,href,cls='j-link',more='')=>`<a class="${cls}" href="${esc(href)}" ${more}>${esc(label)}</a>`;
const head=(over,title,intro='')=>`<div class="section-head"><div><p class="eyebrow">${esc(over)}</p><h2>${esc(title)}</h2></div>${intro?`<p>${esc(intro)}</p>`:''}</div>`;
export function developmentNav(active='projects'){
 return `<nav class="q-dev-nav" aria-label="开发栏目"><a href="/notes/"${active==='projects'?' aria-current="page"':''}>项目</a><a href="/notes/lab/"${active==='lab'?' aria-current="page"':''}>实验室</a><a href="/notes/updates/"${active==='updates'?' aria-current="page"':''}>更新</a><a href="/notes/contribute/"${active==='contribute'?' aria-current="page"':''}>参与</a></nav>`;
}
export function labSpotlight(){
 const e=EXPERIMENTS.find(row=>row.kind!=='video'&&(!row.visibility||row.visibility==='public'));if(!e)return '';
 return `<section class="section q-lab-spotlight">${head('LAB / 001','一句提示词，可以做出什么？','打开作品，看看实际效果。')}<a class="entry q-lab-strip" href="/notes/lab/docs/${esc(e.id)}/"><div class="q-lab-mark" aria-hidden="true">${esc(e.medium||'HTML')}<span>01</span></div><div><span class="j-meta">实验室 · 交互动画</span><h3>${esc(e.title)}</h3><p>${esc(e.spotlight||e.subtitle)}</p></div><span class="q-lab-go">查看实验 <span aria-hidden="true">↗</span></span></a></section>`;
}
export function websiteOverview(p){
 return `<section class="section q-site-overview">${head('WEBSITE','先找到你需要的资料')}<p class="j-lead">${esc(p.intro)}</p><div class="actions">${a('浏览网站','/','button')}${a('查看源代码','https://github.com/Aha-xiaoQ/Aha-xiaoQ.github.io','button button--quiet','target="_blank" rel="noopener noreferrer"')}</div></section><section class="section">${head('GUIDES','按目标开始')}<div class="j-shortcuts">${(p.startDocuments||['start','content','publishing']).map(id=>p.docs.find(d=>d.id===id&&!d.archived)).filter(Boolean).map(d=>docCard(p,d)).join('')}</div><div class="j-section-footer">${a('浏览全部网站资料',url(p)+'docs/')}</div></section><section class="section">${head('FEEDBACK','一起改进网站')}<p>${esc(p.participation.summary)}</p>${a('反馈问题',p.participation.issueUrl,'button button--quiet','target="_blank" rel="noopener noreferrer"')}</section>`;
}
function docCard(p,d){
 const video=d.kind==='lab-video';
 const children=p.docs.filter(x=>x.readingDocument&&x.parentDoc===d.id&&!x.versioned);
 return `<article class="entry j-destination"><a class="j-destination-link" href="${url(p,d.id)}"><p class="q-doc-label">${video?'视频作品':d.action?'下载与运行':'阅读指南'}</p><h3>${esc(d.title)}</h3><p>${esc(d.summary)}</p><span class="j-destination-label">${video?'查看作品':d.action?'打开运行说明':'阅读指南'}</span></a>${children.length?`<details class="q-doc-related"><summary>相关参考 · ${children.length}</summary><ul>${children.map(c=>`<li>${a(c.title,url(p,c.id))}</li>`).join('')}</ul></details>`:''}</article>`;
}
export function documentDirectory(p){
 const docs=p.docs.filter(d=>!d.archived&&!d.readingDocument);
 const history=p.docs.filter(d=>d.archived||d.readingDocument&&d.versioned);
 const groups=p.documentationGroups?p.documentationGroups.map(group=>[group.label,group.title,group.documents]):
  p.layout==='experiments'?[['EXPERIMENTS','实验记录',docs.map(d=>d.id)]]:
  [['01 / SOURCE','源码与运行',docs.filter(d=>d.action||/(?:source|start)/.test(d.id)).map(d=>d.id)],['02 / BUILD','关卡、工具与接入',docs.filter(d=>/(?:stages|map|world|architecture|reference|contribut)/.test(d.id)).map(d=>d.id)]];
 const used=new Set();const blocks=[];
 for(const[k,t,ids]of groups){const rows=docs.filter(d=>ids.includes(d.id)&&!used.has(d.id));rows.forEach(d=>used.add(d.id));if(rows.length)blocks.push(`<section class="section q-doc-group">${head(k,t)}<div class="j-shortcuts">${rows.map(d=>docCard(p,d)).join('')}</div></section>`);}
 const rest=docs.filter(d=>!used.has(d.id));if(rest.length)blocks.push(`<section class="section q-doc-group">${head('REFERENCE','项目说明与参考')}<div class="j-shortcuts">${rest.map(d=>docCard(p,d)).join('')}</div></section>`);
 const standalone=p.docs.filter(d=>d.readingDocument&&!d.versioned&&!docs.some(parent=>parent.id===d.parentDoc));
 if(standalone.length)blocks.push(`<section class="section">${head('READING','参考资料')}<ul class="q-doc-index">${standalone.map(d=>`<li>${a(d.title,url(p,d.id))}</li>`).join('')}</ul></section>`);
 if(history.length)blocks.push(`<section class="section"><details class="j-legacy-details" data-history-docs><summary>历史版本与过程资料 · ${history.length}</summary><p>保留旧版本和原链接。当前开发请从上方指南开始。</p><ul>${history.map(d=>`<li>${a(d.title,url(p,d.id))}</li>`).join('')}</ul></details></section>`);
 return `<div class="q-doc-directory" data-current-docs>${blocks.join('')}</div>`;
}
const videoAction=e=>a('观看视频',experimentVideoURL(e.video),'button','target="_blank" rel="noopener noreferrer" aria-label="'+esc('观看《'+e.title+'》视频（在新标签页打开）')+'"');
function releaseAction(resource) {
 const attrs=resource.role==='html'?'target="_blank" rel="noopener noreferrer" data-router-ignore':'download data-router-ignore';
 return a(resource.label,resource.href,'button button--quiet',attrs);
}
function releaseSection(e) {
 if(!e.resources?.length)return '';
 return `<section class="section" data-lab-release="${esc(e.id)}">${head('FILES','最终成片与制作资料')}<p>打开可播放的 HTML，或下载最终成片与制作工程。</p><div class="actions">${e.resources.map(releaseAction).join('')}</div><p class="j-small">此处为网站最终版本；B 站视频仍通过原 BV 号观看。</p></section>`;
}
function videoCard(e,i){
 return `<article class="entry q-lab-card" data-lab-video-card="${esc(e.id)}"><div class="q-lab-visual" aria-hidden="true"><span>VIDEO WORK</span><strong>VIDEO<span>↗</span></strong><small>BILIBILI / ${String(i+1).padStart(3,'0')}</small></div><div class="q-lab-copy"><p class="eyebrow">BILIBILI · ${esc(e.format||'视频作品')}</p><h2>${esc(e.title)}</h2><p>${esc(e.subtitle)}</p><div class="actions">${videoAction(e)}${e.resources?.find(r=>r.role==='html')?releaseAction(e.resources.find(r=>r.role==='html')):''}${a('查看作品','/notes/lab/docs/'+e.id+'/','button button--quiet')}</div></div></article>`;
}
export function experimentGallery(){
 return `<section class="section q-lab-intro">${head('LAB / WORKS','从提示词到作品。')}<p class="j-lead">交互动画、音乐影像与主题节目。保留作品与相关记录，直接看实际效果。</p></section>${EXPERIMENTS.filter(e=>e.visibility!=='draft'&&e.visibility!=='archived').map((e,i)=>e.kind==='video'?videoCard(e,i):`<article class="entry q-lab-card"><div class="q-lab-visual" aria-hidden="true"><span>ONE PROMPT</span><strong>${esc(e.medium||'HTML')}<span>↗</span></strong><small>INTERACTIVE / ${String(i+1).padStart(3,'0')}</small></div><div class="q-lab-copy"><p class="eyebrow">${esc(e.model)} · ${esc(e.format||'HTML')}</p><h2>${esc(e.title)}</h2><p>${esc(e.subtitle)}</p><blockquote translate="no" lang="${esc(e.promptLanguage||'zh-CN')}">${esc(e.prompt)}</blockquote><div class="actions">${a('查看实验','/notes/lab/docs/'+e.id+'/','button')}${a('直接打开动画',e.artifact.href,'button button--quiet','target="_blank" rel="noopener noreferrer" data-router-ignore')}</div></div></article>`).join('')}${EXPERIMENTS.some(e=>e.visibility==='archived')?'<details class="j-legacy-details"><summary>历史实验</summary><ul>'+EXPERIMENTS.filter(e=>e.visibility==='archived').map(e=>'<li>'+a(e.title,'/notes/lab/docs/'+e.id+'/')+'</li>').join('')+'</ul></details>':''}<p class="j-small q-lab-footnote">作品记录用于观察具体效果，不代表跨模型基准测试结果。</p>`;
}
function videoDetail(e){
 const related=EXPERIMENTS.find(row=>row.id===e.relatedExperimentId&&row.visibility!=='draft');
 return `<article class="section q-experiment" data-lab-video="${esc(e.id)}">${e.visibility==='archived'?'<p class="j-notice">历史实验，保留原始记录。</p>':''}<div class="q-experiment-top"><p class="eyebrow">LAB / VIDEO</p>${a('返回实验室','/notes/lab/')}</div><div class="q-experiment-stage"><div class="q-lab-placeholder"><span class="q-lab-kicker">BILIBILI · VIDEO WORK</span><h2>${esc(e.title)}</h2><p>${esc(e.subtitle)}</p>${videoAction(e)}<span class="j-small">在哔哩哔哩观看完整视频，本页不会自动播放。</span></div></div><dl class="q-experiment-facts"><div><dt>作品形式</dt><dd>${esc(e.format||'视频作品')}</dd></div><div><dt>观看平台</dt><dd>哔哩哔哩</dd></div><div><dt>视频编号</dt><dd><code translate="no">${esc(e.video.bvid)}</code></dd></div><div><dt>收录日期</dt><dd><time datetime="${esc(e.createdAt)}">${esc(e.createdAt)}</time></dd></div></dl><section class="section">${head('ABOUT','作品说明')}<p>${esc(e.provenance)}</p><p class="j-small">${esc(e.verification)}</p></section>${releaseSection(e)}${related?`<section class="section">${head('RELATED','相关实验')}<p>视频成片与原始 SVG 动画分别保留。</p>${a(related.title,'/notes/lab/docs/'+related.id+'/','button button--quiet')}</section>`:''}</article>`;
}
export function experimentDetail(id){
 const e=EXPERIMENTS.find(x=>x.id===id&&x.visibility!=='draft');if(!e)return null;
 if(e.kind==='video')return videoDetail(e);
 return `<article class="section q-experiment" data-experiment="${esc(id)}">${e.visibility==='archived'?'<p class="j-notice">历史实验，保留原始记录。</p>':''}<div class="q-experiment-top"><p class="eyebrow">LAB / ${esc(e.format||'HTML')}</p>${a('返回实验室','/notes/lab/')}</div><div class="q-experiment-stage" data-lab-stage><div class="q-lab-placeholder"><span class="q-lab-kicker">${esc(e.kicker||'ONE PROMPT')}</span><h2>${esc(e.title)}</h2><p>${esc(e.previewDescription||e.subtitle)}</p><button class="button" type="button" data-lab-play>播放原始动画</button><span class="j-small">点击后载入，离开本页停止。</span></div></div><div class="q-lab-actions"><div class="actions">${a('新窗口打开',e.artifact.href,'button button--quiet','target="_blank" rel="noopener noreferrer" data-router-ignore')}${a('下载原始 HTML',e.artifact.href,'button button--quiet','download="'+esc(e.artifact.downloadName||e.id.replaceAll('-','_')+'.html')+'" data-router-ignore')}<button type="button" class="button button--quiet" data-lab-stop hidden>结束预览</button></div><p class="j-small" data-lab-status role="status">${(e.artifact.bytes/1024).toFixed(1)} KiB · ${e.artifact.selfContained?'无外部依赖':'依赖说明见作品记录'}</p></div><dl class="q-experiment-facts"><div><dt>生成模型</dt><dd>${esc(e.model)}</dd></div><div><dt>推理强度</dt><dd>${e.reasoningEffort?esc(e.reasoningEffort):'未记录'}</dd></div><div><dt>输入</dt><dd>一条提示词</dd></div><div><dt>原始产物</dt><dd>独立 HTML</dd></div></dl><section class="q-prompt-section"><div class="section-head"><h2>原始提示词</h2><button type="button" class="button button--quiet" data-copy-prompt>复制提示词</button></div><pre tabindex="0" data-prompt-text translate="no" lang="${esc(e.promptLanguage||'zh-CN')}">${esc(e.prompt)}</pre><p class="j-small" role="status" data-copy-prompt-status></p></section><section class="section">${head('OBSERVE','模型表现，看这些细节')}<div class="q-observation-grid">${e.features.map((f,i)=>`<section class="entry"><span class="q-observation-no">0${i+1}</span><h3>${esc(f.title)}</h3><p>${esc(f.description)}</p></section>`).join('')}</div></section><details class="q-provenance"><summary>作品记录与说明</summary><p>${esc(e.provenance)}</p><p>${esc(e.verification)}</p><p>收录日期：${esc(e.createdAt)} · 原始文件：${esc(e.artifact.bytes)} 字节</p><p class="q-file-hash">SHA-256：<code>${esc(e.artifact.sha256)}</code></p></details></article>`;
}

export function projectNavigation(p){return p.layout==='experiments'?developmentNav('lab'):null;}
export function projectOverview(p){return p.layout==='website'?websiteOverview(p):p.layout==='experiments'?experimentGallery():null;}
export function projectDocument(p,r){return p.layout==='experiments'&&r.doc?experimentDetail(r.doc):null;}
