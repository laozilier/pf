/**
 * Created by sam on 2020/5/18.
 *
 */
const BasePlayer = require('../../BasePlayer');
const Event = require('./event');

class Player extends BasePlayer {
    constructor(main) {
        super(main);
        this.uid = 0;
        this.seatId = 0;
        this.initEvent();
        this.resetData();
    }

    /***
     * 客户端事件绑定
     */
    initEvent() {
        this.on(Event.cutCard, this.cutCard);
        this.on(Event.discard, this.discard);
        this.on(Event.jiaofen, this.jiaofen);
        this.on(Event.dingzhu, this.dingzhu);
        this.on(Event.maidi, this.maidi);
        this.on(Event.liushou, this.actLiushou);
        this.on(Event.surrender, this.surrender);
        this.on(Event.replySurrender, this.replySurrender);
    }

    resetData() {
        this.lastDiscard = undefined;    //上一个打出的牌
        this.beginHolds = [];
        this.canCall = true;
        this.called = false;
        this.isPai = undefined;
        this.holds = [];
        this.jiaofenIdx = undefined;
        this.baofu = undefined;
        this.liushou = undefined;
        this.alreadyLiushou = false;
        this.reply = undefined;
        this.canReply = undefined;
    }

    /**
     * 玩家投降
     */
    surrender() {
        this.main.playerSurrender(this);
    }

    /**
     * 其他玩家是否同意投降
     * @param data
     */
    replySurrender(data) {
        this.main.playerReplySurrender(this, data);
    }

    /**
     * 客户端发送留守事件
     * @param data
     */
    actLiushou(data) {
        this.main.playerLiushou(this, data);
    }

    /**
     * 客户端发送叫分事件
     * @param data
     */
    jiaofen(data) {
        this.log('玩家叫分:', data);
        this.main.playerJiaofen(this, data);
    }

    /**
     * 客户端发送放弃事件
     */
    giveup() {
        this.main.playerGiveup(this);
    }

    /**
     * 庄家定主花色
     * @param data
     */
    dingzhu(data) {
        this.main.playerDingzhu(this, data);
    }

    /**
     * 庄家埋底
     * @param data
     */
    maidi(data) {
        /** 检查数据 是否合法 */
        if (!Array.isArray(data)) {
            this.log('埋底错误:', data);
            return;
        }
        let tempData = [].concat(data);
        this.holds.forEach((el) => {
            let idx = tempData.indexOf(el);
            if (idx >= 0) {
                tempData.splice(idx, 1);
            }
        });

        if (tempData.length > 0) {
            /** 不合法 */
            this.log('埋底错误:', data);
            return;
        }

        this.main.playerMaidi(this, data);
    }

    setTrusteeship(isTrusteeship) {
        if (isTrusteeship == this.isTrusteeship) {
            return;
        }

        this.isTrusteeship = isTrusteeship;
        this.main.checkPlayerIsTrusteeship(this);
    }

    /***
     * 玩家切牌
     * @param index 切牌位置
     */
    cutCard (index) {
        this.main.cutCard(this.uid, index);
    }

    /***
     * 玩家出牌
     * @param cards
     */
    discard(cards) {
        this.main.discard(this, cards);
    }

    /***
     * 从手牌中移除打出的牌
     * @param cards
     */
    removeHolds(cards) {
        cards.forEach((el) => {
            let index = this.holds.indexOf(el);
            if (index !== -1){
                this.holds.splice(index, 1);
            }
        });
    }

    /***
     * 玩家信息，用于重连
     * @returns {{}}
     */
    getInfos(uid) {
        let data = {uid: this.uid};
        if (this.uid === uid) {
            data.holds = this.holds;
        }

        data.isPai = this.isPai;
        data.jiaofenIdx = this.jiaofenIdx;
        data.baofu = this.baofu;
        data.liushou = this.liushou;
        data.canReply = this.canReply;
        data.reply = this.reply;

        return data;
    }

    log(msg, info) {
        console.log(`table[${this.main.room.rid}] player[${this.uid} ${this.seatId}] ${msg} info:`, info);
    }
}


module.exports = Player;