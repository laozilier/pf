/**
 * Created by sam on 2020/5/18.
 *
 */
const BasePlayer = require('../../BasePlayer');
const algorithm = require('./ddzAlgorithm');
const cardsType = require('./ddzConst').cardsType;
const status = require('./ddzConst').status;
const event = require('./ddzEvent');
const conf = require('./config');
const Poker = require('../Poker');


class Player extends BasePlayer {
    constructor(main) {
        super(main);
        this.uid = 0;
        this.seatId = 0;
        this.score = 0;             //玩家分数
        this.robScore = null;       //抢地主倍数
        this.doubleTimes = null;    //是否加倍
        this.folds = [];            //已经打出的牌
        this.timer = {};            //定时器

        this.initEvent();
    }

    /***
     * 客户端事件绑定
     */
    initEvent() {
        this.on(event.robBanker, this.robBanker);
        this.on(event.callScore, this.callScore);
        this.on(event.doubleScore, this.doubleScore);
        this.on(event.brightCard, this.brightCard);
        this.on(event.discard, this.discard);
        this.on(event.pass, this.pass);
        this.on(event.error, this.error);
    }

    /***
     * 玩家叫地主
     * @param score 0: 不叫  1：叫地主
     * @param auto 是否自动操作
     */
    robBanker(score, auto=false) {
        if (this.status !== status.ROB_BANKER) {
            this.log(`player status ${this.status} can not robBanker`);
            return;
        }
        if (this.main.turn !== this.seatId ) {
            this.log('not this player turn！');
            return;
        }
        this.clearTimeout(this.timer.timeout);
        this.clearTimeout(this.timer.tuoguan);

        if (auto && !this.isTrusteeship) {
            this.hosting()
        }

        this.robScore = score;

        if(score) {
            this.main.banker = this.seatId;
            this.main.maxRob = this.main.maxRob? this.main.maxRob*2: 1;
            this.robScore = this.main.maxRob;
        }
        this.log(`rob banker: ${score} maxRob: ${this.main.maxRob} auto: ${auto}`);
        this.sendAll(event.robBanker, {uid: this.uid,
                                            robBanker: score,
                                            maxRob: this.main.maxRob});

        let robCount = 0;
        for(let i = 0; i < this.main.players.length; ++i) {
            if(this.main.players[i].robScore === null) {
                this.main.nextTurn();
                this.changeStatus(status.WAIT);
                return;
            }else if (this.main.players[i].robScore !== 0){
                robCount++;
            }
        }

        if(robCount === 0) {         //如果所有人都没叫地主，则重新发牌
            this.main.reBegin();
        } else if(robCount === 1) {   //有人抢地主，第一个叫地主的可以再抢一次
            this.main.changeStatus(status.DOUBLE_SCORE);
        } else {
            for(let i = 0; i < this.main.players.length; ++i) {
                if(this.main.players[i].robScore === 1) {
                    this.main.nextTurn(this.main.players[i].seatId);
                    return;
                }
            }
            this.main.changeStatus(status.DOUBLE_SCORE);
        }
    }

    /***
     * 玩家叫分
     * @param score
     * @param auto 是否自动操作
     */
    callScore(score, auto=false) {
        if (this.status !== status.CALL_SCORE) {
            this.log(`player status ${this.status} can not callScore`);
            return;
        }
        if (this.main.turn !== this.seatId ) {
            this.log('not this player turn!');
            return;
        }
        if (this.main.maxRob > 0 && score > 0 && score <= this.main.maxRob) {
            this.error(`叫分不能小于上家！`);
            return;
        }

        this.clearTimeout(this.timer.timeout);
        this.clearTimeout(this.timer.tuoguan);

        if (auto && !this.isTrusteeship) {
            this.hosting()
        }

        if (!this.main.maxRob || score > this.main.maxRob) {
            this.main.maxRob = score;
        }
        this.robScore = score;
        this.sendAll(event.callScore, {uid: this.uid, robScore: score});
        this.log(`rob score ${score} auto: ${auto}`);

        //叫三分直接结束叫分
        if(score === 3) {
            this.main.banker = this.seatId;
            this.main.changeStatus(status.DOUBLE_SCORE);
            return;
        }

        let robCount = 0;
        for(let i = 0; i < this.main.players.length; ++i) {
            if(this.main.players[i].robScore === null) {
                this.changeStatus(status.WAIT);
                this.main.nextTurn();
                return;
            } else if (this.main.players[i].robScore !== 0) {
                robCount++;
            }
        }

        if(robCount === 0) {         //如果所有人都没叫地主，则重新发牌
            return this.main.reBegin();
        } else if(robCount === 1) {
            this.main.confirmBanker();
            this.main.changeStatus(status.DOUBLE_SCORE);
        } else {                    // 没到3分还可以继续叫
            if (this.main.maxRob < 3) {
                for(let i = 0; i < this.main.players.length; ++i) {
                    if(this.main.players[i].robScore === 1) {
                        this.main.nextTurn(this.main.players[i].seatId);
                        return;
                    }
                }
            }
            this.main.confirmBanker();
            this.main.changeStatus(status.DOUBLE_SCORE);
        }

        // //没人叫则重新发牌
        // if(robCount === 0) {         //如果所有人都没叫地主，则重新发牌
        //     this.main.reBegin();
        //     return;
        // }


        // this.main.changeStatus(status.DOUBLE_SCORE);
    }

