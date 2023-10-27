/**
 * Created by sam on 2020/6/3.
 *
 */

const Player = require('./Player');
const Poker = require('../Poker');
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
        this.bankerUid = -1;            //庄家
        this.status = -1;               //当前状态
        this.turn = -1;                 //当前活跃玩家
        this.turnUid = -1;
        this.holdsList = [];            //玩家手牌，用于回放
        this.foldsList = [];            //打出的牌，用于回放
        this.lastDiscards = [];         //上一轮打出的牌
        this.curDiscards = [];         //本轮打出的牌
        this.firstDisCard = undefined;
        this.maxDisCard = undefined;
        this.scoreCards = [];
        this.allScoreCards = [];
        this.mul = 0;
        this.fanCount = 0;
        this.tableScore = 0;            //桌面分
        this.xianScore = 0;
        this.first_turn = -1;           //每一轮第一个出牌的座位号
        this.max_turn = -1;
        this.tempzhu = [];
        this.tempzhuUid = -1;
        this.zhuType = -1;
        this.giveUpCount = 0;
        this.friendUid = -1;
        this.settleType  =-1;
        this.isPo = false;
        this.isXiaoPo = false;
        this.isDaPo = false;
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
        let cards = Poker.deal(2, this.rule.isNotHas6 ? [3,4,6] : [3,4]);
        // cards = [9,9,22,22,9,9,22,22,35,35,48,48,35,35,48,48,20,23,21,27,21,7,30,36];
        // cards = [
        //     4,4,6,6,35,35,48,48,1,1,14,14,27,27,40,40,52,52,53,
        //     8,8,10,10,35,35,48,48,1,1,14,14,27,27,40,40,52,52,53,
        //     0,0,22,22,35,35,48,48,1,1,14,14,27,27,40,40,52,52,53,
        //     53,9,22,22,35,35,48,48,1,1,14,14,27,27,40,40,52,52,53,
        //     20,23,21,27,21,7,30,36,
        // ];
        // if (!this.rule.isNotHas6) {
        //     cards = cards.concat([20,23,21,27,21,7,30,36]);
        // }

        let dealCount = Math.floor((cards.length-8)/this.uids.length);
        for (let i = 0; i < this.players.length; ++i) {
            let player = this.players[i];
            player.holds = [];
            let holds = cards.splice(0, dealCount);
            player.beginHolds = holds;
            if (i == this.players.length-1) {
                let cb = (() => {
                    if (this.tempzhuUid < 0) {
                        //this.changeStatus(Status.WAITJIAOZHU);
                    } else {
                        //this.changeStatus(Status.WAITFANZHU);
                    }
                });
                player.startSendHolds(cb);
            } else {
                player.startSendHolds();
            }

            this.log(`deal seatId = ${player.seatId}, uid = ${player.uid}, beginHolds = ${player.beginHolds}`);
        }

        /** 保存8张底牌 */
        this.bottomCards = cards.splice(0, 8);
        this.log(`deal bottomCards = ${this.bottomCards}`);
        /** 通知发牌 */
        //this.sendAll(Event.deal, this.dealCount);
    }



    /**
     * 玩家叫主
     * @param p
     * @param tempzhu
     */
    playerJiaozhu(p, tempzhu) {
        this.tempzhu = tempzhu;
        this.tempzhuUid = p.uid;
        this.mul = 1;
        this.sendAll(Event.jiaozhu, {tempzhu: tempzhu, uid: this.tempzhuUid, mul: this.mul});
        this.players.forEach((el) => {
            el.checkJiaozhu();
            el.checkSpecialJiaozhu();
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
        if (this.status != Status.WAITFANZHU && this.status != Status.SENDHOLDS) {
            this.log(`玩家反主状态错误 turnUid = ${this.turnUid} p.uid = ${p.uid} status = ${this.status}`);
            return false;
        }

        if (this.turnUid != p.uid && this.status == Status.WAITFANZHU) {
            this.log(`玩家反主轮转错误 turnUid = ${this.turnUid} p.uid = ${p.uid}`);
            return false;
        }

        if (p.isGiveUp) {
            this.log(`玩家已经放弃过反主了 turnUid = ${this.turnUid} p.uid = ${p.uid}`);
            return false;
        }
        
        if (this.rule.fanCount > 0 && this.fanCount >= this.rule.fanCount) {
            this.log(`反主次数超过限制 fanCount = ${this.fanCount} rule.fanCount = ${this.rule.fanCount}`);
            return false;
        }

        this.log(`反主 turnUid = ${this.turnUid} p.uid = ${p.uid} ${data}`);
        if (this.rule.fanzhuMul) {
            this.mul *= 2;
        } else {
            this.mul += 1;
        }
        this.fanCount += 1;
        this.sendAll(Event.fanzhu, {uid: p.uid, tempzhu: data, mul: this.mul, fanCount: this.fanCount});
        this.tempzhu = data;
        this.tempzhuUid = p.uid;
        if (this.status == Status.WAITFANZHU) {
            this.setTimeout(()=>{
                this.nextTurn();
            }, 500);
        } else {
            this.players.forEach((el) => {
                el.checkFanzhu();
            });
        }

        return true;
    }

    /**
     * 玩家放弃反主
     * @param p
     */
    playerGiveup(p) {
        if (p.isGiveUp) {
            this.log(`玩家已经放弃过反主了 turnUid = ${this.turnUid} p.uid = ${p.uid}`);
            return false;
        }

        if (this.status == Status.SENDHOLDS) {
            this.sendAll(Event.giveup, p.uid);
            return true;
        } else if (this.status == Status.WAITFANZHU) {
            if (this.turnUid != p.uid) {
                this.log(`轮转错误 turnUid = ${this.turnUid} p.uid = ${p.uid}`);
                return false;
            }

            this.sendAll(Event.giveup, p.uid);
            this.setTimeout(()=>{
                this.nextTurn();
            }, 500);
            return true;
        }

        return false;
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

        if (this.zhuType > -1) {
            this.log(`已经定主 bankerUid = ${this.bankerUid} p.uid = ${p.uid} 主 = ${this.zhuType} data = ${data}`);
            return;
        }

        if (![0,1,2,3].includes(data)) {
            this.log(`定主错误 bankerUid = ${this.bankerUid} p.uid = ${p.uid} data = ${data}`);
            return;
        }

        this.log(`定主 bankerUid = ${this.bankerUid} p.uid = ${p.uid} data = ${data}`);
        this.inStatus_MAIDI(data);
    }

    /**
     * 庄家埋底
     * @param p
     * @param data
     */
    playerMaidi(p, data) {
        if (this.status != Status.MAIDI) {
            this.log(`埋底状态错误 this.status = ${this.status}}`);
            return false;
        }

        if (this.bankerUid != p.uid) {
            this.log(`埋底错误 bankerUid = ${this.bankerUid} p.uid = ${p.uid}`);
            return false;
        }

        if (data.length != 8) {
            this.log(`埋底错误 data = ${data}}`);
            return false;
        }

        this.oriBottomCards = [].concat(this.bottomCards);
        this.bottomCards = data;
        p.removeHolds(data);
        this.sendAll(Event.maidi);
        this.send(p.uid, Event.maidiHolds, p.holds);
        p.finalHolds = [].concat(p.holds);
        this.setTimeout(()=> {
            this.changeStatus(Status.FRIEND);
        });
        return true;
    }

    /**
     *
     * @param p
     * @param data
     */
    playerFriend(p, data) {
        if (this.status != Status.FRIEND) {
            this.log(`选择队友错误 status = ${this.status} p.uid = ${p.uid}`);
            return;
        }

        if (this.bankerUid != p.uid) {
            this.log(`选择队友错误 bankerUid = ${this.bankerUid} p.uid = ${p.uid}`);
            return;
        }

        if (this.friendUid > -1) {
            this.log(`选择队友错误 bankerUid = ${this.bankerUid} p.uid = ${p.uid} friendUid = ${this.friendUid}`);
            return;
        }

        if ([0,1].indexOf(data) < 0 && ['0','1'].indexOf(data) < 0) {
            this.log(`选择队友错误 data = ${data} p.uid = ${p.uid}`);
            return;
        }

        if (parseInt(data) > 0) {
            this.checkChangeSeat();
        } else {
            this.friendUid = 0;
            this.sendAll(Event.friend, {friend: this.friendUid});
        }

        this.changeStatus(Status.DISCARD);
    }

    checkChangeSeat() {
        /** 换位置 先找到有主6和没主6的玩家 */
        let zhu6s = [];
        let notZhu6s = [];
        let z6 = [5,18,31,44][this.zhuType];
        this.players.forEach((p)=> {
            if (p.holds.includes(z6)) {
                zhu6s.push(p.seatId);
            } else {
                notZhu6s.push(p.seatId);
            }
        });

        this.log(`checkChangeSeat zhu6s: ${zhu6s}`);
        /** 如果有两个玩家 玩家的seat差不等于2 则需要换位置 庄家不动 */
        if (zhu6s.length > 1 && Math.abs(zhu6s[0]-zhu6s[1]) != 2) {
            /** 先找到庄家对面的玩家 */
            let banker = this.uids.indexOf(this.bankerUid);
            let duimian = banker-2;
            if (duimian < 0) {
                duimian = banker+2;
            }
            /** 判断对面玩家是否有主6 */
            let changeSeat = -1;
            if (zhu6s.includes(duimian)) {
                /** 有主6 跟没主6的换位置 庄家肯定没主6 */
                for (let i = 0; i < notZhu6s.length; i++) {
                    let seat = notZhu6s[i];
                    if (seat != banker) {
                        changeSeat = seat;
                        break;
                    }
                }
            } else {
                /** 没主6 跟有主6的换位置 庄家肯定有主6 */
                for (let i = 0; i < zhu6s.length; i++) {
                    let seat = zhu6s[i];
                    if (seat != banker) {
                        changeSeat = seat;
                        break;
                    }
                }
            }

            this.friendUid = this.uids[changeSeat];

            /** 变更uids*/
            let uid1 = this.uids[duimian];
            let uid2 = this.uids[changeSeat];
            this.uids[changeSeat] = uid1;
            this.uids[duimian] = uid2;

            /** 变更players */
            let p1 = this.players[duimian];
            p1.seatId = changeSeat;
            let p2 = this.players[changeSeat];
            p2.seatId = duimian;
            this.players[changeSeat] = p1;
            this.players[duimian] = p2;

            /** 变更房间 */
            this.room.checkChangeSeat(duimian, changeSeat);
            this.sendAll(Event.changeSeat, [uid1, uid2]);
            this.sendAll(Event.friend, {friend: this.friendUid});
        } else {
            let bankerIdx = this.uids.indexOf(this.bankerUid);
            let friendIdx = bankerIdx-2;
            if (friendIdx < 0) {
                friendIdx = bankerIdx+2;
            }
            this.friendUid = this.uids[friendIdx];
            this.sendAll(Event.friend, {friend: this.friendUid});
        }
    }

    /***
     * 牌面分
     * @constructorran
     */
    calcCardScore (cards) {
        let score = 0;
        cards.forEach((el) => {
            if (Poker.cardValue(el) === 5) {
                score += 5;
                this.scoreCards.push(el);
            }else if ([10, 13].includes(Poker.cardValue(el))) {
                score += 10;
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
            this.turnUid = turnPlayer.uid;
            if (turnPlayer.isGiveUp) {
                this.giveUpCount += 1;
                /** 当放弃的人小于总玩家数时 继续轮转 */
                if (this.giveUpCount < this.players.length) {
                    this.nextTurn();
                } else {
                    /** 设置庄家 */
                    this.bankerUid = this.tempzhuUid;
                    this.getLasting().lastBanker = this.bankerUid;
                    this.sendAll(Event.broadcastBanker, this.bankerUid);
                    this.turnUid = this.bankerUid;
                    this.turn = this.uids.indexOf(this.turnUid);
                    /** 如果庄家是特殊抢或者特殊反 则进入定主状态 */
                    if (this.tempzhu.length > 2) {
                        this.changeStatus(Status.DINGZHU);
                        this.sendAll(Event.turn, {turn: this.turnUid, isFirstDiscard: true});
                    } else {
                        this.inStatus_MAIDI();
                    }
                }

                return;
            }

            this.giveUpCount = 0;
            let a = Algorithm.getFanzhus(this.tempzhu,
                turnPlayer.all_10, turnPlayer.red_2, turnPlayer.black_2, turnPlayer.wang) || [];
            let msg = {
                turn: turnPlayer.uid,
                isFirstDiscard: true,
            };

            let canFan = (this.rule.fanCount == 0 || this.fanCount < this.rule.fanCount);
            if (canFan && a.length > 0) {
                turnPlayer.canFanzhu = true;
                msg.fanzhu = a;
            } else {
                turnPlayer.canFanzhu = false;
            }
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
            this.sendAll(Event.lastDiscards, this.lastDiscards);
            this.setTimeout(()=> {
                this.getTableScore();
                /** 最大牌玩家接着出牌 */
                this.turn = this.max_turn;
                this.first_turn = this.turn;
                this.firstDisCard = undefined;
                this.maxDisCard = undefined;
                this.curDiscards = [];
                this.tableScore = 0;
                let turnPlayer = this.players[this.turn];
                this.turnUid = turnPlayer.uid;
                let msg = {
                    turn: turnPlayer.uid,
                    isFirstDiscard: !(!!this.firstDisCard),
                };
                this.sendAll(Event.turn, msg);
                if (turnPlayer.holds.length == 1) {
                    this.discard(turnPlayer, [].concat(turnPlayer.holds));
                } else {
                    this.startTimeout(turnPlayer);
                }
            }, 1500);
        } else {
            if (this.first_turn == -1) {
                this.first_turn = this.turn;
            }

            let turnPlayer = this.players[this.turn];
            this.turnUid = turnPlayer.uid;
            let msg = {
                turn: turnPlayer.uid,
                isFirstDiscard: !(!!this.firstDisCard),
                maxDisCard: this.maxDisCard,
            };

            this.sendAll(Event.turn, msg);
            if (!!this.firstDisCard && turnPlayer.holds.length == this.firstDisCard.cards.length) {
                this.discard(turnPlayer, [].concat(turnPlayer.holds));
            } else {
                this.startTimeout(turnPlayer);
            }
        }
    }

    /**
     * 闲家捡分
     */
    getTableScore() {
        let maxPlayer = this.players[this.max_turn];
        if (maxPlayer.uid != this.bankerUid) {
            let can = false;
            if (this.friendUid > 0) {
                if (maxPlayer.uid != this.friendUid) {
                    this.xianScore += this.tableScore;
                    can = true;
                }
            } else {
                this.xianScore += this.tableScore;
                can = true;
            }

            let msg = {};
            if (this.xianScore >= 80 && !this.isPo) {
                this.isPo = true;
                msg.isPo = this.isPo;
            }

            if (this.xianScore >= this.rule.xiaofan && !this.isXiaoPo) {
                this.isXiaoPo = true;
                msg.isXiaoPo = this.isXiaoPo;
            }

            if (this.xianScore >= this.rule.dafan && !this.isDaPo) {
                this.isDaPo = true;
                msg.isDaPo = this.isDaPo;
            }

            if (can) {
                msg.score = this.xianScore;
                msg.scoreCards = this.scoreCards;
                this.sendAll(Event.xianScore, msg);
                this.allScoreCards = this.allScoreCards.concat(this.scoreCards);
            }
        }

        this.scoreCards = [];
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
            this.koudi();
        });
    }

    /**
     * 扣底
     */
    koudi() {
        let isKoudi = false;
        /** 如果闲家最后最大 并且是主 则闲家分数加上埋底分 */
        let max_turnUid = this.uids[this.max_turn];
        let diScore = 0;
        let msg = {};
        if (max_turnUid != this.friendUid && max_turnUid != this.bankerUid && this.maxDisCard.isZhu) {
            let typeMul = 1;
            if (this.maxDisCard.type == CardType.AABB || this.maxDisCard.type == CardType.AA) {
                typeMul = this.maxDisCard.cards.length;
            }

            diScore = this.calcCardScore(this.bottomCards)*typeMul;
            this.xianScore += diScore;
            isKoudi = true;
            this.allScoreCards = this.allScoreCards.concat(this.scoreCards);

            if (this.xianScore >= 80 && !this.isPo) {
                this.isPo = true;
                msg.isPo = this.isPo;
            }

            if (this.xianScore >= this.rule.xiaofan && !this.isXiaoPo) {
                this.isXiaoPo = true;
                msg.isXiaoPo = this.isXiaoPo;
            }

            if (this.xianScore >= this.rule.dafan && !this.isDaPo) {
                this.isDaPo = true;
                msg.isDaPo = this.isDaPo;
            }
        }

        msg.xianScore = this.xianScore;
        msg.isKoudi = isKoudi;
        msg.diScore = diScore;
        msg.bottomCards = this.bottomCards;

        this.setTimeout(()=> {
            this.sendAll(Event.liangdi, msg);
        });

        let dealy = isKoudi ? 3000: 2000;
        this.setTimeout(()=> {
            this.calculateResult();
        }, dealy);
    }

    /**
     * 计算结果
     */
    async calculateResult() {
        let settleMul = 1;
        let settleType = SettleType.NONE;
        if (this.xianScore < this.rule.kuascore) {
            if (this.xianScore == this.rule.daguang) {
                settleMul = 3;
                settleType = SettleType.DAGUANG;
            } else if (this.xianScore < this.rule.xiaoguang) {
                settleMul = 2;
                settleType = SettleType.XIAOGUANG;
            } else {
                settleType = SettleType.GUO;
            }

            let settleScore = this.mul*settleMul*this.ante;
            this.players.forEach((el) => {
                if (this.friendUid > 0) {
                    if (el.uid == this.bankerUid || el.uid == this.friendUid) {
                        el.score += settleScore;
                    } else {
                        el.score -= settleScore;
                    }
                } else {
                    if (el.uid == this.bankerUid) {
                        el.score += settleScore*3;
                    } else {
                        el.score -= settleScore;
                    }
                }
            });
        } else {
            if (this.xianScore >= this.rule.dafan) {
                settleMul = 3;
                settleType = SettleType.DAFAN;
            } else if (this.xianScore >= this.rule.xiaofan) {
                settleMul = 2;
                settleType = SettleType.XIAOFAN;
            } else {
                settleType = SettleType.KUA;
            }

            let settleScore = this.mul*settleMul*this.ante;
            this.players.forEach((el) => {
                if (this.friendUid > 0) {
                    if (el.uid == this.bankerUid || el.uid == this.friendUid) {
                        el.score -= settleScore;
                    } else {
                        el.score += settleScore;
                    }
                } else {
                    if (el.uid == this.bankerUid) {
                        el.score -= settleScore*3;
                    } else {
                        el.score += settleScore;
                    }
                }
            });
        }

        this.settleType = settleType;
        /** 上传分数 */
        let actualScores = await this.pushScore();
        this.sendAll(Event.gameResult, {
            allScore: actualScores,
            xianScore: this.xianScore,
            zhuType: this.zhuType,
            tempzhu: this.tempzhu,
            banker: this.bankerUid,
            friend: this.friendUid,
            settleType: settleType,
        });

        this.setTimeout(() => {
            this.end();
        });
    }

    /**
     * 进入埋底状态
     */
    inStatus_MAIDI(zhuType) {
        /** 定主 */
        this.zhuType = (zhuType == undefined ? Poker.cardType(this.tempzhu[[0]]) : zhuType);
        this.sendAll(Event.dingzhu, this.zhuType);
        /** 庄家拿底牌 进入埋底状态 */
        let banker = this.player(this.bankerUid);
        banker.holds = banker.holds.concat(this.bottomCards);
        this.send(banker.uid, Event.bottmCards, this.bottomCards);
        this.changeStatus(Status.MAIDI);
        this.sendAll(Event.turn, {turn: this.turnUid, isFirstDiscard: true});
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
        return;
        /** 先清除自动计时器 */
        if (!!this._autoTimeout) {
            this.clearTimeout(this._autoTimeout);
            this._autoTimeout = undefined;
        }

        let actionTime = Conf.actionTime;
        if (!!turnPlayer) {} else {
            turnPlayer = this.player(this.bankerUid);
        }

        if (!!turnPlayer && turnPlayer.isTrusteeship) {
            actionTime = !!quick ? 0 : 1000;
        }

        switch (this.status) {
            case Status.CUT_CARD:
                this._autoTimeout = this.setTimeout(() => {
                    turnPlayer.cutCard(Math.randomRange(24, 48));
                }, Math.min(actionTime, Conf.qiepaiTime));
                break;
            case Status.WAITJIAOZHU:
                this._autoTimeout = this.setTimeout(() => {
                    this.changeStatus(Status.LIUJU);
                }, Math.min(actionTime, Conf.liujuTime));
                break;
            case Status.WAITFANZHU:
                this._autoTimeout = this.setTimeout(() => {
                    turnPlayer.giveup();
                    this.playerAutoTrusteeship(turnPlayer);
                }, actionTime);
                break;
            case Status.DINGZHU:
                this._autoTimeout = this.setTimeout(() => {
                    turnPlayer.dingzhu(0);
                    this.playerAutoTrusteeship(turnPlayer);
                }, actionTime);
                break;
            case Status.MAIDI:
                this._autoTimeout = this.setTimeout(() => {
                    turnPlayer.maidi(this.bottomCards);
                    this.playerAutoTrusteeship(turnPlayer);
                }, actionTime);
                break;
            case Status.FRIEND:
                this._autoTimeout = this.setTimeout(() => {
                    turnPlayer.friend(0);
                    this.playerAutoTrusteeship(turnPlayer);
                }, actionTime);
                break;
            case Status.DISCARD:
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
        this.sendAll(Event.cutCard, {index: index, card: this.cutCardValue});
        this.log(`cut card：${this.cutCardValue}`);

        this.setTimeout(()=> {
            this.deal();
        }, 1000);
    }

    /**
     * 检查当前是否可以叫主
     */
    checkCanJiaozhu() {
        if (this.tempzhuUid > 0) {
            return false;
        }

        if (this.status != Status.SENDHOLDS && this.status != Status.WAITJIAOZHU) {
            return false;
        }

        return true;
    }

    /***
     * 自动出牌
     * @param turnPlayer
     */
    autoDiscard(turnPlayer) {
        let cards = Algorithm.getAutoDicard(this.firstDisCard, turnPlayer.holds, this.zhuType, this.maxDisCard, this.rule.isNotHas6);
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

        if (this.turn !== turnPlayer.seatId) {
            this.log(`player: ${turnPlayer.uid}, turn：${this.turnUid} 不能出牌！`);
            this.send(turnPlayer.uid, Event.toast, '轮转错误!');
            return false;
        }

        let cardsData = Algorithm.checkCanOut(this.firstDisCard, this.zhuType, cards, turnPlayer.holds, this.rule.isNotHas6);
        this.log(`出牌 player: ${turnPlayer.uid} cardsData = ${JSON.stringify(cardsData)}`);
        if (!cardsData) {
            this.log("牌型不合法!");
            this.send(turnPlayer.uid, Event.toast, '牌型不合法!');
            return false;
        }

        cardsData.uid = turnPlayer.uid;
        if (!!this.firstDisCard) {
            if (Algorithm.compareCardsDatas(this.zhuType, this.maxDisCard, cardsData)) {
                this.max_turn = turnPlayer.seatId;
                this.maxDisCard.max = false;
                cardsData.max = true;
                if (this.maxDisCard.isSha) {
                    cardsData.daSha = true;
                }
                this.maxDisCard = cardsData;
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

                    if (Algorithm.isHasZhu(p.holds, this.zhuType)) {
                        this.send(turnPlayer.uid, Event.toast, '不能甩牌，强制出最小!');
                        let maps = Algorithm.getCardsMap(cardsData.cards);
                        let danzhangs = [];
                        let duizis = [];
                        for (let key in maps) {
                            if (maps[key] == 1) {
                                danzhangs.push(parseInt(key));
                            } else {
                                duizis.push(parseInt(key));
                            }
                        }

                        /** 有单张就出单张 */
                        if (danzhangs.length > 0) {
                            danzhangs.sort((el1, el2)=> {
                                let v1 = Algorithm.cardValue(el1, this.zhuType);
                                let v2 = Algorithm.cardValue(el2, this.zhuType);
                                if (v1 == v2) {
                                    let t1 = Poker.cardType(el1);
                                    let t2 = Poker.cardType(el2);
                                    return t2-t1;
                                }
                                return v1-v2;
                            });

                            cardsData.type = CardType.A;
                            cardsData.cards = [danzhangs[0]];
                            cardsData.minVal = Algorithm.cardValue(cardsData.cards[0], this.zhuType);
                        } else {
                            duizis.sort((el1, el2) => {
                                let v1 = Algorithm.cardValue(el1, this.zhuType);
                                let v2 = Algorithm.cardValue(el2, this.zhuType);
                                if (v1 == v2) {
                                    let t1 = Poker.cardType(el1);
                                    let t2 = Poker.cardType(el2);
                                    return t2 - t1;
                                }
                                return v1 - v2;
                            });

                            cardsData.type = CardType.AA;
                            cardsData.cards = [duizis[0], duizis[0]];
                            cardsData.minVal = Algorithm.cardValue(cardsData.cards[0], this.zhuType);
                        }
                    }
                }
            }

            cardsData.max = true;
            cardsData.first = true;
            this.max_turn = turnPlayer.seatId;
            this.firstDisCard = cardsData;
            this.curDiscards = [cardsData];
            this.maxDisCard = cardsData;
        }

        turnPlayer.removeHolds(cardsData.cards);
        this.foldsList.push({uid: turnPlayer.uid, seat: turnPlayer.seatId, cardsData:cardsData});
        this.log(`discard ${JSON.stringify(cardsData)} holds: ${turnPlayer.holds}`);

        this.tableScore += this.calcCardScore(cardsData.cards);
        this.log(`tableScore: ${this.tableScore}`);
        this.sendAll(Event.discard, {
            uid: turnPlayer.uid,
            cardsData: cardsData,
            tableScore: this.tableScore,
            max_turn: this.uids[this.max_turn]
        });

        this.nextTurn();
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
                this.log(`切牌 ask_cutCard this.qieUid = ${this.qieUid}`);
                this.alreayQie = false;
                this.sendAll(Event.ask_cutCard, this.qieUid);
                this.startTimeout(this.player(this.qieUid));
                break;
            case Status.WAITJIAOZHU:
                this.startTimeout();
                break;
            case Status.WAITFANZHU:
                this.players.forEach((el) => {
                    el.stopFanzhu();
                });

                this.turn = this.uids.indexOf(this.tempzhuUid);
                this.nextTurn();
                break;

            case Status.DINGZHU:
                this.startTimeout();
                break;

            case Status.MAIDI:
                this.startTimeout();
                break;

            case Status.FRIEND:
                this.startTimeout();
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
            tempzhu: this.tempzhu,
            tempzhuUid: this.tempzhuUid,
            zhuType: this.zhuType,
            turn: this.turnUid,
            status: this.status,
            banker: this.bankerUid,
            qieUid: this.qieUid,
            tableScore: this.tableScore,
            lastDiscards: this.lastDiscards,
            curDiscards: this.curDiscards,
            friendUid: this.friendUid,
            mul: this.mul,
            allScoreCards: this.allScoreCards,
            xianScore: this.xianScore,
            isPo: this.isPo,
            isXiaoPo: this.isXiaoPo,
            isDaPo: this.isDaPo,
        };

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
            bottomCards: this.bottomCards,
            oriBottomCards: this.oriBottomCards,
            friendUid: this.friendUid,
            xianScore: this.xianScore,
            allScoreCards: this.allScoreCards,
            tempzhu: this.tempzhu,
            zhuType: this.zhuType,
            mul: this.mul,
            settleType: this.settleType,
        };

        this.players.forEach((player, index) => {
            history[player.uid] = {
                score: player.score,
                holds: player.beginHolds,
                finalHolds: player.finalHolds,
            };
        });

        //this.log(history);
        return history;
    }

    log(info) {
        console.log(`table[${this.room.rid}] info：`, info)
    }
}

module.exports = Main;