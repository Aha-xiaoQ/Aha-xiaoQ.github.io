/** Optional handbook and local feedback copy. No polling, simulation writes or automatic popup. */
export function createAdventureHelp({document: doc, makeLifetime, getBindings, getContext,
  makeGuide, formatReport, keyLabel, padLabel, getMode, togglePause, resetInput, focusGame,
  storage, copyText}) {
  if (doc.getElementById('m06Help')) throw Error('Adventure help already mounted');
  const life = makeLifetime(), header = doc.querySelector('.app > header'), column = doc.querySelector('.play-column');
  if (!header || !column) throw Error('Adventure help host missing');
  const node = (tag, cls, text) => {const el = doc.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el;};
  const button = (text,id) => {const b=node('button','',text);b.type='button';if(id)b.id=id;return b;};
  const trigger=button('操作速查','m06HelpButton');trigger.className='m06-help-button';trigger.dataset.terraDisplay='';
  trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','m06Help');
  header.insertBefore(trigger, doc.getElementById('m05Focus') || header.querySelector('.offline'));
  const hint=node('aside','m06-first-steps');hint.setAttribute('aria-label','首次游玩提示');hint.dataset.terraDisplay='';
  const hintCopy=node('div','');hintCopy.append(node('strong','','第一次来到这里？'),node('p','','先看看移动、工具与地下入口的操作。也可以直接开始。'));
  const hintActions=node('div','m06-hint-actions'),learn=button('了解操作'),dismiss=button('不再提示','m06DismissHelp');
  hintActions.append(learn,dismiss);hint.append(hintCopy,hintActions);column.append(hint);
  const hintKey='marioMix.help.v1';try{hint.hidden=storage?.getItem(hintKey)==='dismissed';}catch{/* Current visit remains usable. */}
  const dialog=node('dialog','m06-help');dialog.id='m06Help';dialog.setAttribute('aria-labelledby','m06HelpTitle');
  const head=node('header','');const title=node('h2','','操作说明');title.id='m06HelpTitle';title.tabIndex=-1;
  const closeButton=button('关闭说明','m06HelpClose');head.append(title,closeButton);dialog.append(head);
  const intro=node('p','m06-help-intro');dialog.append(intro);
  const choices=node('div','m06-device');choices.setAttribute('role','group');choices.setAttribute('aria-label','操作提示类型');
  const keyboard=button('键盘与鼠标'),gamepad=button('手柄');keyboard.dataset.guideDevice='keyboard';gamepad.dataset.guideDevice='gamepad';choices.append(keyboard,gamepad);dialog.append(choices);
  const cards=node('div','m06-help-grid');dialog.append(cards);
  const notice=node('p','m06-help-note','需要改键时，请关闭手册并打开“按键设置”。显示偏好可以调整菜单文字和对比度。');dialog.append(notice);
  const feedback=node('details','m06-feedback');feedback.append(node('summary','','遇到问题？复制反馈信息'));
  const report=node('textarea','');report.id='m06FeedbackText';report.readOnly=true;report.rows=9;report.setAttribute('aria-label','可复制的问题反馈模板');
  const copy=button('复制反馈信息','m06CopyFeedback'),copyStatus=node('p','m06-copy-status');copyStatus.setAttribute('role','status');
  feedback.append(node('p','','复制后补充复现步骤，再发到项目反馈区。这里不会自动发送任何数据。'),report,copy,copyStatus);dialog.append(feedback);doc.body.append(dialog);
  let opened=false,ownsPause=false,opener=null,device='keyboard',generation=0,disposed=false;
  function refresh(){
    const context=getContext();
    intro.textContent=context.character+' · '+(context.terra?'以下提示使用当前绑定。':'以下为该角色的默认操作。');
    for(const b of [keyboard,gamepad])b.setAttribute('aria-pressed',String(b.dataset.guideDevice===device));
    cards.replaceChildren();
    for(const row of makeGuide({bindings:getBindings(),hero:context.hero,device,keyLabel,padLabel})){
      const card=node('section','m06-help-card');const heading=node('h3','',row.title),keys=node('p','m06-keys',row.keys);
      card.append(heading,keys,node('p','',row.text));cards.append(card);
    }
    report.value=formatReport(context);copyStatus.textContent='';
  }
  function close({resume=true,restoreFocus=true}={}){
    if(!opened)return false;opened=false;generation++;
    const resumePlay=resume&&ownsPause&&!doc.hidden&&getMode()==='paused';ownsPause=false;
    if(dialog.open)dialog.close();resetInput();if(resumePlay)togglePause();
    if(restoreFocus){if(resumePlay)focusGame();else if(opener?.isConnected)opener.focus({preventScroll:true});}
    return true;
  }
  function open(){
    if(opened||disposed||doc.querySelector('dialog[open]'))return false;
    opener=doc.activeElement;ownsPause=getMode()==='playing';if(ownsPause)togglePause();resetInput();
    try{device=getContext().device==='gamepad'?'gamepad':'keyboard';refresh();const host=doc.fullscreenElement||doc.body;if(dialog.parentElement!==host)host.append(dialog);dialog.showModal();opened=true;generation++;title.focus({preventScroll:true});return true;}
    catch(error){if(dialog.open)dialog.close();if(ownsPause&&getMode()==='paused')togglePause();ownsPause=false;throw error;}
  }
  life.listen(trigger,'click',open);life.listen(learn,'click',open);life.listen(closeButton,'click',()=>close());
  life.listen(dismiss,'click',()=>{hint.hidden=true;try{storage?.setItem(hintKey,'dismissed');}catch{}focusGame();});
  for(const b of [keyboard,gamepad])life.listen(b,'click',()=>{device=b.dataset.guideDevice;refresh();});
  life.listen(dialog,'cancel',e=>{e.preventDefault();close();});
  life.listen(dialog,'close',()=>{if(!dialog.open)close();});
  life.listen(copy,'click',async()=>{
    const serial=generation;let ok=false;
    try{if(copyText){await copyText(report.value);ok=true;}}catch{}
    if(!opened||serial!==generation)return;
    copyStatus.textContent=ok?'已复制，补充复现步骤后即可反馈。':'剪贴板不可用，请选择并复制下方文字。';
    if(!ok){report.focus();report.select();}
  });
  function handleKey(e){
    if(!opened||!['keydown','keyup'].includes(e.type))return false;
    // Let native Tab traversal and copy/select shortcuts work inside the modal.
    if(e.code==='Tab'||e.ctrlKey||e.metaKey||e.altKey){e.stopImmediatePropagation();return false;}
    if(e.type==='keydown'&&!e.repeat){
      if(e.code==='Escape')close();
      else if(['Enter','Space'].includes(e.code)){
        const el=e.target?.closest?.('#m06Help button,#m06Help summary');
        if(el?.tagName==='SUMMARY')el.parentElement.open=!el.parentElement.open;else el?.click();
      }
    }
    return true;
  }
  function suspend(){close({resume:false,restoreFocus:false});resetInput();}
  function dispose(){if(disposed)return;disposed=true;suspend();life.dispose();dialog.remove();trigger.remove();hint.remove();}
  return Object.freeze({open,close,refresh,handleKey,suspend,dispose,snapshot:()=>({open:opened,ownsPause,device,hintHidden:hint.hidden,disposed})});
}
