/**
 * Created by sam on 2020/6/3.
 *
 */

const Player = require('./Player');
const Status = require('./const').status;
const Event = require('./event');
const Conf = require('./config');
const Algorithm = require('./algorithm');
const CardType = require('./const').cardsType;
const SettleType = require('./const').settleType;

class Main extends require('../../BaseMain') {
    constructor(uids, rule, room) {
        super(room);
        this.uids = uids;               //玩家uid列表
        this.rule = rule;
        this._algorithm = new Algorithm();
        this._algorithm.setRule(rule, uids.length);

        this.ante = rule.ante;          //底分
        this.playModel = rule.playModel || 0;               //0=经典模式，1=双进单出
        this.mulRule = rule.mulRule ? [1,2,3] : [1,2,4];    //翻倍规则

        this.gameRules = rule.gameRules || [];
        if (uids.length == 3) {
            this.surrenderLev = [1,2];  //认输档
        } else {
            this.surrenderLev = rule.surrenderLev ? [1,2,4]:[1,2];    //认输档
        }

        this.daiPai = this.gameRules[1] || false;        //是否带拍
        this.baofu = this.gameRules[2] || false;         //报副留守
        this.canCheck = this.gameRules[3] || false;      //允许查牌
        this.surrenderAsk = this.gameRules[4] || false;  //投降询问所有人
        this.startCall65 = this.gameRules[6] || false;   //65分起叫

        this.xiaoguang = 30;    //小光
        this.daguang = 0;       //大光
        this.xiaodao = 40;      //小到
        this.dadao = 70;        //大到

        this.jiaofens = [80,75,70,65,60,55,50,45,40,35,30,25,20,15,10,5];
        this.initPlayer(room);
    }

    /***
     * 初始化玩家类
     * @param room
     */
    initPlayer(room) {
        this.uids.forEach((uid, i) => {
            let player =  new Player(this);
            player.uid = uid;
            player.seatId = i;
            player.isTrusteeship = room.player(uid).isTrusteeship;
            this.players.push(player);
        });
    }

    /**
     * 重置数据
     */
    resetData() {
        this.alreayQie = false;         //是否已经切牌
        this.bankerUid = undefined;     //庄家
        this.status = -1;               //当前状态
        this.turn = -1;                 //当前活跃玩家
        this.turnUid = -1;
        this.foldsList = [];            //打出的牌，用于回放
        this.lastDiscards = [];         //上一轮打出的牌
        this.curDiscards = [];          //本轮打出的牌
        this.setFirstDisCard();
        this.setMaxDiscard();
        this.setZhuType();

        this.scoreCards = [];
        this.allScoreCards = [];
        this.tableScore = 0;            //桌面分
        this.xianScore = 0;
        this.jiaofenIdx = this.startCall65 ? 2 : -1;
        this.callUid = undefined;
        this.isPai = false;
        this.first_turn = -1;           //每一轮第一个出牌的座位号
        this.max_turn = -1;
        this.settleType = -1;
        this.jiaoCount = 0;
        this.diLen = 0;
        this.isPo = false;
        this.isXiaoPo = false;
        this.isDaPo = false;
        this.surrendered = undefined;
        this.zhuType = undefined;
    }

    /***
     * 游戏开始
     */
    begin() {
        this.log('game begin.............');
        this.resetData();
        this.sendAll(Event.gameBegin, {uids: this.uids});
        this.players.forEach((player) => {
            player.resetData();
            /** 推送托管状态 */
            this.sendAll(Event.tuoGuang, [player.uid, player.isTrusteeship]);
        });

        this.changeStatus(Status.CUT_CARD);
    }

    /**
     * 切牌 玩家主动动作或者自动操作
     * @param uid
     * @param index
     */
    cutCard(uid, index) {
        if (this.status !== Status.CUT_CARD) {
            this.log(`status: ${this.status} can't cut card!`);
            return;
        }

        if (this.qieUid !== uid) {
            this.log(`qieUid: ${this.qieUid} uid : ${uid} can't cut card!`);
            return;
        }

        if (this.alreayQie) {
            return;
        }

        if (!!this._autoTimeout) {
            this.clearTimeout(this._autoTimeout);
            this._autoTimeout = undefined;
        }

        this.alreayQie = true;
        this.sendAll(Event.cutCard, {index: index});

        this.setTimeout(()=> {
            this.deal();
        });
    }
    /***
     * 发送牌到客户端
     */
    deal() {
        this.log('deal.............');
        this.changeStatus(Status.SENDHOLDS);
        let cards = this._algorithm.deal(2, [3,4]);
        this.diLen = 8;
        if (this.uids.length == 3) {
            this.diLen = [9,8,7][cards.length%this.uids.length];
        }

        let dealCount = Math.floor((cards.length-this.diLen)/this.uids.length);
        for (let i = 0; i < this.players.length; ++i) {
            let player = this.players[i];
            player.holds = [];
            let holds = cards.splice(0, dealCount);
            player.beginHolds = [].concat(holds);
            player.holds = holds;
            player.send(Event.holds, {holds: holds, diLen: this.diLen});
            this.log(`deal seatId = ${player.seatId}, uid = ${player.uid}, beginHolds = ${player.beginHolds}`);
        }

        /** 保存底牌 */
        this.bottomCards = cards;
        this.log(`deal bottomCards = ${this.bottomCards}`);
        this.setTimeout(()=> {
            this.changeStatus(Status.JIAOFEN);
        }, 2000);
    }

