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
    dtActType: {
        wulong: 0, //乌龙
        duizi: 1, //对子
        liangdui: 2, //连对
        santiao: 3, //三条
        shunzi: 4, //顺子
        tonghua: 5, //同花
        hulu: 6, //葫芦
        tiezhi: 7, //铁支
        tonghuashun: 8, //同花顺
        wutong: 9, //五同
    },

    status: {
        /** 游戏开始 */
        BEGIN: 0,
        /** 等待抢庄 */
        WAIT_BANKER: 1,
        /** 等待下注 */
        WAIT_BETS: 2,
        /** 等待摆牌 */
        CHU_PAI: 3,
        /** 比牌 */
        BI_PAI: 4,
        /** 游戏结束 */
        END: 5
    },

    cardType: {
        0: 0,// 乌龙0x11100-0xEEEEE(0xEEEEE的10进制为978670<1000000)

        10: 1,// 对子0x1100 + 10 * 1000000 -- 0xEEEE + 10 * 1000000

        20: 2,// 两对0x111 + 20 * 1000000 -- 0xEEE + 20 * 1000000

        30: 3,// 三条 0x111 + 30 * 1000000 -- 0xEEE + 30 * 1000000

        31: 10, // 冲三

        40: 4,// 顺子 6 + 40 * 1000000 -- 14 + 40 * 100000

        50: 5,// 同花 0x11111 + 50 * 1000000 -- 0xEEEEE + 50 * 1000000

        60: 6,// 葫芦 0x11 + 60 * 1000000 -- 0xEE + 60 * 1000000

        61: 11,// 中墩葫芦

        70: 7,// 铁支 0x11 + 70 * 1000000 -- 0xEE + 70 * 1000000

        80: 8,// 同花顺 6 + 80 * 1000000 -- 14 + 80 * 1000000

        90: 9,// 五同 2 + 90 * 1000000 -- 14 + 90 * 1000000

        100: 12,// 三同花 100 + 100000000

        110: 13, // 六小 100 + 100000000 (todo: 新增牌型)

        120: 14,// 三顺子 120 + 100000000

        140: 15,// 六对半 140 + 100000000

        160: 16,// 五对三条 160 + 100000000   0

        180: 17,//四套三条 180 + 100000000

        200: 18,// 凑一色 200 + 100000000   0

        220: 19,// 全小 220 + 100000000   0

        240: 20,// 全大 240 + 100000000   0

        260: 21,// 三分天下 260 + 100000000

        280: 22,// 三同花顺 280 + 100000000

        300: 23,// 十二皇族 300 + 100000000   0

        320: 24,// 一条龙 320 + 100000000

        340: 25 // 青龙 340 + 100000000                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       00000
    }
};

