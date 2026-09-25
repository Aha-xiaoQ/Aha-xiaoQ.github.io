/** Isolated local Chromium transport. No installed-profile or remote browser access. */
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawn}from'node:child_process';
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export function browserPath(env=process.env){
 const options=[env.XIAOQ_BROWSER,...['PROGRAMFILES','PROGRAMFILES(X86)','LOCALAPPDATA'].flatMap(key=>env[key]?[path.join(env[key],'Microsoft/Edge/Application/msedge.exe'),path.join(env[key],'Google/Chrome/Application/chrome.exe')]:[]),'/usr/bin/chromium','/usr/bin/chromium-browser','/usr/bin/google-chrome','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
 const file=options.filter(Boolean).find(p=>{try{return fs.statSync(p).isFile();}catch{return false;}});
 if(!file)throw Error('Chromium/Edge not found. Set XIAOQ_BROWSER to its executable. Browser verification was not skipped.');return file;
}
export class CDP {
 constructor(socket){this.socket=socket;this.sequence=0;this.pending=new Map();this.handlers=new Map();socket.addEventListener('message',event=>{let data;try{data=JSON.parse(event.data);}catch{return;}if(data.id){const p=this.pending.get(data.id);if(p){this.pending.delete(data.id);clearTimeout(p.timer);data.error?p.reject(Error(data.error.message)):p.resolve(data.result||{});}}else for(const fn of this.handlers.get(data.method)||[])fn(data.params||{},data.sessionId);});socket.addEventListener('close',()=>{for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('Browser connection closed'));}this.pending.clear();});}
 on(event,handler){if(!this.handlers.has(event))this.handlers.set(event,new Set());this.handlers.get(event).add(handler);return()=>this.handlers.get(event)?.delete(handler);}
 send(method,params={},sessionId){return new Promise((resolve,reject)=>{const id=++this.sequence,timer=setTimeout(()=>{this.pending.delete(id);reject(Error('Browser command timed out: '+method));},15000);this.pending.set(id,{resolve,reject,timer});try{this.socket.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));}catch(error){clearTimeout(timer);this.pending.delete(id);reject(error);}});}
 close(){this.socket.close();}
}
export async function launch({executable=browserPath()}={}){
 const profile=fs.mkdtempSync(path.join(os.tmpdir(),'xiaoq-site-browser-'));
 const args=['--headless=new','--remote-debugging-port=0','--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-extensions','--disable-component-update','--disable-sync','--disable-gpu',...(process.platform==='linux'?['--no-sandbox']:[]),'about:blank'];
 let child,error=null,cdp;
 try{
  child=spawn(executable,args,{stdio:['ignore','ignore','pipe'],windowsHide:true,shell:false});child.on('error',e=>{error=e;});child.stderr.on('data',()=>{});
  let port;for(let i=0;i<150;i++){if(error)throw error;if(child.exitCode!==null)throw Error('Browser exited during startup');try{port=Number(fs.readFileSync(path.join(profile,'DevToolsActivePort'),'utf8').split('\n')[0]);if(port)break;}catch{}await delay(100);}
  if(!port)throw Error('Browser debugging endpoint unavailable');
  const res=await fetch('http://127.0.0.1:'+port+'/json/version',{signal:AbortSignal.timeout(5000)});if(!res.ok)throw Error('Browser endpoint error');const info=await res.json();
  const socket=new WebSocket(info.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Browser connection timed out')),5000);socket.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});socket.addEventListener('error',()=>{clearTimeout(timer);reject(Error('Browser connection failed'));},{once:true});});cdp=new CDP(socket);
  const {targetId}=await cdp.send('Target.createTarget',{url:'about:blank'});const {sessionId}=await cdp.send('Target.attachToTarget',{targetId,flatten:true});
  await cdp.send('Page.enable',{},sessionId);await cdp.send('Runtime.enable',{},sessionId);await cdp.send('Network.enable',{},sessionId);
  let closed=false;
  return {cdp,sessionId,browser:info.Browser,async close(){if(closed)return;closed=true;try{await cdp.send('Browser.close');}catch{}cdp.close();child.kill();await delay(150);fs.rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:100});}};
 }catch(e){cdp?.close();child?.kill();await delay(100);fs.rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});throw e;}
}
export async function evaluate(browser,expression){const out=await browser.cdp.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},browser.sessionId);if(out.exceptionDetails)throw Error(out.exceptionDetails.exception?.description||out.exceptionDetails.text||'Page evaluation failed');return out.result.value;}
export async function until(browser,expression,{timeout=12000}={}){const start=Date.now();while(Date.now()-start<timeout){try{if(await evaluate(browser,expression))return;}catch{}await delay(60);}throw Error('Page readiness timed out');}
