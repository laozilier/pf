// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

module.exports = {
    MaxTables: 50,
    AllGames: 10,
    SceneType: {
        Hall: 0,
        Qinyou: 1,
        QinyouRoom1: 2,
        YuleRoom:3,
        QinyouRoom2: 4,
    },

    GameName: {
        template: 'template',
        niuniu: 'niuniu',
        niuniu_mpqz: 'niuniu_mpqz',
        niuniu_guodi: 'niuniu_guodi',
        niuniu_wanren: 'niuniu_wanren',
        psz: 'psz',
        poker_pdk: 'poker_pdk',
        mj_tj: 'mj_tj',
        diantuo: 'diantuo',
        diantuo_tj: 'diantuo_tj',
        diantuo_hsg: 'diantuo_hsg',
        sanshui: 'sanshui',
        mj_hz: 'mj_hz',
        mj_cs: 'mj_cs',
        mj_yy: 'mj_yy',
        sangong: 'sangong',
        dsq: 'dsq',
        poker_ddz: 'poker_ddz',
        poker_qianfen: 'poker_qianfen',
        poker_bashi: 'poker_bashi',
        poker_sdh: 'poker_sdh',
        zp_chz: 'zp_chz',
        poker_sbf: 'poker_sbf',
        eg_fruit: 'eg_fruit',
    },

    GameStr: {
        niuniu_mpqz: '拼五张',
        niuniu_guodi: '锅底牛',
        niuniu_wanren: '万人牛牛',
        psz: '拼三张',
        poker_pdk: '跑得快',
        mj_tj: '桃江麻将',
        diantuo: '掂坨',
        diantuo_tj: '桃江掂坨',
        diantuo_hsg: '灰山港掂坨',
        sanshui: '十三张',
        mj_hz: '红中麻将',
        mj_cs: '长沙麻将',
        mj_yy: '益阳麻将',
        sangong: '三公',
        dsq: '斗兽棋',
        poker_ddz: '斗地主',
        poker_qianfen: '沅江千分',
        poker_bashi: '益阳巴十',
        poker_sdh: '三打哈',
        zp_chz: '扯胡子',
        poker_sbf: '三百分',
        eg_fruit: '水果转转',
    },

    CWords: {
        niuniu: [
            "别跟我抢庄，小心玩死你们",
            "喂！赶紧亮牌，别磨矶。",
            "搏一搏,单车变摩托",
            "快点吧，等到花都谢啦！",
            "时间就是金钱，我的朋友！",
            "不要因为我是娇花而怜惜我，使劲推注吧！",
            "我是牛牛我怕谁。",
            "大牛吃小牛，呵呵~~",
            "下得多，输得多，小心推注当内裤。",
            "有没有天理，有没有王法，这种牌也能输?",
            "一点儿小钱，拿去喝茶吧！",
        ],

        psz: [
            "我最讨厌看牌的人了！",
            "你是钱多了吗？敢跟注我？",
            "都跟到底，看谁厉害！",
            "我全压了，你看着办！",
            "牌小就不要跟我玩！",
            "你敢上我就敢跟，谁怕谁啊！",
            "快点儿，我等到花儿都谢了！",
            "天灵灵地灵灵，来手好牌行不行！",
            "别走嘛，一起玩多开心！",
            "这局我赢定了！",
            "遇到我，真是你的不幸。",
            "不好意思，我又赢了。",
            "我要走了，下次再玩吧。",
            "唉！破财消灾吧！",
            "不管是小牌还是杂牌，到了我手里都是好牌",
        ],

        poker_pdk: [
            "快点吧，等到花都谢啦！",
            "又断线了，网络怎么这么差呀！",
            "不要走，决战到天亮！",
            "你的牌打得太好啦！",
            "你是MM还是GG？",
            "和你合作真是太愉快了！",
            "大家好！很高兴见到各位。",
            "各位，真是不好意思，我要离开一会。",
            "不要吵了，有什么好吵的，专心玩游戏吧。",
        ],

        mj_tj: [
            "别放炮",
            "别跟我比黑",
            "打个来碰",
            "搞个来吃",
            "给我吃，你不会亏",
            "喝擂茶",
            "坏笑",
            "快点，要晕了",
            "快点出牌",
            "那是谁啊，开始了",
            "你真蠢，这牌都打",
            "手气好",
            "数钱",
            "睡着了吧，还不出牌",
            "谢谢老板",
            "这种炮都要",
        ],

        sanshui: [
            "快点吧，等到花都谢啦！",
            "又断线了，网络怎么这么差呀！",
            "不要走，决战到天亮！",
            "你的牌打得太好啦！",
            "你是MM还是GG？",
            "和你合作真是太愉快了！",
            "大家好！很高兴见到各位。",
            "各位，真是不好意思，我要离开一会。",
            "不要吵了，有什么好吵的，专心玩游戏吧。",
        ],

        mj: [
            "快点吧，等到花都谢啦！",
            "又断线了，网络怎么这么差呀！",
            "不要走，决战到天亮！",
            "你的牌打得太好啦！",
            "你是MM还是GG？",
            "和你合作真是太愉快了！",
            "大家好！很高兴见到各位。",
            "各位，真是不好意思，我要离开一会。",
            "不要吵了，有什么好吵的，专心玩游戏吧。",
        ],

        sangong: [
            "快点吧，等到花都谢啦！",
            "又断线了，网络怎么这么差呀！",
            "不要走，决战到天亮！",
            "你的牌打得太好啦！",
            "你是MM还是GG？",
            "和你合作真是太愉快了！",
            "大家好！很高兴见到各位。",
            "各位，真是不好意思，我要离开一会。",
            "不要吵了，有什么好吵的，专心玩游戏吧。",
        ],

        dsq: [
            "快点吧，等到花都谢啦！",
            "又断线了，网络怎么这么差呀！",
            "不要走，决战到天亮！",
            "你的牌打得太好啦！",
            "你是MM还是GG？",
            "和你合作真是太愉快了！",
            "大家好！很高兴见到各位。",
            "各位，真是不好意思，我要离开一会。",
            "不要吵了，有什么好吵的，专心玩游戏吧。",
        ],

    poker_ddz: [
            "快点吧，等到花都谢啦！",
            "又断线了，网络怎么这么差呀！",
            "不要走，决战到天亮！",
            "你的牌打得太好啦！",
            "你是MM还是GG？",
            "和你合作真是太愉快了！",
            "大家好！很高兴见到各位。",
            "各位，真是不好意思，我要离开一会。",
            "不要吵了，有什么好吵的，专心玩游戏吧。",
        ],
    poker_qianfen: [
            "快点吧，等到花都谢啦！",
            "又断线了，网络怎么这么差呀！",
            "不要走，决战到天亮！",
            "你的牌打得太好啦！",
            "你是MM还是GG？",
            "和你合作真是太愉快了！",
            "大家好！很高兴见到各位。",
            "各位，真是不好意思，我要离开一会。",
            "不要吵了，有什么好吵的，专心玩游戏吧。",
        ],
    poker_bashi: [
            "快点吧，等到花都谢啦！",
            "又断线了，网络怎么这么差呀！",
            "不要走，决战到天亮！",
            "你的牌打得太好啦！",
            "你是MM还是GG？",
            "和你合作真是太愉快了！",
            "大家好！很高兴见到各位。",
            "各位，真是不好意思，我要离开一会。",
            "不要吵了，有什么好吵的，专心玩游戏吧。",
        ],
    poker_sdh: [
            "快点吧，等到花都谢啦！",
            "又断线了，网络怎么这么差呀！",
            "不要走，决战到天亮！",
            "你的牌打得太好啦！",
            "你是MM还是GG？",
            "和你合作真是太愉快了！",
            "大家好！很高兴见到各位。",
            "各位，真是不好意思，我要离开一会。",
            "不要吵了，有什么好吵的，专心玩游戏吧。",
        ],
    zp_chz: [
            "快点吧，等到花都谢啦！",
            "又断线了，网络怎么这么差呀！",
            "不要走，决战到天亮！",
            "你的牌打得太好啦！",
            "你是MM还是GG？",
            "和你合作真是太愉快了！",
            "大家好！很高兴见到各位。",
            "各位，真是不好意思，我要离开一会。",
            "不要吵了，有什么好吵的，专心玩游戏吧。",
        ],
    },

    playRules: {
        niuniu_mpqz:
            '    一、游戏底注：可选1000，5000，一万，2万，5万，10万。\n'+
            '    二、开局人数：可选2~6人，最大人数可选6~10人。 \n'+
            '    三、进入和踢出限制：\n' +
            '       1、游戏底注为1000时。玩家入场金币为6.4万。小于5.12万被踢出。\n'+
            '       2、游戏底注为5000时。玩家入场金币为32万。小于25.6万被踢出。\n'+
            '       3、游戏底注为1万时。玩家入场金币为64万。小于51.2万被踢出。\n'+
            '       4、游戏底注为2万时。玩家入场金币为128万。小于102.4万被踢出。\n'+
            '       5、游戏底注为5万时。玩家入场金币为320万。小于256万被踢出。\n' +
            '       6、游戏底注为10万时。玩家入场金币为640万。小于512万被踢出。\n'+
            '    四、翻倍规则：\n' +
            '       1、牛牛*4，牛九*3，牛八*2，牛七*2，其他牛1倍。\n' +
            '       2、牛番：无牛、牛一1倍、牛二2倍...牛九9倍、牛牛10倍。\n'+
            '    五、押注：\n'+
            '       1、闲家推注可选无，5倍，10倍，20倍。\n'+
            '       2、最大抢庄1~4倍。' +
            '       3、抢庄可加倍可不加倍。\n'+
            '    六、特殊规则（可选）：\n'+
            '       1、五花牛（5倍）：5张牌手牌全由JQK组合成。\n'+
            '       2、顺子牛（6倍）：5张手牌由点数相连的五张牌组成，如56789。\n'+
            '       3、同花牛（7倍）：5张手牌花色一样全为梅花或其他花色。\n'+
            '       4、葫芦牛（8倍）：5张手牌由3张点数相同的牌和另外两张点数相同的牌组成，如44466。\n'+
            '       5、炸弹牛（9倍）：5张手牌由4张点数相同的牌和任意一张牌组成，如55558。\n'+
            '       6、全大牛（10倍）：（无花规则下有次特殊牌型）5张手牌加起来点数不小于四十，如99987。\n'+
            '       7、五小牛（10倍）：5张手牌加起来点数不超过十，如AA224。\n'+
            '       8、同花顺牛（10倍）：5张手牌既是顺子又是同花，如全黑桃56789。\n'+
            '       （以上特殊牌型按先后顺序从小到大）。\n'+
            '       9、金牌牛：5张手牌由3张点数相同的牌和任意两张点数的牌组成，如55589。\n' +
            '       10、牛番规则时所有特殊牌型倍数额外+6倍。\n'+
            '    七、高级选项（可选）：\n' +
            '       1、可中途加入。\n' +
            '       2、可搓牌。\n' +
            '       3、无花：去掉花牌。',
        niuniu_guodi:
            '    一、游戏锅底：可选5万，10万，20万，40万，80万。\n'+
            '    二、开局人数：可选2~6人，最大人数可选6~10人。 \n'+
            '    三、进入和踢出限制：\n' +
            '       1、游戏底注为5万时。玩家入场金币为6万。小于5万被踢出。\n'+
            '       2、游戏底注为10万时。玩家入场金币为12万。小于10万被踢出。\n'+
            '       3、游戏底注为20万时。玩家入场金币为24万。小于20万被踢出。\n'+
            '       4、游戏底注为40万时。玩家入场金币为48万。小于40万被踢出。\n'+
            '       5、游戏底注为80万时。玩家入场金币为96万。小于80万被踢出。\n'+
            '    四、翻倍规则：\n' +
            '       1、牛牛*4，牛九*3，牛八*2，牛七*2，其他牛1倍。\n' +
            '    五、押注：\n'+
            '       1、闲家下注为锅底1/10，1/5，1/4。\n'+
            '       2、最大抢庄1倍。' +
            '    六、收庄和连庄：\n'+
            '       1、收庄局数可设置3、5、8局。\n'+
            '       2、连庄次数最多两次，每次连庄锅底翻倍。' +
            '    七、特殊规则（可选）：\n'+
            '       1、五花牛（5倍）：5张牌手牌全由JQK组合成。\n'+
            '       2、顺子牛（6倍）：5张手牌由点数相连的五张牌组成，如56789。\n'+
            '       3、同花牛（7倍）：5张手牌花色一样全为梅花或其他花色。\n'+
            '       4、葫芦牛（8倍）：5张手牌由3张点数相同的牌和另外两张点数相同的牌组成，如44466。\n'+
            '       5、炸弹牛（9倍）：5张手牌由4张点数相同的牌和任意一张牌组成，如55558。\n'+
            '       6、全大牛（10倍）：（无花规则下有次特殊牌型）5张手牌加起来点数不小于四十，如99987。\n'+
            '       7、五小牛（10倍）：5张手牌加起来点数不超过十，如AA224。\n'+
            '       8、同花顺牛（10倍）：5张手牌既是顺子又是同花，如全黑桃56789。\n'+
            '       （以上特殊牌型按先后顺序从小到大）。\n'+
            '       9、金牌牛：5张手牌由3张点数相同的牌和任意两张点数的牌组成，如55589。\n' +
            '       10、牛番规则时所有特殊牌型倍数额外+6倍。\n'+
            '    八、高级选项（可选）：\n' +
            '       1、可中途加入。\n' +
            '       2、可搓牌。\n' +
            '       3、无花：去掉花牌。',
        psz:
            '    一、游戏人数、牌张数：\n'+
            '       2~5人。 去掉大小王、共52张牌，每个玩家有3张手牌。\n'+
            '      （每局的第一轮无法弃、第3轮开始可以比牌、最多可以跟注10轮，第10轮之后只能比牌或者弃牌。\n'+
            '    二、牌型比较(可设置金花大于顺子或者顺子大于金花)\n'+
            '       1、金花大：豹子>顺金>金花>顺子>对子>单张。\n'+
            '       2、拖拉机大（顺子大）：豹子>顺金>顺子>金花>对子>单张。\n'+
            '       3、牌点大小比较：A、K、Q、J….4>3>2。\n'+
            '       4、顺金、顺子按照顺序比点：AKQ>KQj….432>32A。\n'+
            '       5、拖拉机（顺子大）：AKQ>A23>其他顺子；顺金天龙>顺金地龙>其他顺金。\n'+
            '    三、牌型：\n'+
            '       1、豹子：三张点相同的牌。\n'+
            '       2、顺金：花色相同的顺子。\n'+
            '       3、金花：花色相同的非顺子。\n'+
            '       4、顺子：花色不同的顺子。\n'+
            '       5、对子：点数相同的两张牌加上其他一张牌。\n'+
            '       6、单张：三张牌不组成任何类型的牌。\n'+
            '       7、天龙：QKA，地龙：A23，顺金天龙：花色相同的QKA，顺金地龙：花色相同的A23（只存在于拖拉机大模式）。\n'+
            '    四、经典玩法：最多8人，共52张牌\n'+
            '       1、底注：游戏开始后，每位玩家投入的初始注。\n'+
            '       2、明注：看牌后的下注。暗注：没有看牌的下注。明注下注金额必须为暗注的两倍。\n'+
            '       3、单注封顶：每个玩家每次下注的上限。\n'+
            '       4、回合数封顶：每副牌每名玩家下注次数达到上限。达到回合数封顶时，玩家只可以与其他玩家进行比牌或者弃牌。\n'+
            '       5、跟注：和上家加入同样的筹码。\n'+
            '       6、加注：提高单次押注的筹码，但是不能超过单注封顶。\n'+
            '       7、弃牌：放弃当局牌，看牌前和看牌后都能弃牌。 游戏开始后长时间不操作，系统自动跟注。若达到回合数封顶时，长时间不操作，系统默认弃牌。\n'+
            '       8、比牌：经过两轮后可以选择与任意玩家进行比牌\n'+
            '       9、闷牌：根据房间设定，闷牌几轮，则前几轮不允许看牌。\n'+
            '       10、喜钱：当手牌为顺金或者豹子时，无论几分场，每家需要拿出一定的分数给获得相应牌型的玩家，顺金给5分，豹子给10分。\n'+
            '       11、孤注一掷：当身上所携带的金币不足以跟注的情况下，将身上所有的金币进行投注，玩家点击孤注一掷后，将按照逆时针次序与每一位玩家进行比牌。'+
            '当孤注一掷玩家牌型大于所有玩家时，获胜。当任意一名玩家牌型大于孤注一掷玩家时，则为输家。输掉所有金币。',
        poker_pdk:
            '    一、牌数：1、16张玩法 2、15张玩法。\n'+
            '    二、游戏底注：可选1000，5000，一万，2万，5万，10万。\n'+
            '    三、人数：2，3人。\n'+
            '    四、进入和踢出限制：\n' +
            '       1、游戏底注为1000时，玩家入场金币 6.4万，小于2.56万时被踢出房间。\n'+
            '       2、游戏底注为5000时，玩家入场金币 32万，小于5.12万时被踢出房间。\n'+
            '       3、游戏底注为1万时，玩家入场金币 64万，小于12.8万时被踢出房间。\n'+
            '       4、游戏底注为2万时，玩家入场金币 128万，小于25.6万时被踢出房间。\n'+
            '       5、游戏底注为5万时，玩家入场金币 320万，小于51.2万时被踢出房间。\n'+
            '       6、游戏底注为10万时，玩家入场金币 640万，小于102.4万时被踢出房间。\n'+
            '    五、首局先出可选庄家随机出牌或者黑桃三先出。\n'+
            '    六、可选显示牌数或不显示牌数。\n'+
            '    七、特殊玩法（可选）：\n'+
            '       1、三张可少带出完：最后一手牌只剩三张或三带一可以出完牌。\n'+
            '       2、三张可少带接完：最后一手牌只剩三张或三带一刚好上家打出三带二三张的点数只要大于上家则可接完。\n'+
            '       3、飞机可少带出完：最后一首牌只剩下2对或2对以上的点数相连的3张牌且没有任意四张牌或是小于四张牌可直接出完。\n'+
            '       4、飞机可少带接完：最后一首牌只剩下2对或2对以上的点数相连的3张牌且没有任意四张牌或是小于四张牌可直接出完。\n'+
            '       5、小通机制：玩家手上剩余的牌大于10张。\n'+
            '       6、双报：玩家手上只剩两张牌报双。\n'+
            '    八、特殊规则（可选）：\n'+
            '       1、炸弹不可拆。\n'+
            '       2、允许四带二。\n'+
            '       3、允许四带三。\n'+
            '       4、红桃10扎鸟。\n'+
            '       5、可中途加入。',
        diantuo:
            '    一、游戏底注：2000,5000,1万，2万，5万。\n'+
            '    二、固定区间：\n'+
            '       1、无：游戏底注可任意选则。\n'+
            '       2、10 20 30: 游戏底注只能为一万，一把最小数10万金币，最大数30万金币。\n'+
            '       3、20、40、60:游戏底注只能为一万,一把最小数20万金币，最大数60万金币。\n'+
            '       4、30 60 90 :游戏底注只能为一万,一把最小数30万金币，最大数90万金币。\n'+
            '    三、炸弹有喜: 可选择5炸或者6炸的时候加喜分。四红四黑:四红两张红桃两张方块，四黑两张黑桃两张梅花。\n'+
            '    四、天炸三喜：四个王喜分为3。\n'+
            '    五、特殊规则（可选）：中途可进，去掉3,4。',
        mj_tj:
            '    一、游戏底注：可选1000，5000，一万，2万，5万，10万。\n'+
            '    二、游戏人数：2-4人。\n'+
            '    三、进入和踢出限制：\n' +
            '       1、游戏底注为1000时，玩家入场金币 6.4万，小于5.12万时被踢出房间。\n'+
            '       2、游戏底注为5000时，玩家入场金币 32万，小于25.6万时被踢出房间。\n'+
            '       3、游戏底注为1万时，玩家入场金币 64万，小于51.2万时被踢出房间。\n'+
            '       4、游戏底注为2万时，玩家入场金币 128万，小于102.4万时被踢出房间。\n'+
            '       5、游戏底注为5万时，玩家入场金币 320万，小于256万时被踢出房间。\n'+
            '       6、游戏底注为10万时，玩家入场金币 640万，小于512万时被踢出房间。\n'+
            '    四、报听规则：\n' +
            '       1，不报听。\n'+
            '       2，报听小出：玩家A报听，玩家B胡牌，则A要给B小胡自摸的钱。\n'+
            '       3，报听大出：玩家A报听，玩家B胡牌，则A要给B大胡自摸的钱。\n'+
            '    五、抓鸟规则：\n' +
            '       1，不抓鸟 2，抓一鸟  3，抓2鸟。\n'+
            '    六、特殊规则：\n' +
            '       1，天胡抢杠胡。\n' +
            '       2，抓鸟必中。\n' +
            '       3，豪华七小对：5对牌加4张相同的牌(未开杠)。\n'+
            '    七、中途可进（可选）。',
        sanshui:
            '    一、游戏底注：可选1000，5000,1万，2万，5万，10万。\n'+
            '    二、游戏人数：开局人数可选2-4人，最大人数：可选4-7人。\n'+
            '    三、进入和踢出限制：\n' +
            '       1、游戏底注为1000时，玩家入场金币为10万，小于8万时被踢出房间。\n'+
            '       2、游戏底注为5000时，玩家入场金币为50万，小于40万时被踢出。\n'+
            '       3、游戏底注为1万时，入场金币为100万，小于80万时被踢出房间。\n'+
            '       4、游戏底注为2万时，入场金币为200万，小于160万被踢出。\n'+
            '       5、游戏底注为5万时，入场金币为500万，小于400万时被踢出。\n'+
            '       6、游戏底注为10万时，入场金币为1000万，小于800万时被踢出。\n'+
            '    四、马牌：\n'+
            '       1、马牌选取：玩家创建房间时，可选择是否使用马牌；勾选使用马牌后，可从黑桃5，黑桃10，黑桃A三张牌中，选择一张为马牌。\n'+
            '       2、马牌分值设定：在原有算分基础上，若玩家有马牌，择其与其他玩家之间的所有道比分都*2，没有马牌的玩家之间不翻倍。另外玩家有马牌输了，输分也要翻倍。\n'+
            '    五、计分规则：\n' +
            '       赢一道：+1分，同一道大于其他玩家。\n' +
            '       输一道：-1分，同一道小于其他玩家。\n' +
            '       打和：+0分，同一道和其他玩家大小相同。\n' +
            '       打枪：+1分或*2倍，如果其他一个玩家三道全部胜过另一个玩家，称为打枪。赢家可以额外获得1分或2倍，输家则额外扣1分或2倍。\n' +
            '       全垒打：*2倍，比牌结束后，如果一个玩家全垒打，算上原来打枪的分数，赢家还要每家分数乘2倍。\n' +
            '       冲三：+3，分头道为三条，且大于对手，赢家可获得1分外，再加2分，总计赢3分，输家则输3分。\n' +
            '       中墩葫芦：+2分，中道为葫芦，且大于对手，赢家可获得1分外，再加1分，总计2分，输家则输2分。\n' +
            '       铁支：+4或+8分，中道为铁支，且大于对手，赢家赢8分，输家则输8分。尾道为铁支，且大于对手，赢家可获得4分，输家则输4分。\n' +
            '       同花顺：+5分或+10分，中道为同花顺，且大于对手，赢家赢10分，输家输10分。尾道为同花顺，且大于对手，赢家可获得5分，输家则输5分。\n' +
            '       五同：+10分或+20分，中道为五条，且大于对手，赢家赢20分，输家则输20分。尾道为五条，且大于对手对手，赢家赢10分，输家则输10分。\n' +
            '       三同花：+4分，三同花牌型，赢取玩家4分。\n' +
            '       六小：+4分，十三张牌都是A~10，赢取玩家4分。\n' +
            '       三顺子：+4分，三顺子牌型，赢取玩家4分。\n' +
            '       六对半：+4分，六对半牌型，赢取玩家4分。\n' +
            '       四套三条：+8分，若大于其他玩家，赢取玩家8分。\n' +
            '       三分天下：+16分，若大于其他玩家，赢取玩家16分。\n' +
            '       三同花顺：+18分，若大于其他玩家，赢取玩家18分。\n' +
            '       一条龙：+52分，若大于其他玩家，赢取玩家52分。\n' +
            '       清龙：+108分，若大于其他玩家，赢取玩家108分。\n' +
            '    六、中途可进（可选）。',
        mj_hz:
            '    一、游戏底注：可选1000，5000，1万，2万，5万，10万。\n'+
            '    二、游戏人数：开局人数可选2-4人，最大人数可选2-4人，开局人数不能大于最大人数。\n'+
            '    三、进入和踢出限制：\n' +
            '       1、游戏底注为1000时，玩家入场金币3.2万，小于2.6万时被踢出房间。\n'+
            '       2、游戏底注为5000时，玩家入场金币16万，小于12.8万时被踢出房间。\n'+
            '       3、游戏底注为1万时，玩家入场金币32万，小于25.6万时被踢出房间。\n'+
            '       4、游戏底注为2万时，玩家入场金币64万，小于51.2万时被踢出房间。\n'+
            '       5、游戏底注为5万时，玩家入场金币 160万，小于128万时被踢出房间。\n'+
            '       6、游戏底注为10万时，玩家入场金币 320万，小于256万时被踢出房间。\n'+
            '    四、庄闲玩法：\n' +
            '       1，分庄闲：分庄家和闲家 ，游戏开始，庄家得14张牌，闲家得13张，庄家从手中选择一张打出，闲家有权碰、杠、胡，但不能吃，庄家输赢都要+1分。\n' +
            '       2，不分庄闲。\n'+
            '    五、抓鸟规则：1、不抓鸟 2、抓两鸟 3、抓四鸟 4、抓六鸟。\n'+
            '    六、特殊玩法：' +
            '       1、七小对：手上一共七对牌。\n' +
            '       2、自摸胡：只能自摸不能接炮。\n' +
            '       3、通炮：一炮多响。\n' +
            '       4、鸟必中。\n'+
            '    七、房间开始后可加入（可选）。',
        mj_zz:
            '    一、游戏底注：可选1000，5000，1万，2万，5万，10万。\n'+
            '    二、游戏人数：开局人数可选2-4人，最大人数可选2-4人，开局人数不能大于最大人数。\n'+
            '    三、进入和踢出限制：\n' +
            '       1、游戏底注为1000时，玩家入场金币3.2万，小于2.6万时被踢出房间。\n'+
            '       2、游戏底注为5000时，玩家入场金币16万，小于12.8万时被踢出房间。\n'+
            '       3、游戏底注为1万时，玩家入场金币32万，小于25.6万时被踢出房间。\n'+
            '       4、游戏底注为2万时，玩家入场金币64万，小于51.2万时被踢出房间。\n'+
            '       5、游戏底注为5万时，玩家入场金币 160万，小于128万时被踢出房间。\n'+
            '       6、游戏底注为10万时，玩家入场金币 320万，小于256万时被踢出房间。\n'+
            '    四、庄闲玩法：\n' +
            '       1，分庄闲：分庄家和闲家 ，游戏开始，庄家得14张牌，闲家得13张，庄家从手中选择一张打出，闲家有权碰、杠、胡，但不能吃，庄家输赢都要+1分。\n' +
            '       2，不分庄闲。\n'+
            '    五、抓鸟规则：1、不抓鸟 2、抓两鸟 3、抓四鸟 4、抓六鸟。\n'+
            '    六、特殊玩法：' +
            '       1、七小对：手上一共七对牌。\n' +
            '       2、自摸胡：只能自摸不能接炮。\n' +
            '       3、通炮：一炮多响。\n' +
            '       4、鸟必中。\n'+
            '    七、房间开始后可加入（可选）。',
        mj_yy:
            '    一、游戏底注：可选1000，5000，1万，2万，5万，10万。\n'+
            '    二、游戏人数：开局人数可选2-4人，最大人数可选2-4人，开局人数不能大于最大人数。\n'+
            '    三、进入和踢出限制：\n' +
            '       1、游戏底注为1000时，玩家入场金币3.2万，小于2.6万时被踢出房间。\n'+
            '       2、游戏底注为5000时，玩家入场金币16万，小于12.8万时被踢出房间。\n'+
            '       3、游戏底注为1万时，玩家入场金币32万，小于25.6万时被踢出房间。\n'+
            '       4、游戏底注为2万时，玩家入场金币64万，小于51.2万时被踢出房间。\n'+
            '       5、游戏底注为5万时，玩家入场金币 160万，小于128万时被踢出房间。\n'+
            '       6、游戏底注为10万时，玩家入场金币 320万，小于256万时被踢出房间。\n'+
            '    四、将炮设置：将将胡接炮设置\n' +
            '       1、不可接炮。\n' +
            '       2、门清将将胡可接炮。\n' +
            '       3、将将胡可接炮。\n' +
            '    五、抓鸟规则：1、不抓鸟 2、抓两鸟 3、抓四鸟 4、抓六鸟。\n'+
            '    六、特殊玩法：' +
            '       1、分庄闲：分庄家和闲家 ，游戏开始，庄家得14张牌，闲家得13张，庄家从手中选择一张打出，闲家有权碰、杠、胡，但不能吃。\n' +
            '       2、门清：所有牌全部为手上自己摸的牌，没有碰，明杠。\n' +
            '       3、通炮：一炮多响。\n' +
            '       4、鸟必中。\n'+
            '       5、豪华七小对：5对牌加4张相同的牌（未开杠）。\n'+
            '       6、一字撬（全求人）：手上只剩一张牌，其余全为碰牌或者杠。\n' +
            '       7、可报听。\n'+
            '    七、房间开始后可加入（可选）。',
        mj_cs:
            '    一、游戏底注：可选1000，5000，1万，2万，5万，10万。\n' +
            '    二、游戏人数：开局人数可选2-4人，最大人数可选2-4人，开局人数不能大于最大人数。\n' +
            '    三、进入和踢出限制：\n' +
            '       1、游戏底注为1000时，玩家入场金币3.2万，小于2.6万时被踢出房间。\n' +
            '       2、游戏底注为5000时，玩家入场金币16万，小于12.8万时被踢出房间。\n' +
            '       3、游戏底注为1万时，玩家入场金币32万，小于25.6万时被踢出房间。\n' +
            '       4、游戏底注为2万时，玩家入场金币64万，小于51.2万时被踢出房间。\n' +
            '       5、游戏底注为5万时，玩家入场金币 160万，小于128万时被踢出房间。\n' +
            '       6、游戏底注为10万时，玩家入场金币 320万，小于256万时被踢出房间。\n' +
            '    四、庄闲：\n' +
            '       1、胡牌为庄：胡牌为下一局的庄家。\n' +
            '       2、分庄闲：分庄家和闲家 ，游戏开始，庄家得14张牌，闲家得13张，庄家从手中选择一张打出，闲家有权碰、杠、胡，但不能吃。庄家输赢都+1\n' +
            '    五、抓鸟规则：1、不抓鸟 2、抓一鸟 3、抓二鸟。\n' +
            '    六、飘分：在摸牌后每位玩家选择飘分数（不飘分/飘一分/飘两分/飘四分）,结算时，将胡牌玩家及竖排玩家飘分数相加计算额外输赢。\n' +
            '    七、特殊玩法：\n' +
            '       1、节节高：相同花色，连续3对牌。\n' +
            '       2、三同：如有一对一筒一对一索一对一万。\n' +
            '       3、一枝花：13张牌里某花色只有一张，且为"五"。\n' +
            '       4、假杠：是指随意一对牌，不一定需要258做将。',
        sangong:
            '    一、游戏底注：可选1000，5000，一万，2万，5万，10万。\n'+
            '    二、开局人数：可选2~6人，最大人数可选6~10人。 \n'+
            '    三、进入和踢出限制：\n' +
            '       1、游戏底注为1000时。玩家入场金币为6.4万。小于5.12万被踢出。\n'+
            '       2、游戏底注为5000时。玩家入场金币为32万。小于25.6万被踢出。\n'+
            '       3、游戏底注为1万时。玩家入场金币为64万。小于51.2万被踢出。\n'+
            '       4、游戏底注为2万时。玩家入场金币为128万。小于102.4万被踢出。\n'+
            '       5、游戏底注为5万时。玩家入场金币为320万。小于256万被踢出。\n' +
            '       6、游戏底注为10万时。玩家入场金币为640万。小于512万被踢出。\n'+
            '    四、翻倍规则：' +
            '       1、三公：爆九*9，三条*5，三公*4，九点*3，八点*2。\n'+
            '       2、金花：豹子*6，金花顺*5，金花*4，顺子*3，对子*2。\n'+
            '    五、押注：\n'+
            '       1、闲家推注可选无，5倍，10倍，20倍。\n'+
            '       2、最大抢庄1~4倍。\n' +
            '       3、抢庄可加倍可不加倍。\n'+
            '   六、特殊规则：\n'+
            '       1、爆九（9倍）：3张牌手牌全由3、3、3组合成。\n'+
            '       2、三条（5倍）：3张手牌由点数相同的三张牌组成，如5、5、5。\n'+
            '       3、三公（4倍）：3张手牌全由JQK组成。\n'+
            '       以下牌型只会在三公比金花模式中有效：'+
            '       4、豹子（6倍）：3张手牌由点数相同的三张牌组成，如5、5、5。\n'+
            '       5、金花顺（5倍）：3张手牌都是同一花色且点数相连，如红桃345。\n'+
            '       6、金花（4倍）：3张手牌都是同一花色。\n'+
            '       7、顺子（3倍）：3张手牌点数相连，如3，4，5。\n'+
            '       8、对子（2倍）：3张手牌有对子，如3，3，5。\n'+
            '    七、高级选项（可选）：\n' +
            '       1、可中途加入。\n' +
            '       2、可搓牌。\n',
        ttz:
            '    一、游戏底注：可选1000，5000，一万，2万。\n' +
            '    二、开局人数：可选2~5人，最大人数可选10人。\n ' +
            '    三、进入和踢出限制：\n' +
            '       1、游戏底注为1000时。玩家入场金币为6.4万。小于5.12万被踢出。\n'+
            '       2、游戏底注为5000时。玩家入场金币为32万。小于25.6万被踢出。\n'+
            '       3、游戏底注为1万时。玩家入场金币为64万。小于51.2万被踢出。\n'+
            '       4、游戏底注为2万时。玩家入场金币为128万。小于102.4万被踢出。\n' +
            '    四、玩法设置：\n' +
            '       1、通用玩法：红中对>豹子>二八杠。\n' +
            '       2、湖南玩法：红中对>二八杠>豹子。\n' +
            '       3、东北玩法：二八杠>红中对>豹子。\n' +
            '    五、特别提示：\n' +
            '       1、每两局重新洗牌，记牌器重置。\n' +
            '       2、超时自动弃牌。\n' +
            '       3、牌最大的玩家赢得所有筹码，如有多个玩家，则由这些玩家平分所有筹码。',
        dsq:
            '    一、游戏底注：可选10万，50万，100万，200万，500万，1000万。\n'+
            '    二、开局人数：2人，最大人数2人。 \n'+
            '    三、进入和踢出限制：无。\n' +
            '    四、输赢金币数以输家拥有的最大金币数和底注之间取小，赢家可以赢超过自身金币数的金币。\n' +
            '    五、超时自动认输。\n' +
            '    六、当某一方玩家只剩一个棋子时，开启追棋判定。开启后在12步之内没有吃动作发生则以平局结束游戏。\n',

        poker_ddz:
            '    一、游戏底注：可选1000，5000，1万，2万。\n'+
            '    二、开局人数：2人或3人。 \n'+
            '    三、抢庄模式：叫分或抢地主模式。 \n'+
            '    四、进入和踢出限制：\n' +
            '       1、游戏底注为1000时，玩家入场金币 6.4万，小于2.56万时被踢出房间。\n'+
            '       2、游戏底注为5000时，玩家入场金币 32万，小于5.12万时被踢出房间。\n'+
            '       3、游戏底注为1万时，玩家入场金币 64万，小于12.8万时被踢出房间。\n'+
            '       4、游戏底注为2万时，玩家入场金币 128万，小于25.6万时被踢出房间。\n',
        poker_qianfen:
            '    一、游戏底注：可选1000，5000，1万，2万。\n'+
            '    二、开局人数：2人或3人。 \n',
        poker_bashi:
            '    一、游戏底注：可选1万，2万，5万，10万，20万。\n'+
            '    二、开局人数：4人。 \n',
        poker_sdh:
            '    一、游戏底注：可选1万，2万，5万，10万，20万。\n'+
            '    二、开局人数：3人或4人。 \n',
        poker_sbf:
            '    一、游戏底注：可选1万，2万，5万，10万，20万。\n'+
            '    二、开局人数：3人或4人。 \n',
        zp_chz:
            '    一、游戏底注：可选1万，2万，5万，10万，20万。\n'+
            '    二、开局人数：2人或3人。 \n',
        gobang:
            '    单机游戏经典。\n',
        eg_fruit: 
            '    单机游戏经典。\n',
    },

    playerMax: {
        poker_pdk: [2, 3],
        niuniu_mpqz: [6, 8, 10],
        niuniu_guodi: [6, 8, 10],
        niuniu_wanren: [6],
        mj_tj: [2, 3, 4],
        diantuo: [4],
        diantuo_tj: [4],
        diantuo_hsg: [4],
        sanshui: [4, 5, 6, 7],
        mj_hz: [2, 3, 4],
        mj_zz: [2, 3, 4],
        mj_cs: [2, 3, 4],
        mj_yy: [2, 3, 4],
        sangong: [6, 8],
        psz: [5, 6, 7],
        dsq: [2],
        poker_ddz: [2, 3],
        poker_qianfen: [2, 3],
        poker_bashi: [4],
        poker_sdh: [3, 4],
        zp_chz: [2, 3, 4],
        poker_sbf: [3, 4],
        eg_fruit: [100]
    },

    Emojis: ['happy', 'angry', 'fennu', 'han', 'huaixiao', 'jiong', 'lihai', 'se', 'shaoxiang', 'shihua',
        'sleep', 'smile', 'touxiang', 'yun', 'zhiya'],

    AutoList: [917146],

    msg_room:'',
    //s c s代表服务器  c代表客户端  sc代表服务器到客户端  cs代表客户端到服务器
    //命名规则 游戏组件名+sc或者cs+消息名 如 zp_phz_sc_gameBegin
    msg_zp_phz:'message zp_phz_sc_gameBegin {' +
        '  optional int32 by = 1 [default = -1];' +
        '  repeated bool answer = 2;' +
        '  optional int32 time = 3;' +
        '  optional int32 from = 4;' +
        '  optional bool result = 5;' +
        '}',
};
