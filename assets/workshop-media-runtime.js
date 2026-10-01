/* WORKSHOP-R07. One lightweight observer; route redraws reuse the same initializer. */
(() => {
  'use strict';
  if (globalThis.SITE_MEDIA_RUNTIME) return;
  const bound=new WeakSet();
  function state(image, failed) {
    const media=image.closest('.pw-media');if(!media)return;
    media.classList.toggle('pw-media--failed',failed);
    const fallback=media.querySelector('.pw-media-fallback');if(fallback)fallback.hidden=!failed;
  }
  function mount(root=document) {
    const images=[];if(root.matches?.('.pw-media img'))images.push(root);
    images.push(...(root.querySelectorAll?.('.pw-media img')||[]));
    for(const image of images){
      if(bound.has(image))continue;bound.add(image);
      const failed=()=>{
        const sources=image.parentElement?.tagName==='PICTURE'?[...image.parentElement.querySelectorAll('source')]:[];
        if(sources.length){
          // Retry the retained original exactly once, including cached preview failures.
          state(image,false);for(const source of sources)source.remove();image.src=image.getAttribute('src');return;
        }
        state(image,true);
      };
      image.addEventListener('error',failed);image.addEventListener('load',()=>state(image,false));
      if(image.complete){if(image.naturalWidth===0)failed();else state(image,false);}
    }
  }
  function start(){mount();const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)mount(node);});observer.observe(document.body,{childList:true,subtree:true});}
  globalThis.SITE_MEDIA_RUNTIME=Object.freeze({mount});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
