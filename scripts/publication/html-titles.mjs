/** Count HTML document titles without counting SVG/MathML accessible names.
 * A small lexical, namespace-aware scan for authored static HTML, not a general
 * HTML conformance validator. Never changes the source or evaluates scripts.
 * HTML raw text, quoted attributes, comments and inactive templates are not tags.
 */
const VOID=new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const RAW=new Set('script style title textarea xmp iframe noembed noframes noscript'.split(' '));
const BREAKOUT=new Set('b big blockquote body br center code dd div dl dt em embed h1 h2 h3 h4 h5 h6 head hr i img li listing menu meta nobr ol p pre ruby s small span strong strike sub sup table tt u ul var'.split(' '));
const SVG_INTEGRATION=new Set(['foreignobject','desc','title']);
const MATH_TEXT=new Set(['mi','mo','mn','ms','mtext']);
const encoding=attrs=>(attrs.match(/(?:^|\s)encoding\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)?.slice(1).find(x=>x!==undefined)||'').toLowerCase();
function htmlIntegration(frame){
 return frame.ns==='svg'&&SVG_INTEGRATION.has(frame.name)||frame.ns==='math'&&frame.name==='annotation-xml'&&['text/html','application/xhtml+xml'].includes(frame.encoding);
}
function childNamespace(frame,name){
 let ns=frame.ns;
 if(htmlIntegration(frame)||frame.ns==='math'&&MATH_TEXT.has(frame.name)&&!['mglyph','malignmark'].includes(name))ns='html';
 if(frame.ns==='math'&&frame.name==='annotation-xml'&&name==='svg')ns='html';
 if(ns==='html'){if(name==='svg')return 'svg';if(name==='math')return 'math';}
 return ns;
}
export function htmlTitleCount(source){
 if(typeof source!=='string')throw new TypeError('HTML title scan requires text');
 const stack=[{name:'#root',ns:'html',inactive:false}],tag=/<(\/?)([a-z][a-z0-9:-]*)(?=[\t\n\f\r />])((?:[^<>"']|"[^"]*"|'[^']*')*)>/iy;
 let cursor=0,count=0;
 while(cursor<source.length){
  const parent=stack.at(-1);
  // RCDATA (including an HTML title) must not reinterpret literal '<title>'.
  if(parent.ns==='html'&&RAW.has(parent.name)||parent.ns!=='html'&&['script','style'].includes(parent.name)){
   const closing=new RegExp('</'+parent.name+'(?=[\\t\\n\\f\\r />])[^>]*>','gi');closing.lastIndex=cursor;
   const found=closing.exec(source);if(!found)break;
   cursor=closing.lastIndex;stack.pop();continue;
  }
  if(parent.ns==='html'&&parent.name==='plaintext')break;
  const start=source.indexOf('<',cursor);if(start<0)break;
  if(source.startsWith('<!--',start)){
   const end=/--!?>/g;end.lastIndex=start+4;const found=end.exec(source);if(!found)break;cursor=end.lastIndex;continue;
  }
  if(parent.ns!=='html'&&source.startsWith('<![CDATA[',start)){
   const end=source.indexOf(']]>',start+9);if(end<0)break;cursor=end+3;continue;
  }
  if(/^<!|^<\?/.test(source.slice(start,start+2))){
   const end=source.indexOf('>',start+2);if(end<0)break;cursor=end+1;continue;
  }
  tag.lastIndex=start;const found=tag.exec(source);
  if(!found){cursor=start+1;continue;}
  cursor=tag.lastIndex;
  const close=found[1]==='/',name=found[2].toLowerCase(),attributes=found[3];
  if(close){
   for(let i=stack.length-1;i>0;i--)if(stack[i].name===name){stack.length=i;break;}
   continue;
  }
  // HTML breakout elements end foreign content. This prevents an unclosed SVG
  // from hiding a subsequent HTML title after a normal body/div/p element.
  if(parent.ns!=='html'&&!htmlIntegration(parent)&&!MATH_TEXT.has(parent.name)&&(BREAKOUT.has(name)||name==='font'&&/(?:^|\s)(?:color|face|size)\s*=/i.test(attributes))){
   while(stack.length>1&&stack.at(-1).ns!=='html'&&!htmlIntegration(stack.at(-1))&&!MATH_TEXT.has(stack.at(-1).name))stack.pop();
  }
  const host=stack.at(-1),ns=childNamespace(host,name);
  const inactive=host.inactive||ns==='html'&&['template','noscript'].includes(name);
  if(ns==='html'&&name==='title'&&!inactive)count++;
  const selfClosing=/\/\s*$/.test(attributes);
  // A slash does not self-close an ordinary HTML element such as title/div.
  if(ns==='html'? !VOID.has(name):!selfClosing)stack.push({name,ns,inactive,encoding:encoding(attributes)});
 }
 return count;
}