    /**
     * 玩家叫分
     * @param p
     * @param data
     */
    playerJiaofen(p, data) {
        if (this.status != Status.JIAOFEN) {
            this.log(`玩家叫分 状态错误 status = ${this.status} p.uid = ${p.uid}`);
            return;
        }

        if (this.turnUid != p.uid) {
            this.log(`玩家叫分 轮转错误 turnUid = ${this.turnUid} p.uid = ${p.uid}`);
            return;
        }

        if (!p.canCall) {
            this.log(`玩家叫分 玩家已经被拍了 turnUid = ${this.turnUid} p.uid = ${p.uid}`);
            return false;
        }

        let idx = data.idx;
        if (isNaN(idx)) {
            this.log(`玩家叫分 数据错误 p.uid = ${p.uid}`);
            return;
        }

        if (idx < 0) {
            this.jiaoCount+=1;
            p.canCall = false;
            if (!!this.callUid) {} else { this.callUid = p.uid; }
            this.sendAll(Event.jiaofen, {jiaofenIdx: -1, uid: p.uid});
            this.setTimeout(() => {
                this.nextTurn();
            }, 500);
            return;
        }

        if (idx < this.jiaofenIdx || idx >= this.jiaofens.length) {
            this.log(`玩家叫分 数据错误 p.uid = ${p.uid}`);
            return;
        }

        let pai = data.pai;
        /** 如果过了第一轮 所有人都没拍 则不能再拍 */
        if (!!pai) {
            if (!this.isPai && this.jiaoCount >= this.uids.length) {
                this.log(`玩家叫分 加拍错误 jiaoCount = ${this.jiaoCount} p.uid = ${p.uid}`);
                return;
            }

            if (idx < this.jiaofens.indexOf(50)) {
                this.log(`玩家叫分 加拍错误 最少50分 p.uid = ${p.uid}`);
                return;
            }
        }

        this.jiaoCount+=1;
        this.callUid = p.uid;
        this.players.forEach(el=> {
            if (el.uid != this.callUid) {
                el.jiaofenIdx = undefined;
            }
        });

        p.called = true;
        p.jiaofenIdx = idx;
        this.jiaofenIdx = idx;
        if (!!pai) {
            this.isPai = true;
            p.isPai = true;
            /** 所有叫分但是没有拍的玩家 都不能再叫分 */
            this.players.forEach((el) => {
                if (el.called && !el.isPai) {
                    el.canCall = false;
                }
            });
        }

        this.sendAll(Event.jiaofen, {jiaofenIdx: this.jiaofenIdx, uid: p.uid, isPai: this.isPai});
        if (idx == this.jiaofens.length-1) {
            this.broadcastBanker(p);
        } else {
            this.nextTurn();
        }
    }

    /**
     * 庄家定主花色
     * @param p
     * @param data
     */
    playerDingzhu(p, data) {
        if (this.status != Status.DINGZHU) {
            this.log(`定主状态错误 this.status = ${this.status}}`);
            return;
        }

        if (this.bankerUid != p.uid) {
            this.log(`定主错误 bankerUid = ${this.bankerUid} p.uid = ${p.uid} data = ${data}`);
            return;
        }

        if (this.zhuType != undefined) {
            this.log(`已经定主 bankerUid = ${this.bankerUid} p.uid = ${p.uid} 主 = ${this.zhuType} data = ${data}`);
            return;
        }

        if (![-1,0,1,2,3].includes(data)) {
            this.log(`定主错误 bankerUid = ${this.bankerUid} p.uid = ${p.uid} data = ${data}`);
            return;
        }

        this.log(`定主 bankerUid = ${this.bankerUid} p.uid = ${p.uid} data = ${data}`);
        /** 定主 */
        this.setZhuType(data);
        this.sendAll(Event.dingzhu, {zhuType: this.zhuType});
        this.changeStatus(Status.MAIDI);
    }

