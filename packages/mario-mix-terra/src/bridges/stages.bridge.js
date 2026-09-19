// M03 single reviewed host adapter. Content packs never monkey-patch legacy functions.
// Legacy Terra remains a sealed scene. The platform driver is a contract prototype,
// not a claim that every previous hero now works on arbitrary original Mario maps.
(()=>{
 const catalog=__terraModules.createStageCatalog(__terraExtensionPack);
 const legacy={update:fixedUpdate,draw,pause:togglePause,start:startGame,characters:showCharacters,primary:handlePrimary,select:selectHero,music:desiredMusic};
 const lifetime=()=>__terraModules.createLifetime({scheduleInterval:(f,n)=>setInterval(f,n),cancelInterval:i=>clearInterval(i)});
 const appScope=lifetime(),codes=new Set();let pauseHeld=false,uiSaved=null;
 const fallbackBindings=__terraModules.createBindingsModel({definitions:__terraModules.createActionDefinitions(),assignMount:__terraModules.assignMountBinding});
 const audioPolicy=__terraModules.createStageAudioPolicy({hasKey:k=>AUDIO_MANIFEST.some(a=>a.key===k),playEffect:k=>oneShot(k),stopAll:()=>resetGameAudio()});
 const motor=__terraModules.createPlatformMotor();
 const host=__terraModules.createStageSession({catalog,makeLifetime:lifetime,drivers:{'platform-v1':({plan,emit})=>__terraModules.createPlatformStage({plan,motor,emit})},onEvent:e=>{if(e.type==='sound')audioPolicy.effect(e.event);if(e.type==='complete'){mode='win';codes.clear();audioPolicy.finish();stopMusic(true);}}});
 const snapshotIds=['heroHelp','heroStatus','actionLabel','downLabel','stateLabel','distanceLabel','livesLabel','bestLabel'];
 function saveUI(){if(uiSaved)return;uiSaved=snapshotIds.map(id=>({el:$(id),html:$(id)?.innerHTML}));
   const copy=[['.panel > h2','同一张底图。<br>独立接入角色。'],['.panel > p.intro:first-of-type','关卡开发试验场：验证角色能力、适配路线、房间往返和检查点。几何素材与原型移动器仅供接口开发。'],['.panel .tip','<strong>怎样验证</strong><br>选择两个角色分别跳跃；靠近蓝框按交互进入奖励房。返回后拾取记录保留。'],['.screen-top span:first-child','M04 / STAGE CONTRACT LAB'],['.tagline span:first-child','仅为接入原型 · 非正式 1-4'],['header .brand small','MARIO MIX / DEVELOPER STAGE'],['header .offline','开发样例 · 待实机验收']];
   for(const [selector,html]of copy){const el=document.querySelector(selector);if(el){uiSaved.push({el,html:el.innerHTML});el.innerHTML=html;}}
   if($('relayMessage')){uiSaved.push({el:$('relayMessage'),html:$('relayMessage').innerHTML});$('relayMessage').textContent='底图不变；角色适配层只增加路线，不覆盖原碰撞。';}
 }

 function restoreUI(){for(const q of uiSaved||[])if(q.el)q.el.innerHTML=q.html;uiSaved=null;}
 function sync(){const v=host.view(),s=v.scene;if(!s)return;mode=v.status==='paused'?'paused':v.status==='complete'?'win':'playing';$('heroHelp').textContent='关卡框架验证 · 几何预览，不是正式 1-4。移动、跳跃、攻击沿用按键设置；交互进入蓝色传送门，C 返回角色页。';$('actionLabel').textContent='攻击 / 主动作';$('downLabel').textContent='下穿平台 / 门边按交互';$('heroStatus').textContent=s.title+' / '+s.character.title;$('stateLabel').textContent=v.status==='complete'?'样例结束（R 重试）':v.status==='paused'?'已暂停':'开发样例 · '+s.roomId;$('livesLabel').textContent='HP '+s.health+' / ×'+s.lives;$('distanceLabel').textContent='SCORE '+s.score;$('bestLabel').textContent='COIN '+s.coins;$('progressFill').style.width=Math.min(100,(s.p.x/(s.width-32))*100)+'%';$('pauseButton').textContent=v.status==='paused'?'继续 P':'暂停 P';}
 function clearInput(){codes.clear();keys.clear();touch.clear();pauseHeld=false;}
 function leave(){if(host.active()){host.stop();audioPolicy.exit();restoreUI();clearInput();}}
 function launch(stageId,characterId,allowDraft=false){
   const plan=catalog.plan(stageId,characterId,{allowDraft}); // Preflight BEFORE destructive transition.
   if(plan.stage.driver==='legacy-terra-v1'){leave();legacy.characters();legacy.select('sandboxTrio');legacy.start();return;}
   leave();legacy.characters();legacy.select('mario');saveUI();audioInit();audioPolicy.enter(plan.audio);
   try{host.start(stageId,characterId,{allowDraft});}catch(e){audioPolicy.exit();restoreUI();throw e;}
   canvas.width=W;canvas.height=H;canvas.focus({preventScroll:true});$('heroPicker').hidden=true;$('overlay').classList.remove('choosing');hideOverlay();clearInput();sync();
 }
 fixedUpdate=function(){if(!host.active())return legacy.update();
   if(t17Early.helpOpen?.()){clearInput();sync();return;}
   let pad=null;try{pad=Array.from(navigator.getGamepads?.()||[]).find(p=>p&&p.connected!==false);}catch{}
   const bindings=window.TerraBindingsPort?.config()||fallbackBindings.config(.28);
   const input=__terraModules.readStageActions({codes,pad,bindings,normalizeStick:__terraModules.normalizeStick});
   // Existing touch controls remain in the main shell.
   const tv=[...touch.values()];input.x=Math.max(-1,Math.min(1,input.x+(tv.includes('right')?1:0)-(tv.includes('left')?1:0)));input.jump||=tv.includes('jump');input.attack||=tv.includes('run');input.down||=tv.includes('down');input.interact||=input.down;
   if(input.pause&&!pauseHeld)togglePause();pauseHeld=input.pause;
   host.step(input);sync();audioSync();
 };
 draw=function(){if(!host.active())return legacy.draw();__terraModules.drawStageView(ctx,host.view());};
 desiredMusic=function(){return host.active()?audioPolicy.music():legacy.music();};
 togglePause=function(){if(!host.active())return legacy.pause();if(host.view().status==='running'){host.pause();audioPolicy.pause();}else if(host.view().status==='paused'){host.resume();audioPolicy.resume();}clearInput();sync();draw();};
 showCharacters=function(){leave();return legacy.characters();};
 startGame=function(){if(!host.active())return legacy.start();const v=host.view();launch(v.stageId,v.characterId,true);};
 handlePrimary=function(){if(!host.active())return legacy.primary();if(host.view().status==='paused')togglePause();else startGame();};
 const button=document.createElement('button');button.className='secondary';button.type='button';button.id='terraStageLauncherButton';button.textContent='开发工具 · 关卡试验场';button.hidden=!(new URLSearchParams(location.search).get('dev')==='1'||new URLSearchParams(location.search).has('test')||document.documentElement.dataset.test==='1');$('charactersButton').after(button);
 const box=document.createElement('dialog');box.id='terraStageLauncher';box.setAttribute('aria-labelledby','terraStageLauncherTitle');box.innerHTML='<h2 id="terraStageLauncherTitle">关卡与角色接入</h2><p>这里验证地图、角色和适配层的组合。样例不是正式 1-4，第三期继续使用原行为。</p><label>关卡 <select id="terraStageSelect"></select></label><label>角色 <select id="terraCharacterSelect"></select></label><label><input id="terraStageDrafts" type="checkbox"> 显示开发草稿</label><p id="terraStageNote" role="status"></p><div class="buttons"><button id="terraStageGo" type="button">进入</button><button id="terraStageClose" type="button">返回</button></div>';
 document.body.append(box);const style=document.createElement('style');style.textContent='#terraStageLauncher{max-width:560px;width:calc(100% - 32px);max-height:80vh;overflow:auto;background:#161d25;color:#f7f5ed;border:2px solid #e4b866;padding:24px;font:inherit}#terraStageLauncher::backdrop{background:#000a}#terraStageLauncher h2{margin:0 0 16px}#terraStageLauncher p{line-height:1.7}#terraStageLauncher label{display:block;margin:16px 0}#terraStageLauncher select{max-width:100%;width:100%;padding:8px;font:inherit}#terraStageLauncher button{padding:10px 16px;font:inherit}';document.head.append(style);
 const select=$('terraStageSelect'),charSelect=$('terraCharacterSelect'),drafts=$('terraStageDrafts');let resumeOwner=false;
 function populate(){const stageBefore=select.value;select.replaceChildren();for(const s of catalog.list().filter(s=>s.status!=='draft'||drafts.checked)){const o=document.createElement('option');o.value=s.id;o.textContent=s.title;select.append(o);}if([...select.options].some(o=>o.value===stageBefore))select.value=stageBefore;populateCharacters();}
 function populateCharacters(){charSelect.replaceChildren();const s=catalog.list().find(s=>s.id===select.value);for(const id of s?.characters||[]){const c=catalog.characters().find(c=>c.id===id),o=document.createElement('option');o.value=id;o.textContent=c.title;charSelect.append(o);}$('terraStageNote').textContent=s?.note||'尚无关卡';}
 function close({resume=true}={}){if(box.open)box.close();if(resume&&resumeOwner&&mode==='paused')togglePause();resumeOwner=false;canvas.focus({preventScroll:true});}
 appScope.listen(button,'click',()=>{resumeOwner=mode==='playing';if(resumeOwner)togglePause();populate();box.showModal();});
 appScope.listen(select,'change',populateCharacters);appScope.listen(drafts,'change',populate);appScope.listen($('terraStageClose'),'click',()=>close());appScope.listen(box,'cancel',e=>{e.preventDefault();close();});
 appScope.listen($('terraStageGo'),'click',()=>{try{launch(select.value,charSelect.value,drafts.checked);close({resume:false});}catch(e){$('terraStageNote').textContent=e.message;}});
 const onKey=e=>{
  if(!host.active()&&!box.open)return;
  if(box.open){e.stopImmediatePropagation();if(e.code==='Escape'){e.preventDefault();close();}return;} // Keep native control defaults; never leak dialog keys to legacy gameplay.
  if(window.TerraBindingsPort?.isOpen()){if(window.TerraBindingsPort.captureKeyboard(e)){e.preventDefault();e.stopImmediatePropagation();}return;}
  if(e.target?.closest?.('input,textarea,select,[contenteditable]')||e.code==='Tab')return;
  const mappedKeys=new Set(Object.values((window.TerraBindingsPort?.config()||fallbackBindings.config(.28)).actions).flatMap(a=>a.keys));if(!mappedKeys.has(e.code)&&!['KeyC','KeyR','Escape','Enter'].includes(e.code))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(e.type==='keyup'){codes.delete(e.code);return;}if(e.repeat)return;
  if(e.code==='KeyC'){showCharacters();return;}if(e.code==='KeyR'){startGame();return;}if(e.code==='Escape'||e.code==='KeyP'){togglePause();return;}if(e.code==='Enter'&&host.view().status==='complete'){startGame();return;}codes.add(e.code);audioInit();
 };
 // Reuse the baseline's FIRST capture owner instead of racing previously registered handlers.
 const priorEarly=t17Early.handle;
 const stageEarly=e=>{if(t17Early.presentation?.(e))return true;if((e.type==='keydown'||e.type==='keyup')&&(box.open||host.active())){onKey(e);return false;}return priorEarly?.(e);};
 t17Early.handle=stageEarly;
 appScope.defer(()=>{if(t17Early.handle===stageEarly)t17Early.handle=priorEarly;});
 appScope.listen(window,'blur',()=>{if(host.active()){clearInput();if(mode==='playing')togglePause();}});
 appScope.listen(window,'pagehide',e=>{if(e.persisted){clearInput();if(host.active()&&mode==='playing')togglePause();}else{leave();appScope.dispose();}});
 if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test'))window.__terraStageTest={catalog:()=>catalog.source(),launch,step:(n,input={})=>{for(let i=0;i<n;i++)host.step(input);sync();draw();return host.view();},view:()=>host.view(),pause:()=>togglePause(),leave:()=>showCharacters()};
})();
