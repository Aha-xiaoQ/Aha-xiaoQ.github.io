from common import *
import copy
def part(w,s):return {'width':w,'creation':rows(s)}
m1={'name':'7-1','locations':[loc(entry='Plain'),loc(entry='PipeVertical'),loc(1)],'areas':[
area('Overworld Alt','''
Floor 0 0 w=584;Cannon 152 16 h=16;Koopa 208 22 flying=true;Brick 216 64 c=Mushroom;Cannon 224 8;Cannon 224 24 h=16;Fill Brick 224 64 nx=2
Cannon 288 16 h=16;Fill Block 312 32 nx=4;Koopa 352 28 flying=true;Cannon 368 24 h=24;Koopa 424 22 flying=true
Cannon 448 8;Cannon 448 24 h=16;Fill Brick 496 32 nx=2;Stone 512 32;Cannon 512 48 h=16;Koopa 520 16 flying=true
Brick 520 32 c=Coin;Brick 528 32;Cannon 544 16 h=16;Floor 600 0 w=616;Pipe 608 0 h=24 piranha=true
Fill Brick 656 32 nx=7 ny=2 dy=23;HammerBro 680 44;HammerBro 692 76;Pipe 744 0 h=24 piranha=true t=2;Block 744 64 c=Mushroom1Up hidden=true
Cannon 832 16 h=16;Pipe 872 0 h=24 piranha=true;Koopa 912 12;Pipe 920 0 h=16 piranha=true e=1
Cannon 976 16 h=16;Pipe 1024 0 h=16 piranha=true;Fill Brick 1072 32 nx=5 ny=2 dy=32;HammerBro 1080 12;HammerBro 1096 44
Stone 1128 24;Cannon 1168 8;Cannon 1168 24 h=16;Fill Brick 1192 40 nx=2;Springboard 1208 14.5;Brick 1208 88 c=Mushroom
Floor 1224 0 w=432;Stone 1224 8;Fill Brick 1224 56 nx=2;Stone 1232 16 h=16;Stone 1240 24 h=24;Stone 1248 32 h=32;Stone 1256 40 h=40;Stone 1264 48 h=48
Stone 1296 8;Stone 1304 16 h=16;Stone 1312 24 h=24;Stone 1320 32 h=32;Stone 1328 40 h=40;Stone 1336 48 h=48;Stone 1344 56 h=56;Stone 1352 64 h=64 w=16;Beetle 1360 72.5
EndOutsideCastle 1432 0 t={"map":"7-2"}
'''),
area('Underworld','''
Ceiling 32 0 w=56;Floor 0 0 w=136;Fill Brick 0 8 ny=11;Fill Brick 32 8 nx=7 ny=3
Fill Coin 33 31 nx=7 ny=2 dx=8 dy=16;Fill Coin 41 63 nx=5 dx=8;PipeHorizontal 104 16;PipeVertical 120 88 h=88
''')]}
r2=json.loads((OUT/'world-2.json').read_text())
m2=copy.deepcopy(r2['maps'][1]);m2['name']='7-2'
uw=m2['areas'][1];a=uw['creation']
# Preserve source differences, including irregular coordinates/field names and missing exit transport.
for q in a:
 k=q.get('macro') or q.get('thing');x=q.get('x');y=q.get('y')
 if k=='Fill' and q.get('thing')=='Coin' and x==121:q['x']=120
 if q.get('thing')=='Stone' and x==632 and y==88:q['x']=532
 if q.get('thing')=='Stone' and x==664 and y==64:q.pop('width',None);q['height']=24
 if q.get('thing')=='Coin' and x==1073:q['x']=1072
 if q.get('thing')=='Coin' and x==1105:q['x']=1104
 if q.get('thing')=='CheepCheep' and x==1344:q['smart']=True
 if k=='Fill' and x==1281:q.update(y=32,yheight=-24)
 if k=='Fill' and x==1448:
  q.pop('ynum');q.pop('yheight');q.update(yum=2,Yheight=32)
 if q.get('thing')=='Stone' and x==1512 and y==32:q['height']=32
 if q.get('thing')=='Stone' and x==1512 and y==88:q.pop('height',None);q['width']=88
 if q.get('thing')=='PipeHorizontal' and x==1520:q.pop('transport',None);q.pop('small',None);q['width']=16
 if q.get('thing')=='Stone' and x==1528:q['width']=112
uw['creation']=[q for q in a if not(q.get('thing')=='Coral' and q.get('x')==344) and not(q.get('macro')=='Floor' and q.get('x')==1640)]
uw['creation']+=rows('''Blooper 208 46;Blooper 424 46;Blooper 624 54;Blooper 728 16;CheepCheep 816 24;Blooper 1208 38;Blooper 1392 14;Blooper 1440 14''')
exitroom=m2['areas'][2]
for q in exitroom['creation']:
 if q.get('macro')=='Floor':q['width']=336
 if q.get('thing')=='Stone' and q.get('x')==72:q.pop('width',None)
 if q.get('macro')=='EndOutsideCastle':q['transport']={'map':'7-3'}
