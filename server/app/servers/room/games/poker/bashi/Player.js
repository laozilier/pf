/**
 * Created by sam on 2020/5/18.
 *
 */
const BasePlayer = require('../../BasePlayer');
const Event = require('./event');
const Poker = require('../Poker');
const Algorithm = require('./algorithm');

class Player extends BasePlayer {
    constructor(main) {
        super(main);
        this.uid = 0;
        this.seatId = 0;
        this.finalHolds = [];
        this.initEvent();
        this.resetData();
    }

    /***
     * 客户端事件绑定
     */
    initEvent() {
        this.on(Event.cutCard, this.cutCard);
        this.on(Event.discard, this.discard);
        this.on(Event.jiaozhu, this.jiaozhu);
        this.on(Event.fanzhu, this.fanzhu);
        this.on(Event.dingzhu, this.dingzhu);
        this.on(Event.maidi, this.maidi);
        this.on(Event.giveup, this.giveup);
        this.on(Event.friend, this.friend);
    }

    resetData() {
        this.lastDiscard = undefined;    //上一个打出的牌
        this.beginHolds = [];
        this.cardIdx = 0;
        this.isGiveUp = false;
        this.canJiaozhu = false;
        this.canSpecialJiaozhu = false;
        this.canFanzhu = false;
        this.zhu_10 = [];
        this.all_10 = [];
        this.red_2 = [];
        this.black_2 = [];
        this.wang = [];
        this.holds = [];
    }

    /**
     * 开始发牌 每0.3秒发一张
     */
    startSendHolds(cb) {
        this.setTimeout(() => {
            let card = this.beginHolds[this.cardIdx];
            this.holds.push(card);
            this.send(Event.holds, [card]);
            let cardValue = Poker.cardValue(card);
            let cardType = Poker.cardType(card);
            if (cardValue == 10) {
                if (!this.zhu_10.includes(card)) {
                    this.zhu_10.push(card);
                    this.checkJiaozhu();
                }

                if (!this.all_10.includes(card)) {
                    this.all_10.push(card);
                } else {
                    this.all_10.push(card);
                    this.checkFanzhu();
                }
            }

            if (cardValue == 15) {
                if (cardType%2 == 0) {
                    this.red_2.push(card);
                    if (this.main.rule.needRed2 && this.red_2.length == 1) {
                        this.checkJiaozhu();
                    }

                    if (this.red_2.length > 2) {
                        this.checkSpecialJiaozhu();
                        this.checkFanzhu();
                    }
                } else {
                    this.black_2.push(card);
                    if (this.black_2.length > 2) {
                        this.checkSpecialJiaozhu();
                        this.checkFanzhu();
                    }
                }
            }

            if (cardValue > 15) {
                this.wang.push(card);
                if (this.wang.length > 2) {
                    this.checkSpecialJiaozhu();
                    this.checkFanzhu();
                }
            }

            this.cardIdx += 1;
            if (this.cardIdx < this.beginHolds.length) {
                this.finalHolds = [].concat(this.holds);
                this.startSendHolds(cb);
            } else {
                !!cb && cb();
            }
        }, 300);
    }

    /**
     * 检查可叫主
     */
    checkJiaozhu() {
        /** 如果没人叫主 则给可以叫主的人发送询问叫主 */
        if (this.main.checkCanJiaozhu()) {
            if (this.zhu_10.length == 0) {
                return;
            }

            if (this.main.rule.needRed2) {
                if (this.red_2.length == 0) {
                    return;
                }
            }

            this.canJiaozhu = true;
            this.send(Event.ask_jiaozhu, this.zhu_10);
            // this.jiaozhu([this.zhu_10[0]]);
        } else {
            /** 如果已经有人叫了 则所有人取消叫主 */
            if (this.canJiaozhu) {
                this.canJiaozhu = false;
                this.send(Event.cancel_jiaozhu);
            }
        }
    }
    /**
     * 客户端发送叫主事件
     * @param data
     */
    jiaozhu(data) {
        this.log('玩家叫主:', data);
        if (this.main.checkCanJiaozhu()) {
            /** 检查数据 是否合法 */
            if (!Array.isArray(data)) {
                return;
            }

            /** 检查数据 是否合法 */
            let tempData = [].concat(data);
            this.holds.forEach((el) => {
                let idx = tempData.indexOf(el);
                if (idx >= 0) {
                    tempData.splice(idx, 1);
                }
            });

            if (tempData.length > 0) {
                /** 不合法 */
                this.log('叫主错误:', data);
                return;
            }

            this.main.playerJiaozhu(this, data);
        } else {
            /** 已经叫过主了 不能再叫主 */
        }
    }
    
