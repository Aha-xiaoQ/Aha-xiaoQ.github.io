/* Aggregate page counts only. No visitor ID, cookies, referrer or complete URL. */
(() => {
  if (location.hostname !== 'aha-xiaoq.github.io' || location.protocol !== 'https:' || window.self !== window.top || window.__XIAOQ_ANALYTICS_STARTED__) return;
  window.__XIAOQ_ANALYTICS_STARTED__ = true;
  const endpoint='https://xiaoq-guestbook.hfutqdm.chatgpt.site/api/traffic';
  const exclusionKey='xiaoq-stats-disabled',activityKey='xiaoq-stats-last-pageview';
  let excluded=false,lastPath=null;
  function disabled(){
    const flag=new URLSearchParams(location.search).get('stats');
    if(flag==='off'){excluded=true;try{sessionStorage.setItem(exclusionKey,'1');}catch{}}
    else if(flag==='on'){excluded=false;try{sessionStorage.removeItem(exclusionKey);}catch{}}
    try{if(sessionStorage.getItem(exclusionKey)==='1')excluded=true;}catch{}
    return excluded || window.__XIAOQ_ANALYTICS_DISABLED__===true;
  }
  function pageview(){
    if(disabled())return;
    const path=location.pathname.split(/[?#]/,1)[0].replace(/\/index\.html$/,'/');
    if(path===lastPath)return;lastPath=path;
    let visitStart=null;const now=Date.now();
    try{const previous=Number(sessionStorage.getItem(activityKey));visitStart=!previous||now-previous>=30*60*1000;sessionStorage.setItem(activityKey,String(now));}catch{}
    fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path,visitStart}),credentials:'omit',referrerPolicy:'no-referrer',keepalive:true}).catch(()=>{});
  }
  // A dedicated successful-route event avoids counting scroll/view replaceState calls.
  window.addEventListener('xiaoq:pageview',pageview);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',pageview,{once:true});else pageview();
  // Keep the previous provider independent; test opt-out suppresses both loaders.
  if(disabled() || document.querySelector('script[data-cf-beacon]'))return;
  const beacon=document.createElement('script');beacon.type='module';
  beacon.src='https://static.cloudflareinsights.com/beacon.min.js';
  beacon.setAttribute('data-cf-beacon',JSON.stringify({token:'ec50601bb94346a1b765e79a14a574fa'}));
  document.head.appendChild(beacon);
})();
