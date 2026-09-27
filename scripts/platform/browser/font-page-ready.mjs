/** Readiness for a font inspection, not a wait for every image/video to finish.
 * The selected document, locale runtime, live content and active local styles
 * must all be ready. #app is only a router implementation detail: standalone
 * semantic pages can render <main> directly under <body>. Keep the observed
 * host for diagnostics, but never make that wrapper a readiness requirement.
 * Failure reports the observed state instead of a bare timeout.
 */
import {evaluate} from './cdp.mjs';

export function fontPageMatches(actual,expected){
 try{
  const a=new URL(actual),b=new URL(expected);
  const normalize=p=>p.replace(/\/index\.html$/,'/');
  return ['http:','https:'].includes(b.protocol)&&a.origin===b.origin&&normalize(a.pathname)===normalize(b.pathname);
 }catch{return false;}
}
export function fontReadinessProblems(state,expected){
 const issues=[];
 if(!state||!fontPageMatches(state.url,expected))issues.push('wrong-document');
 if(!state||!['interactive','complete'].includes(state.readyState))issues.push('document-not-parsed');
 const lang=new URL(expected).searchParams.get('lang')||'zh';
 if(!state?.localeReady||state.language!==lang)issues.push('locale-not-ready');
 if(!state?.main||!state?.heading)issues.push('content-not-ready');
 if(new URL(expected).pathname.startsWith('/notes/')&&!state?.journal)issues.push('journal-not-ready');
 if(!Array.isArray(state?.pendingStyles)||state.pendingStyles.length)issues.push('styles-not-ready');
 if(state?.resourceFailure)issues.push('page-resource-failure');
 return issues;
}
export function fontPageState(){
 const local=link=>{try{return new URL(link.href,location.href).origin===location.origin;}catch{return false;}};
 const pendingStyles=[...document.querySelectorAll('link[rel~="stylesheet"]')]
  .filter(l=>local(l)&&!l.disabled&&(!l.media||matchMedia(l.media).matches)&&!l.sheet).map(l=>l.href);
 return {url:location.href,readyState:document.readyState,title:document.title,
  localeReady:!!globalThis.SITE_I18N,language:globalThis.SITE_I18N?.language||null,
  app:!!document.querySelector('#app'),main:!!document.querySelector('main'),heading:!!document.querySelector('h1'),
  journal:!!globalThis.SITE_JOURNAL&&!!document.querySelector('[data-journal-slot] .journal'),
  resourceFailure:!!document.querySelector('.q-resource-error,.j-error,.q-search-error'),pendingStyles};
}
export async function waitForFontPage(browser,expected,{timeout=20000}={}){
 if(!Number.isFinite(timeout)||timeout<1||timeout>60000)throw Error('Invalid font page readiness timeout');
 const start=Date.now();let state=null,lastError=null;
 while(Date.now()-start<timeout){
  try{state=await evaluate(browser,'('+fontPageState.toString()+')()');lastError=null;
   if(!fontReadinessProblems(state,expected).length)return state;
   if(state.resourceFailure)break;
  }catch(e){lastError=e.message;}
  await new Promise(r=>setTimeout(r,75));
 }
 throw Error('Font page readiness failed: '+JSON.stringify({expected,problems:fontReadinessProblems(state,expected),observed:state,...(lastError?{evaluationError:lastError}:{})}));
}
