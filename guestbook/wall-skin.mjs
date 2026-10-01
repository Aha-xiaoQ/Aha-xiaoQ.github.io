export function installWallSkin(){
  const header=document.querySelector('header'),form=document.querySelector('#composer'),viewport=document.querySelector('#viewport');
  const title=document.createElement('div');title.className='wall-heading';
  const eyebrow=document.createElement('span');eyebrow.className='wall-eyebrow';eyebrow.textContent='WORDS LEFT HERE';
  title.append(eyebrow,header.querySelector('h1'),header.querySelector('p'));header.append(title);
  const write=document.createElement('a');write.href='#composer';write.className='write-link';write.textContent='＋ 留一句话';
  write.onclick=e=>{e.preventDefault();form.scrollIntoView({block:'start'});document.querySelector('#message').focus({preventScroll:true});};header.append(write);
  header.querySelector('p').textContent=true?'把此刻的心情，留在这里。':'本地试贴 · 刷新后清空';
  const toolbar=document.querySelector('.toolbar'),actions=document.createElement('div');actions.className='note-actions';actions.setAttribute('aria-label','便签操作');
  for(const b of [...toolbar.querySelectorAll('button')]){
    if(['编辑我的便签','调整我的便签位置','删除选中便签'].includes(b.textContent))actions.append(b);
    if(['公开便签','我的便签'].includes(b.textContent))b.classList.add('scope-button');
  }
  const toolDetails=document.createElement('details');toolDetails.className='note-tools';const toolTitle=document.createElement('summary');toolTitle.textContent='便签操作';toolDetails.append(toolTitle,actions);toolbar.append(toolDetails);
  const actionHint=document.createElement('p');actionHint.className='action-hint';actionHint.setAttribute('role','status');actions.after(actionHint);
  const status=document.querySelector('#status');
  new window.MutationObserver(()=>{actionHint.textContent=/请先打开|请在“我的便签”|不能直接修改|008 升级|Open My notes|Select the note you want to move|editing cannot restore|Editing is temporarily unavailable/.test(status.textContent)?status.textContent:'';}).observe(status,{childList:true,characterData:true,subtree:true});
  viewport.previousElementSibling.textContent='我的便签：单击选中 · 双击编辑 · 拖动后松手保存 · Delete 删除。长文可拖纸边；虚线位置正在等审核。';
  const empty=document.createElement('div');empty.className='wall-empty';
  const caption=document.createElement('strong');caption.textContent='这一角，等你留句话';
  const help=document.createElement('span');help.textContent='一句问候、一点灵感，或今天的小小心情。';empty.append(caption,help);viewport.append(empty);
  const sync=()=>{empty.hidden=!!document.querySelector('.note')||viewport.classList.contains('placing');};
  new window.MutationObserver(sync).observe(document.querySelector('#world'),{childList:true});
  new window.MutationObserver(sync).observe(viewport,{attributes:true,attributeFilter:['class']});sync();
}
