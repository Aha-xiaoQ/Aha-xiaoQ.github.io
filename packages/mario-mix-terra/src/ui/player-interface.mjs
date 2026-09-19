/** One player-facing UI coordinator. It reads snapshots and calls explicit actions.
 * No physics, inventory or game-loop ownership. No MutationObserver or frame timer.
 */
export function createPlayerInterface({document:doc,makeLifetime,readContext,makeCopy,
  resetInput,focusGame,getMode,togglePause,restart,chooseCharacters,openHelp,openBindings,
  getBindings,keyLabel,padLabel,resetBindings,hideHud=()=>{},capturePending=()=>false,readPad=()=>null}) {
  if(doc.getElementById('m07Options'))throw Error('Player interface already mounted');
  const life=makeLifetime(),win=doc.defaultView,body=doc.body,header=doc.querySelector('.app > header');
  const panel=doc.querySelector('.panel'),overlay=doc.getElementById('overlay'),game=doc.getElementById('game');
  const node=(tag,cls,text)=>{const el=doc.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el;};
  const button=(text,id)=>{const el=node('button','secondary',text);el.type='button';if(id)el.id=id;el.dataset.terraDisplay='';return el;};
  const text=(el,value)=>{if(el&&el.textContent!==String(value))el.textContent=value;};
  const setHidden=(el,hidden)=>{if(el&&el.hidden!==hidden)el.hidden=hidden;};
  const get=id=>doc.getElementById(id);
  // Keep the real optional-media warning reachable, not mixed with combat objectives.

  body.dataset.terraUi='m07';
  const options= node('dialog','m07-dialog');options.id='m07Options';options.setAttribute('aria-labelledby','m07OptionsTitle');
  const oh=node('header',''),ot=node('h2','','游戏设置'),oc=button('完成','m07OptionsClose');ot.id='m07OptionsTitle';ot.tabIndex=-1;oh.append(ot,oc);options.append(oh);
  const keysButton=button('修改按键','m07OptionsBindings');options.append(keysButton);
  const optionsIntro=node('p','m07-muted','调整显示与音量。打开设置时，正在进行的游戏会暂停。');options.append(optionsIntro);
  const display=get('m05Display'),audio=get('t20Audio');
  if(display){display.open=true;options.append(display);}
  if(audio){audio.open=true;options.append(audio);audio.append(node('p','m07-audio-help','调整音乐与音效的音量。部分音轨需联网加载；声音未响时，可重新检查音频。'));}
  const advanced=node('details','m07-advanced');advanced.append(node('summary','','资源加载详情'));
  for(const id of ['audioStatus','r06Media','t21AssetStatus']){const el=get(id);if(el)advanced.append(el);}
  if(advanced.children.length>1)options.append(advanced);
  doc.body.append(options);
  const optionsTrigger=button('设置','m07OptionsButton');optionsTrigger.setAttribute('aria-haspopup','dialog');optionsTrigger.setAttribute('aria-controls',options.id);
  header.insertBefore(optionsTrigger,get('m05Focus'));
  const binds=get('t21BindingButton');if(binds){header.insertBefore(binds,optionsTrigger);binds.classList.add('m07-binding-trigger');binds.dataset.terraDisplay='';}
  const help=get('m06HelpButton');if(help)text(help,'操作');
  const actionbar=node('div','m07-actions');actionbar.setAttribute('aria-label','游戏操作');
  for(const id of ['pauseButton','fullButton','restartButton','charactersButton'])if(get(id)){get(id).dataset.terraDisplay='';actionbar.append(get(id));}
  doc.querySelector('.screen-shell').after(actionbar);
  const sound=get('soundButton');if(sound)audio?.append(sound);
  // Leave inherited hosts in place for their existing handlers, but remove obsolete visible text.
  const oldControls=panel.querySelector('.buttons');if(oldControls)oldControls.hidden=true;
  const oldHelp=get('t15Help');if(oldHelp){oldHelp.hidden=true;oldHelp.dataset.m07Legacy='';}
  const legacyMedia=get('r06Media');if(legacyMedia){const desc=legacyMedia.querySelector('p');if(desc)desc.textContent='音乐随场景切换。网络不可用时可保持静音，或选择本地音频。';}
  const oldStatus=panel.querySelector('.m06-journey');if(oldStatus)oldStatus.hidden=true;
  const first=doc.querySelector('.m06-first-steps');if(first)first.hidden=true;
  const abilities=node('div','m07-abilities');for(const id of ['r06Mount','r06Heal'])if(get(id)){get(id).dataset.terraDisplay='';abilities.append(get(id));}panel.append(abilities);
  const recent=node('details','m07-recent');recent.id='m07Recent';recent.append(node('summary','','最近提示'));
  const history=node('ol','');recent.append(history);panel.append(recent);
  const guide=node('section','m07-context');guide.setAttribute('aria-label','当前操作提示');
  const guideTitle=node('strong','','操作提示'),guideBody=node('p','');guide.append(guideTitle,guideBody);panel.insertBefore(guide,recent);
  const note=node('section','m07-notice');note.id='m07Pickup';note.hidden=true;note.setAttribute('role','status');note.setAttribute('aria-live','polite');note.setAttribute('aria-atomic','true');
  const noticeTitle=node('strong',''),noticeBody=node('p','');note.append(noticeTitle,noticeBody);actionbar.after(note);
  const toast=get('toast');if(toast){toast.classList.add('m07-toast');toast.setAttribute('aria-live','polite');}
  const choiceLabel=node('p','m07-selection');choiceLabel.id='m07Selection';get('overlayTitle').after(choiceLabel);
  const aux=node('div','m07-overlay-aux');
  const menuHelp=button('操作说明','m07MenuHelp'),menuOptions=button('游戏设置','m07MenuOptions');aux.append(menuHelp,menuOptions);get('overlayHint').after(aux);
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-labelledby','overlayTitle');overlay.setAttribute('aria-describedby','overlayText');overlay.setAttribute('aria-modal','true');
  if(get('t13ChestPanel'))get('t13ChestPanel').setAttribute('aria-labelledby','t13ChestTitle');
  const confirm=node('dialog','m07-dialog m07-confirm');confirm.id='m07Confirm';confirm.setAttribute('aria-labelledby','m07ConfirmTitle');
  const ct=node('h2','','确认操作');ct.id='m07ConfirmTitle';const cb=node('p','');cb.id='m07ConfirmDescription';confirm.setAttribute('aria-describedby',cb.id);
  const ca=node('div','m07-confirm-actions'),cancel=button('取消','m07ConfirmCancel'),accept=button('确认','m07ConfirmAccept');ca.append(cancel,accept);confirm.append(ct,cb,ca);doc.body.append(confirm);
  let disposed=false,optionsOwns=false,optionsOpener=null,confirmAction=null,confirmOwns=false,confirmOpener=null;
  let lastMode=null,lastPickup=null,toastTimer=0,menuPadKey='',previousPad=[],lastAxis=0,historyRows=[];
  const inertTargets=[header,panel,doc.querySelector('.footer'),...doc.querySelectorAll('.source-note'),actionbar,doc.querySelector('.touchbar'),get('m07CompactHud'),game];
  const originalInert=new Map(inertTargets.filter(Boolean).map(el=>[el,el.inert]));
  function log(title,detail=''){
    const value=[title,detail].filter(Boolean).join(' · ');if(historyRows[0]===value)return;
    historyRows.unshift(value);historyRows=historyRows.slice(0,8);history.replaceChildren(...historyRows.map(v=>node('li','',v)));
  }
  function notify(message){
    if(disposed)return;
    const s=String(message||'').trim();if(!s)return;
    log(s);if(!toast)return;win.clearTimeout(toastTimer);text(toast,s);toast.classList.add('show');
    toastTimer=win.setTimeout(()=>toast.classList.remove('show'),5000);
  }
  life.defer(()=>win.clearTimeout(toastTimer));
  function pickup(item){
    if(disposed)return;
    if(!item){note.hidden=true;lastPickup=null;return;}
    if(lastPickup===item)return;lastPickup=item;
    text(noticeTitle,'获得 '+item.name);text(noticeBody,item.effect||'');note.hidden=false;log('获得 '+item.name,item.effect||'');
  }
  function modalParent(el){const parent=doc.fullscreenElement||doc.body;if(el.parentElement!==parent)parent.append(el);}
  function showOptions(){
    if(disposed||options.open||confirm.open||doc.querySelector('dialog[open]'))return false;
    optionsOpener=doc.activeElement;optionsOwns=getMode()==='playing';if(optionsOwns)togglePause();resetInput();
    try{modalParent(options);options.showModal();ot.focus({preventScroll:true});return true;}
    catch(e){if(optionsOwns&&getMode()==='paused')togglePause();optionsOwns=false;throw e;}
  }
  function closeOptions({resume=true,focus=true}={}){
    if(!options.open&&!optionsOwns)return;const owned=optionsOwns;optionsOwns=false;if(options.open)options.close();resetInput();
    if(resume&&owned&&!doc.hidden&&getMode()==='paused'){togglePause();if(focus)focusGame();}
    else if(focus&&optionsOpener?.isConnected)optionsOpener.focus({preventScroll:true});
  }
  function requestConfirm(kind){
    if(disposed||confirm.open||capturePending())return false;
    const config={restart:['重新开始本关？','将重新开始当前挑战；当前场景中未保留的进度会重置。','重新开始',restart],characters:['切换角色？','将结束当前挑战并返回角色选择。','返回角色选择',chooseCharacters],bindings:['恢复默认按键？','将替换当前自定义键位。需要保留时，请先导出配置。','恢复默认',resetBindings]}[kind];
    if(!config)return false;
    confirmOpener=doc.activeElement;confirmOwns=getMode()==='playing';if(confirmOwns)togglePause();resetInput();confirmAction=config[3];text(ct,config[0]);text(cb,config[1]);text(accept,config[2]);
    try{modalParent(confirm);confirm.showModal();cancel.focus({preventScroll:true});return true;}catch(e){confirmAction=null;if(confirmOwns&&getMode()==='paused')togglePause();confirmOwns=false;throw e;}
  }
  function closeConfirm(approved=false,{resume=true,focus=true}={}){
    if(!confirm.open&&!confirmAction)return;const action=confirmAction,owned=confirmOwns;confirmAction=null;confirmOwns=false;
    if(confirm.open)confirm.close();resetInput();
    if(approved)action?.();
    else if(resume&&owned&&!doc.hidden&&getMode()==='paused')togglePause();
    refresh();if(focus){if(getMode()==='playing')focusGame();else if(confirmOpener?.isConnected)confirmOpener.focus({preventScroll:true});}
  }
  for(const el of [optionsTrigger,menuOptions])life.listen(el,'click',showOptions);
  life.listen(keysButton,'click',()=>{closeOptions();openBindings();});
  life.listen(oc,'click',()=>closeOptions());life.listen(options,'cancel',e=>{e.preventDefault();closeOptions();});life.listen(options,'close',()=>closeOptions());
  life.listen(menuHelp,'click',()=>openHelp());life.listen(cancel,'click',()=>closeConfirm());life.listen(accept,'click',()=>closeConfirm(true));
  life.listen(confirm,'cancel',e=>{e.preventDefault();closeConfirm();});life.listen(confirm,'close',()=>closeConfirm());
  for(const [id,kind] of [['restartButton','restart'],['charactersButton','characters'],['overlayCharacters','characters'],['t21BindReset','bindings']]){
    if(get(id))life.listen(get(id),'click',e=>{
      if(kind!=='bindings'&&getMode()==='menu')return;
      e.preventDefault();e.stopImmediatePropagation();requestConfirm(kind);
    },true);
  }
  function refresh(){
    if(disposed)return;
    const c=readContext(),v=makeCopy(c),mode=c.mode,activeOverlay=!overlay.classList.contains('hidden')&&!overlay.hidden;
    if(!v.terra||mode==='menu')hideHud();
    body.dataset.playerMode=mode;body.dataset.playerHero=c.hero||'';
    const modal=activeOverlay&&['menu','paused','win','gameover','respawn'].includes(mode);
    for(const [el,original]of originalInert)el.inert=modal||original;
    if(modal)overlay.setAttribute('aria-modal','true');else overlay.removeAttribute('aria-modal');
    text(header.querySelector('.offline'),`${v.selected.chapter} · ${v.selected.name}`);
    text(header.querySelector('.brand small'),'经典关卡 · 不同角色');
    const kicker=panel.querySelector('.kicker'),heading=panel.querySelector('h2'),intro=panel.querySelector('.intro:not([id])');
    text(kicker,'当前目标');text(heading,v.location);text(intro,v.objective);
    for(const el of [...doc.querySelectorAll('#t10Previous,#t15OldEpisodes')])el.hidden=true;
    text(get('charactersButton'),'切换角色');text(get('restartButton'),'重新开始');text(get('pauseButton'),mode==='paused'?'继续游戏':'暂停');text(get('fullButton'),doc.fullscreenElement?'退出全屏':'全屏');
    keysButton.hidden=!v.terra;
    if(binds){text(binds,'按键');binds.disabled=!v.terra;binds.title=v.terra?'修改泰拉瑞亚的键位':'按键修改适用于泰拉瑞亚；其他角色请查看操作说明';}
    text(get('stateLabel'),v.status);text(get('bestLabel'),'');text(get('heroStatus'),v.selected.name);text(get('relayMessage'),v.objective);
    for(const el of doc.querySelectorAll('#heroPicker [data-hero]')){
      const character=v.characters[el.dataset.hero];if(!character)continue;
      text(el.querySelector('strong'),character.name);text(el.querySelector('small'),character.ability);
      let badge=el.querySelector('.m07-chapter-badge');if(!badge){badge=node('span','m07-chapter-badge');el.prepend(badge);}text(badge,character.chapter);
      el.setAttribute('aria-label',`${character.name}，关卡 ${character.chapter}，${character.ability}`);
    }
    if(v.overlay&&activeOverlay){text(get('overlayTitle'),v.overlay.title);text(get('overlayText'),v.overlay.body);text(get('mainAction'),v.overlay.action);text(get('overlayLabel'),mode==='menu'?'混合马里奥':v.location);text(get('overlayHint'),v.overlay.hint);text(choiceLabel,`${v.selected.chapter} · ${v.selected.name}`);choiceLabel.hidden=mode!=='menu';}
    aux.hidden=!activeOverlay;
    if(oldHelp)oldHelp.hidden=true;if(oldStatus)oldStatus.hidden=true;if(first)first.hidden=true;
    if(get('t10Build'))get('t10Build').textContent='';
    const device=c.device==='gamepad'?'gamepad':'keyboard',binding=getBindings()?.actions||{};
    const key=id=>{const values=binding[id]?.[device==='gamepad'?'pad':'keys']||[];return values.length?String((device==='gamepad'?padLabel:keyLabel)(values[0])):'未绑定';};
    abilities.hidden=!v.terra||mode==='menu';text(get('r06Mount'),'坐骑 · '+key('mount'));text(get('r06Heal'),'治疗 · '+key('heal'));
    if(v.terra){
      const tool=c.toolName||['武器','木平台','铜斧','铜镐','火把','篝火'][c.tool||0];text(guideTitle,tool+' · '+key('attack'));
      text(guideBody,[device==='gamepad'?'手柄攻击会自动索敌。':'鼠标瞄准，使用当前武器。','选择落点后使用，消耗木材放置平台。','朝近处树木或木平台使用。','朝近处矿块使用；鼠标可以选格。','照亮前路；快速放置：'+key('torch')+'。','放在地面，靠近时获得恢复效果。'][c.tool||0]);
    }else{text(guideTitle,v.selected.ability);text(guideBody,v.selected.description);}
    const quick=doc.querySelector('.m05-quick-guide');if(quick){quick.hidden=mode==='menu';const signature=[c.hero,device,key('jump'),key('attack'),key('pause')].join('|');if(quick.dataset.signature!==signature){quick.dataset.signature=signature;quick.replaceChildren();const pairs=v.terra?[[key('jump'),'跳跃'],[key('attack'),'使用'],[key('pause'),'暂停']]:[['空格','跳跃'],['J','攻击'],['P','暂停']];if(c.hero==='tank')pairs[0]=['方向键','移动'];for(const [k,label]of pairs){const part=node('span','m05-quick-item');part.append(node('kbd','',k),node('span','',label));quick.append(part);}}}
    if(mode==='menu'){note.hidden=true;lastPickup=null;}
    if(mode!==lastMode){lastMode=mode;if(modal&&!doc.querySelector('dialog[open]')){
      const target=mode==='menu'?doc.querySelector('#heroPicker [aria-pressed=true]'):get('mainAction');target?.focus({preventScroll:true});
    }}
  }
  function activeModal(){if(confirm.open)return confirm;if(options.open)return options;const dialog=doc.querySelector('dialog[open]');if(dialog)return dialog;return !overlay.classList.contains('hidden')&&!overlay.hidden?overlay:null;}
  function focusables(root){return [...root.querySelectorAll('button:not([disabled]),summary,input:not([type=hidden]),select,textarea,a[href]')].filter(el=>!el.hidden&&el.getClientRects().length>0&&!el.closest('[hidden]'));}
  function handleKey(e){
    if(disposed||!['keydown','keyup'].includes(e.type))return false;
    const modal=activeModal();
    if(modal&&e.code==='Tab'){
      if(e.type==='keydown'){const items=focusables(modal),i=items.indexOf(doc.activeElement);if(items.length){const next=e.shiftKey?(i<=0?items.length-1:i-1):(i<0||i===items.length-1?0:i+1);items[next].focus({preventScroll:true});}}
      return true;
    }
    if(e.ctrlKey||e.metaKey||e.altKey)return false;
    if(confirm.open||options.open){
      if(e.type==='keydown'&&!e.repeat){if(e.code==='Escape'){if(confirm.open)closeConfirm();else closeOptions();}else if(['Enter','Space'].includes(e.code)){const el=e.target?.closest?.('button,summary');if(el?.tagName==='SUMMARY')el.parentElement.open=!el.parentElement.open;else el?.click();}else if(e.target?.tagName==='INPUT'&&e.target.type==='range'&&['ArrowLeft','ArrowRight','ArrowDown','ArrowUp'].includes(e.code)){const n=Number(e.target.step)||1;e.target.value=String(Number(e.target.value)+(['ArrowLeft','ArrowDown'].includes(e.code)?-n:n));e.target.dispatchEvent(new win.Event('input',{bubbles:true}));}}
      return true;
    }
    if(modal===overlay&&getMode()==='menu'&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)){
      if(e.type==='keydown'&&!e.repeat){const items=[...doc.querySelectorAll('#heroPicker button[data-hero]')],i=items.findIndex(b=>b.getAttribute('aria-pressed')==='true'),cols=win.getComputedStyle(get('heroPicker')).gridTemplateColumns.split(' ').length;const d={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols}[e.code],next=items[(i+d+items.length)%items.length];next?.click();next?.focus({preventScroll:true});}return true;
    }
    if(modal===overlay&&['Enter','Space'].includes(e.code)&&doc.activeElement?.closest('#heroPicker,.m07-overlay-aux')){if(e.type==='keydown'&&!e.repeat){if(e.code==='Enter'&&doc.activeElement.closest('#heroPicker'))get('mainAction').click();else doc.activeElement.click();}return true;}
    if(!(readContext().hero==='sandboxTrio'&&Object.values(getBindings()?.actions||{}).some(a=>a.keys?.includes(e.code)))&&!e.target?.closest?.('input,select,textarea,[contenteditable=true]')&&!doc.querySelector('dialog[open]')&&['playing','paused'].includes(getMode())&&['KeyR','KeyC'].includes(e.code)){
      if(e.type==='keydown'&&!e.repeat)requestConfirm(e.code==='KeyR'?'restart':'characters');return true;
    }
    return false;
  }
  function pollPad(){
    const modal=activeModal();if(!modal||capturePending()) {menuPadKey='';return false;}
    const pad=readPad(),values=Array.from(pad?.buttons||[],b=>!!b?.pressed||Number(b?.value)>.5),axis=Math.abs(Number(pad?.axes?.[1])||0)>.6?(Number(pad.axes[1])||0):(Number(pad?.axes?.[0])||0);
    if(menuPadKey!==modal.id){menuPadKey=modal.id;previousPad=values;lastAxis=axis;return true;}
    const edge=i=>values[i]&&!previousPad[i];
    const direction=edge(13)||edge(15)||axis>.6&&lastAxis<=.6?1:edge(12)||edge(14)||axis<-.6&&lastAxis>=-.6?-1:0;
    const confirmEdge=edge(0)||edge(9),cancelEdge=edge(1);previousPad=values;lastAxis=axis;
    if(direction){const items=focusables(modal),i=items.indexOf(doc.activeElement);const next=items[(i+direction+items.length)%items.length];if(modal===overlay&&next?.closest('#heroPicker'))next.click();next?.focus({preventScroll:true});}
    if(confirmEdge){const el=doc.activeElement?.closest('button,summary');if(modal===overlay&&el?.closest('#heroPicker'))get('mainAction').click();else if(el?.tagName==='SUMMARY')el.parentElement.open=!el.parentElement.open;else el?.click();}
    if(cancelEdge){if(modal===confirm)closeConfirm();else if(modal===options)closeOptions();else if(modal===overlay){if(getMode()==='paused')get('mainAction').click();}else modal.dispatchEvent(new win.Event('cancel',{cancelable:true}));}
    resetInput();return true;
  }
  function suspend(){closeConfirm(false,{resume:false,focus:false});closeOptions({resume:false,focus:false});resetInput();}
  function dispose(){if(disposed)return;suspend();disposed=true;life.dispose();for(const [el,original]of originalInert)el.inert=original;for(const el of [display,audio,...advanced.children].filter(el=>el?.id))panel.append(el);options.remove();confirm.remove();}
  refresh();
  return Object.freeze({refresh,notify,pickup,handleKey,pollPad,requestConfirm,showOptions,suspend,dispose,snapshot:()=>({disposed,optionsOpen:options.open,confirmOpen:confirm.open,history:[...historyRows],mode:lastMode})});
}
