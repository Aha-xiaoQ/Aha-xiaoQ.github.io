/** Per-runtime item definitions, moved intact from the inspected third episode.
 * The two late compatibility weapon registrations remain supported. Do not share
 * one mutable instance between runs; do not mix item metadata with pickup effects.
 */
export function createItemDefinitions() {
  return {
 starfury:{name:'星怒',effect:'挥剑并从上方召来一颗落星',icon:'starfury',weapon:true},
 stormbow:{name:'代达罗斯风暴弓',effect:'从上方落箭；本关箭矢无限',icon:'stormbow',weapon:true},
 terraBlade:{name:'泰拉刃',effect:'近战挥砍并发出宽幅绿色剑气',icon:'terraBlade',weapon:true},
 iceBlade:{name:'冰雪刃',effect:'挥剑发射直行冰弹，不自动追踪',icon:'iceBlade',weapon:true},
 boomstick:{name:'三发猎枪',effect:'每次射出散弹；本关子弹无限',icon:'boomstick',weapon:true},
 zenith:{name:'天顶剑',effect:'多把剑沿旋转轨迹攻击目标区域',icon:'zenith',weapon:true},
 sdmg:{name:'太空海豚机枪',effect:'连射叶绿弹；子弹自身追踪',icon:'sdmg',weapon:true},
 lastPrism:{name:'终极棱镜',effect:'持续光束，消耗魔力',icon:'lastPrism',weapon:true},
 terraprisma:{name:'泰拉棱镜与万花筒',effect:'召唤剑自主攻击，鞭子标记目标',icon:'terraprisma',weapon:true},
 cloudBottle:{name:'云朵瓶',effect:'在空中再跳一次',icon:'cloudBottle',accessory:true},
 band:{name:'再生手环',effect:'持续恢复生命；同类不叠加',icon:'hudRegen',accessory:true,flag:'regen'},
 boots:{name:'赫尔墨斯靴',effect:'持续奔跑后加速',icon:'hudBoots',accessory:true,flag:'boots'},
 flurry:{name:'疾风雪靴',effect:'持续奔跑后加速，与赫尔墨斯靴不叠加',icon:'flurry',accessory:true,flag:'boots'},
 blizzard:{name:'暴雪瓶',effect:'增强空中二段跳，带雪花轨迹',icon:'blizzard',accessory:true,flag:'blizzard'},
 anklet:{name:'疾风脚镯',effect:'步行与奔跑速度提高 10%',icon:'anklet',accessory:true,flag:'anklet'},
 claws:{name:'猛爪手套',effect:'近战挥动速度提高 12%',icon:'claws',accessory:true,flag:'claws'},
 sharkNecklace:{name:'鲨牙项链',effect:'攻击最多忽略 5 点敌人防御',icon:'sharkNecklace',accessory:true,flag:'shark'},
 shackle:{name:'脚镣',effect:'防御增加 1',icon:'shackle',accessory:true,flag:'shackle'},
 mirror:{name:'魔镜',effect:'战后使用返程键回到隐藏场入口',icon:'mirror',accessory:true,flag:'mirror'},
 healing:{name:'治疗药水',effect:'治疗键恢复 100 生命；有冷却',icon:'healing'},
 manaPotion:{name:'魔力药水',effect:'补充魔力药水库存',icon:'manaPotion'},
 torch:{name:'火把',effect:'选择火把格放置，照亮洞穴',icon:'torchPlaced'},
 wood:{name:'木材',effect:'建造木平台与篝火',icon:'wood'},
 silverCoin:{name:'银币',effect:'收藏与计分',icon:'silverCoin'},
 heart:{name:'生命水晶',effect:'生命上限增加 20，最多 400',icon:'heart'},
 lucy:{name:'露西斧',effect:'150% 斧力 · 27 近战伤害；切到第 3 格砍树',icon:'lucy'},
 copperAxe:{name:'铜斧',effect:'基础砍伐工具，可重新装备',icon:'axe'},
 arrows:{name:'圣箭',effect:'远程箭矢库存增加',icon:'arrow'}
};
}
