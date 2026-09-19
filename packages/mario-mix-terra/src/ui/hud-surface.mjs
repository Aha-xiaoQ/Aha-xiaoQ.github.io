/** A display-resolution paint surface; the game canvas, view and hitboxes stay unchanged. */
export function createHudSurface({document:doc,game,host,pixelRatio=()=>1,selectTool=()=>{},heal=()=>{}}) {
  if(!doc||!game||!host)throw new TypeError('HUD surface requires game and host');
  const layer=doc.createElement('canvas');layer.id='m07Hud';layer.className='m07-hud';layer.setAttribute('aria-hidden','true');host.append(layer);
  const node=(tag,cls,text)=>{const el=doc.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el;};
  const dock=node('section','m07-compact-hud');dock.id='m07CompactHud';dock.hidden=true;dock.setAttribute('aria-label','生命、魔力和当前工具');
  const stats=node('div','m07-hud-stats'),hp=node('button',''),mp=node('div',''),meta=node('div','m07-hud-meta');hp.type='button';hp.dataset.terraDisplay='';hp.title='使用治疗药水';
  const hpText=node('span',''),mpText=node('span',''),hpMeter=node('meter',''),mpMeter=node('meter','');hpMeter.setAttribute('aria-label','生命');mpMeter.setAttribute('aria-label','魔力');
  hp.append(hpText,hpMeter);mp.append(mpText,mpMeter);stats.append(hp,mp);dock.append(meta,stats);
  const slots=node('div','m07-compact-slots');slots.setAttribute('role','group');slots.setAttribute('aria-label','快捷栏');const buttons=[];
  for(let i=0;i<6;i++){const b=node('button','');b.type='button';b.dataset.terraDisplay='';b.dataset.tool=String(i);b.setAttribute('aria-pressed','false');const image=node('canvas','');image.width=48;image.height=48;image.setAttribute('aria-hidden','true');const key=node('span','m07-slot-num',String(i+1)),count=node('span','m07-slot-count');b.append(key,image,count);buttons.push({b,image,count});slots.append(b);}
  const selected=node('p','m07-selected-tool'),bossLine=node('div','m07-compact-boss');bossLine.hidden=true;const bossName=node('span',''),bossMeter=node('meter','');bossMeter.setAttribute('aria-label','首领生命');bossLine.append(bossName,bossMeter);dock.append(slots,selected,bossLine);
  game.closest('.screen-shell').before(dock);
  const onSelect=e=>{const b=e.target.closest('button[data-tool]');if(b){e.preventDefault();selectTool(Number(b.dataset.tool));}};const onHeal=()=>heal();slots.addEventListener('click',onSelect);hp.addEventListener('click',onHeal);
  const updateText=(el,v)=>{v=String(v);if(el.textContent!==v)el.textContent=v;};
  function compact(layout,model,boss,icon){
    const small=game.getBoundingClientRect().width<600&&!doc.fullscreenElement;
    doc.body.dataset.hudLayout=small?'compact':'overlay';dock.hidden=!small;if(!small)return false;
    layer.hidden=true;updateText(meta,`1-3 · 得分 ${model.score} · 金币 ${model.coins} · 时间 ${model.time}`);
    const meter=(el,v,max)=>{el.min=0;el.max=Math.max(1,Number(max)||1);el.value=Math.max(0,Math.min(el.max,Number(v)||0));};
    updateText(hpText,`生命 ${model.hp}/${model.maxHp}`);meter(hpMeter,model.hp,model.maxHp);hp.setAttribute('aria-label',`生命 ${model.hp}/${model.maxHp}，治疗药水 ${model.potions||0}，点击治疗`);
    updateText(mpText,`魔力 ${model.mana}/${model.maxMana}`);meter(mpMeter,model.mana,model.maxMana);
    for(let i=0;i<buttons.length;i++){const{b,image,count}=buttons[i],amount=model.counts[i];b.setAttribute('aria-pressed',String(i===model.tool));b.setAttribute('aria-label',`${model.names[i]}${amount==null?'':'，数量 '+amount}`);b.title=model.names[i];updateText(count,amount==null?'':amount);const q=image.getContext('2d');q.setTransform(1,0,0,1,0,0);q.clearRect(0,0,48,48);q.imageSmoothingEnabled=false;icon(q,model.keys[i],24,24,44);}
    updateText(selected,`${model.names[model.tool]||'武器'} · 防御 ${model.defense}`);selected.title=model.gear.map(x=>x.name).join('；');
    bossLine.hidden=!boss;if(boss){updateText(bossName,`克苏鲁之眼 ${Math.max(0,Math.ceil(boss.hp))}/${boss.maxHp}`);meter(bossMeter,boss.hp,boss.maxHp);}return true;
  }
  const g=layer.getContext('2d');let layoutKey='',disposed=false,view=null;
  function frame(layout,visible=true){
    if(disposed)return null;
    layer.hidden=!visible;
    if(!visible){dock.hidden=true;doc.body.dataset.hudLayout='overlay';g.clearRect(0,0,layer.width,layer.height);return null;}
    const r=game.getBoundingClientRect(),h=host.getBoundingClientRect(),dpr=Math.max(1,Math.min(2,Number(pixelRatio())||1));
    if(r.width<=0||r.height<=0)return null;
    const width=Math.round(r.width*dpr),height=Math.round(r.height*dpr);
    const key=[width,height,r.left-h.left,r.top-h.top,layout.viewW,layout.viewH].join('|');
    if(key!==layoutKey){layoutKey=key;layer.width=width;layer.height=height;Object.assign(layer.style,{left:(r.left-h.left)+'px',top:(r.top-h.top)+'px',width:r.width+'px',height:r.height+'px'});}
    g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,layer.width,layer.height);
    g.setTransform(width/layout.viewW,0,0,height/layout.viewH,0,0);
    // Only source images remain pixelated. Browser/system text is drawn at display density.
    g.imageSmoothingEnabled=false;view={width,height,cssWidth:r.width,cssHeight:r.height,dpr};return g;
  }
  function text(value,x,y,size=12,color='#f2ecda',align='left'){
    g.save();g.font=`600 ${size}px "Microsoft YaHei",system-ui,sans-serif`;g.textBaseline='top';g.textAlign=align;g.fillStyle=color;g.fillText(String(value),x,y);g.restore();
  }
  return Object.freeze({frame,text,compact,snapshot:()=>({...view,disposed}),dispose(){if(disposed)return;disposed=true;slots.removeEventListener('click',onSelect);hp.removeEventListener('click',onHeal);layer.remove();dock.remove();}});
}
