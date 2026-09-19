from common import *
m1={'name':'3-1','time':300,'locations':[loc(entry='Plain'),loc(entry='PipeVertical'),loc(xloc=1272),loc(1),loc(2,'Vine')],'areas':[
area('Overworld Night Alt','''
Floor 0 0 w=360
Block 128 32;Block 152 40;Block 176 40 c=Mushroom;Koopa 200 12 jumping=true
Fill Brick 208 32 nx=3;Koopa 224 20 jumping=true;Pipe 256 0 h=24 piranha=true;Goomba 296 8;Pipe 304 0 h=32 piranha=true t=3
Floor 384 0 w=232;Fill Goomba 424 8 nx=3 dx=12;Pipe 456 0 h=24 piranha=true;Brick 488 32;Koopa 520 12;Pipe 536 0 h=16 piranha=true e=1
Stone 584 8;Stone 592 16 h=16;Stone 600 24 h=24;Stone 608 32 h=32
Water 616 10 w=64;Bridge 616 32 w=64;Fill Goomba 656 40 nx=3 dx=12;Block 656 64 c=Mushroom1Up hidden=true
Floor 680 0;Stone 680 32 h=32;Water 688 10 w=16;Floor 704 0 w=320;Stone 704 32 h=32;Stone 712 16 h=16
Brick 720 64 c=Star;Fill Brick 728 64 nx=2;Fill Goomba 752 8 nx=2 dx=12;Koopa 808 12;Pipe 824 0 h=32 piranha=true
Fill Brick 888 32 nx=11;Fill Brick 888 64 nx=2;HammerBro 904 44;Block 904 64;Fill Brick 912 64 nx=3;HammerBro 936 12;Block 936 64 c=Mushroom;Fill Brick 944 64 nx=3
Fill Brick 1032 40 nx=3;Fill Brick 1032 64 nx=2;Brick 1048 64 c=["Vine",{"entrance":4}]
Floor 1056 0 w=80;Stone 1088 8;Stone 1096 16 h=16;Stone 1104 24 h=24;Stone 1112 32 h=32;Goomba 1112 40;Stone 1120 40 h=40;Goomba 1120 48;Stone 1128 48 h=48
Floor 1152 0 w=264;Koopa 1192 12;Fill Brick 1200 32 nx=2 ny=2 dx=16 dy=32;Fill Block 1208 32 ny=2 dy=32;Koopa 1216 76
Fill Goomba 1232 8 nx=3 dx=12;Fill Brick 1240 32 nx=2 ny=2 dx=16 dy=32;Block 1248 32 c=Mushroom;Block 1248 64
Koopa 1320 12 jumping=true;Brick 1328 32;Brick 1336 32 c=Coin;Koopa 1344 18 jumping=true;Fill Brick 1344 32 nx=3;Koopa 1360 44;Koopa 1368 12 jumping=true
Stone 1392 24 h=24;Stone 1400 48 h=48;Floor 1440 0 w=320
Stone 1464 8;Stone 1472 16 h=16;Stone 1480 24 h=24;Stone 1488 32 h=32;Stone 1496 40 h=40;Stone 1504 48 h=48;Koopa 1504 60;Stone 1512 56 h=56;Stone 1520 64 w=16 h=64;Koopa 1528 76
EndOutsideCastle 1600 0 t={"map":"3-2"}
'''),
area('Underworld','''
Floor 0 0 w=136;Fill Brick 0 8 ny=11;Fill Brick 24 40 nx=2 ny=4 dx=72
Fill Brick 32 32 nx=2 dx=56;Fill Brick 32 56 nx=2 ny=2 dx=56;Fill Coin 33 39 nx=2 dx=56
Fill Brick 40 40 nx=2 dx=40;Brick 40 64 c=Mushroom;Fill Coin 41 47 nx=2 dx=40
Fill Brick 48 48 nx=2 dx=24;Fill Coin 49 55 nx=2 ny=2 dx=24 dy=16
Fill Brick 56 56 nx=2 ny=2;Fill Coin 57 71 nx=2 ny=2 dx=8 dy=8;Brick 80 64
PipeHorizontal 104 16 e=1;PipeVertical 120 88 h=88
'''),
area('Sky Night','''
Stone 0 0 w=32;Stone 40 0 w=624;Platform 128 24 w=24 transport=true
Fill Coin 121 55 nx=16 dx=8;Stone 256 40;Fill Coin 273 55 nx=16 dx=8;Stone 408 48 h=16
Fill Coin 425 63 nx=7 dx=8;Stone 488 48 h=16;Stone 536 56 w=16
Fill Stone 568 56 nx=5 dx=16;Fill Coin 569 63 nx=10 dx=8;Fill Coin 681 15 nx=3 dx=8
''',exit=2,blockBoundaries=False)]}
m2={'name':'3-2','time':300,'locations':[loc(entry='Plain')],'areas':[area('Overworld Night Alt','''
Floor 0 0 w=640;Koopa 136 12;Fill Goomba 192 8 nx=3 dx=12;Fill Koopa 264 12 nx=3 dx=12;Fill Koopa 344 12 nx=2 dx=12
Stone 392 8;Fill Coin 441 31 nx=3 dx=8;Stone 480 24 h=24;Block 480 56 c=Mushroom;Koopa 528 12;Fill Goomba 568 8 nx=3 dx=12
Stone 600 16 h=16;Brick 616 32 c=Coin;Brick 616 64 c=Star;Koopa 624 12;Stone 632 16 h=16
Floor 656 0 w=328;Koopa 736 34 jumping=true;Koopa 888 12;Fill Goomba 952 8 nx=3 dx=12
Floor 1000 0 w=24;Stone 1008 16 h=16;Brick 1008 56
Floor 1040 0 w=752;Koopa 1072 12;Fill Koopa 1120 12 nx=3 dx=12;Fill Koopa 1200 12 nx=2 dx=12;Fill Koopa 1296 12 nx=3 dx=12
Fill Coin 1345 55 nx=4 dx=8;Pipe 1352 0 h=24 piranha=true;Koopa 1400 12;Fill Goomba 1432 8 nx=3 dx=12;Fill Goomba 1504 8 nx=3 dx=12
Stone 1536 8;Stone 1544 16 h=16;Stone 1552 24 h=24;Stone 1560 32 h=32;Stone 1568 40 h=40;Stone 1576 48 h=48;Stone 1584 56 h=56;Stone 1592 64 w=16 h=64
EndOutsideCastle 1672 0 t={"map":"3-3"}
''')]}
m3={'name':'3-3','time':300,'locations':[loc(entry='Plain')],'areas':[area('Overworld Night','''
Floor 0 0 w=128;Tree 144 24 w=40;Tree 176 48 w=48;Goomba 208 56
Platform 240 72 w=24 sliding=true begin=228 end=260;Tree 240 0 w=24;Fill Coin 249 7 nx=2 dx=8
Platform 264 40 w=24 sliding=true begin=244 end=276;Tree 288 8 w=56;Coin 298 55;Fill Coin 337 55 nx=3 dx=8
Tree 344 32 w=32;Tree 368 16 w=80;Tree 376 48 w=48;Block 392 80 c=Mushroom;Fill Coin 417 31 nx=3 dx=8
Koopa 416 60 smart=true;Koopa 432 28 smart=true;Tree 440 80 w=32;Fill Coin 449 87 nx=2 dx=8
Platform 482 56 w=24 falling=true;Tree 520 0 w=128;Tree 520 48 w=24;Fill Coin 529 55 nx=3 dx=32
Tree 552 48 w=24;Koopa 584 12 smart=true;Tree 584 48 w=24;Tree 616 72 w=24;Coin 625 79
Scale 660 86 between=56 dropRight=44;Tree 672 16 w=32
Platform 752 32 w=24 falling=true;Platform 768 64 w=24 falling=true;Tree 776 32 w=24;Platform 824 16 w=24 falling=true
Tree 832 64 w=32;Fill Coin 841 71 nx=2 dx=8;Tree 856 16 w=40;Coin 865 23;Tree 864 48 w=24;Coin 873 55
Koopa 912 66 smart=true jumping=true floating=true begin=14 end=66;Tree 928 0 w=24;Tree 952 24 w=96 solidTrunk=true
Fill Koopa 992 36 nx=2 dx=14 smart=true;Platform 1056 56 w=24;Scale 1100 86 between=32 dropRight=48
Floor 1152 0 w=256;EndOutsideCastle 1208 0 large=true walls=15 t={"map":"3-4"}
''')]}
m4={'name':'3-4','time':300,'locations':[loc(entry='Castle')],'areas':[area('Castle','''
StartInsideCastle 0 0 w=128;Stone 0 88 w=128 h=24;Stone 128 88 w=896;Podoboo 128 -32
Floor 144 24;Floor 152 8;Fill Stone 152 24 nx=3 dx=40;Fill CastleBlock 152 16 nx=3 dx=40 fireballs=6
Floor 160 24;Floor 184 24;Floor 192 8;Floor 200 24;Podoboo 208 -32;Floor 224 24;Floor 232 8;Floor 240 24
Floor 264 0 w=104;Stone 264 24 w=16 h=24;Stone 280 80 w=88 h=16;Block 336 32;Block 344 32 c=Mushroom;Block 352 32
Water 368 0 w=16;Floor 384 0 w=320;Fill Stone 424 8 nx=2 dx=80 w=24;Fill Stone 424 80 nx=2 dx=80 w=24 h=16
Fill CastleBlock 432 16 nx=2 dx=80 fireballs=6 direction=1;Fill CastleBlock 432 64 nx=2 dx=80 fireballs=6
Stone 632 8 w=24;Stone 632 80 w=24 h=16;CastleBlock 640 16 fireballs=6;CastleBlock 640 64 fireballs=6 direction=1;Fill Coin 649 55 nx=3 dx=8
Podoboo 704 -32;Water 704 0 w=16;Floor 720 24 w=48;Stone 720 80 w=48 h=16
Water 768 0 w=24;Podoboo 776 -32;Floor 792 24 w=24;Water 816 0 w=24;Podoboo 824 -32;Floor 840 24 w=24;Water 864 0 w=24;Podoboo 872 -32
Floor 888 0 w=136;Stone 888 24 w=40 h=24;Stone 888 80 w=136 h=16;Stone 944 24 w=80 h=24
EndInsideCastle 1024 0 spawnType=Beetle t={"map":"4-1"};Fill Brick 1056 64 nx=2 ny=3;Platform 1084 56 w=16
''')]}
save(3,[m1,m2,m3,m4])