    /**
     * 庄家埋底
     * @param p
     * @param data
     */
    playerMaidi(p, data) {
        if (this.status != Status.MAIDI) {
            this.log(`埋底状态错误 this.status = ${this.status}}`);
            return;
        }

        if (this.bankerUid != p.uid) {
            this.log(`埋底错误 bankerUid = ${this.bankerUid} p.uid = ${p.uid}`);
            return;
        }

        if (data.length != this.bottomCards.length) {
            this.log(`埋底错误 data = ${data}}`);
            return;
        }

        this.oriBottomCards = [].concat(this.bottomCards);
        this.bottomCards = data;
        p.removeHolds(data);
        p.send(Event.maidi, this.bottomCards);
        p.sendAll(Event.maidi, this.bottomCards.length, true);
        p.beginHolds = [].concat(p.holds);
        this.setTimeout(()=> {
            this.changeStatus(Status.DISCARD);
        });
    }

    /**
     * 玩家留守
     * @param p
     * @param type
     */
    playerLiushou(p, type) {
        this.log(`玩家留守 p.uid = ${p.uid} type = ${type}`);
        if (this.status != Status.LIUSHOU) {
            this.log(`玩家留守 状态错误 this.status = ${this.status}}`);
            return;
        }

        if (p.alreadyLiushou) {
            this.log(`玩家留守 已经留守过了 p.liushou = ${p.liushou} p.alreadyLiushou = ${p.alreadyLiushou}`);
            return;
        }

        if (![-1,0,1,2,3].includes(type)) {
            this.log(`玩家留守 花色错误`);
            return;
        }

        if (type == this.zhuType) {
            this.log(`玩家不能留守主 type = ${type} zhuType = ${this.zhuType}`);
            return;
        }

        p.liushou = type;
        let msg = {uid: p.uid, type: type};
        this.sendAll(Event.liushou, msg);
        this.foldsList.push({event: Event.liushou, msg: msg});
        p.alreadyLiushou = true;
        this.changeStatus(Status.DISCARD, true);
    }

    /**
     * 玩家投降
     * @param p
     */
    playerSurrender(p) {
        this.log(`玩家投降 p.uid = ${p.uid}}`);
        if (this.status != Status.MAIDI && this.status != Status.DINGZHU) {
            this.log(`玩家投降 状态错误 this.status = ${this.status}`);
            return;
        }

        if (this.bankerUid != p.uid) {
            this.log(`玩家不能投降 bankerUid = ${this.bankerUid}`);
            return;
        }

        if (this.surrendered) {
            this.log(`玩家已经投降过了 但是有玩家不同意 不能再次投降 bankerUid = ${this.bankerUid}`);
            return;
        }

        /** 投降 */
        this.surrendered = true;
        if (this.surrenderAsk) {
            this.lastStatus = this.status;
            this.changeStatus(Status.SURRENDER);
            this.players.forEach((el) => {
                if (el.uid != this.bankerUid) {
                    el.canReply = true;
                }
            });
        } else {
            this.halfGameOverResult(true);
        }
    }

    /**
     * 玩家回复投降
     * @param p
     * @param data
     */
    playerReplySurrender(p, data) {
        this.log(`回复玩家投降 p.uid = ${p.uid} data = ${data}`);
        if (this.status != Status.SURRENDER) {
            this.log(`玩家回复投降 状态错误 this.status = ${this.status}`);
            return;
        }

        if (p.uid == this.bankerUid) {
            this.log(`玩家回复投降 庄自己不能回复}`);
            return;
        }

        if (![0,1].includes(data)) {
            this.log(`玩家回复投降 数据错误`);
            return;
        }

        p.reply = data;
        p.canReply = undefined;
        let msg = {uid: p.uid, reply: data};
        this.sendAll(Event.replySurrender, msg);

        if (p.reply == 0) {
            this.players.forEach(el=> {
                el.reply = undefined;
            });
            this.changeStatus(this.lastStatus);
        } else {
            let all = true;
            this.players.forEach(el=> {
                if (el.uid != this.bankerUid && el.reply != 1) {
                    all = false;
                }
            });

            if (all) {
                this.players.forEach(el=> {
                    el.reply = undefined;
                });
                this.halfGameOverResult(true);
            }
        }
    }

    /***
     * 牌面分
     * @constructorran
     */
    calcCardScore (cards) {
        let score = 0;
        cards.forEach((el) => {
            let s = this._algorithm.getCardScore(el);
            if (s > 0) {
                score += s;
                this.scoreCards.push(el);
            }
        });

        return score;
    }

