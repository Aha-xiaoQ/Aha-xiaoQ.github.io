import {loadBill,drawBill,drawBillItem} from './editor-bill.mjs';
import {materialFor,enemySprite,terrainParts,markerParts,sourceType,castleParts} from './map-appearance.mjs';
import {classicSprite,classicDraw} from './classic-art.mjs';
/** Shared native-pixel renderer; provenance is recorded in CLASSIC_ART_NOTICE.txt. */
const images=new Map();
export function preloadArt(rooms){return Promise.all([...(rooms.some(r=>r.playHero==='bill')?[loadBill()]:[]),...rooms.flatMap(r=>[...Object.values(r.art||{}),...(r.playerSkin?[r.playerSkin]:[])]).map(src=>{
 if(!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(src)||src.length>700000)return Promise.reject(Error('素材须为小于 500 KB 的 PNG'));
 if(images.has(src))return images.get(src).ready;
 const image=new Image(),entry={image,ready:null};entry.ready=new Promise((resolve,reject)=>{image.onload=()=>{if(image.width!==image.height||image.width>256||image.width<16||image.width%16)reject(Error('地块图需为 16–256 像素正方形，边长为 16 的倍数'));else resolve();};image.onerror=()=>reject(Error('素材图片无法读取'));});images.set(src,entry);image.src=src;return entry.ready;
} )]);}
export function background(c,room,w,h){c.fillStyle=/Underwater/.test(room.setting||'')?'#5c94fc':/Underworld|Castle|Night/.test(room.setting||'')?'#000000':'#5c94fc';c.fillRect(0,0,w,h);}
export function drawParts(c,parts,room={}){for(const p of parts){const im=classicSprite(p.name),v=room.renderBounds||p;if(p.w<=0||p.h<=0)continue;c.save();c.beginPath();c.rect(p.x,p.y,p.w,p.h);c.clip();const left=p.x+Math.max(0,Math.floor((v.x-p.x)/im.width))*im.width,top=p.y+Math.max(0,Math.floor(((v.y??p.y)-p.y)/im.height))*im.height;for(let y=top;y<Math.min(p.y+p.h,(v.y??p.y)+(v.h??p.h));y+=im.height)for(let x=left;x<Math.min(p.x+p.w,v.x+v.w);x+=im.width)c.drawImage(im,x,y);c.restore();}}
export function drawReference(c,o,room){if(o.kind==='active-vine'){drawParts(c,[{name:'src|Character|Vine||middle',x:o.x,y:o.y,w:o.w,h:o.h}],room);return true;}if(['world-transport','source-transport-not-simulated'].includes(o.kind)){const world=String(o.source?.transport?.map||'').split('-')[0];if(/^[1-8]$/.test(world)){drawPixelText(c,world,o.x+12,o.y-24);return true;}}const parts=markerParts(room,o);drawParts(c,parts,room);return parts.length>0;}
export function drawTile(c,q,room={}){
 if(q.material==='used'){classicDraw(c,'src|Solid|Block|used|',q.x,q.y);return;}
 const mat=materialFor(room,q),image=images.get(room.art?.[mat])?.image;
 if(image?.complete&&image.naturalWidth){c.save();c.beginPath();c.rect(q.x,q.y,q.w,q.h);c.clip();for(let y=q.y;y<q.y+q.h;y+=16)for(let x=q.x;x<q.x+q.w;x+=16)c.drawImage(image,x,y,16,16);c.restore();return;}
 const parts=terrainParts(room,q);if(parts.length)drawParts(c,parts,room);else{c.fillStyle='#e251ac';c.fillRect(q.x,q.y,q.w,q.h);}
}
export function drawScenery(c,room){
 if(/\bSky\b/.test(room.setting||''))return; // Coin heaven uses its authored cloud floor, not ground scenery.
 if(/Underwater/.test(room.setting||'')&&!/Castle/.test(room.setting||'')){const v=room.renderBounds||{x:0,w:room.map?.width||256},name='src|Scenery|Water|Underwater|top';drawParts(c,[{name,x:Math.floor(v.x/8)*8,y:32,w:v.w+16,h:classicSprite(name).height}],room);}
 for(const q of room.map?.geometry||[])if(['TreeTop','ShroomTop'].includes(sourceType(room,q)))drawReference(c,{id:q.id+'-trunk',kind:'decorative-trunk',source:{macro:sourceType(room,q)==='ShroomTop'?'Shroom':'Tree'}},room);

 if(/Under|Castle|Night/.test(room.setting||'')){drawParts(c,castleParts(room),room);return;}
 const trees=room.map?.geometry.some(q=>['TreeTop','ShroomTop'].includes(sourceType(room,q)));
 const v=room.renderBounds||{x:0,w:room.map?.width||256},floor=(room.map?.height||240)-32;
 for(let page=Math.floor(v.x/768)-1;page<=Math.floor((v.x+v.w)/768)+1;page++){
  const b=page*768;
  for(const [name,x,y] of [['hill_large',0,floor-35],['hill_small',256,floor-19],['hill_large',512,floor-35],['bush3',184,floor-16],['bush1',376,floor-16],['bush2',664,floor-16],['cloud1',136,48],['cloud1',312,64],['cloud2',440,48],['cloud2',568,64]]){if(trees&&/hill|bush/.test(name))continue;classicDraw(c,name,b+x,y);}
 }
 drawParts(c,castleParts(room),room);
}
export function drawObject(c,o,tick=0,room={}){if(o.kind==='bill-shot'){drawBillItem(c,o);return;}
 const {x,y,w,h}=o;c.save();
 const clipTop=o.emerge?o.blockTop:o.clipTop;if(Number.isFinite(clipTop)){c.beginPath();c.rect(x-16,y-32,w+32,Math.max(0,clipTop-y+32));c.clip();}
 if(o.kind==='bill-supply'){drawBillItem(c,o);}
 else if(o.kind==='spawn'&&room.playHero==='bill'){drawBill(c,{...o,y:o.y+o.h-30,h:30,facing:1,grounded:true},tick);}
 else if(o.kind==='enemy-death'){const name=o.flat?'goomba_flat':enemySprite(o.skin||o.type,room.setting,o.source)||'goomba',im=classicSprite(name);c.translate(Math.round(x+(w-im.width)/2),Math.round(y+h-im.height));if(!o.flat){c.translate(0,im.height);c.scale(1,-1);}c.drawImage(im,0,0);}
 else if(o.kind==='score-pop'){c.fillStyle='#fff';c.font='8px ChillBitmap, monospace';c.fillText(o.text,Math.round(x),Math.round(y));}
 else if(o.kind==='bubble'){classicDraw(c,'src|Character|Bubble||',x,y);}
 else if(o.kind==='coin-pop'){classicDraw(c,'coin'+(Math.floor((o.age||0)/4)%3),x,y);}
 else if(o.kind==='brick-debris'){const im=classicSprite('brick');c.drawImage(im,o.sx,o.sy,8,8,Math.round(x),Math.round(y),8,8);}
 else if(o.kind==='fire-impact'){classicDraw(c,'fireball'+(Math.floor((o.age||0)/2)%4),x+2,y+2);}
 else if(o.kind==='fireball'){classicDraw(c,'fireball'+(Math.floor(tick/3)%4),x-1,y-1);}
 else if(['mushroom','life','star','flower'].includes(o.kind)){const name=o.kind==='star'?'star0':o.kind==='flower'?'flower':'mushroom',variant=o.kind==='life'?'life':o.kind==='star'?['normal','starItem1','starItem2','starItem3'][Math.floor(tick/4)%4]:o.kind==='flower'?['normal','flower1','flower2','flower3'][Math.floor(tick/6)%4]:'normal',im=classicSprite(name,variant);classicDraw(c,name,x+(w-im.width)/2,y+h-im.height,false,variant);}
 else if(o.kind==='coin'){const im=classicSprite('coin0');classicDraw(c,'coin0',x+(w-im.width)/2,y+h-im.height);}
 else if(o.kind==='portal'){c.globalAlpha=.65;c.strokeStyle='#aaff99';c.strokeRect(x,y,w,h);}
 else if(o.kind==='walker'||enemySprite(o.kind)){const name=enemySprite(o.skin||o.kind,room.setting,{...o.source,frame:o.source?.frame||(Math.floor(tick/8)%2?'two':'')})||'goomba',im=classicSprite(name);classicDraw(c,name,x+(w-im.width)/2,y+h-im.height,/(Goomba|goomba)/.test(name)?!!(Math.floor(tick/8)%2):/BulletBill/.test(name)?o.vx<0:o.vx>0);}
 else if(o.kind==='exit'&&room.markers?.some(m=>m.kind==='castle-finish')){c.restore();return;}
 else if(o.kind==='exit'||o.kind==='checkpoint'){if(o.kind==='exit'&&room.markers?.some(m=>m.kind==='flagpole-finish'&&Math.abs(m.x-x)<32)){c.restore();return;}c.fillStyle='#80d010';c.fillRect(x+w/2-1,y-8,2,h-8);classicDraw(c,'flag_top',x+w/2-4,y-16);classicDraw(c,'flag',x+w/2-16,room.finish?.flagY??y);}
 else if(o.kind==='hazard'&&room.markers?.some(m=>/lava/.test(m.kind)&&o.x<m.x+2*(m.source?.width||8)&&o.x+o.w>m.x)){c.restore();return;}
 else if(o.kind==='hazard'){c.fillStyle='#eb5250';c.beginPath();c.moveTo(x,y+h);c.lineTo(x+w/2,y);c.lineTo(x+w,y+h);c.fill();}
 else {if(!o.id?.startsWith('arrival-')){const skin=images.get(room.playerSkin)?.image;if(skin)c.drawImage(skin,x+(w-16)/2,y+h-16,16,16);else classicDraw(c,'small_idle',x+(w-16)/2,y+h-16);}c.strokeStyle='#80ffd8';c.strokeRect(x,y,w,h);c.fillStyle='#80ffd8';c.font='9px sans-serif';c.fillText(o.id?.startsWith('arrival-')?'落点':'起点',x,y-5);}
 c.restore();
}
export function drawPlayer(c,p,tick=0,skin){if(p.hero==='bill'){drawBill(c,p,tick);return;}
 if(!p.dying&&!p.shrink&&!p.growth&&!p.fireGrowth&&p.invulnerable&&Math.floor(tick/4)%2)return;
 const prefix=(p.shrink||p.growth?Math.floor((p.shrink||p.growth)/4)%2:p.power)?'big':'small',name=p.dying?'dead':p.climbing?prefix+'_climb'+Math.floor(tick/8)%2:p.piping||p.springId?prefix+'_idle':p.power&&p.crouch?'big_crouch':p.swimming&&!p.grounded?'src|Character|Player|normal '+(prefix==='big'?(p.power===2?'fiery':'large'):'')+' paddling '+(p.swimStroke?'paddle'+(1+Math.floor((24-p.swimStroke)/8)%3):'swim2')+'|':!p.grounded?prefix+'_jump':p.vx*p.facing<-.08?prefix+'_skid':Math.abs(p.vx||0)>.08?prefix+'_run'+Math.floor((p.anim||0)/6)%3:prefix+'_idle';
 const im=images.get(skin)?.image||classicSprite(name,p.fireGrowth?(Math.floor(p.fireGrowth/4)%2?'normal':'fire'):p.star?'star'+(1+Math.floor(tick/4)%3):p.power===2?'fire':'normal');c.save();c.translate(Math.round(p.x+(p.w-im.width)/2)+(p.facing<0?im.width:0),Math.round(p.y+p.h-im.height));c.scale(p.facing<0?-1:1,1);c.drawImage(im,0,0);c.restore();
}

