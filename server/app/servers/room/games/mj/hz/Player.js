/**
 * Created by sam on 2020/5/18.
 *
 */
const BasePlayer = require('../../BasePlayer');
const Event = require('./event');
const Conf = require('./config');

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
        this.on(Event.discard, this.discard);
        this.on(Event.action, this.doAction);
    }

    resetData() {
        this.beginHolds = [];
        this.holds = [];
        this.outs = [];
        this.inPokers = [];
        this.zhaniao = [];
    }

    setTrusteeship(isTrusteeship) {
        if (isTrusteeship == this.isTrusteeship) {
            return;
        }

        this.isTrusteeship = isTrusteeship;
        this.main.checkPlayerIsTrusteeship(this);
        if (!!this._autoTimeout) {
            this.startTimeout();
        }
    }

    /**
     * 玩家搬点
     */
    bandian(data) {
        this.main.bandian(this, data);
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
     * @param data
     */
    discard(data) {
        this.main.discard(this, data);
    }

    doAction(data) {
        /** 先清除自动计时器 */
        if (!!this._autoTimeout) {
            this.clearTimeout(this._autoTimeout);
            this._autoTimeout = undefined;
        }
        this.main.playerDoAction(this, data);
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

    startTimeout() {
        return;
        /** 先清除自动计时器 */
        if (!!this._autoTimeout) {
            this.clearTimeout(this._autoTimeout);
            this._autoTimeout = undefined;
        }

        let actionTime = Conf.actionTime;
        if (this.isTrusteeship) {
            actionTime = 1000;
        }

        this._autoTimeout = this.setTimeout(() => {
            this.doAction({t:0});
            this.main.playerAutoTrusteeship(this);
        }, actionTime);
    }

    /***
     * 玩家信息，用于重连
     * @returns {{}}
     */
    getInfos(uid) {
        let data = {uid: this.uid};
        if (this.uid === uid) {
            data.holds = this.holds;
        } else {
            data.holds = this.holds.length;
        }

        data.inPokers = this.inPokers;
        data.outs = this.outs;
        data.zhaniao = this.zhaniao;

        // console.log(data);
        return data;
    }

    log(msg, info) {
        console.log(`table[${this.main.room.rid}] player[${this.uid} ${this.seatId}] ${msg} info:`, info);
    }
}


module.exports = Player;