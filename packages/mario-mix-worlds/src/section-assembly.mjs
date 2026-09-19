/** Expand one successful traversal for editing while retaining raw section views.
 * Stretch records use the 256 native-pixel play viewport (128 source units).
 * A repeated section is kept as a loop marker; it is never expanded indefinitely.
 */
export function assembleArea(area){
 const records=[],visited=new Set(),segments=[];
 function part(rows,offset,stretch=false){for(const original of rows||[]){const q=structuredClone(original);q.x=stretch?offset:offset+(q.x||0);if(stretch)q.width=128;if(q.sliding){q.begin+=offset;q.end+=offset;}records.push(q);
 if(q.macro==='Section'||q.macro==='SectionDecider')section(q.macro==='SectionDecider'?q.pass:q.section||0,q.x);
 }}
 function section(id,x){if(visited.has(id))return;const s=area.sections?.[id];if(!s)throw Error('Missing section '+id);visited.add(id);segments.push({section:id,x,route:'pass'});part(s.before?.creation,x);x+=s.before?.width||0;if(s.stretch){part(s.stretch.creation,x,true);x+=128;}part(s.after?.creation,x);}
 part(area.creation,0);return {records,segments};
}
