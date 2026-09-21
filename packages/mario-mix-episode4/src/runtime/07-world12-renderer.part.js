/* v0.10 — focused repair on the user's exact v0.9 upload.
 * No replacement of the v0.9 entrance, positional ending, music or map data.
 * Shield PNGs: newagebegins/BattleCity a1b1741782dcf23fc814e9a7abc5f383900b2cda.
 * CastleRailingFilled and small-castle assembly: umaim/Mario 980c275358704a49f868567aeec5bdfb347c4781.
 * Source-code licensing is not a separate licence for original game artwork.
 */
const R10_VERSION='1.0.0';
const R10_BASE_SHA='2c5fdefedc9da867e06da51152777ea636c5fee2ca5e6cb5a98e422bdc2683db';
const R10_SHIELD_DATA=["iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAC4jAAAuIwF4pT92AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAACVSURBVHja7FfbCsAgCLUx8P//Np/cU7A1xC6CtXkepQ5ejmaJmeEOInoYEDHBBDS+A5xx1p7WHkr21sg1PvcMpJxzU4RaLXu1U86vowENsxFL8NdAmQOjah+dC+t0gTQJrTMh8bpnIBx4acBaCxpPlCDmQJQgXsN9dsLeHbH1/j47ofVWvE8XfP9n9Pvf8QUAAP//AwBARZgJurWBfQAAAABJRU5ErkJggg==","iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAC4jAAAuIwF4pT92AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAB8SURBVHja7FdBDoAwCBvGhP//Fk548jKj2B2EmHIejJbChkTEQMzdHx1UVZB42yi2HUWeIXx7rg0DkmkARYT6lTPABC4amPscrX02N+Z4fRhYVfsqI+c99QyY2SfI75hgGzIBJsBJyNeQf0K2YX8NcDP6/XZ8AAAA//8DAE3RawUWlQdKAAAAAElFTkSuQmCC"];
const r10Ready=Promise.all(R10_SHIELD_DATA.map((data,i)=>new Promise((resolve,reject)=>{
 const id='bc-shield10-'+i,im=new Image();
 im.onload=()=>{R12_SPRITES[id]=im;resolve();};
 im.onerror=()=>reject(new Error('Missing embedded shield frame '+i));
 im.src='data:image/png;base64,'+data;
})));
window.__mixReady=Promise.all([window.__mixReady,r10Ready]);
// The filled central crenellations are an existing source sprite, not a redraw.
const R10_FILLED_RAIL='p[2,5,9]11112220222x15,222122202221x27,122202221x27,1x07,1x27,1x27,1x27,1x27,1x27,1x27,12222000x19,0000';
decoded.set('castle_railing_filled10',{w:16,h:8,pixels:decodeClassic(R10_FILLED_RAIL)});
function r10DrawShield(g,x,y){
 if(hero!=='tank'||!r12?.tank?.shield||mode==='dying'||r12.finish09?.hidden)return;
 // Alternate the two white pixel-outline frames every two simulated ticks.
 // No alpha bubble, no blinking vehicle; pausing freezes this animation.
 const phase=(Math.floor(r12.ticks/2)&1),im=R12_SPRITES['bc-shield10-'+phase];
 if(!im)return;
 g.save();g.imageSmoothingEnabled=false;
 g.drawImage(im,0,0,32,32,Math.round(x-2),Math.round(y-2),16,16);
 g.restore();
}
// Rebuilt shovel walls must never imprison an actor occupying a damaged cell.
function r10ClearNewFortifications(){
 if(hero!=='tank'||r12?.area!=='defense'||!r03Challenge)return;
 const bodies=[player,...ninja.foes.filter(e=>!e.dead&&!e.spawn)];
 for(const body of bodies){
  if(!r12TankCollides(body))continue;
  const origin={x:body.x,y:body.y};let chosen=null;
  for(let radius=2;radius<=208&&!chosen;radius+=2){
   for(let dx=-radius;dx<=radius&&!chosen;dx+=2){
    const dy=radius-Math.abs(dx);
    for(const sign of dy?[1,-1]:[1]){
     const q={...body,x:origin.x+dx,y:origin.y+dy*sign};
     if(r12TankCollides(q)||bodies.some(other=>other!==body&&overlap(q,other)))continue;
     chosen=q;break;
    }
   }
  }
  if(chosen){body.x=chosen.x;body.y=chosen.y;body.vx=body.vy=0;
   r12Event('shovel-safe-position',{player:body===player,from:origin,to:{x:body.x,y:body.y}});}
 }
}
const r10GiveBefore=r12Give;
r12Give=function(type){
 const result=r10GiveBefore(type);
 if(hero==='tank'&&type==='shovel')r10ClearNewFortifications();
 return result;
};
const r10FixedBefore=fixedUpdate;
fixedUpdate=function(){
 const defense=hero==='tank'&&r12?.area==='defense',oldShovel=defense?r12.tank.shovel:0;
 r10FixedBefore();
 if(defense&&r12?.area==='defense'&&oldShovel>0&&!r12.tank.shovel)r10ClearNewFortifications();
};
if(window.__relayTest){
 __relayTest.give=t=>r12Give(t);
 __relayTest.r10=()=>({version:R10_VERSION,baseSha256:R10_BASE_SHA,
  shieldPhase:r12?.tank?.shield?(Math.floor(r12.ticks/2)&1):null,
  shieldFrames:R10_SHIELD_DATA.length,supplies:ninja?.drops?.filter(d=>d.fixedSupply10).map(d=>({type:d.type,x:d.x,y:d.y})),
  guard:r03Challenge?.blocks?.filter(b=>b.shovelGuard).map(b=>({...b}))||[],
  exitSteel:false,finish:r12?.finish09?{...r12.finish09}:null});
}