    /**
     * 定庄
     * @param turnPlayer
     */
    broadcastBanker(turnPlayer) {
        this.bankerUid = this.turnUid;
        turnPlayer.jiaofenIdx = undefined;
        this.getLasting().lastBanker = this.bankerUid;
        this.sendAll(Event.broadcastBanker, this.bankerUid);
        turnPlayer.holds = turnPlayer.holds.concat(this.bottomCards);
        turnPlayer.send(Event.addBottmCards, this.bottomCards);
        turnPlayer.sendAll(Event.addBottmCards, this.bottomCards.length, true);
        this.setTimeout(()=> {
            this.changeStatus(Status.DINGZHU);
        });
    }

    /***
     * 下一个玩家
     */
    nextTurn(seat) {
        /** 先清除自动计时器 */
        if (!!this._autoTimeout) {
            this.clearTimeout(this._autoTimeout);
            this._autoTimeout = undefined;
        }

        if (!!this._discardTimeout) {
            this.clearTimeout(this._discardTimeout);
            this._discardTimeout = undefined;
        }

        /** 轮转 */
        if (seat == undefined || seat == null || seat < 0) {
            if (this.turn < 0) {
                this.turn = Math.randomRange(0, this.uids.length);
            } else {
                this.turn = (this.turn + 1) % this.uids.length;
            }
        } else {
            this.turn = seat;
        }

        if (this.status == Status.JIAOFEN) {
            let turnPlayer = this.players[this.turn];
            this.turnUid = turnPlayer.uid;
            if (this.turnUid == this.callUid) {
                if (this.jiaofenIdx < 0) {
                    this.changeStatus(Status.LIUJU);
                } else {
                    this.broadcastBanker(turnPlayer);
                }
                return;
            } else {
                if (!turnPlayer.canCall) {
                    this.nextTurn();
                    return;
                }
            }

            let daiPai = (this.daiPai && this.jiaoCount < this.uids.length);
            let msg = {turn: this.turnUid, jiaofenIdx: this.jiaofenIdx, daiPai: daiPai, isPai: this.isPai};
            this.log(`nextTurn msg = ${JSON.stringify(msg)}`);
            this.sendAll(Event.turn, msg);

            this.startTimeout(turnPlayer);
            return;
        }

        if (this.status == Status.SURRENDER) {
            let turnPlayer = this.players[this.turn];
            if (turnPlayer.uid == this.bankerUid) {
                this.nextTurn();
            } else {
                if (turnPlayer.uid == this.turnUid) {

                }
            }
            this.turnUid = turnPlayer.uid;

            return;
        }

        if (this.status == Status.LIUSHOU) {
            let turnPlayer = this.players[this.turn];
            this.turnUid = turnPlayer.uid;
            let msg = {turn: this.turnUid};
            this.sendAll(Event.turn, msg);

            this.startTimeout(turnPlayer);
            return;
        }

        let isGameOver = true;
        /** 如果所有人牌都出完了 则游戏结束 */
        this.players.forEach((el) => {
            if (el.holds.length > 0) {
                isGameOver = false;
            }
        });

        if (isGameOver) {
            this.gameOver();
            return;
        }

        /** 如果这一轮打完了 如果是闲家大则收走桌面分数 */
        if (this.turn == this.first_turn) {
            this.turn = -1;
            this.lastDiscards = [].concat(this.curDiscards);
            if (this.canCheck) {
                this.sendAll(Event.lastDiscards, this.lastDiscards);
            }
            this.setTimeout(()=> {
                if (!this.getTableScore()) {
                    /** 最大牌玩家接着出牌 */
                    this.turn = this.max_turn;
                    this.first_turn = this.turn;
                    this.setFirstDisCard();
                    this.setMaxDiscard();
                    this.curDiscards = [];
                    let turnPlayer = this.players[this.turn];
                    this.turnUid = turnPlayer.uid;
                    let msg = {
                        turn: turnPlayer.uid,
                        isFirstDiscard: true,
                    };
                    this.sendAll(Event.turn, msg);
                    if (turnPlayer.holds.length == 1) {
                        this._discardTimeout = this.setTimeout(()=> {
                            this.discard(turnPlayer, [].concat(turnPlayer.holds));
                        });
                    } else {
                        this.startTimeout(turnPlayer);
                    }
                }
            }, 1500);
        } else {
            let isFirstDiscard = false;
            if (this.first_turn == -1) {
                this.first_turn = this.turn;
                isFirstDiscard = true;
            }

            let turnPlayer = this.players[this.turn];
            this.turnUid = turnPlayer.uid;
            let msg = {
                turn: turnPlayer.uid,
                isFirstDiscard: isFirstDiscard
            };

            this.sendAll(Event.turn, msg);
            if (!!this.firstDisCard && turnPlayer.holds.length == this.firstDisCard.cards.length) {
                this._discardTimeout = this.setTimeout(()=> {
                    this.discard(turnPlayer, [].concat(turnPlayer.holds));
                });
            } else {
                this.startTimeout(turnPlayer);
            }
        }
    }

