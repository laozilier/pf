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

class Main extends require('../../BaseMain') {
    constructor(uids, rule, room) {
        super(room);
        this._algorithm = new Algorithm();
        this._algorithm.setRule(rule);

        this.uids = uids;               //玩家uid列表
        this.rule = rule;
        this.ante = rule.ante;          //底分
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

    resetData() {
        this.alreayQie = false;         //是否已经切牌
        this.bankerUid = undefined;            //庄家
        this.status = -1;               //当前状态
        this.turn = -1;                 //当前活跃玩家
        this.turnUid = undefined;
        this.foldsList = [];            //打出的牌，用于回放
        this.lastDiscards = undefined;         //上一轮打出的牌
        this.curDiscards = undefined;          //本轮打出的牌
        this.setFirstDisCard();
        this.setMaxDiscard();
        this.setZhuType();
        this.scoreCards = [];
        this.allScoreCards = [];
        this.tableScore = 0;            //桌面分
        this.first_turn = -1;           //每一轮第一个出牌的座位号
        this.max_turn = -1;
        this.tempZhu = undefined;
        this.tempZhuUid = undefined;
        this.isFanzhu = false;
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

    /***
     * 发送牌到客户端
     */
    deal() {
        this.log('deal.............');
        this.changeStatus(Status.SENDHOLDS);
        let cards = this._algorithm.deal(2, [3,4]);

        let dealCount = Math.floor(cards.length/this.uids.length);
        for (let i = 0; i < this.players.length; ++i) {
            let player = this.players[i];
            player.holds = [];
            let holds = cards.splice(0, dealCount);
            player.beginHolds = holds;
            if (i == this.players.length-1) {
                let cb = (() => {
                    if (!!this.tempZhuUid) {
                        this.changeStatus(Status.WAITFANZHU);
                    } else {
                        this.changeStatus(Status.WAITJIAOZHU);
                    }
                });
                player.startSendHolds(cb);
            } else {
                player.startSendHolds();
            }

            this.log(`deal seatId = ${player.seatId}, uid = ${player.uid}, beginHolds = ${player.beginHolds}`);
        }
    }



    /**
     * 玩家叫主
     * @param p
     * @param tempZhu
     */
    playerJiaozhu(p, tempZhu) {
        this.tempZhu = tempZhu;
        this.tempZhuUid = p.uid;
        this.mul = 1;
        this.sendAll(Event.jiaozhu, {tempZhu: tempZhu, uid: this.tempZhuUid});
        this.players.forEach((el) => {
            el.checkJiaozhu();
        });

        if (this.status == Status.WAITJIAOZHU) {
            this.changeStatus(Status.WAITFANZHU);
        }
    }

    /**
     * 玩家反主
     * @param p
     * @param data
     */
    playerFanzhu(p, data) {
        if (this.status != Status.WAITFANZHU) {
            return false;
        }

        if (!p.canFanzhu) {
            return false;
        }

        this.sendAll(Event.fanzhu, {uid: p.uid, tempZhu: data, last: this.tempZhuUid});
        this.tempZhu = data;
        this.tempZhuUid = p.uid;
        this.isFanzhu = true;
        this.nextTurn();

        return true;
    }

    /**
     * 玩家放弃反主
     * @param p
     */
    playerGiveup(p) {
        if (this.status != Status.WAITFANZHU) {
            return false;
        }

        p.send(Event.giveup);
        this.nextTurn();
        return true;
    }

    broadcastBanker () {
        /** 设置庄家 */
        this.bankerUid = this.tempZhuUid;
        let v = this.tempZhu[0];
        this.setZhuType(v > 51 ? -1 : this._algorithm.cardType(v));
        this.tempZhuUid = undefined;
        this.tempZhu = undefined;
        this.setTimeout(()=> {
            this.getLasting().lastBanker = this.bankerUid;
            this.sendAll(Event.broadcastBanker, this.bankerUid);
            this.changeStatus(Status.DISCARD);
        });
    }

    /***
     * 牌面分
     * @constructorran
     */
    calcCardScore (cards) {
        let score = 0;
        cards.forEach((el) => {
            let cardScore = this._algorithm.getCardScore(el);
            if (cardScore > 0) {
                score += cardScore;
                this.scoreCards.push(el);
            }
        });

        return score;
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

        /** 轮流出牌 */
        if (seat == undefined || seat == null || seat < 0) {
            if (this.turn < 0) {
                this.turn = Math.randomRange(0, this.uids.length);
            } else {
                this.turn = (this.turn + 1) % this.uids.length;
            }
        } else {
            this.turn = seat;
        }

        if (this.status == Status.WAITFANZHU) {
            let turnPlayer = this.players[this.turn];
            if (turnPlayer.uid == this.tempZhuUid) {
                this.broadcastBanker();
            } else {
                if (turnPlayer.checkFanzhu()) {
                    this.turnUid = turnPlayer.uid;
                    let msg = {
                        turn: turnPlayer.uid,
                    };

                    this.sendAll(Event.turn, msg);
                    this.startTimeout(turnPlayer);
                } else {
                    this.nextTurn();
                }
            }
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
            this.sendAll(Event.lastDiscards, this.lastDiscards);
            this.setTimeout(()=> {
                this.getTableScore();
                /** 最大牌玩家接着出牌 */
                this.turn = this.max_turn;
                this.first_turn = this.turn;
                this.setFirstDisCard();
                this.setMaxDiscard();
                this.curDiscards = [];
                this.tableScore = 0;
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
                isFirstDiscard: isFirstDiscard,
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
     */
    getTableScore() {
        let maxPlayer = this.players[this.max_turn];
        maxPlayer.tableScore += this.tableScore;
        let msg = {};
        msg.score = this.tableScore;
        msg.uid = maxPlayer.uid;
        msg.total = maxPlayer.tableScore;
        msg.scoreCards = [].concat(this.scoreCards);
        this.sendAll(Event.getScore, msg);
        this.foldsList.push({event: Event.getScore, msg: JSON.stringify(msg)});
        this.allScoreCards = this.allScoreCards.concat(this.scoreCards);
        this.scoreCards = [];
        this.tableScore = 0;
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
        this.setTimeout(()=> {
            this.getTableScore();
            this.calculateResult();
        });
    }

    /**
     * 计算结果
     */
    async calculateResult() {
        this.players.forEach((el) => {
            el.score = (el.tableScore-Math.floor(300/this.uids.length))*this.ante;
        });

        /** 上传分数 */
        let actualScores = await this.pushScore();
        this.sendAll(Event.gameResult, {
            allScore: actualScores,
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
            case Status.WAITJIAOZHU:
                this._autoTimeout = this.setTimeout(() => {
                    this.changeStatus(Status.LIUJU);
                }, Conf.liujuTime);
                break;
            case Status.WAITFANZHU:
                this._autoTimeout = this.setTimeout(() => {
                    turnPlayer.giveup();
                    this.playerAutoTrusteeship(turnPlayer);
                }, Conf.actionTime);
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

    /**
     * 切牌 玩家主动动作或者自动操作
     * @param uid
     * @param index
     */
    cutCard(uid, index) {
        if (this.status !== Status.CUT_CARD) {
            return;
        }

        if (this.qieUid !== uid) {
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
        }, 1000);
    }

    /**
     * 检查当前是否可以叫主
     */
    checkCanJiaozhu() {
        if (this.tempZhuUid > 0) {
            return false;
        }

        if (this.status != Status.SENDHOLDS && this.status != Status.WAITJIAOZHU) {
            return false;
        }

        return true;
    }

    checkCanFanzhu() {
        if (this.tempZhuUid < 0) {
            return false;
        }

        if (this.status != Status.WAITFANZHU) {
            return false;
        }

        return true;
    }

    /***
     * 自动出牌
     * @param turnPlayer
     */
    autoDiscard(turnPlayer) {
        this.log(`自动出牌 firstDisCard = ${JSON.stringify(this._algorithm.firstCards)}`);
        this.log(`自动出牌 zhuType = ${this.zhuType}`);
        this.log(`自动出牌 turnPlayer.holds = ${turnPlayer.holds}`);
        this.log(`自动出牌 maxDisCard = ${JSON.stringify(this._algorithm.maxCards)}`);
        let cards = this._algorithm.getAutoDicard(turnPlayer.holds);
        this.log(`自动出牌 cards = ${JSON.stringify(cards)}`);
        return cards;
    }

    /**
     * 出牌
     * @param turnPlayer
     * @param cards
     * @returns {boolean}
     */
    discard(turnPlayer, cards) {
        if (this.turn !== turnPlayer.seatId) {
            this.send(turnPlayer.uid, Event.toast, '轮转错误!');
            return false;
        }

        let cardsData = this._algorithm.checkCanOut(cards, turnPlayer.holds);
        if (!cardsData) {
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
                cardsData.type = CardType.NONE;
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
            this.curDiscards = [cardsData];
            this.setMaxDiscard(cardsData);
        }

        turnPlayer.removeHolds(cardsData.cards);
        this.tableScore += this.calcCardScore(cardsData.cards);
        let msg = {
            cardsData: cardsData,
            tableScore: this.tableScore,
        };
        this.sendAll(Event.discard, msg);
        this.foldsList.push({event: Event.discard, msg: JSON.stringify(msg)});
        this.nextTurn();
    }

    /***
     * 桌子状态改变
     * @param code
     */
    changeStatus(code) {
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
            case Status.CUT_CARD:
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
                break;
            case Status.WAITJIAOZHU:
                this.startTimeout();
                break;
            case Status.WAITFANZHU:
                this.turn = this.uids.indexOf(this.tempZhuUid);
                this.nextTurn();
                break;
            case Status.DISCARD:
                let banker = this.uids.indexOf(this.bankerUid);
                this.nextTurn(banker);
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
            isFanzhu: this.isFanzhu,
            tempZhu: this.tempZhu,
            tempZhuUid: this.tempZhuUid,
            zhuType: this.zhuType,
            turn: this.turnUid,
            status: this.status,
            banker: this.bankerUid,
            qieUid: this.qieUid,
            tableScore: this.tableScore,
            lastDiscards: this.lastDiscards,
            curDiscards: this.curDiscards,
            allScoreCards: this.allScoreCards,
        };

        this.players.forEach(function (el) {
            msg.players[el.uid] = el.getInfos(uid);
        }, this);
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
            tempZhu: this.tempZhu,
            zhuType: this.zhuType,
        };

        this.players.forEach((player, index) => {
            history[player.uid] = {
                holds: player.beginHolds,
            };
        });

        return history;
    }

    log(info) {
        // console.log(`table[${this.room.rid}] info：`, info);
    }
}

module.exports = Main;