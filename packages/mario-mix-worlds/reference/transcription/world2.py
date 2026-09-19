from common import *
m1={'name':'2-1','locations':[loc(entry='Plain'),loc(xloc=1288),loc(entry='PipeVertical'),loc(1,'Vine'),loc(2)],'areas':[
area('Overworld','''
Floor 0 0 w=736
Brick 120 32;Brick 128 32 c=Mushroom;Brick 136 32
Stone 160 8;Stone 168 16 h=16;Stone 176 24 h=24;Stone 184 32 h=32;Stone 192 40 h=40;Goomba 192 48
Block 224 32 hidden=true;Block 224 64 c=Mushroom1Up hidden=true
Fill Brick 232 64 nx=3
Koopa 256 12;Koopa 264 12
Stone 272 32 h=32;Stone 280 16 h=16
Goomba 336 8;Goomba 348 8
Pipe 368 0 h=32 Piranha="true"
Block 424 32 c=Mushroom;Fill Block 424 64 nx=5;Fill Block 432 32 nx=4
Koopa 440 44;Goomba 472 8;Goomba 484 8;Koopa 528 12
Fill Goomba 544 8 nx=3 dx=12
Brick 544 32;Brick 552 64 c=Star;Brick 560 64 nx=3
Pipe 592 0 h=32 piranha=true
Fill Block 632 32 nx=4;Fill Brick 648 64 nx=2;Brick 664 64 c=["Vine",{"transport":3}];Fill Brick 672 64 nx=2;Fill Block 680 32 nx=3
Fill Goomba 704 8 nx=3 dx=12;Fill Brick 736 64 nx=4
Floor 768 0 w=80;Goomba 820 40;Pipe 824 0 h=32 piranha=true t=4
Floor 872 0 w=240;Goomba 916 24;Pipe 920 0 h=16 piranha=true e=2
Goomba 962 8;Pipe 976 0 h=32 piranha=true
Brick 1000 64 c=Mushroom;Fill Brick 1008 64 nx=3;Pipe 1008 0 h=24;Pipe 1040 0 h=40 piranha=true
Floor 1136 0 w=80;Koopa 1200 36 jumping=true
Floor 1232 0 w=576;Stone 1232 24 h=24;Brick 1288 32 c=Coin
Fill Goomba 1296 8 nx=2 dx=12;Fill Brick 1312 64 nx=5;Fill Koopa 1352 12 nx=2 dx=16
Block 1360 32;Block 1374 64 c=Mushroom;Pipe 1408 0 h=24 piranha=true
Koopa 1480 12;Fill Brick 1480 32 nx=2;Block 1488 64 c=Coin hidden=true
Springboard 1504 14.5;Fill Stone 1520 80 nx=2 h=80
EndOutsideCastle 1600 0 t={"map":"2-2"}
'''),
area('Sky','''
Stone 0 0 w=32;Stone 40 0 w=456
Fill Coin 121 55 nx=16 dx=8;Platform 128 24 w=24 transport=true
Fill Coin 257 71 nx=3 dx=8;Fill Coin 289 63 nx=16 dx=8;Fill Coin 425 71 nx=3 dx=8;Fill Coin 553 7 nx=3 dx=8
''',exit=1),
area('Underworld','''
Ceiling 32 0 w=56;Floor 0 0 w=136;Fill Brick 0 8 ny=11;Fill Brick 32 8 nx=7 ny=3
Fill Coin 33 31 nx=7 ny=2 dy=16 dx=8;Fill Coin 41 63 nx=5 dx=8
PipeHorizontal 104 16 t=2;PipeVertical 120 88 h=88
''') ]}
m2={'name':'2-2','locations':[loc(entry='Walking'),loc(1),loc(2,'PipeVertical')],'areas':[
area('Overworld','''Floor 0 0 w=192;PipeHorizontal 80 16 t=1;Pipe 96 0 h=32'''),
area('Underwater','''
Floor 0 0 w=536;Coral 96 24 h=24;Fill Coin 121 7 nx=2 dx=8;Stone 152 32 w=24;Blooper 184 16
Fill Coin 224 64 nx=3 dx=8;Coral 272 40 h=40;Fill Coin 296 7 nx=3 dx=8
Stone 344 32 w=16;Coral 344 48 h=16;Blooper 376 32;Coral 408 32 h=32;Blooper 448 24
Stone 520 24 h=24;Stone 528 40 h=40;Fill Coin 546 23 nx=3 dx=8
Floor 576 0 w=480;Stone 576 40 h=40;Stone 584 24 h=24;CheepCheep 616 24
Stone 632 24 w=16 h=24;Stone 632 88 w=16 h=24;CheepCheep 640 48;CheepCheep 656 16
Stone 664 64 w=24;Blooper 672 40;Coral 672 80 h=16;Coral 720 24 h=24
Blooper 760 80;CheepCheep 760 56;CheepCheep 784 80 smart=true
Fill Coin 816 15 nx=3 dx=8;Stone 824 32 w=16;Coral 824 64 h=32;Blooper 848 16
Fill Coin 912 55 nx=3 dx=8;Stone 928 40 w=16;CheepCheep 944 72;Coral 968 32 h=32
CheepCheep 1032 24 smart=true;Stone 1040 32 h=32;Stone 1048 16 h=16;CheepCheep 1056 16;Stone 1056 88 h=24
Stone 1064 72 w=64;Coin 1073 15;Fill Coin 1080 7 nx=3 dx=8;Coin 1105 15;CheepCheep 1100 40
Floor 1128 0 w=136;Stone 1128 16 h=16;Stone 1136 32 h=32;CheepCheep 1160 32
Coral 1184 16 h=16;Coral 1200 24 h=24;CheepCheep 1206 56 smart=true
Stone 1256 64 h=64;Stone 1264 64 w=16;Fill Coin 1281 7 nx=3 ny=2 dx=8 dy=24
Stone 1304 64 w=16;Stone 1320 64 h=64;Floor 1320 0 w=320;CheepCheep 1320 80;CheepCheep 1344 16
Fill Stone 1384 32 ny=2 dy=32 w=40;Coral 1392 80 h=16;CheepCheep 1408 40
Fill Stone 1448 32 ny=2 dy=32 w=32;CheepCheep 1472 72 smart=true;CheepCheep 1496 48 smart=true
Stone 1488 8 w=40;Stone 1496 16 w=32;Stone 1504 24 w=24;Stone 1512 32 w=16;Stone 1512 88 w=16 h=32
PipeHorizontal 1520 48 t=2 small=true;Stone 1528 88 w=128 h=88;Floor 1640 0 w=16
''',underwater=True),
area('Overworld','''
Floor 0 0 w=464;Pipe 0 0 h=16 piranha=true e=2
Stone 16 8;Stone 24 16 h=16;Stone 32 24 h=24;Stone 40 32 h=32;Stone 48 40 h=40;Stone 56 48 h=48;Stone 64 56 h=56;Stone 72 64 h=64 w=16
EndOutsideCastle 152 0 t={"map":"2-3"}
''')]}
m3={'name':'2-3','time':300,'locations':[loc(entry='Plain')],'areas':[area('Overworld','''
Floor 0 0 w=56;CheepsStart 64 0;Tree 64 0 w=64
Stone 80 8;Stone 88 16 h=16;Stone 96 24 h=24 w=24
Bridge 120 24 w=136 end=true;Bridge 256 24 w=128 end=true;Fill Coin 290 63 nx=4 dx=8
Bridge 384 24 w=128 end=true;Fill Coin 441 63 nx=3 dx=16;Fill Coin 449 55 nx=2 dx=16
Bridge 544 24 w=96 begin=true end=true;Bridge 672 24 w=96 begin=true end=true
Fill Coin 777 63 nx=3 dx=8;Bridge 792 32 w=56 begin=true end=true;Block 816 64 c=Mushroom
Fill Coin 865 63 nx=3 dx=8;Tree 896 0 w=64
Bridge 976 24 w=24;Bridge 1016 24 w=136 begin=true end=true;Fill Coin 1064 63 nx=6 dx=8
Bridge 1168 8 w=80 begin=true end=true;Fill Coin 1193 39 nx=4 dx=8
Bridge 1272 24 w=80 begin=true end=true;Bridge 1368 24 w=16;Fill Coin 1385 55 nx=6 dx=8
Bridge 1400 24 w=16;Bridge 1432 24 w=16;Bridge 1464 24 w=80 begin=true
Tree 1536 0 w=104;Stone 1544 24 w=16 h=24;Stone 1560 16 h=16;Stone 1568 8
CheepsStop 1600 0;Floor 1656 0 w=280
Stone 1664 8;Stone 1672 16 h=16;Stone 1680 24 h=24;Stone 1688 32 h=32;Stone 1696 40 h=40;Stone 1704 48 h=48;Stone 1712 56 h=56;Stone 1720 64 w=16 h=64
EndOutsideCastle 1800 0 large=true walls=7 t={"map":"2-4"}
''')]}
m4={'name':'2-4','time':300,'locations':[loc(entry='Castle')],'areas':[area('Castle','''
StartInsideCastle 0 0 w=128;Stone 0 88 w=128 h=24;Podoboo 128 -32;Water 128 0 w=128
Stone 144 32 w=16;Stone 176 48;CastleBlock 184 48;Block 184 80 c=Mushroom;Stone 192 48;Stone 216 32 w=16;Podoboo 240 -32
Floor 256 -8 w=416;Stone 256 24 w=16 h=32;Stone 272 88 w=392 h=24;Stone 272 64 w=168;Stone 272 0 w=72
Stone 296 32 w=96;CastleBlock 344 0;Stone 352 0 w=88;CastleBlock 392 32 fireballs=6;Stone 400 32 w=88
CastleBlock 440 64 fireballs=6;CastleBlock 440 0;Stone 448 0 w=88;Stone 448 64 w=216
CastleBlock 488 32 fireballs=6;Stone 496 32 w=88;CastleBlock 536 0;Stone 544 0 w=96;CastleBlock 584 32 fireballs=6
Stone 640 24 w=32 h=32;CastleBlock 656 56 fireballs=6
PlatformGenerator 686 0 w=12 direction=-1;PlatformGenerator 710 0 w=12
Floor 736 16;CastleBlock 736 24 fireballs=6 direction=1
Floor 744 24 w=48;Stone 744 88 w=48 h=24;Floor 792 0 w=80
Fill Coin 817 7 nx=3 ny=2 dx=8 dy=32;CastleBlock 824 16;Stone 864 24 h=24
Water 872 0 w=16;Stone 864 24 h=24;Floor 888 24 w=16;Water 904 0 w=32
Floor 920 0 w=104;Stone 920 24 w=40 h=24;Stone 920 88 w=104 h=24
Fill Stone 976 24 nx=2 dx=32 w=16 h=24;Fill Brick 1024 64 nx=6
EndInsideCastle 1024 0 spawnType=Shell t={"map":"3-1"}
Platform 1108 56 w=16 sliding=true begin=1080 end=1112 nocollidechar=true
''')]}
save(2,[m1,m2,m3,m4])