    setFirstDisCard(data) {
        this.firstDisCard = data;
        this._algorithm.firstCards = data;
    }

    setMaxDiscard(data) {
        this.maxDisCard = data;
        this._algorithm.maxCards = data;
    }

    setZhuType(data) {
        this.zhuType = data;
        this._algorithm.zhuType = data;
    }

    /**
     * 闲家捡分
     * @returns {boolean}
     */
    getTableScore() {
        let isOver = false;
        let maxPlayer = this.players[this.max_turn];
        if (maxPlayer.uid != this.bankerUid && this.tableScore > 0) {
            this.xianScore += this.tableScore;
            let msg = {score: this.tableScore, scoreCards: this.scoreCards};
            this.checkPo(msg);
            this.sendAll(Event.xianScore, msg);
            this.foldsList.push({event: Event.xianScore, msg: JSON.stringify(msg)});
            this.allScoreCards = this.allScoreCards.concat(this.scoreCards);
            if (this.isDaPo) {
                isOver = true;
                this.halfGameOverResult();
            }
        } else {
            this.sendAll(Event.xianScore);
            this.foldsList.push({event: Event.xianScore, msg: []});
        }

        this.tableScore = 0;
        this.scoreCards = [];

        return isOver;
    }

    /**
     * 检查得分垮庄
     * @param msg
     */
    checkPo(msg) {
        let jiaofen = this.jiaofens[this.jiaofenIdx];
        if (this.xianScore >= jiaofen && !this.isPo) {
            this.isPo = true;
            msg.isPo = this.isPo;
        }

        if (this.xianScore >= jiaofen+this.xiaodao && !this.isXiaoPo) {
            this.isXiaoPo = true;
            msg.isXiaoPo = this.isXiaoPo;
        }

        if (this.xianScore >= jiaofen+this.dadao && !this.isDaPo) {
            this.isDaPo = true;
            msg.isDaPo = this.isDaPo;
        }
    }

    /**
     * 游戏结束
     */
    gameOver() {
        if (this._gameEnd) {
            return;
        }

        this._gameEnd = true;
        this.changeStatus(Status.SETTLE);
        if (!this.getTableScore()) {
            this.setTimeout(()=> {
                this.koudi();
            }, 2000);
        }
    }

    /**
     * 扣底
     */
    koudi() {
        /** 如果闲家最后最大 则闲家分数加上埋底分 */
        let isKoudi = false;
        let diScore = 0;
        let max_turnUid = this.uids[this.max_turn];
        let msg = {bottomCards: this.bottomCards};
        if (!!this.maxDisCard && max_turnUid != this.bankerUid) {
            if (this.maxDisCard.isZhu) {
                let typeMul = 1;
                if (this.maxDisCard.type == CardType.AABB || this.maxDisCard.type == CardType.AA) {
                    typeMul = this.maxDisCard.cards.length;
                }

                diScore = this.calcCardScore(this.bottomCards)*typeMul;
                if (diScore > 0) {
                    this.xianScore += diScore;
                    msg.score = diScore;
                    msg.scoreCards = this.scoreCards;
                    this.allScoreCards = this.allScoreCards.concat(this.scoreCards);
                    this.checkPo(msg);
                }

                isKoudi = true;
            }

            msg.isKoudi = isKoudi;
            this.sendAll(Event.liangdi, msg);
        }

        this.foldsList.push({event: Event.liangdi, msg: JSON.stringify(msg)});

        let dealy = 1000;
        if (isKoudi) {
            dealy += 1000;
        }

        if (diScore > 0) {
            dealy += 1000;
        }
        this.setTimeout(()=> {
            this.calculateResult();
        }, dealy);
    }

    /**
     * 计算结果
     */
    calculateResult() {
        let settleMul = 1;
        let settleType = SettleType.NONE;
        let jiaofen = this.jiaofens[this.jiaofenIdx];
        if (this.xianScore < jiaofen) {
            if (this.xianScore == this.daguang) {
                settleMul = this.mulRule[2];
                settleType = SettleType.DAGUANG;
            } else if (this.xianScore < this.xiaoguang) {
                settleMul = 2;
                settleType = SettleType.XIAOGUANG;
            } else {
                settleType = SettleType.GUO;
            }

            let settleScore = settleMul*this.ante*(this.isPai ? 2 : 1)*(this.playModel ? 2 : 1);
            this.players.forEach((el) => {
                if (el.uid == this.bankerUid) {
                    el.score += settleScore*(this.uids.length-1);
                } else {
                    el.score -= settleScore;
                }
            });
        } else {
            if (this.xianScore >= jiaofen+this.dadao) {
                settleMul = this.mulRule[2];
                settleType = SettleType.DADAO;
            } else if (this.xianScore >= jiaofen+this.xiaodao) {
                settleMul = 2;
                settleType = SettleType.XIAODAO;
            } else {
                settleType = SettleType.KUA;
            }

            let settleScore = settleMul*this.ante*(this.isPai ? 2 : 1);
            this.players.forEach((el) => {
                if (el.uid == this.bankerUid) {
                    el.score -= settleScore*(this.uids.length-1);
                } else {
                    el.score += settleScore;
                }
            });
        }

        this.settleType = settleType;

        this.upScore();
    }