exitroom['creation'].insert(-1,{'thing':'Stone','x':80,'y':64,'height':64})
m3=copy.deepcopy(r2['maps'][2]);m3['name']='7-3'
for q in m3['areas'][0]['creation']:
 if q.get('macro')=='EndOutsideCastle':q['transport']={'map':'7-4'}
m3['areas'][0]['creation']+=rows('''
Koopa 312 36;Koopa 416 44 jumping=true;Fill Coin 576 56 nx=2 dx=24;Fill Coin 584 64 nx=2 dx=8
Koopa 632 36 smart=true;Koopa 760 36 smart=true;Koopa 952 12 smart=true
Koopa 1120 52 jumping=true flying=true;Koopa 1248 36 jumping=true flying=true
''')
m4={'name':'7-4','locations':[loc(entry='Castle')],'areas':[area('Castle','''
StartInsideCastle 0 0;Stone 0 88 w=128 h=24;Floor 40 24 w=88;Water 128 0 w=88;Stone 128 88 w=128
Platform 144 48 w=16 falling=true;Podoboo 160 -32;Platform 176 40 w=16 falling=true;Floor 216 24 w=40;Stone 224 80 w=32 h=16;Section 256 0
''',sections=[
{'before':part(48,'Floor 0 0 w=48;Stone 0 88 w=48;Stone 16 32 w=32;Stone 32 40 w=16;Stone 40 48 w=8'),
 'stretch':part(8,'Floor 0 0;SectionPass 0 24 h=24;Stone 0 56 h=32;SectionFail 0 80 h=24;Stone 0 88'),
 'after':part(24,'Floor 0 0 w=24;Stone 0 88 w=24;Section 24 0 section=1')},
{'before':part(8,'Floor 0 0;Stone 0 24;Stone 0 88'),
 'stretch':part(8,'Floor 0 0;SectionFail 0 16 h=16;Stone 0 24;SectionPass 0 48 h=24;Stone 0 56;SectionFail 0 80 h=24;Stone 0 88'),
 'after':part(32,'Floor 0 0 w=32;Stone 0 24;Stone 0 88 w=32;Section 32 0 section=2')},
{'stretch':part(8,'Floor 0 0;SectionFail 0 24 h=24;Stone 0 56 h=32;SectionPass 0 80 h=24;Stone 0 88'),
 'after':part(80,'Floor 0 0 w=80;Stone 0 40;Stone 0 48 w=16;Stone 0 56 w=32;Stone 0 88 w=80;Stone 40 24 w=24 h=24;SectionDecider 80 0 pass=3 fail=0')},
{'before':part(136,'Floor 0 24 w=24;Stone 0 88 w=136;Floor 24 0 w=32;Stone 48 56 w=16;Water 56 0 w=24;Stone 72 56 w=24;Floor 80 0;CastleBlock 80 48 fireballs=6 direction=1;Water 88 0 w=24;Stone 104 56 w=32;Floor 112 0 w=24'),
 'stretch':part(8,'SectionFail 0 24 h=24;SectionPass 0 80 h=24;Floor 0 0;Stone 0 56 h=32;Stone 0 88'),
 'after':part(80,'Section 0 0 section=4')},
{'before':part(64,'Floor 0 0 w=64;Stone 0 88 w=64;Stone 16 56 w=24;Stone 24 24 w=24;Stone 56 56'),
 'stretch':part(8,'Floor 0 0;Stone 0 24;Stone 0 56;Stone 0 88'),
 'after':part(64,'Floor 0 0 w=64;Stone 0 24;Stone 0 88 w=64;Stone 24 56 w=24;Stone 32 24 w=24;Section 64 0 section=5')},
{'before':part(32,'Floor 0 0 w=16;Stone 0 56 h=32;Stone 0 88 w=32;Stone 8 56 w=24;Floor 16 8;Floor 24 16'),
 'stretch':part(8,'Floor 0 24;SectionPass 0 80 h=24;Stone 0 56;SectionFail 0 48 h=24;Stone 0 88'),
 'after':part(56,'Floor 0 24 w=56;Stone 0 88 w=56;SectionDecider 56 80 h=56 pass=6 fail=3')},
{'before':part(272,'''Floor 0 0 w=24;Stone 0 88 w=272;Floor 24 24 w=24;Floor 48 0 w=16;Floor 64 24 w=64
Floor 128 0 w=16;Floor 144 24 w=16;Floor 160 0 w=16;Floor 176 24 w=16;Floor 192 0 w=16;Floor 208 24 w=64
EndInsideCastle 272 0 spawnType=HammerBro throwing=false t={"map":"8-1"}''')}
]) ]}
save(7,[m1,m2,m3,m4])
