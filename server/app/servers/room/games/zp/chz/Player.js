/**
 * Created by sam on 2020/5/18.
 *
 */
const BasePlayer = require('../../BasePlayer');
const Event = require('./event');
const enum_chz = require('./enum');
const InPokerType = enum_chz.inPokerType;
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
        this.on(Event.bandian, this.bandian);
        this.on(Event.piaofen, this.piaofen);
        this.on(Event.discard, this.discard);
        this.on(Event.action, this.doAction);
    }

    resetData() {
        this.beginHolds = [];
        this.holds = [];
        this.outs = [];
        this.inPokers = [];
        this.guochis = [];
        this.guopengs = [];
        this.sishou = false;
        this.piaofenScore = 0;
        this.alreadyPiao = false;
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
     * 玩家飘分
     * @param data 飘分
     */
    piaofen (data) {
        if (this.alreadyPiao) {
            return;
        }

        this.alreadyPiao = this.main.piaofen(this, data);
    }

    /***
     * 玩家出牌
     * @param card
     */
    discard(card) {
        this.main.discard(this, card);
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
            data.inPokers = this.inPokers;
        } else {
            data.inPokers = [];
            this.inPokers.forEach((inPoker) => {
                if (inPoker.t == InPokerType.qing) {
                    data.inPokers.push({t: inPoker.t, v: -1, vs: [-1,-1,-1,-1], x: inPoker.x, c: inPoker.c});
                } else if (inPoker.t == InPokerType.xiao) {
                    data.inPokers.push({t: inPoker.t, v: -1, vs: [-1,-1,-1]});
                } else {
                    data.inPokers.push(inPoker);
                }
            })
        }

        data.outs = this.outs;
        data.alreadyPiao = this.alreadyPiao;
        data.piaofenScore = this.piaofenScore;

        // console.log(data);
        return data;
    }

    log(msg, info) {
        console.log(`table[${this.main.room.rid}] player[${this.uid} ${this.seatId}] ${msg} info:`, info);
    }
}


module.exports = Player;