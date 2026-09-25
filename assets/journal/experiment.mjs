/** Per-mount preview lifetime. Only a visitor click may request an original artifact. */
import {EXPERIMENTS} from './data/experiments.mjs?v=dev-r44-b4827cfe7c9fa959';
const bound=new WeakSet(),scopes=new WeakMap();
const status=(box,selector,text)=>{const node=box.querySelector(selector);if(node){node.textContent=text;globalThis.SITE_I18N?.apply(node);}};
function state(box){if(!scopes.has(box))scopes.set(box,{generation:0,controller:null,timer:null});return scopes.get(box);}
function stop(box,announce=true){
 const scope=state(box);scope.generation++;scope.controller?.abort();scope.controller=null;clearTimeout(scope.timer);scope.timer=null;
 const stage=box.querySelector('[data-lab-stage]');stage?.querySelector('iframe')?.remove();
 const placeholder=stage?.querySelector('.q-lab-placeholder');if(placeholder)placeholder.hidden=false;
 const button=box.querySelector('[data-lab-stop]');if(button)button.hidden=true;
 const play=box.querySelector('[data-lab-play]');if(play){play.disabled=false;play.removeAttribute('aria-busy');}
 if(announce)status(box,'[data-lab-status]','预览已结束。可再次播放或下载原始 HTML。');
}
export function disposeExperiments(root){root?.querySelectorAll('[data-experiment]').forEach(box=>stop(box,false));}
export function bindExperiments(root){
 root.querySelectorAll('[data-experiment]').forEach(box=>{
  if(bound.has(box))return;bound.add(box);state(box).generation++;
  box.addEventListener('click',async event=>{
   const button=event.target.closest('button');if(!button)return;
   const data=EXPERIMENTS.find(e=>e.id===box.dataset.experiment);if(!data)return;
   if(button.hasAttribute('data-lab-stop')){stop(box);return;}
   const scope=state(box),generation=scope.generation;
   const alive=()=>box.isConnected&&state(box).generation===generation;
   if(button.hasAttribute('data-lab-play')){
    const stage=box.querySelector('[data-lab-stage]');if(!stage||stage.querySelector('iframe')||scope.controller)return;
    const controller=new AbortController();scope.controller=controller;button.disabled=true;button.setAttribute('aria-busy','true');
    status(box,'[data-lab-status]','正在载入原始动画…');
    const timer=setTimeout(()=>controller.abort(),10000);scope.timer=timer;
    try{
     const url=new URL(data.artifact.href,location.href);if(url.origin!==location.origin||!/^\/experiments\/.+\.html$/.test(url.pathname))throw Error('Invalid artifact');
     const response=await fetch(url,{method:'HEAD',credentials:'omit',signal:controller.signal});
     if(!response.ok)throw Error('Artifact unavailable');if(!alive())return;
     clearTimeout(timer);scope.controller=null;
     const frame=document.createElement('iframe');frame.title=data.title;
     frame.setAttribute('sandbox','allow-scripts');frame.referrerPolicy='no-referrer';frame.src=data.artifact.href;
     frame.addEventListener('load',()=>{if(alive()&&frame.isConnected)status(box,'[data-lab-status]',data.controlsSummary||'在作品中操作；需要时可在新窗口打开。');},{once:true});
     const placeholder=stage.querySelector('.q-lab-placeholder');if(placeholder)placeholder.hidden=true;
     stage.append(frame);globalThis.SITE_I18N?.apply(frame);const end=box.querySelector('[data-lab-stop]');if(end)end.hidden=false;
    }catch(error){if(alive()){scope.controller=null;status(box,'[data-lab-status]','动画未能载入。请重试或在新窗口打开。');}}
    finally{clearTimeout(timer);if(scope.timer===timer)scope.timer=null;if(scope.controller===controller)scope.controller=null;if(alive()){button.disabled=false;button.removeAttribute('aria-busy');}}
    return;
   }
   if(button.hasAttribute('data-copy-prompt')){
    const copyTicket={};scope.copyTicket=copyTicket;
    try{
     if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(data.prompt);
     if(alive()&&scope.copyTicket===copyTicket)status(box,'[data-copy-prompt-status]','提示词已复制。');
    }catch{
     if(!alive()||scope.copyTicket!==copyTicket)return;
     const source=box.querySelector('[data-prompt-text]');if(!source)return;
     const range=document.createRange();range.selectNodeContents(source);const selection=window.getSelection();selection?.removeAllRanges();selection?.addRange(range);
     status(box,'[data-copy-prompt-status]','已选中文字，请使用系统复制操作。');
    }
   }
  });
 });
}
