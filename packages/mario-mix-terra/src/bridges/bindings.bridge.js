// M02 adapter: the only legacy boundary for settings. Models never see game globals.
const T21_ACTIONS=__terraModules.createActionDefinitions();
const T21_PAD_CANON={0:'jump',1:'attack',2:'attack',7:'attack',3:'interact',4:'toolPrev',5:'toolNext',6:'mount',8:'recall',9:'pause',10:'heal',11:'weapon',12:'up',13:'down',14:'left',15:'right'};
const T21_PAD_NAMES=['A / ×','B / ○','X / □','Y / △','LB / L1','RB / R1','LT / L2','RT / R2','Back / View','Start / Options','L3','R3','↑','↓','←','→'];
function t25PadLabel(i){return T21_PAD_NAMES[i]||`手柄键 ${i}`;}
function t25PadButtons(){try{return Array.from(navigator.getGamepads?.()||[]).find(p=>p&&p.connected!==false)?.buttons.map(t17Pressed)||[];}catch{return [];}}

const t21Model=__terraModules.createBindingsModel({definitions:T21_ACTIONS,assignMount:__terraModules.assignMountBinding});
const t21DefaultBinds=()=>t21Model.defaults();
let t21Binds=t21Model.snapshot(),t25NeedsSave=false,t21Storage='未保存';
const t21Keyboard=__terraModules.createKeyboardRouter({definitions:T21_ACTIONS,getBindings:()=>t21Binds,canonicalKeys:t17Keys});
function t21LoadBinds(data){const result=t21Model.load(data);t21Binds=t21Model.snapshot();t25NeedsSave=result.needsSave;if(result.deadzone!==undefined)t17Input.deadzone=result.deadzone;return true;}
try{const raw=localStorage.getItem('marioMix.controls.v1');if(raw)t21LoadBinds(JSON.parse(raw));t21Storage='本机自动保存';}catch{}
function t21Config(){return t21Model.config(t17Input.deadzone);}
function t21SaveBinds(){try{localStorage.setItem('marioMix.controls.v1',JSON.stringify(t21Config()));t21Storage='已保存到本机';}catch{t21Storage='浏览器禁止本地存储；可导出配置保存';}t21BindingStatus.textContent=t21Storage;}
function t21Bind(action,source,value){
 const result=t21Model.bind(action,source,value);
 if(!result.ok){if(result.reason==='conflict')t21BindingStatus.textContent='已被“'+T21_ACTIONS[result.owner].name+'”使用，请先更改该动作。';else if(result.reason==='full')t21BindingStatus.textContent='无法绑定：没有可腾出的手柄按钮。';return false;}
 t21Binds=t21Model.snapshot();t21SaveBinds();t21RefreshBindings();
 if(action==='mount'&&source==='pad')t21BindingStatus.textContent='已绑定：'+t25PadLabel(value);return true;
}
function t21PhysicalIndices(i){const action=T21_PAD_CANON[i];return mode==='playing'&&action?t21Binds[action].pad:[i];}
t17Action=function(i){return t21PhysicalIndices(i).some(j=>!!t17Input.buttons[j]&&!t17Input.blocked.has(j));};
t17Edge=function(i){return t21PhysicalIndices(i).some(j=>!!t17Input.buttons[j]&&!t17Input.previous[j]&&!t17Input.blocked.has(j));};
function t21KeyLabel(k){return __terraModules.keyLabel(k);}
const t21BindingBox=document.createElement('dialog');t21BindingBox.id='t21Bindings';t21BindingBox.setAttribute('aria-labelledby','t21BindingsTitle');t21BindingBox.innerHTML='<header><h2 id="t21BindingsTitle">按键设置</h2><button type="button" id="t21BindClose">完成</button></header><p>点击动作旁的按钮，再按新的键；按 Esc 取消本次改键。设置自动保存在本机，也可导出备份。</p><div class="t21BindScroll"><table><thead><tr><th>动作</th><th>键盘</th><th>手柄</th></tr></thead><tbody id="t21BindRows"></tbody></table></div><p id="t21BindingStatus" role="status"></p><footer><button type="button" id="t21BindReset">恢复默认</button><button type="button" id="t21BindExport">导出配置</button><button type="button" id="t21BindImport">导入配置</button><input type="file" accept="application/json,.json" id="t21BindFile" hidden></footer>';
document.body.append(t21BindingBox);const t21BindingStatus=$('t21BindingStatus');
const t21BindingButton=document.createElement('button');t21BindingButton.type='button';t21BindingButton.id='t21BindingButton';t21BindingButton.textContent='按键设置';t15Help.before(t21BindingButton);