    /***
     * 加倍
     */
    doubleScore(score, auto=false) {
        if (this.status !== status.DOUBLE_SCORE || this.doubleTimes !== null) {
            this.log("玩家状态不是加倍状态或者已经操作过！");
            return;
        }
        this.clearTimeout(this.timer.timeout);
        this.clearTimeout(this.timer.tuoguan);

        if (auto && !this.isTrusteeship) {
            this.hosting()
        }

        this.doubleTimes = score;
        this.changeStatus(status.WAIT);
        this.sendAll(event.doubleScore, {uid: this.uid, doubleScore: score});

        this.log(`double score ${score} auto: ${auto}`);

        for(let i = 0; i < this.main.players.length; ++i) {
            if(this.main.players[i].doubleTimes === null) {
                return;
            }
        }

        this.main.changeStatus(status.DISCARD);
    }

    /***
     * 明牌
     */
    brightCard() {
        if (this.seatId !== this.main.banker) {
            this.error('只有地主才能明牌');
            return;
        }
        this.main.brightCard = 2;
        this.sendAll(event.brightCard, {uid: this.uid, holds: this.holds});
    }

    /***
     * 玩家出牌
     * @param cards
     */
    discard(cards, auto=false) {
        if (this.main.turn !== this.seatId){
            this.log(`turn ${this.main.turn} ,player ${this.seatId} 无操作(discard) 权限`);
            // this.error(`player: ${this.seatId}, 状态：${this.status} 不能出牌！`);
            return;
        }

        this.clearTimeout(this.timer.timeout);
        this.clearTimeout(this.timer.tuoguan);

        if (auto && !this.isTrusteeship) {
            this.hosting()
        }

        let cardsData = algorithm.checkCardsType(cards);
        // 本轮第一手出牌
        if (!this.main.lastDiscard) {
            if(!cardsData){
                this.error("牌型不合法!");
                return;
            }
        } else {
            if(!this.checkDiscard(cards)) {
                this.error("牌型压不起!");
                return;
            }
        }
        cardsData.cards = cards;
        this.main.lastDiscard = cardsData;
        this.main.lastDiscardPlayer = this.seatId;
        this.removeHolds(cards);
        cardsData.seat = this.seatId;
        this.main.foldsList.push({seat: this.seatId, cardsType: cardsData.type, cards: cards});
        this.log(`discard ${cards} auto: ${auto} cardDada type ${cardsData.type} minVal: ${cardsData.minVal} length: ${cardsData.length} holds: ${this.holds}`);

        if(cardsData.type === cardsType.AAAA || cardsData.type === cardsType.BOMB) {
            this.main.bombCount += 1;
        }

        this.sendAll(event.discard, {uid: this.uid, cards:cards, cardsData:cardsData});
        if (this.holds.length === 0) {
            this.main.winner = this.seatId;
            this.getLasting().winner = this.seatId;
            this.main.chunTian();
            if(this.main.chunTianTimes > 1) {
                this.sendAll(event.chunTian, {chunTianTimes: this.main.chunTianTimes});
                this.setTimeout(() => {
                    this.main.gameOver();
                }, 1000);
            } else{
                this.main.gameOver();
            }
        } else {
            this.main.nextTurn();
        }
    }

    /***
     * 不要
     */
    pass(auto=false) {
        if (this.main.turn !== this.seatId){
            this.log(`turn ${this.main.turn} ,player ${this.seatId} 无操作(pass) 权限`);
            return;
        }
        if(!this.main.lastDiscard || this.main.lastDiscardPlayer === this.seatId) {
            this.log("首轮不能不出牌！");
            return;
        }

        if (auto && !this.isTrusteeship) {
            this.hosting()
        }

        this.main.foldsList.push({seat: this.seatId, cards: []});
        this.clearTimeout(this.timer.timeout);
        this.clearTimeout(this.timer.tuoguan);
        this.log(`pass auto: ${auto}`);
        this.sendAll(event.pass, {uid: this.uid});
        this.main.nextTurn();
    }

