// Bill's platform descent is a temporary player-only collision exception.
let billAimX=1,billAimY=0;
let billAimDown=false,billDropRow=null,billDropCollision=false,billDownJumpHeld=false;
function resetBillControls(){billAimX=1;billAimY=0;billAimDown=false;billDropRow=null;billDropCollision=false;billDownJumpHeld=false;}
function billPassablePlatform(t){return !t.hidden&&t.y<13&&(t.type==='brick'||t.type==='question');}
const billSolidQuery=solids;solids=function(box,hidden=false){const hits=billSolidQuery(box,hidden);return billDropCollision&&billDropRow!==null?hits.filter(t=>t.y!==billDropRow||!billPassablePlatform(t)):hits;};
const billMoveBody=moveBody;moveBody=function(body,dx,dy,isPlayer=false){if(hero!=='bill'||!isPlayer||body!==player||billDropRow===null)return billMoveBody(body,dx,dy,isPlayer);billDropCollision=true;try{billMoveBody(body,dx,dy,isPlayer);}finally{billDropCollision=false;}if(body.y>=(billDropRow+1)*T)billDropRow=null;};
function beginBillDescent(input){const held=!!input.down&&!!input.jump,edge=held&&!billDownJumpHeld;billDownJumpHeld=held;if(!edge||!player.grounded||room!=='surface')return false;const foot=player.y+player.h,support=billSolidQuery({x:player.x,y:foot,w:player.w,h:1});if(!support.length||!support.every(t=>billPassablePlatform(t)&&Math.abs(t.y*T-foot)<1))return false;billDropRow=support[0].y;player.grounded=false;player.vy=.7;player.crouch=false;jumpBuffer=0;return true;}

function updateBillAim(input){const horizontal=(input.right?1:0)-(input.left?1:0);billAimY=input.down&&(!player.grounded||horizontal)?1:input.up&&!input.down?-1:0;billAimX=billAimY?horizontal:player.facing;}
