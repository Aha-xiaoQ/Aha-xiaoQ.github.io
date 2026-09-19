// Browser IO is kept at the existing UI hook. No world/physics wrapper is added.
let terraDisplayStorage;try{terraDisplayStorage=localStorage;}catch{}
const terraDisplayPreferences=__terraModules.createDisplayPreferences({storage:terraDisplayStorage});
const terraPresentationLifetime=()=>__terraModules.createLifetime({scheduleInterval:(fn,ms)=>setInterval(fn,ms),cancelInterval:id=>clearInterval(id)});
const terraAdventureShell=__terraModules.createAdventureShell({document,preferences:terraDisplayPreferences,
 makeLifetime:terraPresentationLifetime,resetInput:()=>t17ResetActions(),focusGame:()=>canvas.focus({preventScroll:true}),getBindings:()=>t21Config(),keyLabel:t21KeyLabel});
const terraAdventureHelp=__terraModules.createAdventureHelp({document,makeLifetime:terraPresentationLifetime,
 getBindings:()=>t21Config(),getMode:()=>mode,togglePause:()=>togglePause(),resetInput:()=>{t17ResetActions();t21Keyboard.clear();},
 focusGame:()=>canvas.focus({preventScroll:true}),storage:terraDisplayStorage,keyLabel:t21KeyLabel,padLabel:t25PadLabel,
 makeGuide:__terraModules.buildQuickGuide,formatReport:__terraModules.formatPlayerReport,
 getContext:()=>({version:'0.4.3',terra:isTrio(),hero,character:__terraModules.playerCopy({hero}).selected.name,scene:state?.r05Arena?'地下挑战':'主场景',mode,device:t20Device,viewport:innerWidth+' × '+innerHeight}),
 copyText:text=>{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');return navigator.clipboard.writeText(text);}});
var terraHudSurface=__terraModules.createHudSurface({document,game:canvas,host:canvas.parentElement,pixelRatio:()=>window.devicePixelRatio||1,selectTool:i=>t15Slots[i]?.click(),heal:()=>t15HP.click()});
var terraPlayerInterface=__terraModules.createPlayerInterface({document,makeLifetime:terraPresentationLifetime,
 readContext:()=>({hero,mode,inArena:!!state?.r05Arena,phase:state?.phase,underground:state?.scene==='underground',tool:state?.tool||0,toolName:state&&isTrio()?t15Model(state).names[state.tool||0]:'',device:t20Device}),
 makeCopy:__terraModules.playerCopy,hideHud:()=>terraHudSurface.frame(null,false),resetInput:()=>{t17ResetActions();t21Keyboard.clear();},focusGame:()=>canvas.focus({preventScroll:true}),getMode:()=>mode,
 togglePause:()=>togglePause(),restart:()=>startGame(),chooseCharacters:()=>showCharacters(),openHelp:()=>terraAdventureHelp.open(),openBindings:()=>t21OpenBindings(),
 getBindings:()=>t21Config(),keyLabel:t21KeyLabel,padLabel:t25PadLabel,capturePending:()=>!!t21CaptureState.pending(),
 resetBindings:()=>{t21Binds=t21Model.reset();t21SaveBinds();t21RefreshBindings();},
 readPad:()=>{try{return Array.from(navigator.getGamepads?.()||[]).find(p=>p&&p.connected!==false)||null;}catch{return null;}}});
terraAfterDraw=()=>terraPlayerInterface.refresh();
t17Early.menuPad=()=>terraPlayerInterface.pollPad();
t17Early.helpOpen=()=>terraAdventureHelp.snapshot().open;
t17Early.presentation=e=>terraPlayerInterface.handleKey(e)||terraAdventureHelp.handleKey(e)||terraAdventureShell.handleKey(e);
// A persisted page is frozen for back/forward cache, not destroyed. Keep its listeners.
window.addEventListener('pagehide',e=>{terraPlayerInterface.suspend();terraAdventureHelp.suspend();if(!e.persisted){terraPlayerInterface.dispose();terraHudSurface.dispose();terraAdventureHelp.dispose();terraAdventureShell.dispose();}});
if(document.documentElement.dataset.test==='1'){window.__terraPresentationTest=terraAdventureShell;window.__terraHelpTest=terraAdventureHelp;}

if(document.documentElement.dataset.test==='1'){window.__terraPlayerUiTest=terraPlayerInterface;window.__terraHudSurfaceTest=terraHudSurface;}
