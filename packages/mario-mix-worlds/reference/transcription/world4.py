from common import *
def part(width,s):return {'width':width,'creation':rows(s)}
m1={'name':'4-1','locations':[loc(entry='Plain'),loc(entry='PipeVertical'),loc(1)],'areas':[
area('Overworld','''
Floor 0 0 w=256;Pipe 168 0 h=24 piranha=true;Block 200 32 c=Mushroom;Block 200 64;Lakitu 212 84
Floor 272 0 w=352;Fill Coin 329 31 nx=2 dx=24;Fill Coin 337 39 nx=2 dx=8;Fill Block 512 32 nx=2 ny=2 dx=24 dy=32
Floor 656 0 w=536;Fill Block 720 32 nx=4;Block 736 64 c=Mushroom1Up hidden=true;Stone 824 24 h=24;Fill Coin 841 55 nx=4 dx=8
Pipe 928 0 h=32 piranha=true;Fill Coin 953 55 nx=4 dx=8;Pipe 1056 0 h=32 piranha=true t=2;Fill Coin 1081 55 nx=4 dx=8
Fill Block 1168 32 nx=2;Block 1184 32 c=Mushroom;Fill Block 1184 64 nx=4;Fill Brick 1192 32 nx=2;Fill Block 1208 32 nx=3
Floor 1208 0 w=184;Pipe 1304 0 h=16 piranha=true e=1
Floor 1416 0 w=24;Floor 1456 0 w=64;Stone 1512 24 h=24;Floor 1536 0 w=384;LakituStop 1664 0
Stone 1664 8;Stone 1672 16 h=16;Stone 1680 24 h=24;Stone 1688 32 h=32;Stone 1696 40 h=40;Stone 1704 48 h=48;Stone 1712 56 h=56;Stone 1720 64 w=16 h=64
Brick 1760 32 c=Coin;EndOutsideCastle 1800 0 t={"map":"4-2"}
'''),
area('Underworld','''
Floor 0 0 w=136;Fill Brick 0 8 ny=11;Fill Brick 24 16 ny=3;Fill Brick 24 80 nx=12
Fill Coin 25 39 nx=8 dx=8;Fill Coin 25 7 nx=10 dx=8;Fill Brick 32 32 nx=6;Fill Brick 80 16 ny=3
PipeHorizontal 104 16 t=1;Brick 104 32 c=Mushroom;PipeVertical 120 88 h=88
''')]}
m2={'name':'4-2','locations':[loc(entry='Walking'),loc(1),loc(1,'PipeVertical'),loc(2),loc(3,'PipeVertical'),loc(4,'Vine')],'areas':[
area('Overworld','Floor 0 0 w=192;PipeHorizontal 80 16 t=1;Pipe 96 0 h=32'),
area('Underworld','''
Floor 0 0 w=88;Fill Brick 0 8 ny=11;Ceiling 48 0 w=408;Floor 104 0 w=16;Floor 136 0
Fill Brick 160 64 nx=23 ny=3;Floor 168 0 w=288;Fill Brick 176 16 nx=5 ny=3;Brick 216 32;Fill Coin 217 7 nx=3 dx=8;Brick 224 32 c=Mushroom
Fill Brick 240 8 nx=18 ny=4;Fill Goomba 344 40 nx=3 dx=12;Brick 344 64;Brick 344 72 c=Coin;Brick 344 80;Fill Brick 352 64 nx=4 ny=3
Fill Block 400 32 nx=2 ny=2 dy=32;Fill Block 432 32 nx=2 dx=16;Block 440 32 c=Mushroom;PlatformGenerator 470 0 w=24
Floor 504 0 w=336;Block 504 40 hidden=true;Block 512 48 hidden=true;Brick 512 64 c=["Vine",{"transport":5}]
Block 520 40 hidden=true;Fill Brick 520 64 nx=2;Block 528 32 hidden=true;Ceiling 536 0 w=360;Pipe 576 0 h=24 piranha=true
Brick 608 32;Brick 616 32 c=Coin;Koopa 616 12;Pipe 624 0 h=56 piranha=true;Brick 640 32;Brick 648 32 c=Star;Beetle 664 8.5
Pipe 672 0 h=24 piranha=true t=3;Brick 696 40;Beetle 704 8.5;Pipe 712 0 h=24;Fill Koopa 800 12 nx=2 dx=12
Stone 824 16 h=16;Stone 832 24 h=24;Floor 856 0 w=16;Pipe 856 0 h=32;Floor 888 0 w=16;Stone 888 24 w=16 h=24;PlatformGenerator 918 0 w=24
Floor 952 0 w=32;Fill Brick 952 32 nx=4;Brick 952 64;Ceiling 952 0 w=32;Brick 960 64 c=Mushroom;Brick 968 64;PlatformGenerator 992 0 w=24
Ceiling 1024 0 w=216;Floor 1032 0 w=120;Pipe 1048 0 h=16 e=2;Koopa 1096 12;Pipe 1104 0 h=24 piranha=true;Pipe 1136 0 h=32 piranha=true
Floor 1168 0 w=72;Stone 1216 8;Stone 1224 16 h=16;Stone 1232 24 h=24;Beetle 1232 32.5;PlatformGenerator 1246 0 w=24
Floor 1280 0 w=184;Fill Brick 1280 48 ny=2;Fill Brick 1280 64 nx=16 ny=3;Ceiling 1280 0 w=232;Brick 1288 32 c=Mushroom
Fill Brick 1296 32 nx=10;Fill Coin 1297 39 nx=10 dx=8;Fill Koopa 1344 12 nx=2 dx=12
Stone 1384 8;Stone 1392 16 h=16;Stone 1400 24 h=24;Stone 1408 32 h=32;Beetle 1432 8.5;Pipe 1440 0 h=56 piranha=true
Floor 1480 0 w=312;Fill Brick 1480 8 nx=24 ny=3;PipeHorizontal 1496 40 t=4;PipeVertical 1512 88 h=64
Fill Brick 1528 32 nx=18 ny=7;Ceiling 1528 0 w=184;Fill Brick 1616 32 nx=7 ny=7;ScrollEnabler 1512 184 h=96 w=16
ScrollBlocker 1528 0;Ceiling 1616 0 w=136;WarpWorld 1672 0 warps=[5];Fill Brick 1776 8 nx=2 ny=11
'''),
area('Underworld','''
Ceiling 32 0 w=56;Floor 0 0 w=136;Fill Brick 0 8 ny=11;Fill Brick 32 48 nx=7;Brick 32 56
Fill Coin 42 55 nx=5 ny=2 dx=8 dy=8;Fill Brick 80 56 ny=4;Fill Brick 88 56 nx=2
Brick 112 48 c=Coin;PipeHorizontal 104 16 t=2;PipeVertical 120 88 h=88
'''),
area('Overworld','''
Floor 0 0 w=464;Pipe 0 0 h=16 piranha=true e=4
Stone 16 8;Stone 24 16 h=16;Stone 32 24 h=24;Stone 40 32 h=32;Stone 48 40 h=40;Stone 56 48 h=48;Stone 64 56 h=56;Stone 72 64 w=16 h=64
EndOutsideCastle 152 0 t={"map":"4-3"}
'''),
area('Overworld','''
Floor 0 0 w=32;Floor 40 0 w=472;Shroom 96 32 w=24;Fill Coin 97 39 nx=3 dx=8
Shroom 128 64 w=24;Fill Coin 129 71 nx=3 dx=8;Shroom 144 16 w=24;Shroom 176 16 w=40;Shroom 176 64 w=24;Fill Coin 177 71 nx=3 dx=8
Shroom 208 48 w=24;Fill Coin 209 55 nx=3 dx=8;Shroom 240 72 w=40;Fill Coin 241 79 nx=5 dx=8;Shroom 248 24 w=56;Fill Coin 281 31 nx=2 dx=8
Stone 320 8;Stone 328 16 h=16;Stone 336 24 h=24;Stone 344 32 h=32;Stone 352 40 h=40;Stone 360 48 h=48;Stone 368 56 h=56;Stone 376 64 h=64;Stone 384 72 h=72;Stone 392 72 w=88
WarpWorld 392 0 warps=[8,7,6] textHeight=0;Stone 496 88 w=16 h=88;ScrollBlocker 512 88
''')]}
m3={'name':'4-3','time':300,'locations':[loc(entry='Plain')],'areas':[area('Overworld Shrooms','''
Floor 0 0 w=120;Shroom 128 0 w=40;Shroom 152 64 w=40;Fill Coin 161 71 nx=3 dx=8
Shroom 184 32 w=56;Fill Coin 193 39 nx=4 dx=8;Fill Koopa 224 44 nx=2 smart=true;Shroom 256 72 w=24;Shroom 288 8 w=56
Koopa 288 84 smart=true floating=true jumping=true begin=32 end=88;Coin 302 15;Koopa 312 20 smart=true;Shroom 312 64 w=40;Coin 321 15
Block 344 88 c=Mushroom;Shroom 352 32 w=24;Coin 385 47;Scale 396 86 between=56 dropRight=44;Shroom 408 40 w=24
Platform 464 20 w=24 floating=true begin=16 end=72;Platform 496 66 w=24 floating=true begin=32 end=88
Shroom 520 0 w=40;Shroom 536 48 w=24;Fill Coin 537 55 nx=3 dx=8;Koopa 544 12 smart=true;Shroom 560 80 w=24;Fill Coin 561 87 nx=3 dx=8
Shroom 576 32 w=24;Coin 585 39;Shroom 592 64 w=40;Koopa 624 76 smart=true
Scale 652 86 between=64 dropRight=52;Shroom 672 32;Scale 740 86 dropRight=56;Coin 770 47;Shroom 792 16 w=24
Scale 828 86 between=48 dropRight=56;Shroom 840 24 w=24;Shroom 904 32 w=40;Fill Coin 905 39 nx=5 dx=8
Shroom 936 56 w=24;Shroom 968 0 w=56;Shroom 1040 24 w=40;Platform 1088 67 w=24 floating=true begin=8 end=88
Floor 1128 0 w=152;EndOutsideCastle 1176 0 large=true walls=3 t={"map":"4-4"}
''')]}
m4={'name':'4-4','time':300,'locations':[loc(entry='Castle')],'areas':[area('Castle','''
StartInsideCastle 0 0 w=48;Stone 0 88 w=48 h=24;Floor 48 24;Stone 48 88 w=80
Water 56 0 w=16;Floor 72 24 w=16;Water 88 0 w=16;Floor 104 24 w=24;Section 128 0 section=0
''',sections=[
{'before':part(400,'''Floor 0 0 w=400;Stone 0 88 w=400;Stone 16 56 w=48 h=32;Fill Stone 72 56 nx=5 dx=16 h=32
Stone 152 56 w=24 h=32;Stone 176 56 w=48;Pipe 192 0 h=24 piranha=true;Stone 224 56 w=136 h=32
CastleBlock 296 56 fireballs=6 hidden=true;CastleBlock 352 32 fireballs=6 hidden=true
SectionFail 384 24 w=40 h=24;SectionPass 394 80 w=40 h=24'''),
 'stretch':part(8,'Floor 0 0;Stone 0 56 h=32;Stone 0 88'),
 'after':part(40,'Floor 0 0 w=40;Stone 0 88 w=40;Stone 16 80 w=24 h=24;Stone 16 24 w=24 h=24;SectionDecider 40 0 pass=1 fail=0')},
{'before':part(320,'''Floor 0 0 w=64;Stone 0 88 w=336;Stone 48 24 w=16;Water 64 0 w=16;Stone 72 40 w=16
Floor 80 16;Stone 80 24 w=40;Water 88 0 w=32;Stone 104 48;Stone 112 40 h=16;Floor 120 0 w=216
Stone 120 56 h=16;Stone 128 24 w=208;Stone 128 56 w=16;Stone 160 56 w=32;Stone 200 48 h=24;Stone 200 56 w=24;Stone 240 56 w=96
CastleBlock 280 56 fireballs=6 hidden=true;CastleBlock 328 24 fireballs=6 hidden=true
SectionPass 360 16 w=40 h=16;SectionFail 360 48 w=40 h=24;SectionFail 360 80 w=40 h=24'''),
 'stretch':part(8,'Floor 0 0;Stone 0 24;Stone 0 56;Stone 0 88'),
 'after':part(136,'Floor 0 0 w=80;Stone 0 64 h=40;Stone 0 88;Stone 8 88 w=16 h=24;Floor 72 24 w=32;Stone 72 88 w=64;Floor 96 0 w=32;Floor 120 24 w=16;SectionDecider 136 0 pass=2')},
{'before':part(256,'EndInsideCastle 0 0 spawnType=SpinyEgg t={"map":"5-1"}')}
]) ]}
save(4,[m1,m2,m3,m4])
