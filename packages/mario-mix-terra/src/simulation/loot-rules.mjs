/** Pure pickup plans. No DOM, persistence, random source or global game state.
 * A plan never commits itself. The legacy bridge applies the patch synchronously,
 * then calls display/audio/persistence ports in their original order.
 */
export function createLootRules({getItem}) {
  if (typeof getItem !== 'function') throw new TypeError('getItem port is required');
  const copy = value => JSON.parse(JSON.stringify(value));
  function weapon({current,next,owned,kit=false}) {
    if (!getItem(next)?.weapon) throw new Error('Unknown weapon: '+next);
    if (current === next) return {changed:false};
    const remaining = (owned || ['starfury']).filter(key => key !== current);
    if (!remaining.includes(next)) remaining.push(next);
    return {changed:true,previous:current,weapon:next,owned:remaining,
      overridesKit:!!kit,tool:0,attack:0,cooldown:0,minions:[],prismCharge:0,whipAge:99};
  }
  function chest({chest,transitioning=false}) {
    if (!chest || chest.removed || chest.t21Spilled || chest.empty || transitioning)
      return {changed:false};
    const items = copy(chest.items?.length ? chest.items :
      [{kind:'healing',count:2},{kind:'torch',count:20}]);
    const drops = items.map((item,i) => {
      const spread=(i-(items.length-1)/2)*.9;
      return {kind:item.kind,count:item.count,x:chest.x+8+Math.sign(spread)*6,y:chest.y-4,
        extra:{vx:spread,vy:-3.4-i%2*.6,pickDelay:42,chestId:chest.id}};
    });
    return {changed:true,patch:{opened:true,empty:true,t21Spilled:true,items:[]},items,drops};
  }
  function notice(kind,count=1) {
    if (!kind) return null;
    const item=getItem(kind)||{name:'补给',effect:'可拾取补给',icon:null};
    return {name:item.name+(count>1?' ×'+count:''),effect:item.effect,icon:item.icon,age:0};
  }
  return Object.freeze({weapon,chest,notice});
}
