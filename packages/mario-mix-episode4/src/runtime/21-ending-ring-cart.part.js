/* R35 — visual/feedback repair on R34, preserving gameplay geometry and UI modal.
 * Amy Rose frame pixels: Techokami/SonicWorldsNext, pinned d9939027,
 * Graphics/Players/Amy.png. First 14 cells extracted without redraw/recolor.
 * The source README's MIT grant describes CODE, not a transfer of SEGA's rights.
 * No second canvas, game loop, network request, map or character-controller swap.
 */
const S35_ASSETS={"amy":"@@E04:uri:a211@@"};
const s35AmyImage=new Image();s35AmyImage.src=S35_ASSETS.amy;
const s35AmyReady=s35AmyImage.decode().then(()=>true).catch(()=>false);
// Every frame uses the same source foot row (45), not its variable head bbox.
function s35AmyPose(){
 const arrived=c23.ending>200&&player.x>2360;
 const idle=[0,0,0,0,0,1,2,3,4,3,2,1];
 const greet=[5,6,7,8,9,10,11,12,13,12,11,10,9,8,7];
 const age=arrived?Math.max(0,c23.ending-200):c23.ticks;
 const seq=arrived?greet:idle;
 return {frame:seq[Math.floor(age/(arrived?9:12))%seq.length],arrived,face:-1,feet:208,x:2448};
}
function s35DrawAmy(g,x,feet){
 if(!s35AmyImage.complete||s35AmyImage.naturalWidth!==672)return;
 const p=s35AmyPose(),scale=.70;
 g.save();g.translate(x,feet);g.scale(-1,1);g.imageSmoothingEnabled=false;
 g.drawImage(s35AmyImage,p.frame*48,0,48,48,-24*scale,-45*scale,48*scale,48*scale);
 g.restore();
}
// Center actual lit glyph pixels in the 256-unit GAME viewport. This does not
// center on the page/window or a camera-relative room coordinate (old x=182).
const S35_END_LINES=[['THANK YOU SONIC!',77],['BUT OUR PRINCESS',101],['IS IN ANOTHER',117],['CASTLE!',133]];
function s35MessageLayout(str,y){
 let min=Infinity,max=-Infinity;
 [...str].forEach((c,i)=>{const glyph=HUD_GLYPHS[c]||HUD_GLYPHS[' '];
  for(const row of glyph)for(let col=0;col<8;col++)if(row&(128>>col)){min=Math.min(min,i*8+col);max=Math.max(max,i*8+col);}
 });
 if(!Number.isFinite(min))return {str,y,x:128,left:128,right:128,center:128};
 const x=Math.round(128-(min+max+1)/2);
 return {str,y,x,left:x+min,right:x+max+1,center:x+(min+max+1)/2};
}
function s35DrawEndingMessage(g){
 g.save();
 for(let i=0;i<S35_END_LINES.length;i++)if(i===0||c23.ending>260){const line=s35MessageLayout(...S35_END_LINES[i]);hud(line.str,line.x,line.y,'#fff');}
 g.restore();
}
// An older tank collision wrapper discarded the include-hidden argument.
// Restore that argument's meaning ONLY for Sonic's upward head query. Ordinary
// walls/floors and all other characters still use their existing collision path.
const s35SolidsBase=solids;
solids=function(box,includeHidden=false){
 const result=s35SolidsBase(box,includeHidden);
 if(!s33Is()||!includeHidden)return result;
 for(let y=Math.floor(box.y/T);y<=Math.floor((box.y+box.h-.001)/T);y++)
  for(let x=Math.floor(box.x/T);x<=Math.floor((box.x+box.w-.001)/T);x++){
   const t=tiles.get(tileKey(x,y));
   if(t?.hidden&&t.type==='question'&&!t.used&&!result.includes(t))result.push(t);
  }
 return result;
};
// R34 already granted rings immediately, but had no emerging reward graphic.
// Retain its authoritative grant and world-state write, and add transient feedback
// only AFTER a successful first hit. Repeated hits/loading cannot award twice.
const s35BumpBase=bumpTile;
bumpTile=function(t){
 const first=s33Is()&&c23?.sonic&&t?.type==='question'&&!t.used;
 const before=first?c23.sonic.rings:0;
 const result=s35BumpBase(t);
 if(first&&t.used){
  const s=c23.classic||(c23.classic={look:0});
  const granted=Math.max(0,c23.sonic.rings-before);
  s.rewardPops=(s.rewardPops||[]).filter(p=>c23.ticks-p.born<75);
  s.rewardPops.push({x:t.x*16+8,y:t.y*16,born:c23.ticks,rings:granted});
  s.rewardPops=s.rewardPops.slice(-8);s.lastRewardTick=c23.ticks;
 }
 return result;
};
function s35DrawRewards(g){
 const list=c23.classic?.rewardPops||[];
 for(const p of list){
  const age=c23.ticks-p.born;if(age<0||age>=75)continue;
  const a=age<48?1:(75-age)/27,x=p.x-camera;
  const lift=age<18?17*(1-Math.pow(1-age/18,2)):17+(age-18)*.10;
  const y=p.y-7-lift;
  g.save();g.globalAlpha=a;s33DrawRing(g,x,y,c23.ticks*1.5);
  const label=p.rings>0?p.rings+(p.rings===1?' RING':' RINGS'):'RINGS FULL';
  g.save();g.translate(x,Math.max(39,y-12));g.scale(.58,.58);hud(label,0,0,'#ffeaa1',true);g.restore();
  if(age<32){const r=4+age*.19;g.fillStyle='#fff3ba';for(let i=0;i<4;i++){const a=i*Math.PI*.5+age*.04;const sx=x+Math.cos(a)*r,sy=y+Math.sin(a)*r;g.fillRect(Math.round(sx),Math.round(sy),1,2);g.fillRect(Math.round(sx)-1,Math.round(sy)+1,3,1);}}
  g.restore();
 }
}
const s35StepBase=c23Step;
c23Step=function(v){
 const prev=c23?.ticks;const out=s35StepBase(v);
 if(s33Is()&&c23?.classic?.rewardPops&&c23.ticks!==prev)c23.classic.rewardPops=c23.classic.rewardPops.filter(p=>c23.ticks-p.born<75);
 return out;
};
// Ground the cart on the existing original chamber floor. During the zoom/turn
// it stays in the same canonical coordinates as that floor, instead of jumping
// to an unrelated screen-space position. This creates NO traversable platform.
function s35CartEntranceX(t){return 273-(1-Math.pow(1-clamp(t/50,0,1),3))*88;}
function s35FloorAt(x){
 x=clamp(x,0,2559.5);
 const original=o29.horizontal?.entities||O29_CANONICAL.entities;
 let floor=Infinity;
 for(const e of original)if(e.id.startsWith('tile:')&&!e.state?.destroyed&&e.state?.revealed!==false&&e.y>=176&&e.x<=x&&x<e.x+e.w)floor=Math.min(floor,e.y);
 return Number.isFinite(floor)?floor:208;
}
function s35CartDock(){const x=(o29.turnStart?.camera??camera)+185;return {x,feet:Math.min(s35FloorAt(x-19),s35FloorAt(x+19))};}
function s35CartPose(t){
 return {wheelAngle:(s35CartEntranceX(t)-273)/8,lever:-.68+1.70*o29Ease((t-64)/20),junior:t<50?Math.floor(t/9)%2:t<68?0:1};
}
function s35DrawMachineEntry(g,t){
 const x=s35CartEntranceX(t),wx=(o29.turnStart?.camera??camera)+x;
 const feet=Math.min(s35FloorAt(wx-19),s35FloorAt(wx+19));
 o28Machine(g,x,feet,t);
}
function s35DrawMachineInWorld(g,t){
 if(t>=355)return;
 const dock=s35CartDock();g.save();g.globalAlpha*=1-o29Ease((t-320)/35);
 o28Machine(g,dock.x,dock.feet,t);g.restore();
}
o28Machine=function(g,x,feet,t){
 const p=s35CartPose(t);g.save();g.translate(x,feet);
 // Static circular contact patch: wheel bottom is ALWAYS y=0 at every angle.
 // Wheel spokes turn with entry displacement and stop when the cart is parked.
 g.fillStyle='#020b1280';g.beginPath();g.ellipse(0,-.3,27,.7,0,0,Math.PI*2);g.fill();
 const metal=g.createLinearGradient(0,-56,0,-5);metal.addColorStop(0,'#6d8490');metal.addColorStop(.35,'#253d49');metal.addColorStop(1,'#101f2b');
 g.fillStyle=metal;g.strokeStyle='#92acb5';g.lineWidth=.8;g.beginPath();g.roundRect(-27,-39,54,32,4);g.fill();g.stroke();
 for(const xx of [-19,19]){
  g.save();g.translate(xx,-8);g.fillStyle='#111d25';g.beginPath();g.arc(0,0,8,0,Math.PI*2);g.fill();
  g.strokeStyle='#9b8056';g.lineWidth=1.1;g.beginPath();g.arc(0,0,6.8,0,Math.PI*2);g.stroke();
  g.rotate(p.wheelAngle);g.strokeStyle='#bac2ac';g.lineWidth=.8;
  for(let i=0;i<6;i++){g.rotate(Math.PI/3);g.beginPath();g.moveTo(2,0);g.lineTo(5.8,0);g.stroke();}
  o24Ellipse(g,0,0,2,2,'#d8ba7b');g.restore();
 }
 g.fillStyle='#0c2032';g.fillRect(-18,-34,36,13);g.fillStyle='#70eecf';g.fillRect(-15,-31,13,2);g.fillStyle='#ffbb67';g.fillRect(2,-31,9,2);
 g.strokeStyle='#809593';g.lineWidth=2;g.beginPath();g.moveTo(13,-41);g.lineTo(13+Math.sin(p.lever)*10,-41-Math.cos(p.lever)*10);g.stroke();
 o24Ellipse(g,13+Math.sin(p.lever)*10,-41-Math.cos(p.lever)*10,2.5,2.5,'#e56836');
 o28Junior(g,-5,-33,p.junior*9);g.restore();
};
const s35SourceNote=document.createElement('p');
s35SourceNote.textContent='终点艾咪：Sonic Worlds Next 公开项目中的经典造型动作帧；原图像与角色权利归原权利人。仅截取本场景需要的帧并内置，未改为占位图。来源与处理记录见源码包。';
const s35SourceBox=document.querySelector('.source-note');if(s35SourceBox)s35SourceBox.append(s35SourceNote);
window.__nativeCampaign=Object.freeze({stage:()=>c23Campaign.stage,chapters:[11,12,13,14],canvas:'game',runtime:'native',build:'R35',chapter14:'Ori: grounded machine; Sonic: classic castle, Amy rescue and visible rewards'});
if(document.documentElement.dataset.test==='1'||new URLSearchParams(location.search).has('test'))window.__castle35={
 ...window.__sonic34,build:'R35',ready:()=>Promise.all([s33Ready,s35AmyReady]),
 messageLayout:()=>S35_END_LINES.map(v=>s35MessageLayout(...v)),npc:()=>({...s35AmyPose(),loaded:s35AmyImage.complete&&s35AmyImage.naturalWidth===672,source:'Techokami/SonicWorldsNext',frames:14}),
 rewards:()=>structuredClone(c23.classic?.rewardPops||[]),cartPose:s35CartPose,cartDock:s35CartDock,
 cartGround:t=>{const x=s35CartEntranceX(t),wx=(o29.turnStart?.camera??camera)+x;return {screenX:x,worldX:wx,floors:[s35FloorAt(wx-19),s35FloorAt(wx+19)],feet:Math.min(s35FloorAt(wx-19),s35FloorAt(wx+19))};},
 // Deliberate test fixtures only: not used by full route replays.
 sceneFixture:v=>{if(v.phase!==undefined)o28.phase=v.phase;if(v.age!==undefined)o28.age=v.age;if(v.ending!==undefined)c23.ending=v.ending;if(v.turnStart)o29.turnStart={...v.turnStart};},
 win:()=>{mode='win';s34Chrome();},machine:o28Machine,drawRewards:s35DrawRewards,drawAmy:s35DrawAmy,
 frameTransform:t=>({view:o29TurnFrame(t),rotation:O29Core.rotationFrame(o29.world,o29TurnFrame(t).angle)}),
 ui:()=>s34Chrome()
};