    /**
     * 中途游戏结束结算
     */
    halfGameOverResult(surrender) {
        if (this._gameEnd) {
            return;
        }

        this._gameEnd = true;
        this.changeStatus(Status.SETTLE);
        let settleType = SettleType.KUA;
        let settleMul = this.surrenderLev[0];
        if (!!surrender) {
            this.isSurrendered = true;
            this.sendAll(Event.surrender, this.bankerUid);
            this.foldsList.push({event: Event.surrender, msg: this.bankerUid});
            let jiaofen = this.jiaofens[this.jiaofenIdx];
            if (this.surrenderLev.length > 2) {
                if (jiaofen < 55) {
                    settleMul = this.surrenderLev[1];
                    settleType = SettleType.XIAODAO;
                }
            } else {
                if (jiaofen < 35) {
                    settleMul = this.surrenderLev[2];
                    settleType = SettleType.DADAO;
                } else if (jiaofen < 55) {
                    settleMul = this.surrenderLev[1];
                    settleType = SettleType.XIAODAO;
                }
            }
        } else {
            settleType = SettleType.DADAO;
            settleMul = this.mulRule[2];
        }

        this.settleType = settleType;
        let settleScore = settleMul*this.ante*(this.isPai?2:1);
        this.players.forEach((el) => {
            if (el.uid == this.bankerUid) {
                el.score -= settleScore*(this.uids.length-1);
            } else {
                el.score += settleScore;
            }
        });

        this.setTimeout(()=> {
            this.upScore();
        }, (!!surrender ? 2000 : 100));
    }

    async upScore() {
        /** 上传分数 */
        let actualScores = await this.pushScore();
        this.sendAll(Event.gameResult, {
            allScore: actualScores,
            xianScore: this.xianScore,
            zhuType: this.zhuType,
            banker: this.bankerUid,
            settleType: this.settleType,
        });

        this.setTimeout(() => {
            this.end();
        });
    }

    /**
     * 玩家主动托管
     * @param player
     */
    checkPlayerIsTrusteeship(player) {
        if (player.seatId != this.turn) {
            return;
        }

        if (player.isTrusteeship) {
            this.startTimeout(player, true);
        } else {
            /** 开启自动计时器 */
            this.startTimeout(player);
        }
    }

    startTimeout(turnPlayer, quick) {
        // return;
        /** 先清除自动计时器 */
        if (!!this._autoTimeout) {
            this.clearTimeout(this._autoTimeout);
            this._autoTimeout = undefined;
        }

        switch (this.status) {
            case Status.CUT_CARD:
                this._autoTimeout = this.setTimeout(() => {
                    turnPlayer.cutCard(Math.randomRange(24, 48));
                }, Conf.qiepaiTime);
                break;
            case Status.JIAOFEN:
                this._autoTimeout = this.setTimeout(() => {
                    turnPlayer.jiaofen({idx: -1});
                    this.playerAutoTrusteeship(turnPlayer);
                }, Conf.jiaofenTime);
                break;
            case Status.DINGZHU:
                if (!!turnPlayer) {} else {
                    turnPlayer = this.player(this.bankerUid);
                }
                this._autoTimeout = this.setTimeout(() => {
                    turnPlayer.dingzhu(-1);
                    this.playerAutoTrusteeship(turnPlayer);
                }, Conf.dingzhuTime);
                break;
            case Status.MAIDI:
                if (!!turnPlayer) {} else {
                    turnPlayer = this.player(this.bankerUid);
                }
                this._autoTimeout = this.setTimeout(() => {
                    turnPlayer.maidi(this.bottomCards);
                    this.playerAutoTrusteeship(turnPlayer);
                }, Conf.maidiTime);
                break;
            case Status.SURRENDER:
                this._autoTimeout = this.setTimeout(() => {
                    this.players.forEach(el=> {
                        if (!!el.canReply) {
                            el.replySurrender(1);
                            this.playerAutoTrusteeship(el);
                        }
                    });
                    this.halfGameOverResult(true);
                }, Conf.surrenderTime);
                break;
            case Status.LIUSHOU:
                this._autoTimeout = this.setTimeout(() => {
                    turnPlayer.actLiushou(-1);
                    this.playerAutoTrusteeship(turnPlayer);
                }, Conf.liushouTime);
                break;
            case Status.DISCARD:
                let actionTime = Conf.actionTime;
                if (!!turnPlayer) {} else {
                    turnPlayer = this.player(this.bankerUid);
                }

                if (!!turnPlayer && turnPlayer.isTrusteeship) {
                    actionTime = !!quick ? 0 : 1000;
                }
                this._autoTimeout = this.setTimeout(() => {
                    let cards = this.autoDiscard(turnPlayer);
                    this.discard(turnPlayer, cards);
                    this.playerAutoTrusteeship(turnPlayer);
                }, actionTime);
                break;
            default:
                break;
        }
    }

