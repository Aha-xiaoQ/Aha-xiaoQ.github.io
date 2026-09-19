// M07: unchanged logical geometry painted on a display-resolution overlay, not the low-resolution world.
function t15DrawHUD(s){if(!isTrio()||!s||mode==='menu'){if(typeof terraHudSurface!=='undefined')terraHudSurface?.frame(null,false);return;}
 const l=t15Layout(s),m=t15Model(s);
 const surface=typeof terraHudSurface!=='undefined'?terraHudSurface:null;
 const boss=s.phase==='battle'&&s.eye&&!s.eye.dead?s.eye:null;
 const compact=surface?.compact(l,m,boss,t15Icon);const g=compact?null:surface?.frame(l,true);
 if(!surface)return;
 if(g)__terraModules.paintAdventureHud({context:g,layout:l,model:m,
  actor:{x:s.p.x+s.p.w/2-(s.cam||0),y:s.p.y-(s.r05Arena?s.camY||0:s.r07CamY||0)},
  boss,icon:t15Icon,text:surface.text,
  coin:ready?classicSprite('coin0'):null,highContrast:document.body.dataset.terraContrast==='high'});
 s.t15Hud={hp:m.hp,maxHp:m.maxHp,mana:m.mana,maxMana:m.maxMana,gear:m.gear.map(x=>x.name),tool:m.tool,weapon:m.weapon,rows:2,view:[l.viewW,l.viewH]};
}
