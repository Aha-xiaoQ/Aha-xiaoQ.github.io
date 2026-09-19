import json
from pathlib import Path
BASE=Path(__file__).resolve().parent.parent
OUT=BASE/'worlds'
OUT.mkdir(parents=True,exist_ok=True)
MACROS=set('Fill Floor Ceiling Pipe Tree Shroom Water CastleSmall CastleLarge StartInsideCastle EndOutsideCastle EndInsideCastle WarpWorld PlatformGenerator Bridge Scale Section SectionPass SectionFail SectionDecider CheepsStart CheepsStop BulletBillsStart BulletBillsStop LakituStop'.split())
ALIAS={'w':'width','h':'height','nx':'xnum','ny':'ynum','dx':'xwidth','dy':'yheight','t':'transport','e':'entrance','c':'contents'}
def scalar(s):
 if s=="Infinity":return "Infinity"
 try:return json.loads(s)
 except (ValueError,TypeError):return s

def rows(s):
 out=[]
 for ln in s.splitlines():
  for line in ln.split(';'):
   line=line.strip()
   if not line or line.startswith('#'):continue
   t=line.split();name=t.pop(0);v={'macro' if name in MACROS else 'thing':name}
   if name=='Fill':v['thing']=t.pop(0)
   pos=[]
   for token in t:
    if '=' in token:
     k,z=token.split('=',1);v[ALIAS.get(k,k)]=scalar(z)
    else:pos.append(scalar(token))
   if len(pos)>2:raise ValueError(line)
   if pos:v['x']=pos[0]
   if len(pos)>1:v['y']=pos[1]
   out.append(v)
 return out

def area(setting,s,**kw):return {'setting':setting,'creation':rows(s),**kw}
def loc(area=0,entry=None,**kw):
 d={'area':area,**kw}
 if entry:d['entry']=entry
 return d

def save(world,maps):
 assert len(maps)==4 and [m['name'] for m in maps]==[f'{world}-{i}' for i in range(1,5)]
 obj={'schemaVersion':1,'source':{'repository':'umaim/Mario','commit':'980c275358704a49f868567aeec5bdfb347c4781','blob':'657d750ad65bb06c0e63a3d8958736f9236ec3c0','url':'https://github.com/umaim/Mario/blob/980c275358704a49f868567aeec5bdfb347c4781/Source/settings/maps.js','method':'transcription of terrain, gameplay placements, locations and section definitions; presentation-only scenery omitted','originalReview':'pending','licenseFile':'../LICENSE-MIT.txt'},'maps':maps}
 (OUT/f'world-{world}.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2,allow_nan=False)+'\n')
 print(world,sum(len(a['creation']) for m in maps for a in m['areas']),'base placements')
