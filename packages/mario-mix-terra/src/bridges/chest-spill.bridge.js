// Claim before effects, exactly once in this session. Persistence retains old behavior.
function t21Open(s,c){
 const plan=terraLoot.chest({chest:c,transitioning:s.t11Transition});
 if(!plan.changed)return false;
 Object.assign(c,plan.patch);
 for(const d of plan.drops)t21Drop(s,d.kind,d.count,d.x,d.y,d.extra);
 terraSound('door');t21Event('chest-spilled',{id:c.id,items:plan.items});r05Persist();return true;
}