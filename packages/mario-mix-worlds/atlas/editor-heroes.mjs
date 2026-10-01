// Project-owned selection; original maps and enemies remain unchanged.
export const heroes={mario:'马里奥',bill:'魂斗罗 · 比尔'};
export const heroFor=doc=>doc.playHero||((doc.rooms||doc).some(r=>r.playHero==='bill')?'bill':'mario');
export function selectHero(doc,hero){if(!Object.hasOwn(heroes,hero))throw Error('未知主角');doc.playHero=hero;for(const room of doc.rooms)room.playHero=hero;return doc;}
export const weaponNames={N:'普通弹',M:'M 连射枪',S:'S 散弹枪',F:'F 火球枪',L:'L 激光枪'};
export const carryPlayer=v=>({lives:v.lives,coins:v.coins,score:v.score,power:v.p.power,hero:v.p.hero||'mario',weapon:v.p.weapon||'N'});