    /**
     * 玩家自动托管
     */
    playerAutoTrusteeship(player) {
        if (!player.isTrusteeship) {
            player.isTrusteeship = true;
            this.room.player(player.uid).isTrusteeship = true;
            this.sendAll(Event.tuoGuang, [player.uid, player.isTrusteeship]);
        }
    }

    /***
     * 自动出牌
     * @param turnPlayer
     */
    autoDiscard(turnPlayer) {
        let cards = this._algorithm.getAutoDicard(turnPlayer.holds);
        return cards;
    }

    /**
     * 出牌
     * @param turnPlayer
     * @param cards
     * @returns {boolean}
     */
    discard(turnPlayer, cards) {
        this.log(`firstDisCard = ${JSON.stringify(this.firstDisCard)}`);
        this.log(`cards = ${cards} zhuType = ${this.zhuType}`);
        this.log(`zhuType = ${this.zhuType}`);
        this.log(`turnPlayer.holds = ${turnPlayer.holds}`);
        if (this.status != Status.DISCARD) {
            this.log(`出牌 状态错误 this.status = ${this.status}`);
            return false;
        }

        if (this.turn !== turnPlayer.seatId) {
            this.log(`出牌 轮转错误 player: ${turnPlayer.uid}, turn：${this.turnUid} 不能出牌！`);
            return false;
        }

        let cardsData = this._algorithm.checkCanOut(cards, turnPlayer.holds);
        this.log(`出牌 player: ${turnPlayer.uid} cardsData = ${JSON.stringify(cardsData)}`);
        if (!cardsData) {
            this.log("牌型不合法!");
            this.send(turnPlayer.uid, Event.toast, '牌型不合法!');
            return false;
        }

        cardsData.uid = turnPlayer.uid;
        if (!!this.firstDisCard) {
            if (this._algorithm.compareCardsDatas(this.maxDisCard, cardsData)) {
                this.max_turn = turnPlayer.seatId;
                this.maxDisCard.max = false;
                cardsData.max = true;
                if (this.maxDisCard.isSha) {
                    cardsData.daSha = true;
                }

                this.setMaxDiscard(cardsData);
            } else {
                cardsData.isSha = false;
            }

            this.curDiscards.push(cardsData);
        } else {
            if (cardsData.type == CardType.SHUAIZHU) {
                /** 检查是否能出 如果有一家有主 则不能出 */
                for (let i = 0; i < this.players.length; i++) {
                    let p = this.players[i];
                    if (p.uid == turnPlayer.uid) {
                        continue;
                    }

                    if (this._algorithm.isHasZhu(p.holds)) {
                        this.send(turnPlayer.uid, Event.toast, '不能甩牌，强制出最小!');
                        this._algorithm.sortCardValue(cardsData.cards);
                        let minCard = cardsData.cards[0];
                        if (this._algorithm.hasSingle(cardsData.cards)) {
                            let minCard = cardsData.cards[0];
                            cardsData.cards = [minCard];
                            cardsData.type = CardType.A;
                        } else {
                            cardsData.cards = [minCard, minCard];
                            cardsData.type = CardType.AA;
                        }
                        cardsData.minVal = this._algorithm.cardValue(minCard);
                        break;
                    }
                }
            }

            cardsData.max = true;
            cardsData.first = true;
            this.max_turn = turnPlayer.seatId;
            this.setFirstDisCard(cardsData);
            this.setMaxDiscard(cardsData);
            this.curDiscards = [cardsData];
        }

        turnPlayer.removeHolds(cardsData.cards);
        this.log(`discard ${JSON.stringify(cardsData)} holds: ${turnPlayer.holds}`);

        this.tableScore += this.calcCardScore(cardsData.cards);
        let msg = {
            cardsData: cardsData,
            tableScore: this.tableScore,
        };
        this.sendAll(Event.discard, msg);
        this.foldsList.push({event: Event.discard, msg: JSON.stringify(msg)});
        if (this.baofu && turnPlayer.uid != this.bankerUid) {
            if (turnPlayer.holds.length > Conf.minLiushou) {
                let allBaofu = true;
                this.players.forEach((el) => {
                    if (el.uid != this.bankerUid && !el.baofu) {
                        allBaofu = false;
                    }
                });

                if (allBaofu) {
                    if (!turnPlayer.alreadyLiushou) {
                        this.changeStatus(Status.LIUSHOU);
                        return true;
                    }
                }
            }

            if (!turnPlayer.baofu && turnPlayer.holds.length > 0 && !this._algorithm.isHasZhu(turnPlayer.holds)) {
                turnPlayer.baofu = true;
                this.sendAll(Event.baofu, turnPlayer.uid);
                this.foldsList.push({event: Event.baofu, msg: turnPlayer.uid});
            }
        }

        this.nextTurn();
    }

