from common import *
def part(w,s):return {'width':w,'creation':rows(s)}
m1={'name':'8-1','time':300,'locations':[loc(entry='Plain'),loc(entry='PipeVertical'),loc(1)],'areas':[
area('Overworld','''
Floor 0 0 w=368;Beetle 144 8.5;Fill Goomba 184 8 nx=3 dx=12;Fill Goomba 240 8 nx=3 dx=12;Pipe 280 0 h=32 piranha=true;Fill Koopa 344 12 nx=2 dx=12
Floor 376 0;Floor 392 0 w=16;Floor 416 0 w=16;Floor 440 0 w=16;Floor 464 0 w=888
Koopa 488 12;Coin 513 39;Fill Goomba 552 8 nx=3 dx=12;Pipe 608 0 h=32 piranha=true;Block 640 40 c=Mushroom1Up hidden=true;Beetle 648 8.5
Pipe 656 0 h=24 piranha=true;Coin 713 39;Pipe 752 0 h=32 piranha=true;Coin 786 39;Pipe 832 0 h=32 piranha=true t=2
Fill Goomba 864 8 nx=3 dx=12;Fill Coin 873 71 nx=2 dx=8;Pipe 920 0 h=16 piranha=true e=1;Koopa 952 12
Fill Koopa 992 12 nx=3 dx=12;Fill Koopa 1040 12 nx=3 dx=12;Pipe 1120 0 h=24 piranha=true;Fill Goomba 1184 8 nx=3 dx=12
Stone 1224 32 h=32;Fill Brick 1232 64 nx=4;Block 1264 32 hidden=true;Brick 1264 64 c=Mushroom;Fill Brick 1272 64 nx=3
Koopa 1288 32 jumping=true;Stone 1304 32 h=32;Floor 1360 0;Floor 1376 0 w=16;Koopa 1376 32 jumping=true
Floor 1400 0;Floor 1416 0 w=16;Koopa 1416 28 jumping=true;Floor 1416 0 w=16;Floor 1440 0 w=136
Fill Brick 1472 40 nx=2;Brick 1488 40 c=Star;Fill Brick 1496 40 nx=5;Floor 1584 0;Floor 1600 0;Floor 1616 0 w=152
Fill Koopa 1656 12 nx=2 dx=12;Stone 1680 16 h=16;Fill Coin 1785 39 nx=2 dx=8
Floor 1816 0 w=80;Fill Goomba 1856 8 nx=3 dx=12;Floor 1904 0 w=16;Pipe 1904 0 h=24 piranha=true
Floor 1936 0 h=32 piranha=true;Floor 1968 0 w=352;Pipe 1968 0 h=40;Beetle 2032 8.5
Fill Goomba 2056 8 nx=3 dx=12;Fill Goomba 2112 8 nx=3 dx=12;Fill Goomba 2176 8 nx=2 dx=12
Stone 2200 8;Stone 2208 16 h=16;Stone 2216 24 h=24;Stone 2224 32 h=32;Stone 2232 40 h=40;Stone 2240 48 h=48
Beetle 2264 8.5;Fill Coin 2265 39 nx=2 dx=8;Fill Coin 2329 39 nx=2 dx=40;Floor 2344 0 w=16;Floor 2384 0 w=128
Fill Stone 2424 16 nx=2 dx=32 h=16;Koopa 2440 12;Fill Coin 2529 39 nx=2 dx=8;Floor 2552 0;Fill Coin 2569 39 nx=2 dx=8
Floor 2600 0 w=272;Koopa 2656 12;Fill Koopa 2712 12 nx=3 dx=12;Pipe 2752 0 h=24 piranha=true;Pipe 2840 0 h=16 piranha=true
Floor 2880 0;Stone 2880 16 h=16;Floor 2896 0;Stone 2896 32 h=32;Floor 2912 0;Stone 2912 48 h=48
Floor 2928 0 w=288;Stone 2928 64 w=16 h=64;EndOutsideCastle 3008 0 t={"map":"8-2"}
'''),
area('Underworld','''
Floor 0 0 w=136;Fill Brick 0 8 ny=11;Fill Brick 24 32 nx=9;Fill Brick 24 64 nx=10 ny=4
Fill Coin 25 7 nx=9 dx=8;Fill Coin 33 39 nx=8 dx=8;Brick 96 32 c=Coin;Fill Brick 104 24 nx=2 ny=9
PipeHorizontal 104 16 t=1;PipeVertical 120 100 h=100
''')]}
m2={'name':'8-2','locations':[loc(entry='Plain'),loc(entry='PipeVertical'),loc(1)],'areas':[
area('Overworld','''
Floor 0 0 w=120;Floor 128 0 w=40;Lakitu 128 84;Stone 136 8;Stone 144 16 h=16;Stone 152 24 h=24;Stone 160 32 h=32
Floor 176 0 w=112;Stone 176 48 h=48;Stone 184 56 h=56;Stone 192 64 w=16 h=64;Fill Block 232 32 nx=4
Floor 296 0 w=64;Brick 344 64;Springboard 352 14.5;Brick 352 64 c=Mushroom1Up;Fill Brick 360 64 nx=31
Floor 368 0 w=32;Floor 408 0;Floor 424 0 w=24;Floor 456 0 w=48;Koopa 456 26 jumping=true
Floor 512 0 w=112;Fill Brick 616 32 nx=2;Floor 640 0 w=32;Floor 680 0 w=424
Cannon 680 16 h=16;Koopa 736 32 jumping=true;Cannon 744 8 nofire=true;Koopa 760 24 jumping=true
Brick 792 32;Brick 800 32 c=Mushroom;Cannon 840 16 h=16;Fill Brick 880 32 nx=8;Beetle 888 8.5
Cannon 920 8;Brick 944 32;Stone 952 32;Cannon 952 40;Brick 960 32 c=Mushroom;Beetle 968 8.5;Beetle 984 8.5;Cannon 1000 24 h=24
Pipe 1048 0 h=16 piranha=true;Floor 1112 0 w=40;Koopa 1112 12 jumping=true;Pipe 1136 0 h=16 piranha=true;Floor 1160 0;Floor 1176 0
Floor 1232 0 w=160;Pipe 1248 0 h=32 piranha=true t=2;Pipe 1304 0 h=16 piranha=true e=1
Koopa 1360 32 jumping=true;Koopa 1376 24 jumping=true;Floor 1400 0;Cannon 1400 16 h=16;Koopa 1400 48 jumping=true
Floor 1432 0 w=184;Stone 1456 8;Stone 1464 16 h=16;Stone 1472 24 h=24;Goomba 1472 32
Stone 1480 32 h=32;Stone 1488 40 h=40;Goomba 1488 48;Beetle 1512 8.5;Cannon 1528 8 nofire=true;Cannon 1528 24 h=16
Stone 1592 8;Stone 1600 16 h=16;Stone 1608 24 h=24;Floor 1624 0;Stone 1624 40 h=40;Koopa 1624 72 jumping=true
Floor 1648 0 w=320;LakituStop 1648 0;Stone 1648 64 w=16 h=64;EndOutsideCastle 1728 0 t={"map":"8-3"}
'''),
area('Underworld','''
Ceiling 32 0 w=7;Floor 0 0 w=136;Fill Brick 0 8 ny=11;Fill Brick 32 48 nx=7;Brick 32 56
Fill Coin 42 55 nx=5 ny=2 dx=8 dy=8;Fill Brick 80 56 ny=4;Fill Brick 88 56 nx=2;Brick 112 48 c=Coin
PipeHorizontal 104 16 t=1;PipeVertical 120 88 h=88
''')]}
m3={'name':'8-3','time':300,'locations':[loc(entry='Plain')],'areas':[area('Overworld','''
Floor 0 0 w=552;Cannon 144 16 h=16;Koopa 240 32 jumping=true;Cannon 272 24 h=24;Pipe 424 0 h=23 piranha=true
Fill Brick 480 32 nx=8;Fill Brick 480 64 nx=6;HammerBro 504 12;HammerBro 520 44;Brick 528 64 c=Mushroom;Brick 536 64
Floor 568 0 w=32;Stone 568 32 h=32;Stone 576 24 h=24;Stone 584 16 h=16;Stone 592 8
Floor 616 0 w=376;Cannon 688 16 h=16;Koopa 744 24 jumping=true;Stone 760 24 h=24;Stone 872 32 w=16 h=32
Fill Brick 920 32 nx=8;Brick 920 64;Brick 928 64 c=Mushroom;HammerBro 936 44;Fill Brick 936 64 nx=6;HammerBro 952 12
Floor 1008 0 w=16;Pipe 1008 0 h=23 piranha=true;Floor 1040 0 w=536;Koopa 1096 12;HammerBro 1168 12;HammerBro 1270 12
Pipe 1344 0 h=24 piranha=true;HammerBro 1416 12;HammerBro 1480 12;Brick 1520 32 c=Coin
Stone 1560 16 h=16;Stone 1584 16;Stone 1600 32;Stone 1616 48;Stone 1632 64 w=16
Floor 1664 0 w=256;EndOutsideCastle 1712 0 castleDistance=48 large=true walls=13 t={"map":"8-4"}
''')]}
m4={'name':'8-4','locations':[loc(entry='Castle'),loc(entry='PipeVertical'),loc(1,'PipeVertical'),loc(2,'PipeVertical'),loc(3,'PipeVertical',xloc=0),loc(4,'PipeVertical')],'areas':[
area('Castle','''
StartInsideCastle 0 0;Stone 0 88 w=256;Floor 40 24;Water 48 0 w=40;Floor 88 0 w=64;Pipe 152 16 h=Infinity piranha=true e=1;Section 168 0
''',sections=[{'stretch':part(8,'Floor 0 0;Stone 0 88'),
'after':part(424,'''Pipe 0 16 h=Infinity piranha=true t=1;Stone 0 88 w=424;Floor 16 0 w=72;Fill Goomba 36 8 nx=3 dx=12
Floor 88 24 w=32;Water 120 0 w=136;Platform 152 0 w=16 sliding=true begin=140 end=232 speed=2
Floor 256 24 w=48;Stone 264 56 w=32;Pipe 304 40 h=Infinity piranha=true t=2;Floor 320 24 w=56;Pipe 376 48 h=Infinity piranha=true
Floor 392 24 w=32;Section 424 0''')}]),
area('Castle','Pipe 0 16 h=Infinity piranha=true e=2;Stone 0 88 w=16;Section 16 0',sections=[{
'before':part(328,'''Stone 0 88 w=328;Floor 0 0 w=40;Pipe 40 24 h=Infinity piranha=true;Floor 56 0 w=64;Fill Beetle 88 8.5 nx=2 dx=16
Pipe 120 16 h=Infinity piranha=true t=1;Floor 136 0 w=64;Koopa 176 32 jumping=true;Koopa 192 24 jumping=true
Pipe 200 24 h=Infinity piranha=true;Water 216 0 w=24;Floor 240 0 w=88;Block 264 32 hidden=true;Stone 280 32 w=16
Pipe 280 32 h=24 t=3;Koopa 304 28 jumping=true;Koopa 320 36 jumping=true'''),
'stretch':part(8,'Floor 0 0;Stone 0 88'),
'after':part(16,'Pipe 0 16 h=Infinity piranha=true;Stone 0 88 w=16;Section 16 0')}]),
area('Castle','Pipe 0 16 h=Infinity piranha=true e=3;Stone 0 88 w=16;Section 16 0',sections=[{
'before':part(264,'''Stone 0 88 w=264;Floor 0 0;Floor 8 24 w=48;Pipe 56 40 h=Infinity piranha=true;CheepsStart 72 0;Floor 72 24 w=48
Pipe 120 48 h=Infinity piranha=true t=1;Floor 136 24 w=48;Water 184 0 w=32;Floor 216 24 w=32
Pipe 248 40 h=Infinity piranha=true t=4;CheepsStop 264 0'''),
'stretch':part(8,'Floor 0 24;Stone 0 88'),
'after':part(40,'Floor 0 0 w=24;Stone 0 88 w=40;Pipe 24 16 h=Infinity piranha=true;Section 40 0')}]),
area('Underwater Castle','''
Floor 0 88 w=16;Floor 16 0;Pipe 24 16 h=Infinity e=4;Floor 40 0 w=536
Stone 48 24 w=40 h=24;Stone 48 80 w=40 h=16;Stone 48 88 w=528;Stone 88 32 w=56 h=32;Stone 88 80 w=56 h=24
CastleBlock 160 46 fireballs=6 hidden=true;Blooper 224 16;CastleBlock 248 22 fireballs=6 hidden=true
Stone 312 24 w=24 h=24;Stone 312 80 w=24 h=24;CastleBlock 320 54 fireballs=6 hidden=true
Blooper 408 24;Blooper 424 56;CastleBlock 446 38 fireballs=6 hidden=true;CastleBlock 512 44 fireballs=6 hidden=true
Stone 536 32 w=40 h=32;Stone 536 80 w=40 h=24;PipeHorizontal 544 48 t=5;Stone 552 56 w=24 h=24
''',underwater=True),
area('Castle','''
Pipe 0 16 h=Infinity piranha=true e=5;Stone 0 88 w=232;Floor 16 0 w=40;Pipe 56 16 h=Infinity piranha=true t=1
Floor 72 0 w=72;HammerBro 112 12;Water 128 0 w=56;Podoboo 160 -32;Floor 184 24 w=48;Stone 184 80 w=48 h=16
EndInsideCastle 232 0 spawnType=Bowser throwing=true npc=Peach t={"map":"1-1"}
''') ]}
save(8,[m1,m2,m3,m4])
