/** Player-facing facts only. Never uses release logs as in-game instructions. */
export function playerCopy(context = {}) {
  const characters = {
    mario: {name:'马里奥',chapter:'1-1',place:'地表冒险',ability:'跳跃 · 火球',description:'踩过敌人、跳过缺口。取得蘑菇和火焰花，前往终点旗杆。'},
    bill: {name:'比尔',chapter:'1-1',place:'地表冒险',ability:'魂斗罗 · 射击',description:'用魂斗罗的火力穿过熟悉的地形，收集不同武器。'},
    megaman: {name:'洛克人',chapter:'1-1',place:'地表冒险',ability:'洛克人 · 能量炮',description:'按住攻击蓄力，松开发射能量炮。在平台间寻找安全的落脚点。'},
    ryu: {name:'隼龙',chapter:'1-2',place:'地下潜入',ability:'忍者龙剑传 · 攀墙',description:'挥刀、攀墙，在地下砖群与管道间寻找前进的路线。'},
    tank: {name:'坦克',chapter:'1-2',place:'地下突围',ability:'坦克大战 · 俯视',description:'切换到俯视战场，沿通道前进，用炮火击破障碍。'},
    sandboxTrio: {name:'泰拉瑞亚',chapter:'1-3',place:'树顶之路',ability:'战斗 · 建造 · 探索',description:'挥剑、搭桥、采矿。沿管道探索地下，挑战克苏鲁之眼。'}
  };
  const selected=characters[context.hero] || {name:'测试角色',chapter:'实验',place:'关卡试验场',ability:'地形验证',description:'检查路线与碰撞；这不是正式关卡。'};
  const terra=context.hero==='sandboxTrio';
  let objective=terra?'沿树顶平台向右前进，抵达终点城堡。':'向前探索，抵达本关终点。';
  let location=`${selected.chapter} · ${selected.place}`;
  if(terra && context.inArena){
    location=context.underground?'地下矿区':'地下挑战';
    objective=context.phase==='battle'?'躲开冲刺，使用武器攻击克苏鲁之眼。':context.phase==='cleared'?'领取奖励；继续向下探索，或从入口管道返回。':'先收集补给，准备好后再拾取右侧的可疑眼球。';
  }
  const states={menu:'选择角色与关卡',playing:'冒险中',paused:'已暂停',respawn:'重新出发',win:'关卡完成',gameover:'本次冒险结束',inventory:'查看宝箱',flag:'抵达终点'};
  const overlay={
    menu:{title:'选择角色',body:selected.description,action:`开始 ${selected.chapter}`,hint:'方向键选择 · Enter 开始'},
    paused:{title:'休息一下',body:'游戏已暂停。准备好后继续，也可以先查看操作和设置。',action:'继续游戏',hint:'按暂停键继续'},
    respawn:{title:'再试一次',body:'调整节奏，从本关的重试点继续。',action:'继续挑战',hint:'按 Enter 继续'},
    gameover:{title:'本次冒险结束',body:'可以重新挑战，或换一位角色出发。',action:'重新挑战',hint:'按 Enter 重试'},
    win:{title:'关卡完成',body:'这段旅程结束了。再挑战一次，或选择其他角色与关卡。',action:'再玩一次',hint:'按 Enter 确认'}
  }[context.mode];
  return {characters,selected,location,objective,terra,status:states[context.mode]||'冒险中',overlay:overlay||null};
}

/** Do not abbreviate small amounts into ambiguous letters; clamp display only. */
export function formatUiValue(value, fallback = '—') {
  const n=Number(value);return Number.isFinite(n)?String(Math.max(0,Math.floor(n))):fallback;
}

/** Measured wrapping with ellipsis, never Canvas fillText(maxWidth) squashing. */
export function wrapUiText(value, maxWidth, measure, maxLines = 2) {
  if(!Number.isFinite(maxWidth)||maxWidth<=0||typeof measure!=='function'||!Number.isInteger(maxLines)||maxLines<1)return [];
  const chars=Array.from(String(value??'')),lines=[];let line='',index=0;
  while(index<chars.length){
    const ch=chars[index++];
    if(ch==='\n'){lines.push(line);line='';}
    else if(line && measure(line+ch)>maxWidth){lines.push(line);line=ch;}
    else line+=ch;
    if(lines.length===maxLines){
      let last=lines[maxLines-1];while(last && measure(last+'…')>maxWidth)last=last.slice(0,-1);
      lines[maxLines-1]=last+'…';return lines;
    }
  }
  if(line||!lines.length)lines.push(line);
  return lines;
}
