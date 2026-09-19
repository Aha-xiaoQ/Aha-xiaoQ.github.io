// R05 bridge: stays INSIDE the original game's closure, not an external script.
// Only __mmR05 calls are new. Collision scope and state mutations stay here.
let billAimX=1,billAimY=0;
let billAimDown=false,billDropRow=null,billDropCollision=false,billDownJumpHeld=false;
function resetBillControls(){billAimX=1;billAimY=0;billAimDown=false;billDropRow=null;billDropCollision=false;billDownJumpHeld=false;}
function billPassablePlatform(t){return __mmR05.isBillPassablePlatform(t);}
const billSolidQuery=solids;
solids=function(box,hidden=false){
  const hits=billSolidQuery(box,hidden);
  return billDropCollision&&billDropRow!==null
    ? hits.filter(t=>t.y!==billDropRow||!billPassablePlatform(t)) : hits;
};
const billMoveBody=moveBody;
moveBody=function(body,dx,dy,isPlayer=false){
  if(hero!=='bill'||!isPlayer||body!==player||billDropRow===null)
    return billMoveBody(body,dx,dy,isPlayer);
  billDropCollision=true;
  try{billMoveBody(body,dx,dy,isPlayer);}finally{billDropCollision=false;}
  if(body.y>=(billDropRow+1)*T)billDropRow=null;
};
function beginBillDescent(input){
  const intent=__mmR05.billDescentIntent(input,billDownJumpHeld,player,room);
  billDownJumpHeld=intent.held;
  if(!intent.attempt)return false;
  const foot=player.y+player.h;
  const support=billSolidQuery({x:player.x,y:foot,w:player.w,h:1});
  if(!support.length||!support.every(t=>billPassablePlatform(t)&&Math.abs(t.y*T-foot)<1))return false;
  billDropRow=support[0].y;player.grounded=false;player.vy=.7;
  player.crouch=false;jumpBuffer=0;return true;
}
function updateBillAim(input){
  const aim=__mmR05.resolveBillAim(input,player);
  billAimX=aim.x;billAimY=aim.y;
}
