/**
 * Created by sam on 2020/5/18.
 *
 */
const BasePlayer = require('../../BasePlayer');
const Event = require('./event');
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
        this.on(Event.giveup, this.giveup);
    }

    resetData() {
        this.lastDiscard = undefined;    //上一个打出的牌
        this.beginHolds = [];
        this.cardIdx = 0;
        this.canJiaozhu = undefined;
        this.canFanzhu = undefined;
        this.zhu_10 = [];
        this.all_10 = [];
        this.wang = [];
        this.holds = [];
        this.tableScore = 0;
    }

    /**
     * 开始发牌 每0.3秒发一张
     */
    startSendHolds(cb) {
        this.setTimeout(() => {
            let card = this.beginHolds[this.cardIdx];
            this.holds.push(card);
            this.send(Event.holds, [card]);
            if (Algorithm.isCard10(card)) {
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
            } else if (Algorithm.isWang(card)) {
                this.wang.push(card);
                if (this.wang.length > 1) {
                    this.checkJiaozhu();
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
            let jiaozhus = Algorithm.getJiaozhus(this.zhu_10, this.wang);
            if (jiaozhus[0].length == 0 && jiaozhus[1].length == 0) {
                return;
            }

            this.canJiaozhu = true;
            this.send(Event.ask_jiaozhu, jiaozhus);
        } else {
            /** 如果已经有人叫了 则所有人取消叫主 */
            if (this.canJiaozhu) {
                this.canJiaozhu = false;
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
     * 检查反主
     */
    checkFanzhu() {
        if (!this.main.checkCanFanzhu()) {
            return false;
        }

        let a = Algorithm.getFanzhus(this.main.tempZhu, this.all_10, this.wang);
        this.log('反主数组:', a);
        if (a.length > 0) {
            this.canFanzhu = true;
            this.send(Event.ask_fanzhu, a);
            return true;
        } else {
            this.stopFanzhu();
        }

        return false;
    }

    /**
     * 停止反主
     */
    stopFanzhu() {
        if (this.canFanzhu) {
            this.canFanzhu = false;
        }
    }

    /**
     * 客户端发送反主事件
     * @param data
     */
    fanzhu(data) {
        /** 没有叫主 不能反主 */
        if (this.main.tempZhuUid < 0) {
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

        if (this.main.playerFanzhu(this, data)) {
            this.stopFanzhu();
        }
    }

    /**
     * 客户端发送放弃反主事件
     */
    giveup() {
        /** 没有叫主 不能反主 */
        if (this.main.tempZhuUid < 0) {
            return;
        }

        if (this.main.playerGiveup(this)) {
            this.stopFanzhu();
        }
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
            data.canJiaozhu = this.canJiaozhu;
            if (!!data.canJiaozhu) {
                data.jiaozhu = Algorithm.getJiaozhus(this.zhu_10, this.wang);
            }

            data.canFanzhu = this.canFanzhu;
            if (!!data.canFanzhu) {
                data.fanzhu = Algorithm.getFanzhus(this.main.tempZhu, this.all_10, this.wang);
            }
        } else {
            data.holds = this.holds.length;
        }

        data.tableScore = this.tableScore;
        return data;
    }

    log(msg, info) {
        console.log(`table[${this.main.room.rid}] player[${this.uid} ${this.seatId}] ${msg} info:`, info);
    }
}


module.exports = Player;