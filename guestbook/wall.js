import {installWallI18n, translate} from './wall-i18n.mjs?v=dd5b8227f5b3e07a8da6';
import { contentBounds, fitCamera, expandWall } from './wall-geometry.mjs?v=dd5b8227f5b3e07a8da6';
import { installWallSkin } from './wall-skin.mjs?v=dd5b8227f5b3e07a8da6';
import { installNoteDrag } from './note-drag.mjs?v=dd5b8227f5b3e07a8da6';
const $=id=>document.getElementById(id);
const cloudMode=true;
const form=$('composer'),viewport=$('viewport'),world=$('world'),text=$('message');
let scale=1,tx=0,ty=0,pending=null,selected=null,drag=null,sequence=0;
const notes=new Map(),clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
window.addEventListener('guestbook-identity-changed',()=>{for(const note of notes.values())note.el.remove();world.querySelectorAll('.occupied-slot').forEach(el=>el.remove());notes.clear();select(null);$('status').textContent='身份已切换，正在重新读取便签…';});
let wallBounds;
const plane=document.createElement('div');plane.className='wall-plane';world.prepend(plane);
function drawWall(){Object.assign(plane.style,{left:wallBounds.x+'px',top:wallBounds.y+'px',width:wallBounds.width+'px',height:wallBounds.height+'px'});}
function paint(){world.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;viewport.style.backgroundPosition=`${tx}px ${ty}px`;const grid=Math.max(12,24*scale);viewport.style.backgroundSize=`${grid}px ${grid}px`;$('zoom').textContent=`${(scale*100).toFixed(scale<.1?2:0)}%`;}
function zoom(next,x=viewport.clientWidth/2,y=viewport.clientHeight/2){next=clamp(next,.0001,2);tx=x-(x-tx)*next/scale;ty=y-(y-ty)*next/scale;scale=next;paint();}
function cancel(){pending=null;viewport.classList.remove('placing');$('cancel').hidden=$('center').hidden=true;}
function select(note){selected?.el.classList.remove('selected');selected=note;note?.el.classList.add('selected');$('remove').disabled=!note||(cloudMode&&!note.owned);$('selection').textContent=note?`已选中：${note.nick}`:`墙上有 ${notes.size} 张便签`;refreshSearch();}
function position(note){note.x=clamp(note.x,-1000000,1000000);note.y=clamp(note.y,-1000000,1000000);note.el.style.left=`${note.x}px`;note.el.style.top=`${note.y}px`;wallBounds=expandWall(wallBounds,note);drawWall();}
function ink(color){const rgb=color.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);const lum=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;return lum>.179?'#000000':'#ffffff';}
function sizeNote(note){
  const el=note.el,content=el.querySelector('.content'),footer=el.querySelector('footer');
  if(note.placeholder){
    el.classList.add('reservation');content.textContent='待审核';footer.textContent='位置已预留';
    note.width=note.reservedWidth;note.height=note.reservedHeight;
    el.style.width=note.width+'px';el.style.height=note.height+'px';return;
  }
  note.createdAt ??= new Date().toISOString();
  if(!footer.querySelector('time')){
    const author=document.createElement('span');
    author.className='note-author';
    author.textContent='— '+note.nick;
    footer.replaceChildren(author);
    const time=document.createElement('time');
    time.dateTime=note.createdAt;
    time.textContent=(cloudMode?'提交时间 · ':'预览时间 · ')+new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(note.createdAt));
    time.title='北京时间 · '+note.createdAt;
    footer.append(time);
  }
  if(note.reservedWidth&&note.reservedHeight){
    el.classList.add('reserved-size');note.width=note.reservedWidth;note.height=note.reservedHeight;
    el.style.width=note.width+'px';el.style.height=note.height+'px';return;
  }
  const length=[...note.text].length;
  let width=length<30?220:length<120?290:360;
  const shaped=note.shape==='heart'||note.shape==='round';
  if(shaped)width+=40;
  el.classList.toggle('long',length>60);
  function measure(){el.style.width=width+'px';el.style.height='auto';return content.scrollHeight+footer.scrollHeight+14;}
  let bodyHeight=measure();
  if(shaped){
    // Keep text in the safe central rectangle rather than the tapered edges.
    while(bodyHeight>width*(note.shape==='heart'?.32:.52)){width=Math.ceil(Math.max(width+40,bodyHeight/(note.shape==='heart'?.32:.52)));bodyHeight=measure();}
    note.height=width;
  }else note.height=Math.max(note.shape==='ticket'?(bodyHeight+72)/.8:bodyHeight+64,length<30?150:190);
  note.width=width;el.style.width=width+'px';el.style.height=note.height+'px';
}
function place(x,y){if(!pending)return;const note={...pending,id:++sequence};const el=document.createElement('article');el.className=`note ${note.shape}`;el.style.setProperty('--paper',note.color);el.style.color=ink(note.color);el.tabIndex=0;el.dataset.id=note.id;el.setAttribute('aria-label',`便签：${note.nick}，可用方向键移动`);const content=document.createElement('div');content.className='content';content.textContent=note.text;const footer=document.createElement('footer');footer.textContent=note.nick;el.append(content,footer);note.el=el;notes.set(note.id,note);world.append(el);sizeNote(note);note.x=(x-tx)/scale-note.width/2;note.y=(y-ty)/scale-note.height/2;position(note);select(note);cancel();$('status').textContent='已贴到本地墙面，没有上传。';}
form.addEventListener('input',()=>{const count=[...text.value].length;text.setCustomValidity(count>500?translate('留言请控制在 500 字以内。'):'');$('counter').textContent=`${count} / 500 字`;cancel();$('status').textContent='';});
form.addEventListener('submit',e=>{e.preventDefault();if(!text.value.trim()){text.setCustomValidity(translate('请写下留言。'));text.reportValidity();return;}if(notes.size>=60){$('status').textContent='本地预览最多放 60 张，请先移除一些便签。';return;}pending={text:text.value,nick:$('nick').value.trim()||'匿名访客',color:$('color').value,shape:$('shape').value};viewport.classList.add('placing');$('cancel').hidden=$('center').hidden=false;$('status').textContent='点击墙面粘贴，或选择“贴在视野中央”。';viewport.focus();});
$('cancel').onclick=()=>{cancel();$('status').textContent='已取消粘贴。';};$('center').onclick=()=>place(viewport.clientWidth/2,viewport.clientHeight/2);
$('in').onclick=()=>zoom(scale*1.25);$('out').onclick=()=>zoom(scale/1.25);$('reset').onclick=()=>zoom(1);$('fit').textContent='查看全部便签';$('fit').onclick=()=>{({scale,tx,ty}=fitCamera(contentBounds([...notes.values()]),viewport.clientWidth,viewport.clientHeight));paint();};
function goTo(x,y){scale=1;tx=viewport.clientWidth/2-x;ty=viewport.clientHeight/2-y;paint();}
const home=document.createElement('button');home.type='button';home.textContent='回到中心';home.onclick=()=>goTo(0,0);
const latest=document.createElement('button');latest.type='button';latest.textContent='最新便签';latest.onclick=()=>{const note=[...notes.values()].at(-1);if(note){goTo(note.x+note.width/2,note.y+note.height/2);select(note);}else{$('status').textContent='还没有便签，先写一张吧。';}};
$('reset').after(home,latest);
const finder=document.createElement('details');finder.className='note-finder';
const summary=document.createElement('summary');summary.textContent='查找便签 / 我本次写的';
const label=document.createElement('label');label.htmlFor='note-query';label.textContent='搜索正文或昵称';
const query=document.createElement('input');query.id='note-query';query.type='search';query.placeholder='输入关键词';
const resultCount=document.createElement('p');resultCount.setAttribute('role','status');
const results=document.createElement('div');results.className='note-results';
const ownership=document.createElement('p');ownership.className='hint';ownership.textContent='这里都是你本次试贴的便签，刷新后清空。';
finder.append(summary,label,query,ownership,resultCount,results);viewport.parentElement.prepend(finder);
function refreshSearch(){
  const term=query.value.trim().toLocaleLowerCase();
  const matches=[...notes.values()].reverse().filter(n=>(n.text+' '+n.nick).toLocaleLowerCase().includes(term));
  resultCount.textContent=matches.length?`找到 ${matches.length} 张，点击即可定位。`:(notes.size?'没有匹配的便签。':'还没有便签，先写一张吧。');
  results.replaceChildren();
  for(const note of matches){const button=document.createElement('button');button.type='button';button.textContent=`${note.nick} · ${[...note.text].slice(0,40).join('')}${[...note.text].length>40?'…':''}`;button.onclick=()=>{
    cancel();({scale,tx,ty}=fitCamera({x:note.x-30,y:note.y-30,width:note.width+60,height:note.height+60},viewport.clientWidth,viewport.clientHeight));paint();select(note);viewport.focus({preventScroll:true});viewport.scrollIntoView({block:'nearest'});
  };results.append(button);}
}
query.addEventListener('input',refreshSearch);refreshSearch();
viewport.previousElementSibling.textContent='拖动空白处移动墙面，滚轮缩放。拖动便签边缘调整位置；选中后也可用方向键移动。';
document.fonts?.ready.then(()=>{for(const note of notes.values()){sizeNote(note);position(note);}});
viewport.addEventListener('wheel',e=>{e.preventDefault();const rect=viewport.getBoundingClientRect();zoom(scale*Math.exp(-e.deltaY*.0015),e.clientX-rect.left-viewport.clientLeft,e.clientY-rect.top-viewport.clientTop);},{passive:false});
viewport.addEventListener('pointerdown',e=>{if(e.button!==0||drag)return;const rect=viewport.getBoundingClientRect();if(pending){place(e.clientX-rect.left-viewport.clientLeft,e.clientY-rect.top-viewport.clientTop);return;}const el=e.target.closest('.note');const note=el?notes.get(Number(el.dataset.id)):null;select(note);const content=e.target.closest('.content');if(content){if(e.pointerType==='touch'){drag={pointer:e.pointerId,y:e.clientY,content,scroll:content.scrollTop};viewport.setPointerCapture(e.pointerId);}return;}viewport.focus();drag={pointer:e.pointerId,x:e.clientX,y:e.clientY,tx,ty,note,nx:note?.x,ny:note?.y};viewport.setPointerCapture(e.pointerId);});
viewport.addEventListener('focusin',e=>{const el=e.target.closest('.note');if(el)select(notes.get(Number(el.dataset.id)));});
viewport.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(drag.content){drag.content.scrollTop=drag.scroll-dy/scale;return;}if(drag.note){drag.note.x=drag.nx+dx/scale;drag.note.y=drag.ny+dy/scale;position(drag.note);}else{tx=drag.tx+dx;ty=drag.ty+dy;paint();}});
for(const name of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(name,e=>{if(drag?.pointer===e.pointerId)drag=null;});
viewport.addEventListener('keydown',e=>{if(e.key==='Escape'){cancel();select(null);return;}const delta={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];if(!delta)return;e.preventDefault();if(selected){selected.x+=delta[0];selected.y+=delta[1];position(selected);}else{tx+=delta[0];ty+=delta[1];paint();}});
$('remove').onclick=()=>{if(!selected)return;notes.delete(selected.id);selected.el.remove();select(null);};
const toolbar=document.querySelector('.toolbar');toolbar.append($('remove'));$('remove').textContent='删除选中便签';
function resizeViewport(){
  const top=viewport.getBoundingClientRect().top+window.scrollY;
  viewport.style.height=Math.max(300,Math.min(620,window.innerHeight-Math.min(top,260)-70))+'px';
  if(!wallBounds||notes.size===0){wallBounds={x:0,y:0,width:viewport.clientWidth,height:viewport.clientHeight};tx=0;ty=0;scale=1;drawWall();paint();}
  else if(selected){scale=Math.min(scale,(viewport.clientWidth-32)/selected.width,(viewport.clientHeight-32)/selected.height);tx=viewport.clientWidth/2-(selected.x+selected.width/2)*scale;ty=viewport.clientHeight/2-(selected.y+selected.height/2)*scale;paint();}
}
resizeViewport();window.addEventListener('resize',resizeViewport);
home.onclick=()=>goTo(wallBounds.x+wallBounds.width/2,wallBounds.y+wallBounds.height/2);
paint();
if(cloudMode){
  document.querySelector('header p').textContent='留言需审核后公开';
  world.querySelector('.wall-label').textContent='留一点灵感在这里';
  let cloudDraft=null,moveTarget=null,uncertain=false,lastSubmission=null;
  let editTarget=null,draftBackup=null,removeHome=null;
  const formAnchor=document.createComment('composer-home');form.before(formAnchor);
  $('remove').type='button';
  const editorDialog=document.createElement('dialog');editorDialog.className='note-editor';editorDialog.setAttribute('aria-label','编辑我的便签');document.body.append(editorDialog);
  const wallFeedback=document.createElement('p');wallFeedback.className='wall-feedback';wallFeedback.setAttribute('role','status');viewport.after(wallFeedback);
  new window.MutationObserver(()=>{wallFeedback.textContent=$('status').textContent;}).observe($('status'),{childList:true,characterData:true,subtree:true});
  const submitButton=form.querySelector('[type="submit"]'),heading=form.querySelector('h2');
  const editButton=document.createElement('button');editButton.type='button';editButton.textContent='编辑我的便签';toolbar.append(editButton);
  const cancelEdit=document.createElement('button');cancelEdit.type='button';cancelEdit.textContent='取消编辑';cancelEdit.hidden=true;form.append(cancelEdit);
  const editHelp=document.createElement('p');editHelp.className='hint';editHelp.hidden=true;editHelp.textContent='修改后重新待审核；优先保留原位置，内容变长时自动调整大小并避让。';submitButton.before(editHelp);
  const fields=()=>({body:text.value,nickname:$('nick').value,color:$('color').value,shape:$('shape').value});
  function fillFields(n){text.value=n.body;$('nick').value=n.nickname;$('color').value=n.color;$('shape').value=n.shape;text.setCustomValidity('');$('counter').textContent=`${[...text.value].length} / 500 字`;}
  function endEdit(){editTarget=null;if(editorDialog.open)editorDialog.close();formAnchor.after(form);if(removeHome){removeHome.replaceWith($('remove'));removeHome=null;}heading.textContent='写一张便签';submitButton.textContent='选择粘贴位置';cancelEdit.hidden=editHelp.hidden=true;if(draftBackup)fillFields(draftBackup);draftBackup=null;controls();selected?.el.focus({preventScroll:true});}
  const retryButton=document.createElement('button');retryButton.type='button';retryButton.textContent='重试同一次提交';retryButton.hidden=true;form.append(retryButton);
  const moveButton=document.createElement('button');moveButton.type='button';moveButton.textContent='调整我的便签位置';toolbar.append(moveButton);
  function stopPlacement(){cloudDraft=null;moveTarget=null;cancel();}
  function controls(){for(const control of form.elements)control.disabled=busy;submitButton.disabled=busy||uncertain;retryButton.hidden=!uncertain||!lastSubmission;all.disabled=mine.disabled=more.disabled=moveButton.disabled=editButton.disabled=busy||!!editTarget;$('remove').disabled=busy||!(editTarget||selected)?.owned;$('remove').textContent=editTarget?'删除正在编辑的便签':'删除选中便签';}
  function errorText(error){return ({CREATOR_LOGIN_EXPIRED:'创作者登录已过期，请退出后重新登录，草稿已保留。',SUBMISSIONS_PAUSED:'留言暂未开放，草稿已保留。',RATE_LIMITED:'留言太频繁，请稍后再试，草稿已保留。',WALL_CAPACITY_REACHED:'留言墙暂时已满，草稿已保留。',NO_SPACE_NEARBY:'附近空间不足，请换一处空白位置，草稿已保留。',INVALID_NOTE:'留言内容或格式不符合要求，请检查后重试。',STORAGE_UNAVAILABLE:'浏览器无法保存访客身份，请允许此网站使用本地存储。'})[error.message]||'操作结果尚未确认，请先查看“我的便签”，不要立即重复提交。';}
  form.addEventListener('submit',e=>{
    e.preventDefault();e.stopImmediatePropagation();if(busy||uncertain)return;
    if(!text.value.trim()){text.setCustomValidity(translate('请写下留言。'));text.reportValidity();return;}
    if(editTarget){saveEdit();return;}
    cloudDraft={text:text.value,nick:$('nick').value.trim()||'匿名访客',color:$('color').value,shape:$('shape').value};
    moveTarget=null;viewport.classList.add('placing');$('cancel').hidden=$('center').hidden=false;
    $('status').textContent='选择位置后会发送到云端审核。点击墙面，或选择“贴在视野中央”。';
  },true);
  form.addEventListener('input',stopPlacement);
  finder.addEventListener('click',stopPlacement);
  finder.addEventListener('input',stopPlacement);
  $('cancel').onclick=()=>{stopPlacement();$('status').textContent='已取消，草稿保留。';};
  summary.textContent='查找已加载的便签';
  ownership.textContent='仅展示云端数据；“我的便签”依赖当前浏览器身份，清除网站数据后可能无法找回。';
  const all=document.createElement('button'),mine=document.createElement('button'),more=document.createElement('button');
  all.textContent='公开便签';mine.textContent='我的便签';more.textContent='加载更多';
  all.type=mine.type=more.type='button';more.hidden=true;
  toolbar.prepend(all,mine);toolbar.append(more);
  let own=false,cursor=null,busy=false,occupancy=[],occupancyReady=false;
  function drawOccupancy(){
    world.querySelectorAll('.occupied-slot').forEach(el=>el.remove());
    if(!own)return;
    const loadedIds=new Set([...notes.values()].map(n=>n.remoteId));
    for(const row of occupancy){if(loadedIds.has(row.id))continue;
      const el=document.createElement('div');el.className='occupied-slot';el.setAttribute('aria-label','其他便签占位');el.textContent='已有便签';
      Object.assign(el.style,{left:row.x+'px',top:row.y+'px',width:row.width+'px',height:row.height+'px'});world.append(el);
    }
  }
  function markCollision(note){
    const others=new Map(occupancy.map(row=>[row.id,row]));
    for(const n of notes.values())others.set(n.remoteId,n);
    const conflict=[...others.values()].some(n=>(n.remoteId||n.id)!==note.remoteId&&n.status!=='rejected'&&note.x<n.x+n.width+24&&note.x+note.width+24>n.x&&note.y<n.y+n.height+24&&note.y+note.height+24>n.y);
    note.el.classList.toggle('position-conflict',conflict);
    $('status').textContent=conflict?'红框范围与已有占位冲突，松手后会自动避让；也可移到绿色空位。':'此处未发现占位冲突，松手保存。';
  }
  async function load(reset,requestedOwn=own){
    if(busy)return;stopPlacement();busy=true;occupancyReady=false;controls();
    $('status').textContent='正在读取云端便签…';
    try{
      const {loadCloudPage}=await import('./cloud-preview.mjs?v=dd5b8227f5b3e07a8da6');
      const page=await loadCloudPage(requestedOwn,reset?null:cursor);
      const context=[];let next=null;
      if(requestedOwn){do{const other=await loadCloudPage(false,next);context.push(...other.rows);next=other.next;if(context.length>5000)throw Error('OCCUPANCY_TOO_LARGE');}while(next);}
      occupancy=context;occupancyReady=true;
      own=requestedOwn;
      all.setAttribute('aria-pressed',String(!own));mine.setAttribute('aria-pressed',String(own));
      if(reset){for(const note of notes.values())note.el.remove();notes.clear();select(null);resizeViewport();}
      for(const row of page.rows){
        if([...notes.values()].some(n=>n.remoteId===row.id))continue;
        pending={text:row.body,nick:row.placeholder?'待审核':row.nickname||'匿名访客',rawNick:row.nickname,color:row.color,shape:row.shape,createdAt:row.created_at,remoteId:row.id,revision:row.revision,status:row.status,owned:own,placeholder:!!row.placeholder,reservedWidth:row.width,reservedHeight:row.height};
        place(0,0);selected.x=row.x;selected.y=row.y;position(selected);
        selected.el.setAttribute('aria-label',`便签：${selected.nick}`);
        selected.el.classList.toggle('owned',own);
        if(own){const state=document.createElement('span');state.textContent=({pending:'待审核',approved:'已公开',rejected:'未通过审核'})[row.status]||'';selected.el.querySelector('footer').append(state);sizeNote(selected);position(selected);}
      }
      drawOccupancy();cursor=page.next;more.hidden=!cursor;select(null);
      if(reset&&notes.size)$('fit').click();
      $('status').textContent=`${own?'我的便签':'公开便签'}：已加载 ${notes.size} 张。${uncertain?'上次提交结果未确认，请核对便签后再刷新页面重试。':'新留言需审核后公开。'}`;
      return true;
    }catch{ $('status').textContent='云端读取失败，请重试；本次读取没有修改便签。';return false; }
    finally{busy=false;controls();}
  }
  async function sendAt(x,y,rollback=null){
    if(busy||(!cloudDraft&&!moveTarget))return;
    const draft=cloudDraft,target=moveTarget;
    let px,py;
    if(target){px=(x-tx)/scale-target.width/2;py=(y-ty)/scale-target.height/2;}
    else{
      const previous=selected;pending=draft;place(x,y);const probe=selected;px=probe.x;py=probe.y;
      notes.delete(probe.id);probe.el.remove();select(previous);refreshSearch();
    }
    stopPlacement();busy=true;controls();$('status').textContent=target?'正在保存位置…':'正在提交，请勿重复点击…';
    let success=false,savedId=null;
    try{
      const {getCloudClient}=await import('./cloud-preview.mjs?v=dd5b8227f5b3e07a8da6');const api=await getCloudClient();
      if(target){if(!await api.move(target.remoteId,px,py))throw Error('NOT_OWNED');savedId=target.remoteId;
        let page,before=null,saved;do{page=await api.mine(before);saved=page.rows.find(row=>row.id===savedId);before=page.next;}while(!saved&&before);
        if(!saved){target.moveUncertain=true;throw Error('MOVE_READ_UNCONFIRMED');}
        const adjusted=saved.x!==Math.round(px)||saved.y!==Math.round(py);
        target.x=saved.x;target.y=saved.y;position(target);select(target);
        $('status').textContent='位置已保存。'+(adjusted?'所选位置已被占用，已自动移到附近空位。':'');return;
      }
      else{lastSubmission={body:draft.text,nickname:draft.nick==='匿名访客'?'':draft.nick,color:draft.color,shape:draft.shape,x:px,y:py};savedId=(await api.submit(lastSubmission)).id;lastSubmission=null;text.value='';$('counter').textContent='0 / 500 字';}
      success=true;
    }catch(error){
      if(target&&rollback){target.x=rollback.x;target.y=rollback.y;position(target);}
      if(target&&!['NO_SPACE_NEARBY','NOT_OWNED','INVALID_POSITION','CREATOR_LOGIN_EXPIRED','SUBMISSIONS_PAUSED'].includes(error.message))target.moveUncertain=true;
      uncertain=!target&&!['SUBMISSIONS_PAUSED','RATE_LIMITED','WALL_CAPACITY_REACHED','INVALID_NOTE','STORAGE_UNAVAILABLE','NO_SPACE_NEARBY'].includes(error.message);
      $('status').textContent=target?(error.message==='NO_SPACE_NEARBY'?'附近空间不足，便签已恢复原位。':'移动结果未确认，请刷新“我的便签”核对。'):errorText(error);
    }finally{busy=false;controls();}
    if(success){
      if(!await load(true,true)){$('status').textContent='保存成功，但位置读取失败，请点击“我的便签”刷新核对。';return;}
      const saved=[...notes.values()].find(n=>n.remoteId===savedId);
      const adjusted=saved&&(saved.x!==Math.round(px)||saved.y!==Math.round(py));
      if(saved){select(saved);goTo(saved.x+saved.width/2,saved.y+saved.height/2);}
      $('status').textContent=(target?'位置已保存。':'已提交，等待审核；其他访客只能看到虚线占位。')+(adjusted?'所选位置已被占用，已自动移到附近空位。':'');
    }
  }
  $('center').onclick=()=>sendAt(viewport.clientWidth/2,viewport.clientHeight/2);
  retryButton.onclick=async()=>{
    if(busy||!uncertain||!lastSubmission)return;busy=true;controls();$('status').textContent='正在重试同一次提交，不会重复新增便签…';
    let success=false;
    try{const {getCloudClient}=await import('./cloud-preview.mjs?v=dd5b8227f5b3e07a8da6');await (await getCloudClient()).submit(lastSubmission);if(text.value===lastSubmission.body){text.value='';$('counter').textContent='0 / 500 字';}lastSubmission=null;uncertain=false;success=true;}
    catch(error){if(['SUBMISSIONS_PAUSED','INVALID_NOTE','RATE_LIMITED','WALL_CAPACITY_REACHED','REQUEST_RETIRED','REQUEST_CONFLICT'].includes(error.message)){uncertain=false;lastSubmission=null;}$('status').textContent=error.message==='REQUEST_RETIRED'?'这次提交对应的便签已删除，不会重新创建。':errorText(error);}
    finally{busy=false;controls();}
    if(success){await load(true,true);$('status').textContent='提交结果已确认，请在“我的便签”查看审核状态。';}
  };
  moveButton.onclick=()=>{if(busy)return;if(!selected?.owned){$('status').textContent='请在“我的便签”中选中要移动的便签。';return;}moveTarget=selected;cloudDraft=null;viewport.classList.add('placing');$('cancel').hidden=$('center').hidden=false;$('status').textContent='点击新的位置后保存，或取消。';};
  editButton.onclick=()=>{
    if(busy||editTarget||uncertain)return;
    if(!selected?.owned){$('status').textContent='请先打开“我的便签”，选中要编辑的便签。';return;}
    if(!['pending','approved'].includes(selected.status)){$('status').textContent='这张便签已被撤下或未通过审核，可以删除，但不能直接修改后恢复。';return;}
    if(!Number.isInteger(selected.revision)){$('status').textContent='编辑功能需要先完成云端 008 升级，再刷新此页。';return;}
    stopPlacement();editTarget={...selected};draftBackup=fields();fillFields({body:selected.text,nickname:selected.rawNick||'',color:selected.color,shape:selected.shape});
    heading.textContent=`编辑便签 #${selected.remoteId}`;submitButton.textContent='保存修改并送审';cancelEdit.hidden=editHelp.hidden=false;controls();
    removeHome=document.createComment('remove-home');$('remove').before(removeHome);form.append($('remove'));
    editorDialog.append(form);editorDialog.showModal();
    $('status').textContent='修改后重新待审核；优先保留原位置，内容变长时自动调整大小并避让。';text.focus({preventScroll:true});
  };
  cancelEdit.onclick=()=>{if(busy)return;endEdit();$('status').textContent='已退出编辑。若刚才保存时出现网络错误，请刷新“我的便签”确认结果。';};
  editorDialog.addEventListener('cancel',e=>{e.preventDefault();if(!busy)cancelEdit.click();});
  async function saveEdit(){
    if(busy||!editTarget)return;const target=editTarget,draft=fields();busy=true;controls();$('status').textContent='正在保存修改…';
    let ok=false;
    try{const {getCloudClient}=await import('./cloud-preview.mjs?v=dd5b8227f5b3e07a8da6');await (await getCloudClient()).edit(target.remoteId,target.revision,draft);ok=true;}
    catch(e){$('status').textContent=({STALE_NOTE:'便签已有更新。请复制保留你的修改，再取消编辑、刷新“我的便签”后重试。',NOT_OWNED:'便签已删除或不属于当前访客，修改未保存。',EDIT_NOT_ALLOWED:'便签已被撤下，不能继续编辑。'})[e.message]||errorText(e);}
    finally{busy=false;controls();}
    if(ok){endEdit();const loaded=await load(true,true);const saved=[...notes.values()].find(n=>n.remoteId===target.remoteId);if(saved){select(saved);goTo(saved.x+saved.width/2,saved.y+saved.height/2);}const shifted=saved&&(saved.x!==target.x||saved.y!==target.y);$('status').textContent=loaded?'修改已保存，请查看最新审核状态。'+(shifted?'尺寸变化，已自动移到附近空位。':''):'修改已保存，但读取失败，请刷新“我的便签”核对。';}
  }
  $('remove').onclick=async()=>{
    const target=editTarget||selected;if(busy||!target?.owned)return;
    if(!window.confirm(translate('删除这张便签？删除后将不再展示。')))return;
    stopPlacement();busy=true;controls();
    try{const {getCloudClient}=await import('./cloud-preview.mjs?v=dd5b8227f5b3e07a8da6');if(!await (await getCloudClient()).remove(target.remoteId))throw Error('NOT_OWNED');notes.delete(target.id);target.el.remove();select(null);if(editTarget)endEdit();$('status').textContent='便签已删除，占位已释放。';}
    catch{$('status').textContent='删除结果未确认，请刷新“我的便签”核对。';}
    finally{busy=false;controls();}
  };
  all.onclick=()=>load(true,false);mine.onclick=()=>load(true,true);more.onclick=()=>load(false);
  viewport.addEventListener('dblclick',e=>{
    if(busy||editTarget||uncertain||cloudDraft||moveTarget)return;
    const el=e.target.closest('.note'),note=el&&notes.get(Number(el.dataset.id));
    if(!note?.owned)return;
    e.preventDefault();select(note);editButton.click();
  });
  installNoteDrag({viewport,canStart:()=>occupancyReady&&!busy&&!editTarget&&!cloudDraft&&!moveTarget&&!uncertain,
    findNote:el=>notes.get(Number(el.dataset.id)),select,view:()=>({scale}),position,
    tap:note=>{if(window.innerWidth<=850&&scale<.8)goTo(note.x+note.width/2,note.y+note.height/2);},
    lock:value=>{busy=value;controls();},preview:markCollision,status:message=>{$('status').textContent=message;},
    commit:(note,destination,rollback)=>{moveTarget=note;sendAt(tx+(destination.x+note.width/2)*scale,ty+(destination.y+note.height/2)*scale,rollback);}
  });
  viewport.addEventListener('pointerdown',e=>{if(e.button!==0)return;if(busy||editTarget){e.stopImmediatePropagation();return;}if(cloudDraft||moveTarget){const rect=viewport.getBoundingClientRect();e.stopImmediatePropagation();sendAt(e.clientX-rect.left-viewport.clientLeft,e.clientY-rect.top-viewport.clientTop);return;}const el=e.target.closest('.note');if(el){const note=notes.get(Number(el.dataset.id));select(note);if(window.innerWidth<=850&&scale<.8)goTo(note.x+note.width/2,note.y+note.height/2);e.stopImmediatePropagation();}},true);
  viewport.addEventListener('keydown',e=>{if(selected&&e.key.startsWith('Arrow')){e.preventDefault();e.stopImmediatePropagation();}},true);
  document.addEventListener('keydown',e=>{
    if(e.key!=='Delete'||e.repeat||e.ctrlKey||e.altKey||e.metaKey||e.shiftKey||busy||editTarget||cloudDraft||moveTarget||!selected?.owned)return;
    if(e.target.closest('input,textarea,select,dialog,[contenteditable]:not([contenteditable="false"])'))return;
    e.preventDefault();$('remove').click();
  });
  viewport.addEventListener('keydown',e=>{if(e.key==='Escape')stopPlacement();},true);
  viewport.previousElementSibling.textContent='虚线框表示待审核占位，不展示正文和名字。位置冲突时自动就近避让；长留言可在便签内滚动。';
  load(true);
}
installWallSkin();

installWallI18n();
