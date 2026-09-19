/** UI-only adaptation in the isolated copy; never writes to the original M06 workspace. */
export function labelPreview(path, text) {
 if(path==='src/ui/stage-view.mjs') {
  const from="'SDK LAB · '+s.roomId";
  if(!text.includes(from)) throw Error('M06 preview renderer changed; review the UI adapter');
  return text.replace(from,"'MAP '+(s.title.match(/[1-8]-[1-4]/)?.[0]||'LAB')+' / '+s.roomId");
 }
 if(path==='src/bridges/stages.bridge.js') {
  const mark="const copy=[[";
  if(!text.includes(mark))throw Error('M06 stage bridge changed; review the UI adapter');
  text=text.replace(mark,"const copy=[['.panel .kicker','WORLD 01–08 / MAP TEMPLATES'],[");
  text=text.replace('同一张底图。<br>独立接入角色。','先看底图。<br>再设计角色。');
  text=text.replace('关卡开发试验场：验证角色能力、适配路线、房间往返和检查点。几何素材与原型移动器仅供接口开发。','八世界地图模板。地形按社区参考转录；实验角色可预览路线，敌人与城堡机关仍需开发。');
  text=text.replace('选择两个角色分别跳跃；靠近蓝框按交互进入奖励房。返回后拾取记录保留。','勾选开发草稿并选择 1-1 至 8-4。蓝框代表房间入口；机关缺口见模板说明。C 返回，R 重试。');
  text=text.replace('M04 / STAGE CONTRACT LAB','WORLDKIT W02 / REFERENCE MAPS').replace('仅为接入原型 · 非正式 1-4','参考地形与实验角色 · 非正式关卡');
  text=text.replace('关卡框架验证 · 几何预览，不是正式 1-4。移动、跳跃、攻击沿用按键设置；交互进入蓝色传送门，C 返回角色页。','地图预览：移动与跳跃沿用按键设置，靠近蓝框按交互切换房间。粉色标记为待实现对象；C 返回角色页。');
  text=text.replace('这里验证地图、角色和适配层的组合。样例不是正式 1-4，第三期继续使用原行为。','八世界模板位于开发草稿中。实验角色用于预览；正式泰拉角色尚不支持任意地图。');
  return text;
 }
 return text;
}