const t21MakeLifetime=()=>__terraModules.createLifetime({scheduleInterval:(fn,ms)=>setInterval(fn,ms),cancelInterval:id=>clearInterval(id)});
const t21UILifetime=t21MakeLifetime();
const t21CaptureState=__terraModules.createBindingCapture({assign:t21Bind,mask:i=>t17Input.blocked.add(i),unmask:i=>t17Input.blocked.delete(i)});
const t21View=__terraModules.createBindingsView({document,table:$('t21BindRows'),definitions:T21_ACTIONS,keyLabel:t21KeyLabel,padLabel:t25PadLabel,lifetime:t21UILifetime,
 onChoose:(action,source)=>{t21CaptureState.begin(action,source,t25PadButtons());t21BindingBox.dataset.capturing='true';t21BindingStatus.textContent='请按下“'+T21_ACTIONS[action].name+'”的新'+(source==='keys'?'键盘键':'手柄按钮')+'，Esc 取消。';}});
function t21RefreshBindings(){t21BindingBox.dataset.capturing=String(!!t21CaptureState.pending());t21View.render(t21Binds);t21RefreshGuide();}
function t25BindingPoll(){if(!t21BindingBox.open)return;const r=t21CaptureState.poll(t25PadButtons());t21BindingBox.dataset.capturing=String(!!t21CaptureState.pending());if(r)t21BindingStatus.textContent=r.ok?'已绑定：'+t25PadLabel(r.value)+'，已自动等待释放':'绑定失败，请先释放按键后重试。';}
const t21Settings=__terraModules.createSettingsSession({makeLifetime:t21MakeLifetime,getMode:()=>mode,togglePause:()=>togglePause(),
 resetInput:()=>{t17ResetActions();t21Keyboard.clear();t21CaptureState.clear();t21BindingBox.dataset.capturing='false';},render:()=>{t21RefreshBindings();t21BindingStatus.textContent=t21Storage;},
 show:()=>{const host=document.fullscreenElement||document.body;if(t21BindingBox.parentElement!==host)host.append(t21BindingBox);t21BindingBox.showModal();$('t21BindClose').focus();},hide:()=>{if(t21BindingBox.open)t21BindingBox.close();},focus:()=>canvas.focus({preventScroll:true}),poll:t25BindingPoll});
