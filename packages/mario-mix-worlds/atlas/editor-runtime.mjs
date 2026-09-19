import {runtimeMap,problems,clone} from './editor-model.mjs';
import {createStageCatalog} from './runtime/stage-catalog.mjs';
export function developerPack(room,character,namespace='workshop'){
 const errors=problems(room);if(errors.length)throw Error(errors.join('；'));
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
 const files={};for(const m of pack.maps)files['maps/'+m.id+'/map.json']=JSON.stringify(m,null,2);
 for(const s of pack.stages)files['stages/'+s.id+'/stage.json']=JSON.stringify(s,null,2);
 for(const a of pack.audio)files['audio/'+a.id+'/audio.json']=JSON.stringify(a,null,2);
 // Existing lab-runner is already included in the host; never overwrite it.
 files['README.txt']='地图工坊开发数据包\n\nmaps、stages、audio 三个目录对应第三期开发源码 content/extensions/。\n请在开发源码副本中合并目录；同名文件请先备份，勿直接覆盖线上试玩。\n包使用源码已有 lab-runner 实验角色。运行源码的构建与检查后，在开发关卡试验场勾选显示草稿，选择 '+pack.stages[0].id+'。\n不同工程有独立标识，同一工程重复导出代表修订；不支持的机制仍需开发。\n工程备份请另存 qmap.json，开发包不包含参考数据或编辑器图层。\n';
 return files;
}
