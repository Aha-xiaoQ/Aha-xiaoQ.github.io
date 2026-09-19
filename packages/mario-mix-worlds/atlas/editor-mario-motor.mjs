import {createPlatformMotor as host} from './runtime/platform-motor.mjs';
// Constants and held-jump rules match games/mario-mix/classic-mix.js at 60 Hz.
export function createPlatformMotor(){
 const overlap=host().overlap,approach=(v,t,a)=>v+Math.max(-a,Math.min(a,t-v));
 function create(c,s){return {...host().create(c,s),airCap:1.5,jumpG:.125,fallG:.4375,jumpBuffer:0,power:0,anim:0,crouch:false};}
 function step(p,i,c,w){
  const out=[],ground=p.grounded,axis=Math.sign(i.x||0);p.headHit=null;p.swimming=!!w.swimming;p.swimStroke=Math.max(0,(p.swimStroke||0)-1);
  const carriedBy=ground?p.support:null;
  if(ground&&p.support){const q=w.solids.find(q=>q.id===p.support);if(q){p.x+=q.dx||0;p.y+=q.dy||0;}}
  if(p.power){const crouch=!!i.down&&ground,target=crouch?16:28;if(target!==p.h){const body={...p,y:p.y+p.h-target,h:target};if(target<p.h||!w.solids.some(q=>!q.hidden&&q.collision==='solid'&&overlap(body,q))){p.y=body.y;p.h=target;p.crouch=crouch;}}}else p.crouch=false;
  if(i.jumpPressed)p.jumpBuffer=3;else if(p.jumpBuffer)p.jumpBuffer--;
  const cap=ground?(i.run?2.5:1.5):p.airCap,acc=i.run||(!ground&&p.airCap>1.5)?.0556640625:.037109375;
  if(axis&&!p.crouch){p.vx=approach(p.vx,axis*cap,p.vx&&Math.sign(p.vx)!==axis?.1015625:acc);p.facing=axis;}else if(ground)p.vx=approach(p.vx,0,.05078125);
  if(w.swimming&&i.jumpPressed){p.swimStroke=24;p.vy=-2.5;p.jumpBuffer=0;p.grounded=false;out.push('jump');}
  if(!w.swimming&&p.jumpBuffer&&ground){const s=Math.abs(p.vx);p.vy=s>2.25?-5.1666667:-4.1333333;p.jumpG=s>2.25?.15625:s>1?.1171875:.125;p.fallG=s>2.25?.5625:s>1?.375:.4375;p.airCap=s>1.5?2.5:1.5;p.jumpBuffer=0;p.grounded=false;out.push('jump');}
  p.vy=w.swimming?Math.min(1.5,p.vy+.075):Math.min(4.25,p.vy+(p.vy<0&&i.jump?p.jumpG:p.fallG));if(w.swimming){p.vx=Math.max(-1.5,Math.min(1.5,p.vx));if(p.y<16){p.y=16;p.vy=Math.max(0,p.vy);}}
  p.x+=p.vx;for(const q of w.solids)if(!q.hidden&&q.collision==='solid'&&overlap(p,q)){if(p.vx>0)p.x=q.x-p.w;else if(p.vx<0)p.x=q.x+q.w;p.vx=0;}
  p.x=Math.max(0,Math.min(w.width-p.w,p.x));const bottom=p.y+p.h,top=p.y,vy=p.vy;p.y+=vy;p.grounded=false;p.support=null;
  const hits=[];for(const q of [...w.solids].sort((a,b)=>a.y-b.y)){
   if(p.x+p.w<=q.x||p.x>=q.x+q.w)continue;
   if(!q.hidden&&vy>=0&&bottom<=q.y-(carriedBy===q.id?0:q.dy||0)+1.01&&p.y+p.h>=q.y){p.y=q.y-p.h;p.vy=0;p.grounded=true;p.support=q.id;p.airCap=i.run?2.5:1.5;break;}
   if(q.collision==='solid'&&vy<0&&top>=q.y+q.h-1&&p.y<q.y+q.h)hits.push(q);
  }
  if(hits.length){const q=hits.sort((a,b)=>Math.abs(a.x+a.w/2-p.x-p.w/2)-Math.abs(b.x+b.w/2-p.x-p.w/2))[0];p.y=q.y+q.h;p.vy=.5;p.headHit=q.id;}
  // Held run can skim a one-tile floor gap without a full-speed run-up.
  if(!w.swimming&&!p.grounded&&ground&&vy>=0&&i.run&&axis&&Math.sign(p.vx)===axis){
   const row=w.solids.filter(q=>!q.hidden&&Math.abs(q.y-bottom)<.01).sort((a,b)=>a.x-b.x);
   for(let n=1;n<row.length;n++){const a=row[n-1],b=row[n],gap=b.x-a.x-a.w;if(gap>0&&gap<=16&&p.x+p.w>a.x+a.w&&p.x<b.x){p.y=bottom-p.h;p.vy=0;p.grounded=true;break;}}
  }
  p.anim=(p.anim||0)+Math.abs(p.vx);
  return out;
 }
 return {create,step,overlap};
}
