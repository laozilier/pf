module.exports = {
    /** 客户端操作权限type **/
    actionType: {
        pass: 0,
        chi: 1,
        peng: 2,
        gang:3,
        bu:4,
        hu: 5,
        wangdiao: 6,
        wangchuang: 7
    },

    /** 成牌类型 */
    inPokerType: {
        none: 0,
        chi: 1,
        peng: 2,
        gang: 3,
        bu: 4,
        dui: 5,
        kan: 6,
        diao: 7,
        chuang: 8,
    },

    /** 杠类型 */
    gangType: {
        dian: 0,    //点杠 别人打一张  直接三张杠
        an: 1,      //暗杠
        ming: 2,    //明杠 碰了之后再摸一张杠
    },

    /** 名堂 **/
    mingtangType: {
        none: 0,
        pinghu: 1,
    },

    /** 胡法 **/
    huType: {
        none: 0,
        dianpao: 1,
        zimo: 2,
        wangdiao: 3,
        wangdiaowang: 4,
        wangchuang: 5,
        wangchuangwang: 6,
    },
};