const HUD_GLYPHS={
 '0':[0x3c,0x66,0x6e,0x76,0x66,0x66,0x3c], '1':[0x18,0x38,0x18,0x18,0x18,0x18,0x7e],
 '2':[0x3c,0x66,0x06,0x0c,0x30,0x60,0x7e], '3':[0x3c,0x66,0x06,0x1c,0x06,0x66,0x3c],
 '4':[0x0c,0x1c,0x3c,0x6c,0x7e,0x0c,0x0c], '5':[0x7e,0x60,0x7c,0x06,0x06,0x66,0x3c],
 '6':[0x1c,0x30,0x60,0x7c,0x66,0x66,0x3c], '7':[0x7e,0x66,0x06,0x0c,0x18,0x18,0x18],
 '8':[0x3c,0x66,0x66,0x3c,0x66,0x66,0x3c], '9':[0x3c,0x66,0x66,0x3e,0x06,0x0c,0x38],
 'A':[0x18,0x3c,0x66,0x66,0x7e,0x66,0x66], 'B':[0x7c,0x66,0x66,0x7c,0x66,0x66,0x7c],
 'C':[0x3c,0x66,0x60,0x60,0x60,0x66,0x3c], 'D':[0x78,0x6c,0x66,0x66,0x66,0x6c,0x78],
 'E':[0x7e,0x60,0x60,0x7c,0x60,0x60,0x7e], 'F':[0x7e,0x60,0x60,0x7c,0x60,0x60,0x60],
 'G':[0x3c,0x66,0x60,0x6e,0x66,0x66,0x3e], 'H':[0x66,0x66,0x66,0x7e,0x66,0x66,0x66],
 'I':[0x7e,0x18,0x18,0x18,0x18,0x18,0x7e], 'J':[0x1e,0x0c,0x0c,0x0c,0x0c,0x6c,0x38],
 'K':[0x66,0x6c,0x78,0x70,0x78,0x6c,0x66], 'L':[0x60,0x60,0x60,0x60,0x60,0x60,0x7e],
 'M':[0x63,0x77,0x7f,0x6b,0x63,0x63,0x63], 'N':[0x66,0x76,0x7e,0x7e,0x6e,0x66,0x66],
 'O':[0x3c,0x66,0x66,0x66,0x66,0x66,0x3c], 'P':[0x7c,0x66,0x66,0x7c,0x60,0x60,0x60],
 'Q':[0x3c,0x66,0x66,0x66,0x6e,0x3c,0x0e], 'R':[0x7c,0x66,0x66,0x7c,0x78,0x6c,0x66],
 'S':[0x3c,0x66,0x60,0x3c,0x06,0x66,0x3c], 'T':[0x7e,0x18,0x18,0x18,0x18,0x18,0x18],
 'U':[0x66,0x66,0x66,0x66,0x66,0x66,0x3c], 'V':[0x66,0x66,0x66,0x66,0x66,0x3c,0x18],
 'W':[0x63,0x63,0x63,0x6b,0x7f,0x77,0x63], 'X':[0x66,0x66,0x3c,0x18,0x3c,0x66,0x66],
 'Y':[0x66,0x66,0x66,0x3c,0x18,0x18,0x18], 'Z':[0x7e,0x06,0x0c,0x18,0x30,0x60,0x7e],
 '-':[0,0,0,0x3c,0,0,0], '!':[0x18,0x18,0x18,0x18,0x18,0,0x18], ' ':[0,0,0,0,0,0,0],
 '×':[0,0,0x66,0x3c,0x18,0x3c,0x66]
};

export function drawHud(c,v,level='1-1'){
 const text=(str,x,y)=>drawPixelText(c,str,x,y);
 text(v.p?.hero==='bill'?'BILL':'MARIO',24,16);if(v.p?.hero==='bill')text(v.p.weapon||'N',24,34);text(String(v.score).padStart(6,'0'),24,24);c.save();c.translate(91,24);c.scale(.5,.5);classicDraw(c,'coin0',0,0);c.restore();text('×'+String(v.coins).padStart(2,'0'),104,24);text('WORLD',144,16);text(level,152,24);text('TIME',208,16);text(String(v.timeLeft).padStart(3,'0'),216,24);
}

export function drawPixelText(c,str,x,y){c.fillStyle='#fff';for(const ch of String(str).toUpperCase()){const glyph=HUD_GLYPHS[ch]||HUD_GLYPHS[' '];for(let r=0;r<7;r++)for(let col=0;col<8;col++)if(glyph[r]&(128>>col))c.fillRect(x+col,y+r,1,1);x+=8;}}
