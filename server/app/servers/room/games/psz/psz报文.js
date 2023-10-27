/**
 * Created by T-Vick on 2018/12/6.
 */

// 游戏业务相关请求报文
// 1.游戏状态推送（客户端监听）
let 游戏状态 = {
    事件名: 'gameStatus',
    参数: {
        status: 0 // 0游戏开始，1 游戏中 2 游戏结束
    }
};

// 2.轮转（客户端监听）
let 轮转 = {
    事件名: 'turn',
    参数: {
        uid: '88888',
        currRound: 5,
        currMulti: 2,
        88888: { // 当前轮转玩家数据
            canAuto: true,// 是否能设置自动跟

            isAuto: true, // 是否自动跟

            canWaiver: true, // 是否可弃牌

            canFollow: true, // 是否可以跟注

            currRound: 7, // 第几轮跟注

            currMulti: 2, // 跟注倍率

            canMulti: true, // 是否可以加注

            // canMultiList: [2,4,6],// 加注倍率列表

            canCompare: true, // 是否可以比牌

            canGamble: false, // 是否可以孤注一掷

            canOpenCards: false, // 是否可以看牌

            isOpenedCards: false,

            compareUids: []
        },
        12345: {// 非当前轮转玩家数据
            canAuto: true,
            isAuto: false,
            canWaiver: false,
            canOpenCards: false,
            canFollow: false,
            canMulti: false,
            canCompare: false,
            compareUids: []
        }
    }
};

// 3.跟注/加注（服务端监听）
let 跟注_加注 = {
    事件名称: 'follow',
    参数: 1 // 跟注或者加注的倍率
};

// 4.弃牌（服务端监听）
let 弃牌 = {
    事件名称: 'waiver',
    参数: {}
};

// 5.比牌（服务端监听）
let 比牌 = {
    事件名称: 'compare',
    参数: 88888 // 比牌目标玩家uid
};

// 5.1 比牌失败结果(客户端监听)
let 比牌失败结果 = {
    事件名称: 'compare',
    参数: {
        status: 0 // 0 对方已经弃牌
    }
};

// 6. 看牌（服务端监听）
let 看牌 = {
    事件名称: 'openCards',
};

// 7. 孤注一掷

// 8. 操作结果玩家的操作结果都用currentAction通知（客户端监听）
let 操作结果 = {
    事件名称: 'currentAction',
    参数: {
        uid: this.uid,
        action: 1,// 0 弃牌，1: 打底，2 跟注，3 加注，4 看牌，5 比牌，6 孤注一掷
        data: {
            /** 打底/跟注/加注结果相关参数*/
            amountFollow: 100000, // 跟注总额
            numFollow: 10000, // 本次跟注数
            coinPool: 1000000, // 桌面总金额
            /** 看牌结果相关参数*/
            cards: [0,1,3], // 手牌
            pattern: 0, // 牌型
            value: 888, // 牌值大小
            /** 比牌结果相关参数*/
            winner: 345678, //赢得比牌的玩家
            loser: 8888, // 输掉比牌的玩家
            target: 345678, // 被比较的玩家
            amountFollow: 100000, // 跟注总额
            numFollow: 10000, // 本次跟注数
            coinPool: 1000000, // 桌面总金额
            /** 弃牌结果相关参数*/
            turn: 343433, // 当前轮转uid
            compareUids: []// 当前轮转玩家可与之比牌的玩家的uid数组
        }
    }
};

// 9. 设置自动跟（服务端监听）
let 自动跟 = {
    事件名称: 'setAuto',
    参数: true
};

// 10. 设置自动跟结果（客户端监听）
let 自动跟结果 = {
    事件名称: 'auto',
    参数: {
        uid: 8888,
        isAuto: false,
        canAuto: true
    }
};

// 11. 断线重连（客户端监听）
let 断线重连 = {
    事件名称: 'gameInfo',
    参数: {
        zuid: this.zuid, // 最先发话玩家uid
        status: this.status, // 游戏状态
        uids: this.uids, // 所有参与游戏的玩家uid
        turn: this.turn, // 当前轮转
        coinPool: this.coinPool,// 金币池金额
        currRound: this.currRound, // 第几轮跟随
        currMulti: this.currMulti, // 当前倍数(焖)
        currentAction: this.currentAction, //当前操作
        players: {
            123456: { // 断线重连获取到自己的信息
                isTrusteeship: false, // 托管
                // 是否能设置自动跟
                canAuto: true,
                // 是否自动跟
                isAuto: false,
                // 是否可以弃权
                canWaiver: false,
                // 是否已经弃权
                isWaiver: false,

                isLoser: false,
                // 是否已经看牌
                isOpenedCards: false,

                canOpenCards: false,// 是否可以看牌
                // 是否可以跟注
                canFollow: false,
                // 是否可以加注
                canMulti: false,
                // 是否可以比牌
                canCompare: false,
                // 是否可以孤注一掷
                canGamble: false,
                // 本局总跟注数，包括底
                amountFollow: 100000,

                listFollow: [], // 跟注记录

                holds: [1,2,3] // 看过牌才给手牌
            },
            45678: { // 断线重连获取到其他玩家的信息
                isTrusteeship: false,

                isAuto: false,
                // 是否已经弃权
                isWaiver: false,

                isLoser: true,
                // 是否已经看牌
                isOpenedCards: false,
                // 本局总跟注数，包括底
                amountFollow: 100000,

                listFollow: [] // 跟注记录
            }
        }
    }
};

// 12. 喜钱（客户端监听）
let 喜钱 = {
    事件名称: 'xi',
    参数: {
        uid: 99999, // 谁的喜
        cards: [],// 喜牌
        pattern: 2,
        value: 8888,
        xiScoreMap: {} // uid 到本手牌喜分输赢的映射
    }
};

// 13. 游戏结算




