/**
 * Created by sam on 2020/6/3.
 *
 */

const Player = require('./Player');
const Status = require('./const').status;
const Event = require('./event');
const Conf = require('./config');
const Algorithm = require('./algorithm');
const CardsType = require('./const').cardsType;

class Main extends require('../../BaseMain') {
    constructor(uids, rule, room) {
        super(room);

        this._algorithm = new Algorithm();
        this._algorithm.setRule(rule);

        this.times = rule.times || 1;                           //倍数

        const bombReward = require('./const').bombReward;
        this.xiScore = bombReward[rule.xiScoreMode || 0];   //喜分 0：加法叠加 1：乘法叠加

        this.rewardScore = rule.rewardScore || 100;         //奖分 100/200
        this.rewardScoreMode = rule.rewardScoreMode || 0;   //奖励分给 0：上游 1：最高分

        if (uids.length == 2) {
            const rankScore_2 = require('./const').rankScore_2;
            this.rankScore = rankScore_2[rule.rankScore_2 || 0];    //奖惩 0：60/60  1: 40/40
        } else {
            const rankScore_3 = require('./const').rankScore_3;
            this.rankScore = rankScore_3[rule.rankScore_3 || 0];    //奖惩 0：100/40/60  1:100/30/70 2：100/0/100
        }

        this.settleScore = !!rule.settleScore ? rule.settleScore : 1000;      //结算分数

        this.uids = uids;           //玩家uid列表
        this.alreayQie = false;     //是否已经切牌
        this.cutValue = undefined;  //切到的牌
        
        this.bankerUid = -1;        //庄家uid
        this.status = -1;           //当前状态
        this.turn = -1;             //当前活跃玩家

        this.bottomCards = [];      //底牌
        this.curRank = 0;           //玩家上中下游排名
        this.leftCards = [];        //两人场时第三手牌
        this.foldsList = [];        //打出的牌，用于回放
        this.ante = rule.ante;      //底分
        this.tableScore = 0;        //桌面分
        /** 玩家当前打出的牌 */
        this.setLastCards();

        let sd = this.getLasting();
        sd.initPlayerData(this.uids);

        this.initPlayer(room);
    }

    /***
     * 初始化玩家类
     * @param room
     */
    initPlayer(room) {
        let cards = this._algorithm.deal(3);
        let len = (cards.length-6)/3;
        //创建玩家
        this.uids.forEach((uid, i) => {
            let player = new Player(this);
            player.uid = uid;
            player.seatId = i;
            player.isTrusteeship = room.player(uid).isTrusteeship;
            player.beginHolds = cards.splice(0, len);
            this.players.push(player);
        }, this);

        /**  剩下的牌  **/
        this.bottomCards = cards.splice(0,6);
        this.leftCards = cards;
    }

    /***
     * 游戏开始
     */
    begin() {
        this.log('game begin.............');
        this.sendAll(Event.gameBegin, {uids: this.uids});
        this.players.forEach((player) => {
            /** 推送托管状态 */
            this.sendAll(Event.tuoGuang, [player.uid, player.isTrusteeship]);
        });
        this.syncScore();
        let sd = this.getLasting();
        let winner = sd.winner;
        if (winner > 0 && this.uids.includes(winner)) {
            this.bankerUid = winner;
            this.broadcastBanker();
        } else {
            /** 随机庄 */
            this.bankerUid = this.uids[Math.randomRange(0, this.uids.length)];
        }

        this.changeStatus(Status.CUT_CARD);
    }

    /***
     * 庄家广播
     */
    broadcastBanker() {
        this.sendAll(Event.broadcastBanker, this.bankerUid);
    }