    /***
     * 桌子状态改变
     * @param code
     */
    changeStatus(code, need) {
        this.log(`table change status: ${code}`);
        if (!!this._autoTimeout) {
            this.clearTimeout(this._autoTimeout);
            this._autoTimeout = undefined;
        }

        if (!!this._discardTimeout) {
            this.clearTimeout(this._discardTimeout);
            this._discardTimeout = undefined;
        }

        this.status = code;
        this.sendAll(Event.gameStatus, {status: code});
        switch (code) {
            case Status.CUT_CARD: {
                let qieIdx = 0;
                let lastBanker = this.getLasting().lastBanker;
                if (!!lastBanker) {
                    let bankerIdx = this.uids.indexOf(lastBanker);
                    if (bankerIdx < 0) {
                        qieIdx = Math.randomRange(0, this.uids.length);
                    } else {
                        qieIdx = bankerIdx+1;
                        if (qieIdx >= this.uids.length) {
                            qieIdx = 0;
                        }
                    }
                } else {
                    qieIdx = Math.randomRange(0, this.uids.length);
                }
                this.qieUid = this.uids[qieIdx];
                this.alreayQie = false;
                this.sendAll(Event.ask_cutCard, this.qieUid);
                this.startTimeout(this.player(this.qieUid));
            }
                break;
            case Status.JIAOFEN:
                this.nextTurn();
                break;
            case Status.DINGZHU:
                this.startTimeout();
                break;
            case Status.MAIDI:
                this.startTimeout();
                break;
            case Status.SURRENDER:
                this.startTimeout();
                break;
            case Status.LIUSHOU:
                this.nextTurn(this.turn);
                break;
            case Status.DISCARD: {
                if (need) {
                    this.nextTurn();
                } else {
                    let banker = this.uids.indexOf(this.bankerUid);
                    this.nextTurn(banker);
                }
            }
                break;
            case Status.LIUJU:
                this.setTimeout(()=> {
                    this.begin();
                }, 2000);
                break;
        }
    }

    /**
     * 获取游戏信息
     */
    getInfo(uid) {
        uid = parseInt(uid);
        let msg = {
            uids: this.uids,                        //当前游戏中的玩家
            players: {},
            zhuType: this.zhuType,
            turn: this.turnUid,
            status: this.status,
            banker: this.bankerUid,
            qieUid: this.qieUid,
            tableScore: this.tableScore,
            curDiscards: this.curDiscards,
            allScoreCards: this.allScoreCards,
            xianScore: this.xianScore,
            jiaofenIdx: this.jiaofenIdx,
            isPai: this.isPai,
            daiPai: this.daiPai,
            diLen: this.diLen,
            isPo: this.isPo,
            isXiaoPo: this.isXiaoPo,
            isDaPo: this.isDaPo,
            surrendered: this.surrendered,
        };

        if (this.canCheck) {
            msg.lastDiscards = this.lastDiscards;
        }

        this.players.forEach(function (el) {
            msg.players[el.uid] = el.getInfos(uid);
        }, this);
        // this.log(msg);
        this.send(uid, Event.gameInfo, msg);
    }

    /**
     * 回放数据
     */
    getPlayback() {
        let history = {
            uids: this.uids,
            foldsList: this.foldsList,
            banker: this.bankerUid,
            zhuType: this.zhuType,
            jiaofen: this.jiaofens[this.jiaofenIdx],
            isPai: this.isPai,
            bottomCards: this.bottomCards,
            isSurrendered: this.isSurrendered
        };

        this.players.forEach((player, index) => {
            history[player.uid] = {
                holds: player.beginHolds,
            };
        });

        //this.log(history);
        return history;
    }

    log(info) {
        console.log(`table[${this.room.rid}] info：`, info);
    }
}

module.exports = Main;