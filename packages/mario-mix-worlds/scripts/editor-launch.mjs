import {spawn} from 'node:child_process';
import {createAtlasServer} from './atlas-server.mjs';
const server=createAtlasServer(),url='http://127.0.0.1:4196/atlas/editor.html';
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'端口 4196 已占用。若已启动地图册，请直接访问 '+url:'启动失败：'+e.message);process.exitCode=1;});
server.listen(4196,'127.0.0.1',()=>{
 console.log('地图工坊：'+url+'\n关闭此窗口或按 Ctrl+C 停止服务。地图请在网页中导出备份。');
 const command=process.platform==='win32'?['cmd',['/c','start','',url]]:process.platform==='darwin'?['open',[url]]:['xdg-open',[url]];
 const child=spawn(command[0],command[1],{stdio:'ignore',windowsHide:true});child.on('error',()=>console.log('请在浏览器手动打开以上网址。'));
});
