/** M05 read-only paint layer. All hit regions and game timing remain owned by M04. */
export function paintAdventureHud({context: g, layout: l, model: m, actor, boss, icon, text, coin, highContrast = false}) {
  if (!g || !l || !m) return;
  const ratio = (v, max) => Math.max(0, Math.min(1, v / Math.max(1, max)));
  const panel = (x, y, w, h, accent = '#556c63') => {
    g.fillStyle = highContrast ? '#071316' : '#0c2027e6'; g.fillRect(x, y, w, h);
    g.strokeStyle = accent; g.lineWidth = 1; g.strokeRect(x + .5, y + .5, w - 1, h - 1);
  };
  const bar = (x, y, w, h, value, color, light) => {
    g.fillStyle = '#050e15'; g.fillRect(x, y, w, h);
    const n = Math.round(w * value); g.fillStyle = color; g.fillRect(x, y + 1, n, h - 2);
    g.fillStyle = light; g.fillRect(x, y + 1, n, 1);
  };
  g.save(); g.scale(l.unit, l.unit); g.imageSmoothingEnabled = false;
  const x = actor.x / l.unit, y = actor.y / l.unit;
  g.globalAlpha = !highContrast && y < 65 && x < 246 ? .42 : 1;
  panel(8, 1, 224, 59);
  text('1-3', 12, 5, 12, '#ecdbb1'); text(String(m.score).padStart(6, '0'), 53, 5, 12, '#edf2e9');
  if (coin) g.drawImage(coin, 136, 6, 8, 12);
  else {g.fillStyle = '#e8c781'; g.fillRect(136, 7, 5, 7);}
  text('×' + String(m.coins).padStart(2, '0'), 146, 5, 11, '#d8e4d9');
  text(String(m.time).padStart(3, '0'), 223, 5, 12, '#ecdbb1', 'right');
  for (let i = 0; i < l.slots.length; i++) {
    const q = l.slots[i], selected = i === m.tool;
    g.fillStyle = selected ? '#3c5246' : '#122d34'; g.fillRect(q.x, q.y, q.w, q.h);
    g.lineWidth = selected ? 2 : 1; g.strokeStyle = selected ? '#f2d68c' : '#6f9187';
    g.strokeRect(q.x + 1, q.y + 1, q.w - 2, q.h - 2);
    if (selected) {g.fillStyle = '#f2d68c'; g.fillRect(q.x + 5, q.y + q.h - 4, q.w - 10, 2);}
    icon(g, m.keys[i], q.x + q.w / 2, q.y + q.h / 2, 23);
    text(i + 1, q.x + 3, q.y + 2, 8, selected ? '#fff1c1' : '#d5e0d8');
    if (m.counts[i] !== null && m.counts[i] !== undefined)
      text(m.counts[i] >= 1000 ? Math.floor(m.counts[i] / 1000) + 'K' : m.counts[i], q.x + q.w - 3, q.y + q.h - 10, 9, '#fff6d3', 'right');
  }
  g.globalAlpha = !highContrast && y < 65 && x > l.uiW - 244 ? .42 : 1;
  panel(l.uiW - 238, 1, 230, 59);
  const xx = l.uiW - 230;
  icon(g, 'heart', xx + 6, 12, 14);
  bar(xx + 20, 8, 111, 8, ratio(m.hp, m.maxHp), '#cd6370', '#ffd5b7');
  text(m.hp + '/' + m.maxHp, l.uiW - 12, 5, 12, '#fff1e8', 'right');
  icon(g, 'manaSymbol', xx + 6, 28, 12);
  bar(xx + 20, 24, 111, 8, ratio(m.mana, m.maxMana), '#659ecc', '#c0e8ff');
  text(m.mana + '/' + m.maxMana, l.uiW - 12, 21, 12, '#d3eaff', 'right');
  m.gear.forEach((item, i) => {const gx = xx + 7 + i * 23; g.fillStyle = '#203b40'; g.fillRect(gx - 9, 40, 18, 18); icon(g, item.key, gx, 49, 16);});
  text('DEF ' + m.defense, l.uiW - 12, 42, 10, '#d4e5d5', 'right'); g.globalAlpha = 1;
  if (boss) {
    const w = l.wide ? 350 : 264, bx = (l.uiW - w) / 2, by = l.uiH - 31;
    panel(bx, by, w, 23, '#b99572');
    g.font = '12px "Microsoft YaHei",sans-serif'; g.textBaseline = 'top'; g.fillStyle = '#f5d9b2';
    g.fillText('克苏鲁之眼' + (boss.phase === 2 ? '  II' : ''), bx + 7, by + 3);
    text(Math.max(0, Math.ceil(boss.hp)) + '/' + boss.maxHp, bx + w - 7, by + 3, 11, '#f5d9b2', 'right');
    bar(bx + 7, by + 17, w - 14, 4, ratio(boss.hp, boss.maxHp), boss.phase === 2 ? '#dd8f7a' : '#b96674', '#ffd4ab');
  }
  g.restore();
}

/** Item timing/queue ownership is unchanged; only paint geometry and text wrapping. */
export function paintPickupNotice({context: g, notice, width, height, canvasWidth, canvasHeight, wide, reducedMotion = false}) {
  if (!notice) return;
  const sc = wide ? 1 : .64, w = Math.min(width - 16, 360 * sc), x = 8, h = 48 * sc, y = height - h - 10;
  g.save(); g.setTransform(canvasWidth / width, 0, 0, canvasHeight / height, 0, 0);
  g.globalAlpha = reducedMotion ? 1 : Math.max(0, Math.min(1, notice.age / 8, (210 - notice.age) / 20));
  g.fillStyle = '#0b2027f2'; g.fillRect(x, y, w, h); g.strokeStyle = '#b3a47d'; g.lineWidth = sc;
  g.strokeRect(x + .5 * sc, y + .5 * sc, w - sc, h - sc); g.fillStyle = '#e7c68e'; g.fillRect(x, y, 3 * sc, h);
  g.textBaseline = 'top'; g.fillStyle = '#f8e0af'; g.font = `bold ${13 * sc}px sans-serif`;
  g.fillText(notice.name, x + 11 * sc, y + 5 * sc, w - 22 * sc);
  g.fillStyle = '#d9e6df'; g.font = `${11 * sc}px sans-serif`;
  const lines = [''];
  for (const ch of String(notice.effect || '')) {
    if (g.measureText(lines.at(-1) + ch).width > w - 22 * sc && lines.at(-1)) lines.push('');
    lines[lines.length - 1] += ch;
  }
  lines.slice(0, 2).forEach((line, i) => g.fillText(line, x + 11 * sc, y + (22 + 12 * i) * sc, w - 22 * sc));
  g.restore();
}

/** Neutral fallback for a missing icon, not counterfeit original art or microscopic text. */
export function paintMissingPickup(g,x,y){
  g.save();g.translate(x,y);g.fillStyle='#112a36';g.strokeStyle='#edd09c';g.lineWidth=1;
  g.beginPath();g.moveTo(0,-7);g.lineTo(7,0);g.lineTo(0,7);g.lineTo(-7,0);g.closePath();g.fill();g.stroke();
  g.fillStyle='#edd09c';g.fillRect(-1,-3,2,4);g.fillRect(-1,3,2,1);g.restore();
}
