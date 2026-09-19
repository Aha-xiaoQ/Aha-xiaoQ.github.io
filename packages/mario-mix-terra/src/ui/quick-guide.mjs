/** Read-only help content. Bindings are supplied by the same model used by gameplay. */
export function buildQuickGuide({bindings, device = 'keyboard', hero = 'sandboxTrio', keyLabel, padLabel}) {
  const actions = bindings?.actions || {};
  const label = id => {
    const values = actions[id]?.[device === 'gamepad' ? 'pad' : 'keys'];
    if (!Array.isArray(values) || !values.length) return '未绑定';
    const format = device === 'gamepad' ? padLabel : keyLabel;
    return values.slice(0, 2).map(value => String(format(value))).join(' / ');
  };
  if (hero !== 'sandboxTrio') {
    const pad=device==='gamepad';
    const jump=pad?'A / ×':'空格 / K / Z',attack=pad?'B / ○':'J / X',move=pad?'左摇杆 / 十字键':'WASD / 方向键';
    const rows=[{id:'move',title:'移动',keys:move,text:hero==='tank'?'在俯视通道中调整方向。':'沿平台前进，避开缺口。' },
      {id:'jump',title:hero==='tank'?'转向':'跳跃',keys:hero==='tank'?move:jump,text:hero==='tank'?'坦克不能跳跃。转向后再向目标开火。':'落地后可以再次跳跃。'},
      {id:'attack',title:'攻击',keys:attack,text:hero==='mario'?'获得火焰花后发射火球；普通状态可跳起踩敌。':hero==='ryu'?'挥刀攻击近处敌人。':hero==='megaman'?'按住蓄力，松开发射。':'按住连续射击；配合方向键调整瞄准方向。'},
      {id:'special',title:hero==='ryu'?'攀墙':'角色能力',keys:hero==='ryu'?move:attack,text:hero==='ryu'?'贴住墙面，向上攀爬；留意墙顶和管道边缘。':'收集途中出现的道具；能力随当前角色变化。'},
      {id:'selection',title:'切换角色',keys:'暂停菜单',text:'先暂停，再选择切换角色；确认后会结束当前挑战。'},
      {id:'pause',title:'暂停',keys:pad?'Start / Options':'P / Esc',text:'暂停后可查看操作与设置。'}];
    return rows.map(row=>Object.freeze(row));
  }
  const rows = [
    {id:'move', title:'移动', keys:`${label('left')} · ${label('right')}`, text:device === 'gamepad' ? '使用十字键或左摇杆移动。' : '向左右移动。跳跃时也可以调整方向。'},
    {id:'jump', title:'跳跃', keys:label('jump'), text:'跳过缺口，落地后再继续前进。'},
    {id:'tool', title:'工具与攻击', keys:`${label('toolPrev')} · ${label('toolNext')} · ${label('attack')}`, text:device === 'gamepad' ? '切换快捷栏后按使用键；手柄会自动索敌。' : '切换快捷栏后按使用键；鼠标用于瞄准或选格。'},
    {id:'interact', title:'进入与离开地下', keys:label('interact'), text:'站到可进入的管道口，按交互键进入。返回时也要靠近出口。'},
    {id:'mount', title:'坐骑', keys:label('mount'), text:'获得坐骑后，可骑乘或下来。'},
    {id:'pause', title:'暂停', keys:label('pause'), text:'暂停后再查看设置或离开页面。返回时手动继续。'}
  ];
  return rows.map(row => Object.freeze({...row}));
}

/** Only explicit, non-personal fields enter a support report; no saved data or file paths. */
export function formatPlayerReport(info = {}) {
  const clean = v => String(v ?? '未提供').replace(/[\r\n\u0000-\u001f]/g, ' ').slice(0, 96);
  return [['开发版本',info.version],['角色',info.character],['场景',info.scene],['状态',info.mode],['输入方式',info.device],['画面尺寸',info.viewport]]
    .map(([label,value]) => `${label}：${clean(value)}`).join('\n') + '\n\n问题发生前的操作：\n预期结果：\n实际结果：\n';
}
