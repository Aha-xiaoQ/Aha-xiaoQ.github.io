/** Self-contained native-pixel preview; shares the editor's sprite and material sources. */
import {spritePixels} from '../atlas/classic-art.mjs';
import {materialFor,enemySprite,enemyLabels,terrainParts,markerParts,sourceType,castleParts,orderedTerrain} from '../atlas/map-appearance.mjs';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mapSVG(room){
 const m=room.map,W=m.width,H=m.height,dark=/Underworld|Castle|Night/.test(room.setting||''),defs=new Map();
 function sprite(name,variant='normal'){
  const id=('s-'+name+'-'+variant).replace(/[^a-zA-Z0-9_-]/g,'_');if(defs.has(id))return id;
  const d=spritePixels(name,variant),parts=[];
  for(let y=0;y<d.h;y++)for(let x=0;x<d.w;){const p=d.pixels[y*d.w+x];let end=x+1;while(end<d.w&&d.pixels[y*d.w+end].join(',')===p.join(','))end++;
   if(p[3])parts.push('<rect x="'+x+'" y="'+y+'" width="'+(end-x)+'" height="1" fill="rgb('+p.slice(0,3).join(',')+')"/>');x=end;}
  defs.set(id,'<g id="'+id+'">'+parts.join('')+'</g>');return id;
 }
 const use=(name,x,y,variant='normal')=>'<use href="#'+sprite(name,variant)+'" x="'+x+'" y="'+y+'"/>';
 function tiled(q,name,variant='normal'){
  const s=sprite(name,variant),d=spritePixels(name,variant),id='p-'+s;
  if(!defs.has(id))defs.set(id,'<pattern id="'+id+'" width="'+d.w+'" height="'+d.h+'" patternUnits="userSpaceOnUse"><use href="#'+s+'"/></pattern>');
  return '<rect transform="translate('+q.x+' '+q.y+')" width="'+q.w+'" height="'+q.h+'" fill="url(#'+id+')"/>';
 }
 const trees=m.geometry.some(q=>['TreeTop','ShroomTop'].includes(sourceType(room,q)));let scenery='';if(!dark&&!/Underwater/.test(room.setting||''))for(let b=0;b<W;b+=768)for(const [name,x,y]of [['hill_large',0,H-67],['hill_small',256,H-51],['bush3',184,H-48],['bush1',376,H-48],['cloud1',136,48],['cloud1',312,64],['cloud2',440,48],['cloud2',568,64]]){if(trees&&/hill|bush/.test(name))continue;scenery+=use(name,b+x,y);}
 scenery+=castleParts(room).map(p=>tiled(p,p.name)).join('');
 const shapes=orderedTerrain(room).map(q=>{const parts=terrainParts(room,q);return parts.length?parts.map(p=>tiled(p,p.name)).join(''):'<rect x="'+q.x+'" y="'+q.y+'" width="'+q.w+'" height="'+q.h+'" fill="#e251ac"><title>未匹配素材</title></rect>';}).join('');
 const objects=m.objects.map(o=>{const name=o.kind==='spawn'?'small_idle':o.kind==='coin'?'coin0':enemySprite(room.enemySkins?.[o.id]||o.kind,room.setting);
  if(name){const d=spritePixels(name);return '<g><title>'+esc(o.kind==='spawn'?'马里奥起点':o.kind)+'</title>'+use(name,o.x+((o.w||16)-d.w)/2,o.y+(o.h||16)-d.h)+'</g>';}
  if(o.kind==='exit'&&room.markers?.some(m=>m.kind==='castle-finish'))return '';
  if(o.kind==='hazard'&&room.markers?.some(m=>/lava/.test(m.kind)))return '';
  if(o.kind==='exit'&&room.markers?.some(m=>m.kind==='flagpole-finish'&&Math.abs(m.x-o.x)<32))return '';
  if(o.kind==='exit')return '<path d="M'+o.x+' '+o.y+'v'+o.h+'" stroke="white" stroke-width="2"/>'+use('flag',o.x,o.y);
  if(o.kind==='hazard')return '<rect x="'+o.x+'" y="'+o.y+'" width="'+o.w+'" height="'+o.h+'" fill="#d95743"/>';
  return '';
 }).join('');
 const trunks=(room.markers||[]).filter(o=>o.kind==='decorative-trunk').flatMap(o=>markerParts(room,o)).map(p=>tiled(p,p.name)).join('');
 const liquids=(room.markers||[]).filter(o=>/^(lava|water)-/.test(o.kind)).flatMap(o=>markerParts(room,o)).map(p=>tiled(p,p.name)).join('');
 const markers=(room.markers||[]).filter(o=>! /^(lava|water)-/.test(o.kind)&&o.kind!=='decorative-trunk'&&o.x<=W).map(o=>{const parts=markerParts(room,o),label=enemyLabels[o.kind]||o.kind;
  if(parts.length)return '<g><title>'+esc(label)+'</title>'+parts.map(p=>tiled(p,p.name)).join('')+'</g>';
  if(o.kind.startsWith('decorative'))return '';
  return '<g><title>'+esc(label)+'</title><circle cx="'+(o.x+6)+'" cy="'+Math.min(H-8,o.y)+'" r="5" fill="none" stroke="#ff8290" stroke-width="2"/></g>';
 }).join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" shape-rendering="crispEdges" role="img" aria-labelledby="title"><title id="title">'+esc(m.title)+'：像素素材预览，粉色标记表示参考机制</title><defs>'+[...defs.values()].join('')+'</defs><rect width="'+W+'" height="'+H+'" fill="'+(dark?'#000':'#5c94fc')+'"/>'+scenery+trunks+liquids+shapes+objects+markers+'</svg>\n';
}