/* Dependency-free WebGL renderer. True depth testing; no projected-rectangle fake 3D.
 * Steve texture: Mojang bedrock-samples. Environment/armor/boss textures and motion
 * below are visibly game-inspired browser adaptations, not extracted original assets. */
class R04VoxelRenderer {
 constructor(steve){this.canvas=document.createElement('canvas');this.canvas.width=768;this.canvas.height=720;const gl=this.gl=this.canvas.getContext('webgl',{alpha:false,antialias:true,preserveDrawingBuffer:true});if(!gl){this.software=true;this.canvas.width=384;this.canvas.height=360;this.cpu=this.canvas.getContext('2d');this.makeAtlas(steve);this.texels=this.atlas.getContext('2d').getImageData(0,0,256,256).data;this.image=this.cpu.createImageData(384,360);this.zbuf=new Float32Array(384*360);this.v=[];this.ready=true;return;}
 const compile=(type,src)=>{const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;};
 const vs=compile(gl.VERTEX_SHADER,'attribute vec3 aPosition;attribute vec2 aUV;attribute vec3 aColor;uniform mat4 uMatrix;varying vec2 vUV;varying vec3 vColor;varying float vDepth;void main(){gl_Position=uMatrix*vec4(aPosition,1.0);vDepth=gl_Position.w;vUV=aUV;vColor=aColor;}');
 const fs=compile(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 vUV;varying vec3 vColor;varying float vDepth;uniform sampler2D uAtlas;uniform vec3 uFog;void main(){vec4 tex=texture2D(uAtlas,vUV);if(tex.a<0.1)discard;float fog=smoothstep(29.0,56.0,vDepth);gl_FragColor=vec4(mix(tex.rgb*vColor,uFog,fog),1.0);}');
 const prog=this.program=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));gl.useProgram(prog);this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);for(const[name,n,off]of [['aPosition',3,0],['aUV',2,12],['aColor',3,20]]){const a=gl.getAttribLocation(prog,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,n,gl.FLOAT,false,32,off);}this.uMatrix=gl.getUniformLocation(prog,'uMatrix');this.uFog=gl.getUniformLocation(prog,'uFog');this.tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.tex);this.makeAtlas(steve);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.atlas);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.uniform1i(gl.getUniformLocation(prog,'uAtlas'),0);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);this.v=[];this.ready=true;}
 makeAtlas(steve){const c=this.atlas=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#fff';g.fillRect(0,0,256,256);this.tiles={};const palettes={grass:[94,140,56],dirt:[124,91,65],stone:[130,132,127],wood:[168,137,83],log:[103,82,51],leaves:[61,111,57],brick:[135,128,118],diamond:[67,208,210],dark:[44,43,50],obsidian:[43,32,58],portal:[132,61,197],white:[239,236,218],red:[162,56,49],gold:[228,189,78],robe:[60,57,62],skin:[148,153,151],green:[87,155,73],eye:[232,234,215],ice:[146,211,223],book:[101,70,50],shadow:[78,85,75]};let n=0;
 for(const[key,col]of Object.entries(palettes)){const x=n%12*16,y=Math.floor(n/12)*16;this.tiles[key]=[x,y,16,16];for(let j=0;j<16;j++)for(let i=0;i<16;i++){const seed=((i*197+j*373+n*911)^((i+j*13)*127))%23-11;let rgb=col.map(v=>Math.max(0,Math.min(255,v+seed)));if(key==='wood'&&(j%4===0||i===((Math.floor(j/4)%2)*8)&&j%4<3))rgb=rgb.map(v=>v*.73);if(key==='log'&&i%5===0)rgb=rgb.map(v=>v*.65);if(key==='brick'&&(j%8===0||i===(Math.floor(j/8)%2)*8))rgb=[77,82,82];if(key==='diamond'&&(i+j)%7===0)rgb=[170,244,230];if(key==='portal'){const w=Math.sin(i*.9+j*.5)*18;rgb=[125+w,49+w,177+w];}if(key==='book'&&j>2&&j<13){const cols=[[99,66,44],[167,98,70],[96,115,72],[66,113,128],[163,137,81]];rgb=cols[Math.floor(i/3)%5];}g.fillStyle=`rgb(${rgb.join(',')})`;g.fillRect(x+i,y+j,1,1);}n++;}
 // Original Steve atlas retained without recoloring or replacing the face.
 g.drawImage(steve,0,0,64,64,0,64,64,64);this.steveOffset=[0,64];
 this.tiles.grassSide=[192,0,16,16];g.drawImage(c,...this.tiles.dirt,192,0,16,16);g.drawImage(c,...this.tiles.grass,192,0,16,4);
 this.tiles.ore=[208,0,16,16];g.drawImage(c,...this.tiles.stone,208,0,16,16);g.fillStyle='#58d3df';[[3,4],[9,3],[7,9],[12,12],[3,12]].forEach(([x,y])=>g.fillRect(208+x,y,2,3));
 this.tiles.evokerFace=[80,64,16,16];g.fillStyle='#9b9c92';g.fillRect(80,64,16,16);g.fillStyle='#393c38';g.fillRect(82,69,12,2);g.fillStyle='#e6e7d7';g.fillRect(83,71,3,2);g.fillRect(89,71,3,2);g.fillStyle='#4c856f';g.fillRect(84,71,1,2);g.fillRect(89,71,1,2);g.fillStyle='#626458';g.fillRect(86,72,3,6);g.fillStyle='#35352e';g.fillRect(84,78,7,1);
 this.tiles.creeperFace=[96,64,16,16];g.drawImage(c,...this.tiles.green,96,64,16,16);g.fillStyle='#26392f';g.fillRect(98,68,4,4);g.fillRect(106,68,4,4);g.fillRect(102,71,4,5);g.fillRect(100,75,3,3);g.fillRect(105,75,3,3);
 this.tiles.zombieFace=[112,64,16,16];g.drawImage(c,...this.tiles.green,112,64,16,16);g.fillStyle='#283c2e';g.fillRect(114,70,4,2);g.fillRect(122,70,4,2);g.fillRect(117,77,6,2);
 this.tiles.sign=[80,96,64,16];g.fillStyle='#72583e';g.fillRect(80,96,64,16);g.fillStyle='#f3dfaa';g.font='bold 10px monospace';g.textAlign='center';g.fillText('BUILD →',112,108);
 }
 matrix(eye,target){const norm=v=>{const d=Math.hypot(...v)||1;return v.map(x=>x/d)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((t,v,i)=>t+v*b[i],0);const z=norm(eye.map((v,i)=>v-target[i])),x=norm(cross([0,1,0],z)),y=cross(z,x),view=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];const f=1/Math.tan(.68/2),a=this.canvas.width/this.canvas.height,near=.1,far=80,proj=[f/a,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0],out=Array(16).fill(0);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=proj[k*4+r]*view[c*4+k];return new Float32Array(out);}
 face(points,rect,light=1,tint=[1,1,1]){const [x,y,w,h]=rect,eps=.08;const uv=[[x+eps,y+h-eps],[x+w-eps,y+h-eps],[x+w-eps,y+eps],[x+eps,y+eps]];for(const i of [0,1,2,0,2,3]){const p=points[i],v=uv[i];this.v.push(p[0],p[1],p[2],v[0]/256,v[1]/256,light*tint[0],light*tint[1],light*tint[2]);}}
 box(x,y,z,w,h,d,mat='stone',opt={}){const a=w/2,b=h/2,c=d/2;let v=[[-a,-b,c],[a,-b,c],[a,b,c],[-a,b,c],[-a,-b,-c],[a,-b,-c],[a,b,-c],[-a,b,-c]];const ry=opt.ry||0,rx=opt.rx||0,rz=opt.rz||0;const co=Math.cos(ry),si=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx),cz=Math.cos(rz),sz=Math.sin(rz);v=v.map(([u,v,t])=>{if(opt.pivot){u+=opt.pivot[0];v+=opt.pivot[1];t+=opt.pivot[2];}let yy=v*cx-t*sx,zz=v*sx+t*cx;let xx=u*cz-yy*sz;yy=u*sz+yy*cz;return[x+xx*co+zz*si,y+yy,z-xx*si+zz*co]});
 const faces=[[0,1,2,3],[5,4,7,6],[1,5,6,2],[4,0,3,7],[3,2,6,7],[4,5,1,0]],names=['front','back','right','left','top','bottom'],sh=[.84,.66,.77,.93,1,.54];for(let i=0;i<6;i++){const m=typeof mat==='string'?mat:mat[names[i]]||mat.side||'stone',rect=Array.isArray(m)?m:this.tiles[m];this.face(faces[i].map(j=>v[j]),rect,sh[i],opt.tint||[1,1,1]);}}
 wire(x,y,z,w,h,d,good=true){const col=good?'diamond':'red',t=.035;for(const i of [-1,1])for(const j of [-1,1]){this.box(x,y+i*h/2,z+j*d/2,w,t,t,col);this.box(x+i*w/2,y,z+j*d/2,t,h,t,col);this.box(x+i*w/2,y+j*h/2,z,t,t,d,col);}}
 skin(x,y,w,h){return[x,y+64,w,h];}
 humanoid(p,kind='steve',tick=0,tool=0,flash=false){const yaw=Math.atan2(p.dirX??1,p.dirZ??0),walk=(Math.abs(p.vx||0)+Math.abs(p.vz||0))>.015?Math.sin(p.walk||tick/7)*.52:0,atk=(p.attack||0)/18,sw=atk?Math.sin((1-atk)*Math.PI):0,py=p.y;const tint=flash?[1.6,.8,.8]:[1,1,1];
 const bone=(ox,oy,oz,w,h,d,mat,rx=0)=>{const X=p.x+ox*Math.cos(yaw)+oz*Math.sin(yaw),Z=p.z-ox*Math.sin(yaw)+oz*Math.cos(yaw);this.box(X,py+oy,Z,w,h,d,mat,{ry:yaw,rx,tint});};
 if(kind==='steve'){
 const head={front:this.skin(8,8,8,8),back:this.skin(24,8,8,8),left:this.skin(0,8,8,8),right:this.skin(16,8,8,8),top:this.skin(8,0,8,8),bottom:this.skin(16,0,8,8)};
 const leg={front:this.skin(4,20,4,12),back:this.skin(12,20,4,12),left:this.skin(0,20,4,12),right:this.skin(8,20,4,12),top:this.skin(4,16,4,4),bottom:this.skin(8,16,4,4)};
 const arm={front:this.skin(44,20,4,12),back:this.skin(52,20,4,12),left:this.skin(40,20,4,12),right:this.skin(48,20,4,12),top:this.skin(44,16,4,4),bottom:this.skin(48,16,4,4)};
 bone(-.145,.34,Math.sin(walk)*.13,.25,.67,.27,leg,walk);bone(.145,.34,-Math.sin(walk)*.13,.25,.67,.27,leg,-walk);bone(-.145,.16,Math.sin(walk)*.17,.27,.31,.31,'diamond',walk);bone(.145,.16,-Math.sin(walk)*.17,.27,.31,.31,'diamond',-walk);bone(0,1.04,0,.56,.65,.31,'diamond');bone(0,1.63,0,.5,.5,.5,head);bone(0,1.9,0,.55,.12,.55,'diamond');bone(-.245,1.75,0,.08,.26,.54,'diamond');bone(.245,1.75,0,.08,.26,.54,'diamond');bone(0,1.78,-.245,.5,.2,.09,'diamond');bone(-.415,1.08,-Math.sin(walk)*.16,.25,.67,.27,arm,-walk);bone(.415,1.09,.18*sw,.25,.67,.27,arm,walk-sw*1.5);bone(-.415,1.29,-Math.sin(walk)*.08,.29,.28,.31,'diamond',-walk);bone(.415,1.3,.1*sw,.29,.28,.31,'diamond',walk-sw*.9);
 const ox=.43,oz=.27+sw*.6;if(tool===0){bone(ox,.73,oz,.08,.24,.08,'wood',-sw*1.7);bone(ox,.84,oz+.06,.4,.08,.1,'diamond',-sw*1.7);bone(ox,1.15-sw*.24,oz+.12+sw*.25,.13,.66,.07,'diamond',-sw*1.7);}else if(tool===1){bone(ox,.77,.3,.36,.36,.36,'wood');}else{bone(ox,.94,oz,.08,.6,.08,'wood',-sw*1.6);bone(ox,1.23-sw*.2,oz+.07,.57,.09,.11,'diamond',-sw*1.6);bone(ox-.25,1.14-sw*.2,oz+.07,.1,.2,.11,'diamond',-sw*1.6);}
 }else if(kind==='zombie'){bone(0,1.04,0,.56,.64,.3,'green');bone(-.15,.35,0,.25,.65,.27,'dark',walk);bone(.15,.35,0,.25,.65,.27,'dark',-walk);bone(0,1.62,0,.52,.5,.5,{front:'zombieFace',side:'green',top:'green'});bone(-.42,1.14,.28,.24,.68,.24,'green',-1.4);bone(.42,1.14,.28,.24,.68,.24,'green',-1.4);
 }else if(kind==='evoker'){bone(0,.68,0,.66,1.35,.44,'robe');bone(0,1.6,0,.57,.62,.53,{front:'evokerFace',side:'skin',top:'skin'});bone(0,1.48,.33,.14,.33,.18,'skin');bone(0,.15,.23,.13,1.3,.05,'gold');const cast=p.casting;bone(-.47,cast?1.63:1.03,cast?.02:.3,.22,.73,.26,'robe',cast?-.3:-1.3);bone(.47,cast?1.63:1.03,cast?.02:.3,.22,.73,.26,'robe',cast?-.3:-1.3);bone(-.47,cast?2.0:1.06,cast?.04:.62,.2,.2,.22,'skin');bone(.47,cast?2.0:1.06,cast?.04:.62,.2,.2,.22,'skin');
 }else if(kind==='vex'){bone(0,1.1+Math.sin(tick/9)*.1,0,.25,.6,.2,'ice');bone(0,1.51+Math.sin(tick/9)*.1,0,.35,.35,.3,'white');bone(-.35,1.3,-.16,.44,.48,.035,'ice',Math.sin(tick/5)*.65);bone(.35,1.3,-.16,.44,.48,.035,'ice',-Math.sin(tick/5)*.65);bone(.22,1.08,.2,.05,.45,.05,'white');}
 }
 creeper(e,s){const pulse=e.wind?1+Math.sin(e.wind/3)*.05:1;this.box(e.x,e.y+.65,e.z,.53,1.0,.38,'green');this.box(e.x,e.y+1.48,e.z,.68*pulse,.64*pulse,.61*pulse,{front:'creeperFace',side:'green',top:'green'});for(const x of [-.22,.22])for(const z of [-.22,.22])this.box(e.x+x,e.y+.2,e.z+z,.27,.4,.27,'green');if(e.wind)this.wire(e.x,e.y+.85,e.z,.82,1.8,.72,e.wind%14>7);}
 terrain(s){const px=s.p.x;
 for(const q of s.platforms){if(q.x>px+27||q.x+q.w<px-23)continue;const z0=q.z-q.d/2;for(let x=Math.max(q.x,Math.floor(px-24));x<Math.min(q.x+q.w,px+27);x++){const width=Math.min(1,q.x+q.w-x);for(let z=z0;z<q.z+q.d/2;z++){this.box(x+width/2,q.y-.5,z+.5,width,1,1,s.secret?{top:'wood',side:'wood'}:q.type==='stone'?'brick':{top:'grass',side:'grassSide',bottom:'dirt'});if(q.type==='floor')this.box(x+width/2,q.y-1.5,z+.5,width,1,1,s.secret?'dark':'stone');}}
 if(q.type==='tree')this.box(q.x+q.w/2,q.y/2-3,1,1.15,q.y+6,1.15,'log');}
 if(!s.secret){for(let x=Math.max(3,Math.floor(px-24));x<Math.min(163,px+27);x+=.5){if(x>=86&&x<89)continue;const h=this.ramp(x+.25),h0=this.ramp(x),h1=this.ramp(x+.5);if(h===null)continue;const a=Math.atan2(h1-h0,.5);this.box(x+.25,h-.12,-3.2,.5/Math.cos(a),.18,1.5,'wood',{rz:a});if(Math.floor(x*2)%6===0){this.box(x+.25,h-.75,-3.85,.12,1.3,.12,'log');this.box(x+.25,h-.75,-2.55,.12,1.3,.12,'log');}}
 for(let i=0;i<6;i++){const x=Math.floor(px/25)*25-30+i*25;this.box(x,11+i%2*2,-13,6,1.1,3,'white');this.box(x+2,12+i%2*2,-13,3,1,2,'white');}}
 for(const t of s.trees){if(Math.abs(t.x-px)>24)continue;this.box(t.x,t.y+t.h/2,t.z,.48,t.h,.48,'log');this.box(t.x,t.y+t.h-.2,t.z,2.4,1.3,2.3,'leaves');this.box(t.x,t.y+t.h+.55,t.z,1.7,.9,1.7,'leaves');this.box(t.x-.65,t.y+t.h-.5,t.z+.1,1.4,1.2,1.4,'leaves');}
 for(const b of s.built)this.box(b.x+.5,b.y-.5,b.z,1,1,1,'wood');for(const o of s.ore)if(o.hp>0){this.box(o.x,o.y+.45,o.z,.9,.9,.9,'ore');if(o.hp===1)this.wire(o.x,o.y+.46,o.z,.92,.92,.92,false);}
 if(!s.secret&&Math.abs(px-84)<24){const y=this.ramp(84);this.box(84,y+.7,-.4,.12,1.4,.12,'log');this.box(84,y+1.25,-.4,2.0,.55,.1,{front:'sign',back:'wood',side:'wood',top:'wood'});}
 }
 ramp(x){const nodes=[[3,0],[14,0],[20,.5],[25,2],[28.5,4],[37.5,2.5],[43.5,4.5],[52,0],[62,4],[67.5,0],[71.5,2],[79,3.5],[86,2.5],[94,2],[100,1],[108,3],[114.5,0],[118,2],[124,2],[131,0],[145,0],[154,0],[163,0]];for(let i=1;i<nodes.length;i++){const a=nodes[i-1],b=nodes[i];if(x>=a[0]&&x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return null;}
 portal(t,secret){const x=t.x,y=t.y,z=t.z;for(const dx of [-1,1])this.box(x+dx,y+1.65,z,.45,3.3,.55,'obsidian');this.box(x,y+3.2,z,2.4,.45,.55,'obsidian');this.box(x,y+.05,z,2.4,.2,.6,'obsidian');this.box(x,y+1.6,z,1.6,2.8,.09,'portal');}
 castle(x){for(let i=-3;i<=3;i++)for(let j=0;j<3;j++){if(i===0&&j<2)continue;this.box(x+i,j+.5,0,1,1,2.5,'brick');}for(let i=-3;i<=3;i+=2)this.box(x+i,3.3,0,1,.6,2.5,'brick');for(const t of [-2.5,2.5]){this.box(x+t,2.0,-.6,1.3,4,1.3,'brick');this.box(x+t,4.2,-.6,1.5,.5,1.5,'brick');}this.box(x,1.1,-1.2,.9,2.2,.05,'dark');}
 mansion(s){this.box(12,2.7,-7,24,5.4,.4,'dark');for(let i=1;i<24;i+=2)this.box(i,1.9,-6.65,1.6,3.8,.5,'book');for(const o of s.obstacles)this.box(o.x,o.y+o.h/2,o.z,o.w,o.h,o.d,'log');for(let i=0;i<5;i++){this.box(17+i*.7,.02,0,.65,.04,6,'red');}for(const x of [4,12,20]){this.box(x,3.6,-6.1,.15,.7,.15,'wood');this.box(x,4.0,-6.1,.27,.35,.25,'gold');}this.box(24,2,-3,.4,4,8,'wood');}
 rasterize(m,fog){const w=this.canvas.width,h=this.canvas.height,data=this.image.data,depth=this.zbuf,t=this.texels,v=this.v,fr=fog[0]*255,fg=fog[1]*255,fb=fog[2]*255;for(let i=0;i<depth.length;i++){const p=i*4;data[p]=fr;data[p+1]=fg;data[p+2]=fb;data[p+3]=255;depth[i]=1e9;}
  // Perspective-correct textured triangles and an actual per-pixel depth buffer.
  const project=o=>{const x=v[o],y=v[o+1],z=v[o+2],cw=m[3]*x+m[7]*y+m[11]*z+m[15];if(cw<=.04)return null;const k=1/cw;return[(m[0]*x+m[4]*y+m[8]*z+m[12])*k*w*.5+w*.5,h*.5-(m[1]*x+m[5]*y+m[9]*z+m[13])*k*h*.5,(m[2]*x+m[6]*y+m[10]*z+m[14])*k,k,v[o+3]*k,v[o+4]*k,v[o+5],v[o+6],v[o+7]];};
  for(let o=0;o<v.length;o+=24){const a=project(o),b=project(o+8),c=project(o+16);if(!a||!b||!c)continue;const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<.03)continue;const x0=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),x1=Math.min(w-1,Math.ceil(Math.max(a[0],b[0],c[0]))),y0=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),y1=Math.min(h-1,Math.ceil(Math.max(a[1],b[1],c[1])));if(x0>x1||y0>y1)continue;const da=(b[1]-c[1])/den,db=(c[1]-a[1])/den;
   for(let y=y0;y<=y1;y++){let wa=((b[1]-c[1])*(x0+.5-c[0])+(c[0]-b[0])*(y+.5-c[1]))/den,wb=((c[1]-a[1])*(x0+.5-c[0])+(a[0]-c[0])*(y+.5-c[1]))/den;for(let x=x0;x<=x1;x++,wa+=da,wb+=db){const wc=1-wa-wb;if(wa<-.00001||wb<-.00001||wc<-.00001)continue;const z=wa*a[2]+wb*b[2]+wc*c[2],i=y*w+x;if(z>=depth[i]||z< -1||z>1)continue;const iw=wa*a[3]+wb*b[3]+wc*c[3],u=(wa*a[4]+wb*b[4]+wc*c[4])/iw,vt=(wa*a[5]+wb*b[5]+wc*c[5])/iw,ti=((Math.max(0,Math.min(255,vt*256|0))*256)+Math.max(0,Math.min(255,u*256|0)))*4;if(t[ti+3]<26)continue;depth[i]=z;const q=i*4;let f=Math.max(0,Math.min(1,(1/iw-29)/27));f=f*f*(3-2*f);data[q]=t[ti]*a[6]*(1-f)+fr*f;data[q+1]=t[ti+1]*a[7]*(1-f)+fg*f;data[q+2]=t[ti+2]*a[8]*(1-f)+fb*f;}}}
  this.cpu.putImageData(this.image,0,0);
 }

 render(s){const gl=this.gl;this.v=[];const hidden=s.secret;const fog=hidden?[.16,.16,.22]:[.57,.76,.85];if(gl){gl.viewport(0,0,768,720);gl.clearColor(...fog,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);}const x=s.p.x;
 this.terrain(s);if(hidden)this.mansion(s);this.portal(s.portal,hidden);
 if(!hidden&&x>130){this.box(152.5,2.5,0,.12,5,.12,'wood');const fy=s.ending?s.ending.flagY:4.5;this.box(151.9,fy,0,1.1,.6,.055,'green');this.box(152.5,5.1,0,.25,.25,.25,'gold');this.castle(160);}if(!hidden&&x<20)this.castle(-1.8);
 for(const h of s.hazards){if(h.type==='fang'){if(!h.active)this.wire(h.x,h.y+.02,h.z,1.1,.04,1.1,false);else {const a=Math.min(1,(h.age-h.delay)/8);this.box(h.x-.16,h.y+.5*a,h.z,.16,.9*a,.42,'white',{rz:-.35});this.box(h.x+.16,h.y+.5*a,h.z,.16,.9*a,.42,'white',{rz:.35});this.box(h.x,h.y+.1,h.z,.5,.2,.55,'dark');}}else if(h.type==='blast')this.wire(h.x,h.y+.2,h.z,2+h.age*.08,.3,2+h.age*.08,false);}
 for(const e of s.foes){if(e.dead||Math.abs(e.x-x)>25)continue;if(e.kind==='creeper')this.creeper(e,s);else this.humanoid({...e,dirX:s.p.x-e.x,dirZ:s.p.z-e.z,casting:e.mode==='cast',walk:s.ticks/7,vx:.1,vz:0},e.kind,s.ticks,0,e.flash%4>1);}
 this.humanoid(s.p,'steve',s.ticks,s.tool,s.p.invuln>0&&s.ticks%8<3);
 if(s.target3){const t=s.target3;this.wire(t.x+.5,t.y-.5,t.z,1.03,1.03,1.03,t.valid);}
 const eye=[x-7.5,9.3+Math.max(0,s.p.y)*.75,14.0+s.p.z*.25],target=[x+3,1.4+Math.max(0,s.p.y)*.48,s.p.z*.3];const matrix=this.matrix(eye,target);if(this.software){this.rasterize(matrix,fog);return;}gl.useProgram(this.program);gl.uniformMatrix4fv(this.uMatrix,false,matrix);gl.uniform3fv(this.uFog,new Float32Array(fog));gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.v),gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,this.v.length/8);}
}
