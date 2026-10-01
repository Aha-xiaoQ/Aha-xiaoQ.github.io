// UI-only translation. Never walk visitor messages, names or search excerpts.
const dictionary = Object.fromEntries(`
小Q的便签墙|Xiao Q’s Note Wall
页面导航|Page navigation
← 返回关于|← About
＋ 留一句话|＋ Leave a note
把此刻的心情，留在这里。|Leave a little of your day here.
写一张便签|Write a note
昵称（可选）|Nickname (optional)
自定义纸色|Paper color
形状|Shape
奶黄|Butter yellow
天蓝|Sky blue
浅粉|Soft pink
方形|Square
圆形|Circle
心形|Heart
撕边长条|Torn edge
留言|Your message
留言审核后公开。请勿填写联系方式等隐私信息。|Notes appear after review. Please do not share contact details or private information.
留言需审核后公开|Notes appear after review.
选择粘贴位置|Choose a spot
互动便签墙|Interactive note wall
便签墙|Note wall
缩小|Zoom out
放大|Zoom in
查看整面墙|Fit wall
查看全部便签|Fit all notes
实际大小|Actual size
取消粘贴|Cancel placement
贴在视野中央|Place in center
回到中心|Center wall
最新便签|Latest note
留一点灵感在这里|Leave a little inspiration here
墙上还没有便签|No notes yet
删除选中便签|Delete selected note
移除选中便签|Remove selected note
查找已加载的便签|Find a loaded note
搜索正文或昵称|Search messages or nicknames
输入关键词|Enter a keyword
仅展示云端数据；“我的便签”依赖当前浏览器身份，清除网站数据后可能无法找回。|My notes are linked to this browser. Clearing site data may prevent you from managing them later.
没有匹配的便签。|No matching notes.
还没有便签，先写一张吧。|No notes yet. Be the first to leave one.
公开便签|Public notes
我的便签|My notes
加载更多|Load more
便签操作|Note actions
编辑我的便签|Edit my note
调整我的便签位置|Move my note
取消编辑|Cancel editing
重试同一次提交|Retry this submission
删除正在编辑的便签|Delete this note
保存修改并送审|Save for review
修改后重新待审核；优先保留原位置，内容变长时自动调整大小并避让。|Edits are reviewed again. We keep the position where possible and make room if the note grows.
我的便签：单击选中 · 双击编辑 · 拖动后松手保存 · Delete 删除。长文可拖纸边；虚线位置正在等审核。|Your notes: click to select · double-click to edit · drag and release to save · Delete to remove. Drag the paper edge for long notes. Dashed outlines are awaiting review.
这一角，等你留句话|A little space for your words
一句问候、一点灵感，或今天的小小心情。|A hello, a spark of inspiration, or a small moment from your day.
待审核|Awaiting review
位置已预留|Space reserved
已有便签|Reserved space
其他便签占位|Space reserved for another note
已公开|Published
未通过审核|Not approved
正在读取云端便签…|Loading notes…
云端读取失败，请重试；本次读取没有修改便签。|Could not load notes. Please retry. Your notes have not been changed.
重新加载便签|Retry loading notes
刷新便签|Refresh notes
已取消移动，便签保留原位。|Move cancelled. The note is still in its original position.
已取消，草稿保留。|Cancelled. Your draft is preserved.
已取消粘贴。|Placement cancelled.
选择位置后会发送到云端审核。点击墙面，或选择“贴在视野中央”。|Choose a spot on the wall, or Place in center, to submit your note for review.
点击墙面粘贴，或选择“贴在视野中央”。|Click the wall or choose Place in center.
正在保存位置…|Saving position…
正在提交，请勿重复点击…|Submitting… Please do not click again.
位置已保存。|Position saved.
所选位置已被占用，已自动移到附近空位。|That spot is reserved. Your note was moved to a nearby free space.
已提交，等待审核；其他访客只能看到虚线占位。|Submitted for review. Other visitors only see a dashed placeholder.
红框范围与已有占位冲突，松手后会自动避让；也可移到绿色空位。|The red outline overlaps a reserved space. Release to find a nearby spot, or move to a green outline.
此处未发现占位冲突，松手保存。|This spot is free. Release to save.
附近空间不足，便签已恢复原位。|Not enough space nearby. The note has returned to its original position.
移动结果未确认，请刷新“我的便签”核对。|Move not confirmed. Refresh My notes to check.
保存成功，但位置读取失败，请点击“我的便签”刷新核对。|Saved, but the position could not be loaded. Refresh My notes to check.
正在重试同一次提交，不会重复新增便签…|Retrying the same submission without creating a duplicate…
这次提交对应的便签已删除，不会重新创建。|This note was deleted and will not be recreated.
提交结果已确认，请在“我的便签”查看审核状态。|Submission confirmed. Check its review status in My notes.
请在“我的便签”中选中要移动的便签。|Select the note you want to move in My notes.
点击新的位置后保存，或取消。|Click a new spot to save, or cancel.
请先打开“我的便签”，选中要编辑的便签。|Open My notes and select a note to edit.
这张便签已被撤下或未通过审核，可以删除，但不能直接修改后恢复。|This note was removed or not approved. You can delete it, but editing cannot restore it.
编辑功能需要先完成云端 008 升级，再刷新此页。|Editing is temporarily unavailable. Please try again later.
已退出编辑。若刚才保存时出现网络错误，请刷新“我的便签”确认结果。|Editing closed. If saving encountered a network error, refresh My notes to confirm.
正在保存修改…|Saving changes…
便签已有更新。请复制保留你的修改，再取消编辑、刷新“我的便签”后重试。|This note has changed. Copy your edits, cancel, then refresh My notes and try again.
便签已删除或不属于当前访客，修改未保存。|This note was deleted or belongs to another visitor. Changes were not saved.
便签已被撤下，不能继续编辑。|This note was removed and can no longer be edited.
修改已保存，请查看最新审核状态。|Changes saved. Check the latest review status.
尺寸变化，已自动移到附近空位。|The note grew and was moved to a nearby free space.
修改已保存，但读取失败，请刷新“我的便签”核对。|Changes saved, but loading failed. Refresh My notes to check.
删除这张便签？删除后将不再展示。|Delete this note? It will no longer appear on the wall.
便签已删除，占位已释放。|Note deleted. Its space is now free.
删除结果未确认，请刷新“我的便签”核对。|Deletion not confirmed. Refresh My notes to check.
创作者登录已过期，请退出后重新登录，草稿已保留。|Your creator session expired. Sign out and sign in again. Your draft is preserved.
留言暂未开放，草稿已保留。|Submissions are paused. Your draft is preserved.
留言太频繁，请稍后再试，草稿已保留。|Please wait a moment before posting again. Your draft is preserved.
留言墙暂时已满，草稿已保留。|The wall is currently full. Your draft is preserved.
附近空间不足，请换一处空白位置，草稿已保留。|Not enough space nearby. Choose another spot. Your draft is preserved.
留言内容或格式不符合要求，请检查后重试。|Please check the message and its format, then try again.
浏览器无法保存访客身份，请允许此网站使用本地存储。|This browser cannot save your visitor identity. Please allow site storage.
操作结果尚未确认，请先查看“我的便签”，不要立即重复提交。|The result is not confirmed. Check My notes before submitting again.
留言请控制在 500 字以内。|Please keep your message within 500 characters.
请写下留言。|Please write a message.
新留言需审核后公开。|New notes appear after review.
上次提交结果未确认，请核对便签后再刷新页面重试。|The previous submission is not confirmed. Check your notes before retrying.
身份已切换，正在重新读取便签…|Identity changed. Reloading notes…
已贴到本地墙面，没有上传。|Placed locally; not uploaded.
`.trim().split('\n').map(line=>line.split('|')));
const key='xiaoq-site-language';
let language='zh';
try { language=new URLSearchParams(location.search).get('lang') || localStorage.getItem(key) || 'zh'; } catch {}
language=language==='en'?'en':'zh';
export function translate(value){
 if(language!=='en')return value;
 if(dictionary[value])return dictionary[value];
 if(/^\d+ \/ 500 字$/.test(value))return value.replace(' 字',' characters');
 if(/^墙上有 \d+ 张便签$/.test(value))return value.replace(/墙上有 (\d+) 张便签/,'$1 notes on the wall');
 if(/^找到 \d+ 张，点击即可定位。$/.test(value))return value.replace(/找到 (\d+) 张，点击即可定位。/,'$1 notes found. Click to locate.');
 if(value.startsWith('已选中：'))return 'Selected: '+value.slice(4);
 if(value.startsWith('编辑便签 #'))return value.replace('编辑便签','Edit note');
 if(value.startsWith('便签：'))return 'Note: '+value.slice(3).replace('，可用方向键移动',', use arrow keys to move');
 if(value.startsWith('提交时间 · '))return value.replace('提交时间','Submitted');
 if(value.startsWith('北京时间 · '))return value.replace('北京时间','Beijing time');
 const loaded=value.match(/^(我的便签|公开便签)：已加载 (\d+) 张。(.*)$/);
 if(loaded)return `${dictionary[loaded[1]]}: ${loaded[2]} loaded. ${translate(loaded[3])}`;
 // Only compose known UI sentences; never perform substring replacement on visitor content.
 for(const start of ['位置已保存。','已提交，等待审核；其他访客只能看到虚线占位。','修改已保存，请查看最新审核状态。']){
  if(value.startsWith(start))return dictionary[start]+' '+translate(value.slice(start.length));
 }
 return value;
}
export function installWallI18n(){
 const originals=new WeakMap();
 const skip='script,style,textarea,.wall-feedback,.action-hint,.note:not(.reservation) .content,.note-author,.note-results,[data-i18n-skip]';
 function convert(node,attribute){
  const current=attribute?node.getAttribute(attribute):node.nodeValue;
  let record=originals.get(node);if(!record){record={};originals.set(node,record);}
  const name=attribute||'text',old=record[name];
  const source=old&&old.rendered===current?old.source:current;
  const rendered=source.replace(/\S[\s\S]*\S|\S/,part=>translate(part));
  record[name]={source,rendered};
  if(current!==rendered){if(attribute)node.setAttribute(attribute,rendered);else node.nodeValue=rendered;}
 }
 let scheduled=false;
 const observer=new MutationObserver(()=>{if(!scheduled){scheduled=true;queueMicrotask(apply);}});
 function apply(){
  scheduled=false;observer.disconnect();
  document.documentElement.lang=language==='en'?'en':'zh-CN';
  document.title=language==='en'?'Xiao Q’s Note Wall':'小Q的便签墙';
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){const node=walker.currentNode;if(!node.parentElement.closest(skip))convert(node);}
  for(const el of document.querySelectorAll('[aria-label],[title],[placeholder]')){
   if(el.closest(skip))continue;
   for(const attr of ['aria-label','title','placeholder'])if(el.hasAttribute(attr))convert(el,attr);
  }
  for(const button of document.querySelectorAll('[data-lang]'))button.setAttribute('aria-pressed',String(button.dataset.lang===language));
  const back=document.querySelector('.wall-back');if(back)back.href='../about/?lang='+language;
  observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder']});
 }
 function choose(next){language=next==='en'?'en':'zh';try{localStorage.setItem(key,language);}catch{}
  const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);
  const text=document.querySelector('#message');if(text.validity.customError)text.setCustomValidity(translate([...text.value].length>500?'留言请控制在 500 字以内。':'请写下留言。'));
  apply();
 }
 document.querySelectorAll('[data-lang]').forEach(button=>button.onclick=()=>choose(button.dataset.lang));
 window.addEventListener('storage',event=>{if(event.key===key){language=event.newValue==='en'?'en':'zh';apply();}});
 choose(language);
}
