export const PRODUCTION_LABELS=Object.freeze({playable:'可试玩',developing:'开发中',planned:'待规划'});
export function validateCampaign(data){
 const errors=[],ids=new Set();
 if(data?.schemaVersion!==1||!Array.isArray(data.chapters)||data.chapters.length!==32)throw Error('关卡登记必须包含32个主线位置');
 for(const c of data.chapters){
  if(!/^[1-8]-[1-4]$/.test(c.id)||ids.has(c.id))errors.push('关卡ID重复或无效');ids.add(c.id);
  if(c.world!==Number(c.id?.[0])||c.order!==(Number(c.id?.[0])-1)*4+Number(c.id?.[2]))errors.push(c.id+' 世界或排序不符');
  if(typeof c.title!=='string'||!c.title.trim()||typeof c.summary!=='string'||typeof c.next!=='string'||(c.owner!==null&&typeof c.owner!=='string'))errors.push(c.id+' 关卡介绍或负责人无效');
  if(!Object.hasOwn(PRODUCTION_LABELS,c.production))errors.push(c.id+' 制作状态无效');
  if(c.production==='playable'&&!/^\/games\/[a-z0-9-]+\/play\.html$/.test(c.playHref||''))errors.push(c.id+' 缺少真实试玩入口');
  if(c.production!=='playable'&&c.playHref)errors.push(c.id+' 未发布关卡不提供试玩链接');
  if(!Array.isArray(c.characters)||c.characters.some(s=>typeof s!=='string'||s.length>40))errors.push(c.id+' 角色声明错误');
  if(c.template?.status==='transcribed'){
   if(c.template.id!==`atlas-${c.id}`||c.template.downloadHref!==`/downloads/templates/MarioMix_${c.id}_Template_K01.zip`)errors.push(c.id+' 模板链接无效');
   if(!['pending','reviewed'].includes(c.template.originalReview))errors.push(c.id+' 原版核验状态无效');
   if(c.template.originalReview==='reviewed'&&(!(typeof c.template.reviewedBy==='string'&&c.template.reviewedBy.trim())||!Array.isArray(c.template.reviewEvidence)||!c.template.reviewEvidence.length||c.template.reviewEvidence.some(x=>typeof x!=='string'||!x.trim())))errors.push(c.id+' 复核缺少审核人或证据');
  }else if(c.template?.status!=='pending'||c.template.downloadHref||c.template.id)errors.push(c.id+' 待制作模板不得伪造下载');
  if(c.issue!==null&&!(typeof c.issue==='string'&&/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/issues\/\d+$/.test(c.issue)))errors.push(c.id+' Issue链接无效');
 }
 if(errors.length)throw Error(errors.join('\n'));return data;
}
