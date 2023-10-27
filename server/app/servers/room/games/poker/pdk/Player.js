/**
 * Created by apple on 2018/1/16.
 */
const BasePlayer = require('../../BasePlayer');
const Event = require('./event');

//黑桃 = spades
//红桃 = hearts
//梅花 = clubs
//方块 = diamonds  在国外叫钻石牌


class Player extends BasePlayer {
    constructor(main) {
        super(main);
        this.holds = undefined;
        this.uid = 0;
        this.seatId = 0;
        this.isTrusteeship = false;
        this.score = 0;             //玩家分数
        this.alert = false;
        this.canNum = false;

        this.initEvent();
    }


    initEvent() {
        this.on(Event.discard, this.discard);
        this.on(Event.cutCard, this.cutCard);
    }

    setTrusteeship(isTrusteeship) {
        if (isTrusteeship == this.isTrusteeship) {
            return;
        }

        this.isTrusteeship = isTrusteeship;
        this.main.checkPlayerIsTrusteeship(this);
    }

    cutCard(index) {
        this.main.cutCard(this.uid, index);
    }

    discard(data) {
        this.main.discard(this, data);
    }

    /**
     * 发送牌到前端
     */
    sendHolds(c) {
        this.holds = [].concat(this.beginHolds);
        this.send(Event.holds, {holds: this.holds, c: c});
    }

    /**
     * 是否报警
     */
    checkAlert() {
        if (this.holds.length === 1) {
            this.alert = true;
            this.sendAll(Event.alert, {uid: this.uid});
        }
    }

    /**
     * 删除指定的牌
     * @param cards
     */
    removeHolds(cards) {
        cards.forEach(el => {
            let index = this.holds.indexOf(el);
            if (index > -1) {
                this.holds.splice(index, 1);
            }
        }, this);

        this.checkAlert();
    }

    /**
     * 发送给自己
     */
    getInfos() {
        let data = {};
        //防作弊
        if (this.holds == undefined) {
            data.holds = this.beginHolds.length;
        } else {
            data.holds = this.holds;
        }

        if (this.canNum) {
            data.num = Array.isArray(this.holds) ? this.holds.length : this.beginHolds.length;
        }

        data.alert = this.alert;

        return data;
    }

    /**
     * 发送给其它玩家的信息
     */
    getOtherInfos() {
        let data = {};
        if (this.canNum) {
            data.num = Array.isArray(this.holds) ? this.holds.length : this.beginHolds.length;
        }

        data.alert = this.alert;
        return data;
    }
}

module.exports = Player;