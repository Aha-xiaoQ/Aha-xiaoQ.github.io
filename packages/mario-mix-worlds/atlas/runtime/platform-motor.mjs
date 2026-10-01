/** Developer-stage movement profile. Not a replacement for Terraria/SMB physics.
 * Fixed 60 Hz; one-way landing, solid collision, carried moving surfaces, explicit
 * double jump and downward platform drop. World/character data is caller-owned.
 */
export function createPlatformMotor() {
  const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function create(character,spawn){const m=character.motion;return{x:spawn.x,y:spawn.y,w:m.width,h:m.height,vx:0,vy:0,grounded:false,facing:1,jumps:0,dropTicks:0,support:null};}
  function step(p,input,character,world){
    const m=character.motion,events=[];
    if(p.grounded&&p.support){const support=world.solids.find(q=>q.id===p.support);if(support){p.x+=support.dx||0;p.y+=support.dy||0;}}
    if(p.dropTicks)p.dropTicks--;
    const axis=clamp(Number(input.x)||0,-1,1),target=axis*m.speed;
    p.vx+=clamp(target-p.vx,-m.acceleration,m.acceleration);if(axis)p.facing=Math.sign(axis);
    if(input.jumpPressed&&input.down&&p.grounded&&character.capabilities.includes('platform-drop')&&world.solids.find(q=>q.id===p.support)?.collision==='oneway'){
      p.dropTicks=14;p.grounded=false;p.y+=1;p.vy=Math.max(1,p.vy);p.support=null;
    }else if(input.jumpPressed&&character.capabilities.includes('jump')&&(p.grounded||(character.capabilities.includes('double-jump')&&p.jumps<2))){p.vy=-m.jumpSpeed;p.grounded=false;p.support=null;p.jumps++;events.push('jump');}
    p.vy=Math.min(m.maxFall,p.vy+m.gravity);
    p.x+=p.vx;for(const q of world.solids)if(q.collision==='solid'&&overlap(p,q)){if(p.vx>0)p.x=q.x-p.w;else if(p.vx<0)p.x=q.x+q.w;p.vx=0;}
    p.x=clamp(p.x,0,world.width-p.w);const bottom=p.y+p.h;p.y+=p.vy;p.grounded=false;p.support=null;
    for(const q of [...world.solids].sort((a,b)=>a.y-b.y)){
      if(p.x+p.w<=q.x||p.x>=q.x+q.w)continue;
      const topPrevious=q.y-(q.dy||0);
      if(p.vy>=0&&bottom<=topPrevious+1.01&&p.y+p.h>=q.y&&!(q.collision==='oneway'&&p.dropTicks)){p.y=q.y-p.h;p.vy=0;p.grounded=true;p.support=q.id;p.jumps=0;break;}
      if(q.collision==='solid'&&p.vy<0&&overlap(p,q)){p.y=q.y+q.h;p.vy=0;}
    }
    return events;
  }
  return Object.freeze({create,step,overlap});
}