let t21BindingOpener=null;function t21OpenBindings(){if(document.querySelector('dialog[open]'))return false;t21BindingOpener=document.activeElement;return t21Settings.open();}
function t21CloseBindings(){const result=t21Settings.close();if(mode!=='playing'&&t21BindingOpener?.isConnected)t21BindingOpener.focus({preventScroll:true});return result;}
t21UILifetime.listen(t21BindingButton,'click',t21OpenBindings);
t21UILifetime.listen($('t21BindClose'),'click',t21CloseBindings);
t21UILifetime.listen(t21BindingBox,'cancel',e=>{e.preventDefault();if(t21CaptureState.pending()){t21CaptureState.cancel();t21BindingBox.dataset.capturing='false';t21BindingStatus.textContent='已取消';}else t21CloseBindings();});
// A native close/page exit must not leave polling timers running. pagehide does not resume a paused game.
t21UILifetime.listen(t21BindingBox,'close',()=>{if(!t21BindingBox.open)t21Settings.close();});
t21UILifetime.listen(window,'pagehide',()=>t21Settings.close({resume:false,restoreFocus:false}));
t21UILifetime.listen($('t21BindReset'),'click',()=>{t21Binds=t21Model.reset();t21SaveBinds();t21RefreshBindings();});
t21UILifetime.listen($('t21BindExport'),'click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(t21Config(),null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='MarioMix_按键配置.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);});
t21UILifetime.listen($('t21BindImport'),'click',()=>$('t21BindFile').click());
t21UILifetime.listen($('t21BindFile'),'change',async e=>{try{const file=e.target.files?.[0];if(!file)return;if(file.size>50000)throw Error('配置文件过大');const generation=t21Settings.snapshot().generation;const text=await file.text();if(!t21BindingBox.open||generation!==t21Settings.snapshot().generation)return;t21LoadBinds(JSON.parse(text));t21SaveBinds();t21RefreshBindings();}catch(err){t21BindingStatus.textContent=err.message;}finally{e.target.value='';}});
const t21EarlyBase=t17Early.handle;
t17Early.handle=function(e){if(t17Early.presentation?.(e))return true;if(!isTrio())return t21EarlyBase(e);
 if((e.type==='keydown'||e.type==='keyup')&&t17Keys.has(e.code)&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target?.closest?.('input,textarea,select,[contenteditable="true"]'))t20Own('keyboard','key');
 if((e.type==='pointermove'||e.type==='pointerdown')&&e.target===canvas)t20Own('keyboard','pointer');
 if(t21BindingBox.open){
  if(e.type==='keydown'&&t21CaptureState.pending()){const r=t21CaptureState.key(e);t21BindingBox.dataset.capturing=String(!!t21CaptureState.pending());if(r?.kind==='cancel')t21BindingStatus.textContent='已取消';return true;}
  if(['keydown','keyup'].includes(e.type)){if(e.code==='Tab')return false;if(e.type==='keydown'&&!e.repeat){if(e.code==='Escape')t21CloseBindings();else if(['Enter','Space'].includes(e.code))document.activeElement?.closest?.('#t21Bindings button')?.click();}return true;}
  return ['blur','focus','visibilitychange'].includes(e.type)?t21EarlyBase(e):false;
 }
 const result=t21Keyboard.route(e,mode);
 if(result.kind==='resume'){togglePause();t17ResetActions();return true;}
 if(result.kind==='mapped')return t21EarlyBase(result.event);
 if(result.kind==='consume')return true;
 return t21EarlyBase(e);
};
const t21PollBase=pollMixPad;pollMixPad=function(){if(t17Early.menuPad?.())return;if(t17Early.helpOpen?.()){t17ResetActions();return;}if(!isTrio()||!t21BindingBox.open)return t21PollBase();t25BindingPoll();};
const t21BindingsCSS=document.createElement('style');t21BindingsCSS.textContent=`#t21BindingButton{font:inherit;font-size:12px;border:1px solid #697b88;background:#203544;color:#e7dcbd;border-radius:5px;padding:9px 14px;cursor:pointer;margin-top:12px}#t21Bindings{width:min(640px,94vw);max-height:90vh;padding:22px;border:1px solid #698293;border-radius:10px;background:#162a38;color:#e9e5d6;font:13px/1.6 sans-serif}#t21Bindings::backdrop{background:#030a12bb}#t21Bindings header{display:flex;align-items:center;justify-content:space-between}#t21Bindings h2{margin:0;font-size:21px}#t21Bindings p{font-size:12px;color:#b8c9d2}#t21Bindings table{border-collapse:collapse;width:100%}#t21Bindings td,#t21Bindings th{padding:7px;text-align:left;border-bottom:1px solid #56728355}#t21Bindings td:first-child{width:32%}#t21Bindings button{font:inherit;cursor:pointer;padding:6px 10px;border:1px solid #657f8d;background:#2c4555;color:#f6e1b3;border-radius:4px}#t21Bindings td button{width:100%;font-size:12px;min-height:34px}#t21Bindings footer{display:flex;flex-wrap:wrap;gap:8px}#t21Bindings .t21BindScroll{max-height:54vh;overflow:auto}#t21BindingStatus{min-height:22px;color:#f0d29c}`;document.head.append(t21BindingsCSS);

