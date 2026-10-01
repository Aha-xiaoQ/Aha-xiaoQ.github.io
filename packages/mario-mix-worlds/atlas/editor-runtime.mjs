import {runtimeMap,problems,clone,repairWaterExit} from './editor-model.mjs';
import {createStageCatalog} from './runtime/stage-catalog.mjs';
import {connectionProblems} from './editor-objects.mjs';
export function projectPack(doc,entryRoom,character,namespace='workshop'){
 doc=clone(doc);repairWaterExit(doc);
 const reached=new Set();
 function visit(id){if(reached.has(id))return;const r=doc.rooms.find(r=>r.roomId===id);if(!r)throw Error('管道目标区域不存在');reached.add(id);for(const p of r.map.objects.filter(o=>o.kind==='portal'))visit(p.targetRoom);}
 const errors=connectionProblems(doc);if(errors.length)throw Error(errors.join('；'));
 visit(entryRoom);
 const rooms=doc.rooms.filter(r=>reached.has(r.roomId));
 for(const r of rooms){const errors=problems(r,true);if(errors.length)throw Error(r.roomId+'：'+errors.join('；'));}
 character=clone(character);character.id='workshop-mario';character.title='马里奥';character.capabilities=['jump'];character.motion={...character.motion,width:10,height:14,maxHealth:1};character.note='马里奥外观与单跳、踩敌试玩；不包含其他角色能力。';
 const root=rooms.find(r=>r.roomId===entryRoom),base=clone(root);base.map.objects=base.map.objects.filter(o=>o.kind!=='portal');
 const pack=developerPack(base,character,namespace,true),stage=pack.stages[0];
 pack.maps=rooms.map((r,i)=>{const m=runtimeMap(r);m.id=namespace+'-map-'+i;if(new TextEncoder().encode(JSON.stringify(m)).length>1024*1024)throw Error('区域超过 1 MB');return m;});
 stage.rooms=Object.fromEntries(rooms.map((r,i)=>[r.roomId,pack.maps[i].id]));stage.title=doc.title;stage.note='地图工坊多区域试玩；参考标记不自动转换为游戏机制。';
 createStageCatalog(pack);return pack;
}
export function developerPack(room,character,namespace='workshop',allowSwimming=false){
 const errors=problems(room,allowSwimming);if(errors.length)throw Error(errors.join('；'));
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(namespace)||namespace.length>48)throw Error('开发工程标识无效');
 const map=runtimeMap(room),spawn=map.objects.find(o=>o.kind==='spawn');
 map.id=namespace+'-map';
 if(map.objects.some(o=>o.kind==='portal'&&o.targetRoom!==room.roomId))throw Error('当前为单区域试跑，跨区域管道需要在完整关卡中接入');
 const stage={id:namespace+'-stage',title:map.title,driver:'platform-v1',status:'draft',entryRoom:room.roomId,entrySpawn:spawn.id,rooms:{[room.roomId]:map.id},characters:[character.id],requiredCapabilities:['jump'],overlays:{},audio:namespace+'-silent',note:'地图工坊导出的单区域开发场景；参考标记、奖励块与装饰不由基础平台驱动执行。'};
 const pack={schemaVersion:1,maps:[map],stages:[stage],characters:[clone(character)],audio:[{id:namespace+'-silent',music:null,events:{jump:null,attack:null,pickup:null,hurt:null,death:null,checkpoint:null,complete:null,portal:null},note:'地图检查默认静音。'}]};
 createStageCatalog(pack);
 if(new TextEncoder().encode(JSON.stringify(map,null,2)).length>1024*1024)throw Error('区域数据超过运行时 1 MB 限制，请拆分区域；工程仍可保存');
 return pack;
}
export function filesForPack(pack){
 createStageCatalog(pack);
 const files={};for(const c of pack.characters)if(c.id!=='lab-runner')files['characters/'+c.id+'/character.json']=JSON.stringify(c,null,2);for(const m of pack.maps)files['maps/'+m.id+'/map.json']=JSON.stringify(m,null,2);
 for(const s of pack.stages)files['stages/'+s.id+'/stage.json']=JSON.stringify(s,null,2);
 for(const a of pack.audio)files['audio/'+a.id+'/audio.json']=JSON.stringify(a,null,2);
 // Existing lab-runner is already included in the host; never overwrite it.
 files['README.txt']='地图工坊开发数据包\n\nmaps、stages、audio、characters 目录对应第三期开发源码 content/extensions/。\n请在开发源码副本中合并目录；同名文件请先备份，勿直接覆盖线上试玩。\n包附带 workshop-mario 基础角色配置（跳跃与踩敌）；贴图与原版音频请使用离线试玩导出。运行源码的构建与检查后，在开发关卡试验场勾选显示草稿，选择 '+pack.stages[0].id+'。\n不同工程有独立标识，同一工程重复导出代表修订；不支持的机制仍需开发。\n工程备份请另存 qmap.json，开发包不包含参考数据或编辑器图层。\n';
 return files;
}
