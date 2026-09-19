from common import *
import copy
m1={'name':'6-1','locations':[loc(entry='Plain')],'areas':[area('Overworld Night','''
Floor 0 0 w=160;Lakitu 184 84;Fill Block 128 32 nx=2;Floor 176 0 w=72
Stone 208 8 w=48;Stone 232 16 w=40;Stone 256 24 w=32;Stone 280 32 w=24;Brick 288 64 c=Mushroom
Floor 296 0 w=16;Brick 296 64;Floor 328 0 w=128;Fill Brick 328 32 nx=2;Brick 344 32 c=Coin
Floor 472 0 w=120;Fill Coin 497 31 nx=3 dx=8;Stone 552 8;Stone 560 16 h=16;Stone 568 24 h=24;Stone 576 32 w=16 h=32
Fill Coin 609 47 nx=2 dx=8;Floor 616 0 w=128;Stone 672 16;Stone 680 24 h=16;Stone 696 40 h=40;Stone 704 48 h=48;Stone 712 56 h=56
Block 720 40 c=Mushroom1Up hidden=true;Fill Brick 720 56 nx=3;Fill Brick 736 24 nx=3
Floor 768 0 w=248;Pipe 816 0 h=24 piranha=true;Fill Coin 841 39 nx=3 dx=8;Fill Block 904 32 ny=2 dy=32 hidden=true
Stone 976 8;Stone 984 16 h=16;Stone 992 24 h=24;Stone 1000 32 h=32;Stone 1008 40 h=40;Fill Brick 1016 40 nx=2
Fill Brick 1040 8 nx=5;Brick 1048 40;Floor 1072 0 w=16;Floor 1096 0 w=96
Stone 1144 8;Stone 1152 16 h=16;Stone 1160 24 h=24;Stone 1168 32 h=32;Stone 1176 40 h=40;Stone 1184 48 h=48
Fill Brick 1192 48 nx=2;Brick 1208 32;Fill Brick 1216 16 nx=3;Brick 1216 32 c=Coin
Floor 1240 0 w=72;Floor 1336 0 w=56;Stone 1352 8;Stone 1360 16 h=16;Stone 1368 24 h=24;Stone 1376 32 h=32;Stone 1384 40 h=40
Floor 1408 0 w=240;LakituStop 1408 0;Stone 1408 64 w=16 h=64;EndOutsideCastle 1488 0 t={"map":"6-2"}
''')]}
m2={'name':'6-2','locations':[loc(entry='Plain'),loc(entry='PipeVertical'),loc(entry='PipeVertical'),loc(xloc=1304),loc(entry='PipeVertical'),loc(1),loc(2),loc(3,'Vine'),loc(4)],'areas':[
area('Overworld Night','''
Floor 0 0 w=984;Fill Brick 80 32 nx=3;Pipe 152 0 h=32 piranha=true t=5;Brick 184 64;Block 192 32 hidden=true;Brick 192 64 c=Coin;Brick 200 64;Koopa 208 12
Pipe 224 0 h=32 piranha=true;Stone 256 40 w=16;Pipe 256 40 h=16 piranha=true;Pipe 280 0 h=16 piranha=true e=1;Pipe 296 0 h=16 piranha=true
Koopa 344 32 jumping=true;Pipe 368 0 h=32 piranha=true;Brick 408 32;Brick 416 32 c=Mushroom;Beetle 432 8.5
Pipe 448 0 h=40 piranha=true t=6;Stone 496 32 w=16;Pipe 496 32 h=16 piranha=true;Pipe 536 0 h=16 piranha=true
Fill Brick 616 64 nx=4;Pipe 640 0 h=24 piranha=true;Block 656 32 hidden=true;Brick 648 64 c=["Vine",{"transport":7}]
Pipe 672 0 h=16 piranha=true;Pipe 696 0 h=48 piranha=true;Beetle 736 8.5;Pipe 752 0 h=24 piranha=true;Pipe 816 0 h=32;Pipe 840 0 h=16 piranha=true
Fill Brick 880 32 nx=2 dx=24;Stone 888 32 w=16;Pipe 888 32 h=24 piranha=true;Pipe 920 0 h=16 piranha=true e=2;Brick 920 64;Fill Brick 952 64 nx=9;Beetle 950 72.5
Floor 1032 0 w=96;Pipe 1048 0 h=16 piranha=true;Pipe 1080 0 h=16 piranha=true;Fill Brick 1104 40 nx=2;Brick 1120 64 c=Star;Brick 1128 64
Floor 1136 0;Floor 1152 0 w=64;Fill Brick 1152 32 nx=3;Fill Brick 1160 64 nx=2;Stone 1192 8;Stone 1200 16 h=16;Stone 1208 24 h=24
Floor 1224 0 w=696;Pipe 1224 0 h=24 piranha=true t=8;Stone 1248 32 h=32;Stone 1256 16 h=16
Fill Brick 1280 32 nx=3 ny=2 dy=32;Beetle 1304 8.5;Stone 1336 32 w=16;Pipe 1336 32 h=24 piranha=true;Goomba 1352 8
Pipe 1392 0 h=32 piranha=true;Pipe 1432 0 h=16 piranha=true e=4;Pipe 1448 0 h=24 piranha=true;Pipe 1464 0 h=32 piranha=true;Pipe 1512 0 h=24 piranha=true
Stone 1592 8;Stone 1600 16 h=16;Pipe 1608 0 h=32 piranha=true;Stone 1624 40 h=40;Stone 1632 48 h=48;Stone 1640 56 h=56;Stone 1648 64 h=64;Koopa 1648 84 jumping=true
EndOutsideCastle 1728 0 t={"map":"6-3"}
'''),
area('Underworld','''
Ceiling 32 0 w=56;Floor 0 0 w=136;Fill Brick 0 8 ny=11;Fill Brick 32 48 nx=7;Brick 32 56
Fill Coin 42 55 nx=5 ny=2 dx=8 dy=8;Fill Brick 80 56 ny=4;Fill Brick 112 48 c=Coin;PipeHorizontal 104 16 t=1;PipeVertical 120 88 h=88
''') ]}
# Exact source differences from 5-2's reused water room, including the upstream x=1220 anomaly.
r5=json.loads((OUT/'world-5.json').read_text());uw=copy.deepcopy(r5['maps'][1]['areas'][1])
for q in uw['creation']:
 k=q.get('thing') or q.get('macro');x=q.get('x');y=q.get('y')
 if k=='Coral' and x==120:q['x']=1220
 if k=='PlatformGenerator' and x==182:q.update(x=186,width=16)
 if k=='PlatformGenerator' and x==230:q.update(x=234,width=16)
 if k=='Stone' and x==256 and y==0:q['y']=88
 if k=='Stone' and x==488:q['height']=32
 if k=='PipeHorizontal':q.update(width=16,transport=2)
