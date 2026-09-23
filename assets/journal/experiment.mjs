/** Explicit, disposable preview. The original animation stays byte-for-byte intact. */
import {EXPERIMENTS} from './data/experiments.mjs?v=dev-r44-0f507510655a1cb1';
const bound=new WeakSet();
export function disposeExperiments(root){
 root?.querySelectorAll('[data-experiment]').forEach(stop);
}
function stop(box){
 const stage=box.querySelector('[data-lab-stage]');
 stage?.querySelector('iframe')?.remove();
 const placeholder=stage?.querySelector('.q-lab-placeholder');if(placeholder)placeholder.hidden=false;
 const button=box.querySelector('[data-lab-stop]');if(button)button.hidden=true;
 const status=box.querySelector('[data-lab-status]');if(status)status.textContent='预览已结束。可再次播放或下载原始 HTML。';
}
export function bindExperiments(root){
 root.querySelectorAll('[data-experiment]').forEach(box=>{
  if(bound.has(box))return;bound.add(box);
  box.addEventListener('click',async event=>{
   const button=event.target.closest('button');if(!button)return;
   const data=EXPERIMENTS.find(e=>e.id===box.dataset.experiment);if(!data)return;
   if(button.hasAttribute('data-lab-stop')){stop(box);return;}
   if(button.hasAttribute('data-lab-play')){
    const stage=box.querySelector('[data-lab-stage]');if(stage.querySelector('iframe'))return;
    const frame=document.createElement('iframe');frame.title='鹈鹕骑自行车：原始 SVG 动画';
    frame.setAttribute('sandbox','allow-scripts');frame.referrerPolicy='no-referrer';frame.src=data.artifact.href;
    const status=box.querySelector('[data-lab-status]');status.textContent='正在载入原始动画…';
    frame.addEventListener('load',()=>{if(box.isConnected&&frame.isConnected)status.textContent='在动画内选择速度或暂停；聚焦动画后可按空格键。';},{once:true});
    stage.querySelector('.q-lab-placeholder').hidden=true;stage.append(frame);box.querySelector('[data-lab-stop]').hidden=false;return;
   }
   if(button.hasAttribute('data-copy-prompt')){
    const status=box.querySelector('[data-copy-prompt-status]');
    try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(data.prompt);if(box.isConnected)status.textContent='提示词已复制。';}
    catch{if(!box.isConnected)return;const range=document.createRange();range.selectNodeContents(box.querySelector('[data-prompt-text]'));const selection=window.getSelection();selection?.removeAllRanges();selection?.addRange(range);status.textContent='已选中文字，请使用系统复制操作。';}
   }
  });
 });
}