    /**
     * 检查特殊叫主
     */
    checkSpecialJiaozhu() {
        /** 如果没人叫主 则给可以叫主的人发送询问叫主 */
        if (this.main.checkCanJiaozhu()) {
            let specials = Algorithm.getSpecials(this.red_2, this.black_2, this.wang) || [];
            if (specials.length == 0) {
                return;
            }

            this.canSpecialJiaozhu = true;
            this.send(Event.ask_special_jiaozhu, specials);
        } else {
            /** 如果已经有人叫了 则取消叫主 */
            if (this.canSpecialJiaozhu) {
                this.canSpecialJiaozhu = false;
                this.send(Event.cancel_special_jiaozhu);
            }
        }
    }

    /**
     * 检查反主
     */
    checkFanzhu() {
        if (this.isGiveUp) {
            return;
        }

        if (this.main.tempzhuUid < 0) {
            return;
        }

        let a = Algorithm.getFanzhus(this.main.tempzhu, this.all_10, this.red_2, this.black_2, this.wang) || [];
        this.log('反主数组:', a);
        if (a.length > 0) {
            this.canFanzhu = true;
            this.send(Event.ask_fanzhu, a);
        } else {
            this.stopFanzhu();
        }
    }

    /**
     * 停止反主
     */
    stopFanzhu() {
        if (this.canFanzhu) {
            this.canFanzhu = false;
            this.send(Event.cancel_fanzhu);
        }
    }

    /**
     * 客户端发送反主事件
     * @param data
     */
    fanzhu(data) {
        if (this.isGiveUp) {
            return;
        }

        /** 没有叫主 不能反主 */
        if (this.main.tempzhuUid < 0) {
            return;
        }

        /** 检查数据 是否合法 */
        let tempData = [].concat(data);
        this.holds.forEach((el) => {
            let idx = tempData.indexOf(el);
            if (idx >= 0) {
                tempData.splice(idx, 1);
            }
        });

        if (tempData.length > 0) {
            /** 不合法 */
            this.log('反主错误:', data);
            return;
        }

        this.canFanzhu = false;
        this.main.playerFanzhu(this, data);
    }

    /**
     * 客户端发送放弃反主事件
     */
    giveup() {
        if (this.main.playerGiveup(this)) {
            this.isGiveUp = true;
            this.stopFanzhu();
        }
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

    friend(data) {
        this.main.playerFriend(this, data);
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
        let data = {};
        data.uid = this.uid;
        if (this.uid === uid) {
            data.holds = this.holds;
            data.zhu_10 = this.zhu_10;
            data.canJiaozhu = this.canJiaozhu;
            if (data.canJiaozhu) {
                data.zhu_10 = this.zhu_10;
            }

            data.canSpecialJiaozhu = this.canSpecialJiaozhu;
            if (data.canSpecialJiaozhu) {
                data.specials = Algorithm.getSpecials(this.red_2, this.black_2, this.wang);
            } 
            data.canFanzhu = this.canFanzhu;
            if (data.canFanzhu) {
                data.fanzhu = Algorithm.getFanzhus(this.main.tempzhu, this.all_10, this.red_2, this.black_2, this.wang);
            }

            data.isGiveUp = this.isGiveUp;
        } else {
            data.holds = this.holds.length;
        }

        return data;
    }

    log(msg, info) {
        console.log(`table[${this.main.room.rid}] player[${this.uid} ${this.seatId}] ${msg} info:`, info);
    }
}


module.exports = Player;