uw['creation'].append({'thing':'ScrollBlocker','x':520})
m2['areas'].append(uw)
r3=json.loads((OUT/'world-3.json').read_text());sky=copy.deepcopy(r3['maps'][0]['areas'][2]);sky['exit']=3;sky.pop('blockBoundaries',None);m2['areas'].append(sky)
m2['areas'].append(area('Underworld','''
Ceiling 32 0 w=88;Floor 0 0 w=136;Fill Brick 0 8 ny=11;Fill Brick 24 16 ny=3
Fill Coin 25 39 nx=8 dx=8;Fill Coin 25 7 nx=10 dx=8;Fill Brick 32 32 nx=6;Fill Brick 80 16 ny=3
PipeHorizontal 104 16 t=4;Brick 104 32 c=Mushroom;PipeVertical 120 88 h=88
'''))
m3={'name':'6-3','time':300,'locations':[loc(entry='Plain')],'areas':[area('Overworld Night Alt2','''
Floor 0 0 w=128;BulletBillsStart 128 0;Tree 144 0 w=24;Tree 168 32 w=24;Tree 192 0 w=24
Platform 224 0 w=16 floating=true begin=0 end=56;Fill Coin 226 87 nx=2 dx=8;Tree 248 32 w=32;Tree 296 0 w=24;Springboard 304 14.5
Tree 344 0 w=24;Fill Coin 345 71 nx=7 dx=8;Platform 348 64 w=16 sliding=true begin=312 end=364;Platform 388 47 w=16 sliding=true begin=356 end=400
Tree 392 16 w=32;Block 440 80 c=Mushroom;Platform 444 56 w=16 sliding=true begin=408 end=464;Platform 480 7 w=16 floating=true begin=-8 end=52
Tree 520 32 w=40;Scale 572 86 widthLeft=16 widthRight=16 between=32 dropRight=56;Fill Coin 585 63 nx=2 dx=8
Scale 636 86 widthLeft=16 widthRight=16 between=24 dropRight=56;Tree 680 24 w=40;Tree 680 80 w=24;Fill Coin 681 87 nx=3 dx=8
Tree 720 40 w=24;Tree 744 0 w=24;Tree 776 0 w=32;Fill Coin 801 39 nx=4 dx=8;Tree 824 0 w=24;Tree 856 32 w=40
Tree 904 0 w=40;Springboard 928 14.5;Platform 972 63 w=16 sliding=true begin=940 end=992;Tree 984 0 w=24
Scale 1020 86 widthLeft=16 widthRight=16 between=24 dropLeft=32 dropRight=56;Fill Coin 1025 63 nx=2 dx=8
Tree 1056 0 w=32;Tree 1056 64 w=24;Tree 1080 32 w=32
Platform 1128 47 w=16 falling=true;Platform 1160 55 w=16 falling=true;Fill Coin 1161 47 nx=2 dx=8
Platform 1192 51 w=16 falling=true;Platform 1224 59 w=16 falling=true;Fill Coin 1233 87 nx=2 dx=8
Tree 1246 72 w=24;Floor 1280 0 w=256;BulletBillsStop 1280 0;EndOutsideCastle 1336 0 large=true walls=15 t={"map":"6-4"}
''')]}
m4={'name':'6-4','time':300,'locations':[loc(entry='Castle')],'areas':[area('Castle','''
StartInsideCastle 0 0;Stone 0 88 w=192 h=24;Floor 40 24 w=64;Water 104 8 w=16;Floor 120 24 w=88
Stone 184 64;CastleBlock 184 56 fireballs=6;Stone 192 88 w=1088;Water 208 0 w=24;Podoboo 216 -32
Floor 232 24 w=24;CastleBlock 240 24 fireballs=6;Block 240 56 c=Mushroom;Water 256 0 w=24;Podoboo 264 -32
Stone 280 32 w=296;Stone 280 24 w=552 h=24;Floor 280 0 w=744;Stone 296 80 w=280 h=24
CastleBlock 296 56 fireballs=6;CastleBlock 392 56 fireballs=6;CastleBlock 480 56 fireballs=6;CastleBlock 536 56 fireballs=6;CastleBlock 608 32 fireballs=6
Stone 640 80;CastleBlock 640 72 fireballs=6;CastleBlock 672 32 fireballs=6;Stone 704 80;CastleBlock 704 72 fireballs=6 direction=1;CastleBlock 736 32 fireballs=6
Stone 776 80 w=56 h=16;Fill Block 848 32 nx=3 dx=24 c=Coin hidden=true;Fill Block 856 64 nx=3 dx=24 c=Coin hidden=true
Stone 928 24 w=32 h=24;Stone 984 24 w=40 h=24;Stone 984 80 w=40 h=16
EndInsideCastle 1024 0 spawnType=Blooper throwing=true t={"map":"7-1"}
''')]}
save(6,[m1,m2,m3,m4])
