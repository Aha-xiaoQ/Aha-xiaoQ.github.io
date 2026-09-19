// Apply the pure plan to the still-legacy inventory. No new wrapper or game timer.
function t21EquipWeapon(s,kind,spill=true){
 t21Ensure(s);
 const plan=terraLoot.weapon({current:r06Weapon(s),next:kind,owned:s.t13Owned,kit:s.kit});
 if(!plan.changed)return false;
 if(spill)t21SpillOld(s,plan.previous);
 s.t13Owned=plan.owned;s.t13Weapon=plan.weapon;s.t13WeaponOverride=plan.overridesKit;
 s.tool=plan.tool;s.p.attack=plan.attack;s.p.cooldown=plan.cooldown;
 s.minions=plan.minions;s.prismCharge=plan.prismCharge;s.whipAge=plan.whipAge;
 r06SyncKitTools();t21Event('weapon-exchange',{old:plan.previous,new:kind});return true;
}