const t21GuideRows=[['jump','跳跃 / 跳车'],['attack','攻击 / 工具'],['toolPrev','上一个工具'],['toolNext','下一个工具'],['weapon','切换已有武器'],['mount','上下坐骑'],['heal','治疗'],['recall','魔镜返程'],['pause','暂停']];
function t21RefreshGuide(){t15Help.innerHTML='<summary>操作指南 · 手柄 / 键鼠</summary><p>移动：左摇杆 / 十字键，或 WASD / 方向键。键鼠用鼠标手动瞄准，手柄自动索敌；右摇杆偏转不影响瞄准。按实际输入自动切换。</p><table><thead><tr><th>动作</th><th>手柄</th><th>键盘</th></tr></thead><tbody>'+t21GuideRows.map(([k,n])=>'<tr><td>'+n+'</td><td>'+t21Binds[k].pad.map(t25PadLabel).join(' / ')+'</td><td>'+t21Binds[k].keys.map(t21KeyLabel).join(' / ')+'</td></tr>').join('')+'</tbody></table><p>1–6、滚轮或 LB / R3 切工具（R3 为按下右摇杆）。手柄平台默认沿脚下台面向前接一格；火把与篝火落在脚前地面。上 / 下方向调整高度，鼠标可精确选格。</p><p>宝箱碰到后弹出实物，走过去拾取并显示名称、效果。换下的武器留在地面，先走开再接触即可换回；不再直接删除旧武器。</p><p>上下坐骑：Y（键盘 F，可在按键设置更改），适用于史莱姆、UFO 和矿车。矿车也可接触上车、跳跃下车；原车保留，走开后可重新接触上车。套装接触换装并自动骑 UFO，向下可穿木台。箭矢与子弹无限，魔力、木材和药水仍消耗。</p><p>最右侧眼球在战前物资拿齐后召唤克眼，击败后可从原管道返回。终点大台阶下方的雪地可遇到独眼巨鹿；主线不强制击败它。</p>';}

t21RefreshGuide();if(t25NeedsSave){try{t21SaveBinds();}catch{}t25NeedsSave=false;}
// Diagnostics are only exposed under the existing explicit test flag.
if(document.documentElement.dataset.test==='1')window.__terraSettingsTest={
 config:t21Config,load:t21LoadBinds,bind:t21Bind,open:t21OpenBindings,close:t21CloseBindings,
 capture:()=>t21CaptureState.snapshot(),poll:buttons=>t21CaptureState.poll(buttons),
 session:()=>t21Settings.snapshot(),keyboard:()=>t21Keyboard.snapshot(),
 view:()=>t21UILifetime.snapshot(),storage:()=>t21Storage
};

// M03 read-only settings port for independently owned stage drivers.
window.TerraBindingsPort=Object.freeze({
 config:()=>JSON.parse(JSON.stringify(t21Config())),
 isOpen:()=>t21BindingBox.open,
 captureKeyboard(e){
  if(!t21BindingBox.open||e.code==='Tab')return false;
  if(e.type==='keydown'&&t21CaptureState.pending()){const r=t21CaptureState.key(e);t21BindingBox.dataset.capturing=String(!!t21CaptureState.pending());if(r?.kind==='cancel')t21BindingStatus.textContent='已取消';return true;}
  if(e.type==='keydown'&&!e.repeat){if(e.code==='Escape')t21CloseBindings();else if(['Enter','Space'].includes(e.code))document.activeElement?.closest?.('#t21Bindings button')?.click();}return true;
 }
});
