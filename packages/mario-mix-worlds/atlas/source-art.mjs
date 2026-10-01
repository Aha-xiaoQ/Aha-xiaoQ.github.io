import data from './source-sprite-data.mjs';
// Native widths from upstream objects.js, in source pixels (two pixels/unit).
const widths={Vine:14,Bowser:32,BowserFire:24,BrickShard:8,Bubble:4,CastleFireball:8,Fireball:8,Coin:10,Hammer:16,SpinyEgg:14,Pipe:32,PipeVertical:32,PipeHorizontal:39,Platform:8,CastleBridge:8,CastleChain:15,TreeTrunk:8,Water:8,WaterBlock:1,BridgeBase:8,BrickHalf:16,Bush1:32,Bush2:48,Bush3:64,CastleDoor:16,CastleFlag:13,CastleRailing:16,CastleRailingFilled:16,CastleTop:24,CastleWall:16,Cloud1:32,Cloud2:48,Cloud3:64,Flag:16,FlagPole:2,FlagTop:8,HillSmall:48,HillLarge:80,Peach:16,PlatformString:2,PlantSmall:14,PlantLarge:16,Railing:8,ShroomTrunk:16,String:2,StringCornerLeft:10,StringCornerRight:10,Toad:16};
export const sourceKey=(group,type,setting='',part='')=>'src|'+group+'|'+type+'|'+setting+'|'+part;
const lookup=path=>path.reduce((v,k)=>v?.[k],data.library);
function resolve(v,tokens,part,filters=[],depth=0){
 if(depth>40||v===undefined)throw Error('Unresolved source sprite');
 if(typeof v==='string')return {code:v,filters};
 if(Array.isArray(v)){
  if(v[0]==='same')return resolve(lookup(v[1]),tokens,part,filters,depth+1);
  if(v[0]==='filter')return resolve(lookup(v[1]),tokens,part,[...filters,v[2]],depth+1);
  if(v[0]==='multiple'){const pieces=v[2],key=part|| (v[1]==='horizontal'?'middle':'top');return resolve(pieces[key]??pieces.middle??pieces.top??pieces.left,tokens,'',filters,depth+1);}
  throw Error('Unknown sprite directive '+v[0]);
 }
 const key=tokens.find(t=>Object.hasOwn(v,t))??(Object.hasOwn(v,'normal')?'normal':Object.hasOwn(v,'one')?'one':Object.keys(v)[0]);
 return resolve(v[key],tokens.filter(t=>t!==key),part,filters,depth+1);
}
export function decodeSource(code){
 let palette=data.paletteDefault.map((_,i)=>i),digits=2,i=0,out=[];
 while(i<code.length){
  if(code[i]==='p'){const end=code.indexOf(']',i);palette=code.slice(i+2,end).split(',').map(Number);digits=String(palette.length-1).length;i=end+1;continue;}
  const run=code[i]==='x';if(run)i++;
  const index=Number(code.slice(i,i+digits));i+=digits;
  let count=1;if(run){const end=code.indexOf(',',i);count=Number(code.slice(i,end));if(end<0||!Number.isInteger(count)||count<0||count>100000)throw Error('Bad sprite run');i=end+1;}
  if(palette[index]===undefined)throw Error('Bad source palette');for(let n=0;n<count;n++)out.push(palette[index]);
 }return out;
}
const cache=new Map();
export function sourcePixels(key){
 if(cache.has(key))return cache.get(key);
 const [,group,type,setting='',part='']=key.split('|'),tokens=setting.split(/\s+/).filter(Boolean);
 const {code,filters}=resolve(data.library[group]?.[type],tokens,part);
 const values=decodeSource(code),w=widths[type]||16;
 if(values.length%w)throw Error('Sprite width mismatch '+key+': '+values.length+'/'+w);
 const pixels=values.map(n=>{for(const f of filters){const table=data.filters[f]?.[1];n=Number(table?.[String(n).padStart(2,'0')]??n);}return data.paletteDefault[n];});
 const result={w,h:values.length/w,pixels};cache.set(key,result);return result;
}
export const sourceGroups=Object.fromEntries(Object.entries(data.library).map(([k,v])=>[k,Object.keys(v)]));