    /***
     * 桌子状态改变
     * @param code
     */
    changeStatus(code) {
        this.log(`table change status: ${code}`);
        this.status = code;
        this.sendAll(Event.gameStatus, {status: code});
        switch (code) {
            case Status.CUT_CARD:
                let sd = this.getLasting();
                let loster = sd.loster;
                if (loster > 0 && this.uids.includes(loster)) {
                    this.qieUid = loster;
                } else {
                    let bankerIdx = this.uids.indexOf(this.bankerUid);
                    let qieIdx = bankerIdx-1;
                    if (qieIdx < 0) {
                        qieIdx = this.uids.length-1;
                    }

                    this.qieUid = this.uids[qieIdx];
                }

                this.log(`询问切牌 ask_cutCard this.qieUid = ${this.qieUid}`);
                this.alreayQie = false;
                this.sendAll(Event.ask_cutCard, this.qieUid);
                this.startTimeout(this.player(this.qieUid));
                break;
            case Status.DISCARD:
                let banker = this.uids.indexOf(this.bankerUid);
                this.nextTurn(banker);
                break;
        }
    }

    /**
     * 切牌 玩家主动动作或者自动操作
     * @param index
     */
    cutCard(index) {
        if (this.status !== Status.CUT_CARD) {
            this.log(`status: ${this.status} can't cut card!`);
            return;
        }

        if (this.alreayQie) {
            return;
        }

        this.alreayQie = true;
        let need = false;
        /** 第一局 */
        if (this.getLasting().winner < 0) {
            this.bankerUid = this.uids[Math.randomRange(0, this.uids.length)];
            let cards = this.player(this.bankerUid).beginHolds;
            this.cutValue = cards[Math.randomRange(0, cards.length)];
            need = true;
        }

        this.sendAll(Event.cutCard, {index: index, card: this.cutValue, uid: this.bankerUid});
        this.log(`cut card：${this.cutValue}`);

        //等待切牌结束
        this.setTimeout(() => {
            /** 直接开始 首先发牌 */
            this.sendHoldsToPlayer(need);
        });
    }

    /**
     * 给玩家发牌
     */
    sendHoldsToPlayer(need) {
        this.players.forEach(el=> {
            el.sendHolds();
        });

        this.setTimeout(()=> {
            if (!!need) {
                this.broadcastBanker();
            }

            this.changeStatus(Status.DISCARD);
        }, 2000);
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

        /** 如果上中下游已经出现 游戏结束 */
        if (this.curRank === this.uids.length) {
            if (!!this.lastCards) {
                this.getScore(this.player(this.lastCards.uid));
            }

            this.setTimeout(() => {
                this.roundOver();
            });
            return;
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

        let turnPlayer = this.players[this.turn];

        let isFirstDiscard = false;
        if (!!this.lastCards) {
            if (turnPlayer.uid == this.lastCards.uid) {
                this.getScore(turnPlayer);
                if (turnPlayer.isNotPlaying()) {
                    return this.nextTurn();
                } else {
                    isFirstDiscard = true;
                    let cardsData = this._algorithm.getCardsData([].concat(turnPlayer.holds));
                    if (!!cardsData && cardsData.type != CardsType.AAAABB && cardsData.type != CardsType.AAAABBB) {
                        this.setTimeout(()=> {
                            this.discard(turnPlayer, cardsData.cards);
                        });

                        return;
                    }

                    cardsData = this._algorithm.findAutoCards(turnPlayer.holds);
                    turnPlayer.autoCards = cardsData.cards;
                }
            } else {
                if (turnPlayer.isNotPlaying()) {
                    return this.nextTurn();
                }

                let cardsData = this._algorithm.findAutoBigCards(turnPlayer.holds);
                if (!!cardsData) {
                    if (cardsData.cards.length == turnPlayer.holds.length) {
                        this.setTimeout(()=> {
                            this.discard(turnPlayer, cardsData.cards);
                        });

                        return;
                    }

                    turnPlayer.autoCards = cardsData.cards;
                } else {
                    this.pass(turnPlayer);
                    return;
                }
            }
        } else {
            if (turnPlayer.isNotPlaying()) {
                return this.nextTurn();
            }

            let cardsData = this._algorithm.getCardsData([].concat(turnPlayer.holds));
            if (!!cardsData) {
                this.setTimeout(()=> {
                    this.discard(turnPlayer, cardsData.cards);
                });

                return;
            }

            cardsData = this._algorithm.findAutoCards(turnPlayer.holds);
            turnPlayer.autoCards = cardsData.cards;
            isFirstDiscard = true;
        }

        this.sendAll(Event.turn, {turn: turnPlayer.uid, isFirstDiscard: isFirstDiscard});
        this.startTimeout(turnPlayer);
    }

    getScore(player) {
        if (this.tableScore > 0) {
            player.roundScore += this.tableScore;
            /** 得分动作 */

            this.tableScore = 0;
            this.syncScore();
        }

        this.setLastCards();
    }

    setLastCards(data) {
        this.lastCards = data;
        this._algorithm.lastCards = data;
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
            /** 先清除自动计时器 */
            if (!!this._autoTimeout) {
                this.clearTimeout(this._autoTimeout);
            }

            /** 再开启自动计时器 */
            this.startTimeout(player, true);
        }
    }

