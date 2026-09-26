/** Actual browser font decoding and glyph selection for generated supplement faces.
 * Works on a loaded real site page. No font files are copied out of the repository.
 */
import {evaluate} from './cdp.mjs';
export async function auditFontFaces(browser,record,{family='LXGW WenKai Local'}={}){
 if(!record||record.family!=='LXGW WenKai Local'||!Array.isArray(record.faces))throw Error('Missing generated font record');
 if(!['LXGW WenKai Local','LXGW WenKai'].includes(family))throw Error('Invalid audited font family');
 const results=[];const {cdp,sessionId}=browser;
 await cdp.send('DOM.enable',{},sessionId);await cdp.send('CSS.enable',{},sessionId);
 for(const weight of [400,500,600,700]){
  const variant=weight===400?'regular':'bold',points=[...new Set(record.faces.filter(f=>f.variant===variant).flatMap(f=>f.points))];
  if(!points.length){results.push({weight,characters:0,passed:true,scope:'No supplemental glyphs needed at this weight'});continue;}
  const text=String.fromCodePoint(...points),id='xiaoq-font-audit-probe';
  try{
   const loaded=await evaluate(browser,`(async()=>{document.getElementById('${id}')?.remove();const p=document.createElement('p');p.id='${id}';p.textContent=${JSON.stringify(text)};p.style.cssText='position:fixed;left:0;top:0;max-width:800px;font-family:"${family}";font-weight:${weight};font-size:24px;font-synthesis:none;pointer-events:none;z-index:-1';document.body.append(p);const faces=await document.fonts.load('${weight} 24px "${family}"',p.textContent);await document.fonts.ready;return faces.map(f=>({family:f.family,status:f.status}));})()`);
   if(!loaded.length||loaded.some(f=>f.status!=='loaded'))throw Error('Supplement font did not decode/load');
   const {root}=await cdp.send('DOM.getDocument',{depth:0},sessionId),{nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector:'#'+id},sessionId);
   const {fonts}=await cdp.send('CSS.getPlatformFontsForNode',{nodeId},sessionId);
   if(!fonts?.length||fonts.some(f=>!f.isCustomFont)||fonts.reduce((n,f)=>n+f.glyphCount,0)===0)throw Error('Supplement text fell back to an installed font or missing glyph');
   results.push({weight,characters:points.length,passed:true,fonts:fonts.map(f=>({family:f.familyName,custom:f.isCustomFont,glyphs:f.glyphCount}))});
  }catch(e){results.push({weight,characters:points.length,passed:false,error:e.message});}
  finally{await evaluate(browser,"document.getElementById('"+id+"')?.remove();true");}
 }
 return results;
}