    /***
     * 检查牌是否能打出
     * @param cards
     * @returns {boolean}
     */
    checkDiscard(cards) {
        let cardsMap = algorithm.checkCardsType(cards);

        switch (cardsMap.type) {
            case cardsType.BOMB:
                return true;
            case cardsType.AAAA:
                if(this.main.lastDiscard.type === cardsType.BOMB)
                    return false;
                if(this.main.lastDiscard.type === cardsType.AAAA)
                    return cardsMap.minVal > this.main.lastDiscard.minVal;
                return true;
            default:
                return cardsMap.type === this.main.lastDiscard.type && cardsMap.length === this.main.lastDiscard.length
                    && cardsMap.minVal > this.main.lastDiscard.minVal;
        }
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
        }, this);
        this.folds.push(cards);
    }

    /***
     * 玩家信息，用于重连
     * @returns {{}}
     */
    getInfos() {
        let data = {};
        data.uid = this.uid;
        data.holds = this.holds;
        // data.status = this.status;
        data.robScore = this.robScore;
        data.doubleScore = this.doubleTimes;
        data.cardsCount = this.cardsCount;
        data.brightCard = this.seatId === this.main.banker? this.main.brightCard: 1;
        return data;
    }

    /***
     * 其他玩家信息，用于重连
     * @returns {{holds: number, status: number}}
     */
    getOtherInfos() {
        return {
            uid: this.uid,
            robScore: this.robScore,
            doubleScore: this.doubleTimes,
            holds: this.seatId === this.main.banker && this.main.brightCard === 2? this.holds: this.holds.length,
            // status: this.status,
        };
    }

    /***
     * 玩家状态改变
     * @param code
     */
    changeStatus(code) {
        this.status = code;
        this.startTimeout();
        this.log(`change status ${code}`);
    }

    /***
     * 自动出牌
     */
    autoDiscard() {
        if (!this.main.lastDiscard) {
            let cards = algorithm.discard(this.holds);
            this.log(`Auto select cards: ${cards}`);
            this.discard(cards, true);
        }
        else {
            // 队友出的牌不要
            if (this.main.banker !== this.seatId && this.main.lastDiscardPlayer !== this.main.banker) {
                this.pass(true);
            } else {
                let cards = algorithm.findBigCard(this.holds, this.main.lastDiscard);
                if(cards) {
                    this.log(`auto find big cards ${cards}`);
                    this.discard(cards, true);
                } else {
                    this.pass(true);
                }
            }
        }
    }

    startTimeout(delay) {
        let action_delay = delay === undefined? 5000: delay;
        let discard_delay = delay === undefined? 1000: delay;
        switch (this.status) {
            case status.ROB_BANKER:
                if(this.isTrusteeship) {
                    this.timer.tuoguan = this.setTimeout(() => {
                        this.robBanker(0, true);
                    }, action_delay);
                } else {
                    this.timer.timeout = this.setTimeout(() => {
                       this.robBanker(0, true);
                    }, conf.actionTime);
                }
                break;
            case status.CALL_SCORE:
                if(this.isTrusteeship) {
                    this.timer.tuoguan = this.setTimeout(() => {
                        this.callScore(0, true);
                    }, action_delay);
                } else {
                    this.timer.timeout = this.setTimeout(() => {
                        this.callScore(0, true);
                        // this.hosting();
                        // this.setTuoGuang(true);
                    }, conf.actionTime);
                }

                break;
            case status.DOUBLE_SCORE:
                if(this.isTrusteeship) {
                    this.timer.tuoguan = this.setTimeout(() => {
                        this.doubleScore(1, true);
                    }, action_delay);
                } else {
                    this.timer.timeout = this.setTimeout(() => {
                       this.doubleScore(1, true);
                    }, conf.actionTime);
                }
                break;
            case status.DISCARD:
                if(this.isTrusteeship) {
                    this.timer.tuoguan = this.setTimeout(() => {
                        this.autoDiscard();
                    }, discard_delay);
                } else {
                    this.timer.timeout = this.setTimeout(() => {
                        this.autoDiscard();
                        // this.hosting();
                        // this.setTuoGuang(true);
                    }, conf.actionTime);
                }
                break;
            }
    }

    /***
     * 被动托管，不调用父类方法
     */
    hosting() {
        this.isTrusteeship = true;
        this.main.room.player(this.uid).isTrusteeship = true;
        this.sendAll(Event.tuoGuan, [this.uid, this.isTrusteeship]);
        if (this.uid === this.main.uids[this.main.turn]) {
            this.startTimeout();
            this.clearTimeout(this.timer.timeout);
        }
    }

    /***
     * 托管
     * @param isTrusteeship
     */
    setTrusteeship(isTrusteeship) {
        if (isTrusteeship === this.isTrusteeship) {
            return;
        }

        this.isTrusteeship = isTrusteeship;
        if(isTrusteeship) {
            console.log('托管');
            if (this.uid === this.main.uids[this.main.turn] || (this.status === status.DOUBLE_SCORE && this.doubleTimes === null)) {
                this.startTimeout(0);
                this.clearTimeout(this.timer.timeout);
            }
        }else{
            console.log('取消托管');
            this.clearTimeout(this.timer.tuoguan);
            if (this.uid === this.main.uids[this.main.turn] || (this.status === status.DOUBLE_SCORE && this.doubleTimes === null)) {
                this.startTimeout();
            }
        }
    }

    /***
     * 给客户端发送错误提示
     * @param data
     */
    error(data) {
        // console.log(`table ${this.main.rid} player: ${this.uid} ${this.seatId} error info:`, data);
        this.log(`error ${data}`);
        this.send(event.error, data);
    }

    log(info) {
        console.log(`table[${this.main.room.rid}] player[${this.uid} ${this.seatId}] info:`, info);
    }
}


module.exports = Player;