    /**
     * 启动托管计时器
     * @param turnPlayer
     */
    startTimeout (turnPlayer, quick) {
        // return;

        /** 先清除自动计时器 */
        if (!!this._autoTimeout) {
            this.clearTimeout(this._autoTimeout);
            this._autoTimeout = undefined;
        }

        switch (this.status) {
            case Status.CUT_CARD:
                this._autoTimeout = this.setTimeout(() => {
                    turnPlayer.cutCard(Math.randomRange(8, 36));
                }, Conf.qiepaiTime);
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
                    this.discard(turnPlayer, turnPlayer.autoCards);
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
     * 出牌
     * @param turnPlayer
     * @param cards
     * @returns {boolean}
     */
    discard(turnPlayer, cards) {
        this.log(`出牌 lastCards = ${JSON.stringify(this.lastCards)}`);
        this.log(`出牌 cards = ${cards}`);
        this.log(`出牌 turnPlayer.holds = ${turnPlayer.holds}`);

        if (this.turn !== turnPlayer.seatId) {
            this.send(turnPlayer.uid, Event.toast, '轮转错误!');
            return false;
        }

        if (!Array.isArray(cards) || cards.length == 0) {
            return false;
        }

        let cardsData = this._algorithm.checkCanOut(turnPlayer.holds, cards);
        this.log(`出牌 player: ${turnPlayer.uid} cardsData = ${JSON.stringify(cardsData)}`);
        if (!cardsData) {
            this.log("牌型不合法!");
            this.send(turnPlayer.uid, Event.toast, '牌型不合法!');
            return false;
        }

        cardsData.first = !(!!this.lastCards);
        cardsData.uid = turnPlayer.uid;
        turnPlayer.removeHolds(cards);
        turnPlayer.autoCards = undefined;
        cardsData.h_len = turnPlayer.holds.length;
        this.tableScore += this.calcCardScore(cards);
        cardsData.tableScore = this.tableScore;
        this.setLastCards(cardsData);
        this.sendAll(Event.discard, cardsData);
        this.foldsList.push({event: Event.discard, msg: cardsData});

        this.calcXiScore(turnPlayer, cardsData);
        this.checkRankAndScore(turnPlayer);
    }

    /**
     * 不要
     * @param turnPlayer
     */
    pass(turnPlayer) {
        let msg = {uid: turnPlayer.uid};
        this.sendAll(Event.pass, msg);
        this.foldsList.push({event: Event.pass, msg: msg});
        this.checkRankAndScore(turnPlayer, true);
    }

    /**
     * 检查上中下游和桌面分数
     * @param turnPlayer
     * @param isPass
     */
    checkRankAndScore(turnPlayer, isPass) {
        let sd = this.getLasting();
        /** 如果这次出牌的已经是下游了 出了牌就把桌面分数都收走 如果要不起 那么则由上一个出牌玩家收走桌面分 **/
        if (this.curRank == this.players.length-1) {
            sd.loster = turnPlayer.uid;
            turnPlayer.rank = this.curRank;
            this.curRank+=1;
            this.rankNotice(turnPlayer);
        } else if (turnPlayer.isNotPlaying()) {
            if (this.curRank == 0) {
                sd.winner = turnPlayer.uid;
            }
            turnPlayer.rank = this.curRank;
            this.curRank+=1;
            this.rankNotice(turnPlayer);
        }

        this.setTimeout(()=> {
            this.nextTurn();
        });
    }

    /***
     * 排名广播
     */
    rankNotice(player) {
        let rank = player.rank;
        if (this.uids.length == 2 && this.curRank == this.uids.length) {
            rank = this.curRank;
        }

        let msg = {uid: player.uid, rank: rank};
        this.sendAll(Event.rank, msg);
        this.foldsList.push({event: Event.rank, msg: JSON.stringify(msg)});
    }

    /***
     * 同步分数
     */
    syncScore() {
        let msg = {};
        let sd = this.getLasting();
        this.players.forEach(function (el) {
            msg[el.uid] = {
                totalScore: sd.totalScore[el.uid],
                totalXiScore: sd.totalXiScore[el.uid],
                roundScore: el.roundScore+el.rankScore,
                xiScore: el.xiScore,
            };
        }, this);

        this.sendAll(Event.asyncScore, msg);
        this.foldsList.push({event: Event.asyncScore, msg: msg});
    }

    /***
     * 游戏结束
     */
    roundOver() {
        this.sendBottomCards();

        this.setTimeout(()=> {
            this.nextSettleRound();
        }, 3000);
    }

    sendBottomCards() {
        //上游加上底牌分数
        let bottomScore = this.calcCardScore(this.bottomCards);
        this.sendAll(Event.bottomCards, this.bottomCards);
        this.foldsList.push({event: Event.bottomCards, msg: this.bottomCards});
        if (bottomScore > 0) {
            this.getRank1Player().roundScore += bottomScore;
            this.syncScore();
        }
    }

    async nextSettleRound() {
        //小结算
        let msg = this.settleForRound();
        if (this.isGameOver()) {
            //大结算
            this.settleForRoom(msg);
            let actualScores = await this.pushScore();
            msg.allScores = actualScores;

            //清空记录
            this.getLasting().clear();
        } else {
            await this.pushScore();
        }

        this.sendAll(Event.gameResult, msg);
        this.setTimeout(() => {
            this.end();
        });
    }

    /***
     * 小结算
     */
    settleForRound() {
        let msg = {playerDatas: {}};
        let playerDatas = msg.playerDatas;
        let sd = this.getLasting();
        for (let i = 0; i < this.players.length; ++i) {
            let player = this.players[i];
            player.rankScore = this.rankScore[player.rank];
            //总积分
            sd.totalScore[player.uid] += (player.roundScore+player.rankScore);
            playerDatas[player.uid] = {
                totalScore: sd.totalScore[player.uid],
                totalXiScore: sd.totalXiScore[player.uid],
                roundScore: player.roundScore,
                xiScore: player.xiScore,
                rank: player.rank,
                rankScore: player.rankScore,
                holds: player.holds
            };
        }

        msg.isGameOver = this.isGameOver();
        if (msg.isGameOver) {
            Conf.autoNextTime = 30;
        } else {
            Conf.autoNextTime = 15;
        }

        msg.timer = Conf.autoNextTime;
        this.syncScore();

        return msg;
    }

    /***
     * 大结算
     */
    settleForRoom(msg) {
        let playerDatas = msg.playerDatas;
        let maxScore = 0;
        let maxScorePlayers = [];     //最高分
        let sd = this.getLasting();
        for (let i = 0; i < this.players.length; ++i) {
            let player = this.players[i];
            let totalScore = sd.totalScore[player.uid];
            if (totalScore > maxScore) {
                maxScore = totalScore;
            }

            let finalScore = Math.round(sd.totalScore[player.uid]/100)*100;
            player.finalScore = finalScore;
            playerDatas[player.uid].finalScore = finalScore;
        }

        /** 找到最高分的玩家 可能不只一个 多个的话按照上中下取最前的 */
        for (let i = 0; i < this.players.length; ++i) {
            let player = this.players[i];
            let totalScore = sd.totalScore[player.uid];
            if (totalScore == maxScore) {
                maxScorePlayers.push(player);
            }
        }

        let winPlayer = undefined;
        let rankIdx = 99;
        for (let i = 0; i < maxScorePlayers.length; i++) {
            let player = maxScorePlayers[i];
            let rank = player.rank;
            if (rankIdx > rank) {
                rankIdx = rank;
                winPlayer = player;
            }
        }

        msg.winuid = winPlayer.uid;

        /** 找到赢家 然后给尾局奖励 */
        let rewardScore = this.rewardScore;
        if (this.rewardScoreMode === 1) {
            //最高分得奖励分
            winPlayer.rewardScore = rewardScore;
        } else {
            //上游得奖励分
            this.getRank1Player().rewardScore = rewardScore;
        }

        //最终输赢
        this.players.forEach((player) => {
            if (player.uid !== winPlayer.uid) {
                let score = winPlayer.finalScore+winPlayer.rewardScore-player.finalScore-player.rewardScore;
                score *= this.ante;
                player.score -= score;
                winPlayer.score += score;
                playerDatas[player.uid].win = 0;
            } else {
                playerDatas[player.uid].win = 1;
            }

            player.score += sd.totalXiScore[player.uid]*this.ante;
            playerDatas[player.uid].rewardScore = player.rewardScore;
        });

        return msg;
    }

    getRank1Player() {
        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            if (player.rank == 0) {
                return player;
            }
        }
    }

    /***
     * 游戏是否结束（总结算）
     * @returns {boolean}
     */
    isGameOver() {
        let sd = this.getLasting();
        for (let uid in sd.totalScore) {
            if(sd.totalScore[uid] >= this.settleScore) {
                return true;
            }
        }

        return false;
    }

    /***
     * 计算喜分
     * @param turnPlayer
     * @param cardsData
     */
    calcXiScore (turnPlayer, cardsData) {
        if (cardsData.type != CardsType.AAAA) {
            return;
        }

        let bombLength = cardsData.cards.length;
        if (bombLength < 7) {
            return;
        }

        let score = this.xiScore[bombLength] || 0;
        if (score > 0) {
            let sd = this.getLasting();
            this.players.forEach((el) => {
                if (el.uid !== turnPlayer.uid) {
                    el.xiScore -= score;
                    sd.totalXiScore[el.uid] -= score;
                    turnPlayer.xiScore += score;
                    sd.totalXiScore[turnPlayer.uid] += score;
                }
            });
        }

        this.syncScore();
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
            }
        });

        return score;
    }

    /**
     * 获取游戏信息
     */
    getInfo(uid) {
        uid = parseInt(uid);
        let msg = {
            uids: this.uids,                        //当前游戏中的玩家
            players: {},
            turn: this.uids[this.turn],
            status: this.status,
            banker: this.bankerUid,
            tableScore: this.tableScore,
            lastCards: this.lastCards,
            qieUid: this.qieUid,
        };

        this.players.forEach(function (el) {
            msg.players[el.uid] = el.getInfos(uid);
        }, this);
        this.send(uid, Event.gameInfo, msg);
        this.syncScore();
    }

    /**
     * 回放数据
     */
    getPlayback() {
        let history = {
            uids: this.uids,
            foldsList: this.foldsList,
            banker: this.bankerUid,
            bottomCards: this.bottomCards,
        };

        this.players.forEach((player) => {
            history[player.uid] = {
                holds: player.beginHolds,
            };
        });

        // this.log(history);
        return history;
    }

    log(info) {
        console.log(`table[${this.room.rid}] info：`, info)
    }
}

module.exports = Main;