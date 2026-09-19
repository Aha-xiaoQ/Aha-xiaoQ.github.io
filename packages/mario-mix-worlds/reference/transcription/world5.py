from common import *
import copy
m1={'name':'5-1','locations':[loc(entry='Plain'),loc(entry='PipeVertical'),loc(1)],'areas':[
area('Overworld Alt','''
Floor 0 0 w=392;Koopa 128 12;Fill Goomba 152 8 nx=3 dx=21;Fill Goomba 240 8 nx=3 dx=21;Fill Goomba 328 12 nx=2 dx=21;Pipe 352 0 h=24 piranha=true
Floor 408 0 w=328;Pipe 408 0 h=24 piranha=true;Koopa 488 32 jumping=true;Goomba 520 8 nx=3 dx=12;Goomba 608 8 nx=3 dx=12;Koopa 696 16 jumping=true
Stone 712 24 h=24;Stone 712 32 w=40;Fill Brick 720 64 nx=2 dx=16;Brick 728 64 c=Star
Floor 768 0 w=324;Fill Goomba 824 8 nx=3 dx=12;Cannon 888 16 h=16;Floor 928 0 w=288;Stone 928 24 h=24
Fill Goomba 968 8 nx=3 dx=12;Koopa 1016 12;Fill Goomba 1080 8 nx=3 dx=12;Fill Koopa 1152 12 nx=2 dx=12
Stone 1176 32 w=32;Block 1184 32 c=Mushroom1Up hidden=true;Fill Brick 1192 32 nx=2
Floor 1240 0 w=552;Stone 1248 32 w=16;Pipe 1248 32 h=16 piranha=true t=2;Cannon 1272 16 h=16
Pipe 1304 0 h=16 piranha=true e=1;Cannon 1360 16 h=16;Koopa 1424 12 jumping=true
Stone 1456 8;Brick 1456 44;Stone 1464 16 h=16;Stone 1472 24 h=24;Stone 1480 32 h=32;Stone 1488 40 h=40;Stone 1512 64 w=16 h=48
EndOutsideCastle 1592 0 t={"map":"5-2"}
'''),
area('Underworld','''
Floor 0 0 w=136;Ceiling 32 0 w=56;Fill Brick 0 8 ny=11;Fill Brick 32 48 nx=7;Brick 32 56
Fill Coin 41 55 nx=5 ny=2 dx=8 dy=8;Fill Brick 80 56 ny=4;Brick 88 56 nx=2;Brick 112 48 c=Coin
PipeHorizontal 104 16 t=1;PipeVertical 120 88 h=88
''')]}
m2={'name':'5-2','locations':[loc(entry='Plain'),loc(entry='PipeVertical'),loc(xloc=1032),loc(1),loc(2,'Plain')],'areas':[
area('Overworld Alt','''
Floor 0 0 w=208;Stone 96 8;Stone 104 16 h=16;Stone 112 24 w=16 h=24;Stone 120 32 w=32;Cannon 136 48 h=16;Fill Coin 169 71 nx=3 dx=8;Koopa 184 12;Springboard 200 14.5
Floor 232 0 w=296;Fill Brick 232 32 nx=6;Fill Brick 232 64 nx=5;Fill Coin 233 39 nx=3 dx=8;Brick 272 64 c=Mushroom
Koopa 320 32 jumping=true;Stone 352 8;Stone 360 16 h=16;Stone 368 24 h=24;HammerBro 368 36;Stone 376 32 w=16 h=32;Stone 392 16 h=16;Pipe 440 0 h=24 piranha=true t=3
Stone 496 8;Stone 504 16 h=16;Goomba 504 24;Stone 512 24 h=24;Stone 520 32 h=32;Goomba 520 40
Floor 544 0 w=192;Stone 544 40 h=40;Stone 552 48 w=16 h=48;Fill Block 624 32 nx=5;HammerBro 648 46
Block 672 32 hidden=true;Brick 680 64 c=["Vine",{"entrance":4}];Fill Brick 688 64 nx=2;Fill Coin 689 71 nx=2 dx=8;Fill Brick 712 40 nx=3;Fill Coin 713 7 nx=2 dx=8
Floor 768 0 w=248;Koopa 848 32 jumping=true;Cannon 856 16 h=16;Pipe 920 0 h=16 piranha=true e=1
Fill Brick 944 32 nx=8;Fill Brick 944 64 nx=7;HammerBro 960 44;HammerBro 992 76;Brick 1000 64 c=Star
Floor 1032 0 w=120;Stone 1032 24 h=24;Fill Beetle 1088 8.5 nx=3 dx=8.5;Brick 1128 16 c=Coin;Brick 1136 16 c=Mushroom
Fill Brick 1176 32 nx=3;Floor 1208 0 w=152;Fill Brick 1124 64 nx=5;Fill Goomba 1240 8 nx=2 dx=12
Koopa 1256 76 smart=true;Koopa 1304 28 jumping=true;Koopa 1328 20 jumping=true;Block 1344 32 c=Mushroom
Fill Brick 1376 64 nx=4;Fill Coin 1377 71 nx=2 dx=8;Floor 1384 0 w=16;Pipe 1384 0 h=16;Floor 1416 0 w=64
Stone 1464 8;Stone 1472 16 h=16;Floor 1488 0 w=16;Stone 1488 32 h=32;Koopa 1488 64 jumping=true;Stone 1496 40 h=40
Floor 1512 0 w=280;Stone 1512 56 h=56;Stone 1520 64 w=16 h=64;EndOutsideCastle 1600 0 t={"map":"5-3"}
'''),
area('Underwater','''
Floor 0 0 w=176;Stone 88 56 w=40;Coral 96 24 h=24;Coral 120 72 h=16;Blooper 136 24;Coral 160 32 h=32
Fill Coin 177 47 nx=10 dx=8;PlatformGenerator 182 0 w=24;Floor 208 24 w=16;Stone 208 88 w=16 h=24;CheepCheep 220 60
PlatformGenerator 230 0 w=24;Floor 256 24 w=16;Stone 256 0 w=16 h=24;Floor 272 0 w=32;Blooper 272 24
Coral 304 64 h=32;Stone 304 72 w=48;CheepCheep 312 20;Floor 320 0 w=16;Fill Coin 321 7 nx=2 dx=8
Coral 344 64 h=32;Blooper 348 22;Floor 352 0 w=168;Coral 368 16 h=16;CheepCheep 388 40 smart=true
Stone 400 32 w=32;Fill Coin 401 39 nx=4 dx=8;CheepCheep 424 84;Stone 432 56 w=32;Fill Coin 433 63 nx=4 dx=8
Stone 472 8;Stone 480 16 h=16;Stone 488 32 w=16 h=40;Stone 488 88 w=16 h=40;PipeHorizontal 496 48 t=1;Stone 504 88 w=16 h=88
''',underwater=True),
area('Sky','''
Stone 0 0 w=32;Stone 40 0 w=576;Platform 120 32 w=16 transport=true
Fill Coin 120 64 nx=16;Fill Coin 256 80 nx=3;Fill Coin 288 72 nx=16;Fill Coin 424 80 nx=3
''',exit=2)]}
# 5-3 shares 1-3's reference layout; retain its narrower/differently placed platforms and bullet zone.
r=json.loads((BASE/'first-world.json').read_text())
m3=copy.deepcopy(next(m for m in r['maps'] if m['name']=='1-3'));m3['name']='5-3'
a=m3['areas'][0];a.pop('widthUnits',None);a['creation'].insert(1,{'macro':'BulletBillsStart','width':128})
for q in a['creation']:
 if q.get('thing')=='Platform':
  x=q['x']
  if x==440:q['width']=16
  elif x==688:q.update(x=672,width=20)
  elif x==752:q.update(x=756,width=20)
  elif x==1048:q.update(x=1052,width=20,begin=1008,end=1076)
 if q.get('macro')=='EndOutsideCastle':q['transport']={'map':'5-4'}
a['creation'].insert(-1,{'macro':'BulletBillsStop','x':1152})
# 5-4 uses the source 2-4 layout with different hazards and boss definition.
r2=json.loads((OUT/'world-2.json').read_text());m4=copy.deepcopy(r2['maps'][3]);m4['name']='5-4'
a=m4['areas'][0]
for q in a['creation']:
 if q.get('thing')=='CastleBlock':
  if (q['x'],q['y'])==(184,48):q.update(fireballs=12,direction=1)
  if (q['x'],q['y']) in [(344,0),(440,0),(536,0),(824,16)]:q.update(fireballs=6,direction=1)
 if q.get('macro')=='EndInsideCastle':q.update(spawnType='Lakitu',transport={'map':'6-1'})
for anchor,obj in [((176,48),{'thing':'Podoboo','x':160,'y':-24}),((888,24),{'thing':'Podoboo','x':872,'y':-32}),((920,0),{'thing':'Podoboo','x':904,'y':-32}),((1108,56),{'thing':'Podoboo','x':1048,'y':-40})]:
 i=next(i for i,q in enumerate(a['creation']) if (q.get('x'),q.get('y'))==anchor);a['creation'].insert(i,obj)
save(5,[m1,m2,m3,m4])
