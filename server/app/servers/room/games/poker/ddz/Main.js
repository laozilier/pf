/**
 * Created by sam on 2020/5/18.
 *
 */

const Player = require('./Player');
const Poker = require('../Poker');
const ddzRule = require('./ddzRule');
const event = require('./ddzEvent');
const conf = require('./config');
const status = require('./ddzConst').status;


class Main extends require('../../BaseMain') {
    constructor(uids, rule, room) {
        super(room);
        this.uids = uids;           //玩家uid列表
        this.dealCount = 17;        //每人发牌张数
        this.status = -1;           //当前状态
        this.turn = null;           //当前活跃玩家
        this.rule = new ddzRule(rule);
        this.banker = null;         //地主座位号
        this.bankerCards = [];      //三张地主牌
        this.holdsList = [];        //玩家手牌，用于回放
        this.foldsList = [];        //打出的牌，用于回放
        this.bombCount = 0;         //炸弹个数
        this.lastDiscard = null;    //上一个打出的牌
        this.lastDiscardPlayer = null;   //上一个出牌玩家
        this.winner = 0;            //赢家座位号
        this.ante = rule.ante;      //底分
        this.maxRob = 0;            //最大抢地主倍数
        this.chunTianTimes = 1;     //春天倍数
        this.brightCard = 1;        //明牌
        this.allCard = [];          //两人场时第三手牌

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
           if(room.player(uid).isTrusteeship) {
               player.hosting();
           }
           this.players.push(player);
        });
    }

    /***
     * 游戏开始
     */
    begin() {
        this.log('game begin.............');
        this.sendAll(event.gameBegin, {uids: this.uids});
        this.deal();

        let stat = 0;
        if (this.rule.robMode === 0) {
            stat = status.ROB_BANKER;
        } else {
            stat = status.CALL_SCORE;
        }
        this.setTimeout(() => {
            this.changeStatus(stat);
            this.nextTurn();
        }, 2000);
    }

    /***
     * 发牌
     */
    deal() {
        this.log('deal.............');
        let cards = Poker.deal();
        // let cards = Poker.test_deal();
        for (let i = 0; i < 3; ++i) {
            let holds = cards.slice(i * this.dealCount, (i +1) * this.dealCount);
            let player = this.players[i];
            if (!player) {
                this.allCard = holds;
            } else {
                player.holds = holds;
                this.holdsList[i] = holds.slice();
                this.log(`deal ${player.seatId} ${player.holds}`);
                player.send(event.holds, player.holds);
                this.holdsList[i] = cards.slice(i * this.dealCount, (i +1) * this.dealCount);
            }
        }
        //保存地主牌
        this.bankerCards = cards.slice(cards.length - 3, cards.length);
    }

    /***
     * 所有人都不抢地主，重新发牌
     */
    reBegin() {
        this.maxRob = 0;
        this.turn = null;
        for(let i = 0; i < this.players.length; ++i) {
            this.players[i].robScore = null
        }
        this.begin();
    }


    /***
     * 发送地主牌
     */
    dealBankerCards() {
        let banker = this.players[this.banker];
        banker.holds.push.apply(banker.holds, this.bankerCards);
        this.holdsList[this.banker].push.apply(this.holdsList[this.banker], this.bankerCards);

        this.sendAll(event.dealBanker, {
            'banker': this.uids[this.banker],
            'bankerCards': this.bankerCards
        });
    }

    /***
     * 确定地主
     */
    confirmBanker() {
        this.players.forEach((el) => {
            if(el.robScore === this.maxRob){
                this.banker = el.seatId;
            }
        });
    }

    /***
     * 下一个活跃玩家
     */
    nextTurn(seat) {
        if (seat!==undefined) {
            this.turn = seat
        }
        else if(this.turn !== null) {
            this.turn = (this.turn + 1) % this.uids.length;
        }
        else if (this.banker !== null) {
            this.turn = this.banker;
        } else if(this.getLasting().winner !== null && this.getLasting().winner <= this.players.length) {
            this.turn = this.getLasting().winner;
        }
        else {
            this.turn = 0;
        }

        //其他玩家都要不起，出牌权回到自己手中，自由出牌
        if (this.lastDiscardPlayer === this.players[this.turn].seatId) {
            this.lastDiscard = null;
        }
        this.log(`this turn ${this.turn}`);
        this.players[this.turn].changeStatus(this.status);

        this.sendAll(event.turn, {turn: this.uids[this.turn], isFirstDiscard: !this.lastDiscard});
    }

    /***
     * 游戏结束
     */
    async gameOver() {
        //记录这一局赢家，方便下一局使用
        this.getLasting().winnerUid = this.uids[this.winner];
        this.calcScore();

        let loserCard = {}; //剩下的牌
        this.players.forEach(el => {
            if (el.holds.length > 0) {
                loserCard[el.uid] = el.holds;
            }
        });

        //上传分数
        let actualScores = await this.pushScore();

        let msg;
        if (this.players.length === 2) {
            msg = {
                allScore: actualScores,
                loserCard: loserCard,
                allCard: this.allCard
            };
        } else {
            msg = {
                allScore: actualScores,
                loserCard: loserCard,
            };
        }
        this.sendAll(event.gameResult, msg);
        this.log(`game over! msg: ${msg}`);
        console.log(msg);

        this.setTimeout(() => {
            this.end();
        }, 1000);
    }

    /***
     * 计算得分
     */
    calcScore() {
        let banker = this.players[this.banker];
        let bombTimes = 2 ** this.bombCount;
        let chunTianTimes = this.chunTianTimes > 1? 2: 1;

        let baseScore = this.ante * this.maxRob * bombTimes * this.brightCard * chunTianTimes;
        for(let i = 0; i < this.players.length; ++i) {
            let player = this.players[i];
            if (player.uid !== banker.uid) {
                let score = baseScore * player.doubleTimes * banker.doubleTimes;
                //地主赢
                if (banker.seatId === this.winner) {
                    player.score -= score;
                    banker.score += score;
                }
                else {
                    player.score += score;
                    banker.score -= score;
                }
                this.log(`player ${player.seatId} score ${player.score}`);
            }
        }
        this.log(`banker ${banker.seatId} score ${banker.score}`);
    }

    /***
     * 春天判断
     * @returns {number}
     * @constructor
     */
    chunTian() {
        let banker = this.players[this.banker];
        // 地主输
        if (this.banker !== this.winner) {
            if (banker.folds.length === 1) {
                this.chunTianTimes = 4;
            }
        } else {  //地主赢
            for (let i = 0; i < this.players.length; ++i) {
                let player = this.players[i];
                if (player.uid === banker.uid) {
                    continue;
                }
                if (player.folds.length !== 0) {
                    return;
                }
            }
            this.chunTianTimes = 2;
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
            turn: this.status!==status.DOUBLE_SCORE? this.uids[this.turn]: 0,
            status: this.status,
            banker: this.banker!==null? this.uids[this.banker]:0,
            bankerCards: this.banker!==null? this.bankerCards: [],
            maxRob: this.maxRob? this.maxRob * (2 ** this.bombCount): 0,
            lastDiscard: this.lastDiscard!==null? this.lastDiscard:0,
            lastDiscardPlayer: this.lastDiscardPlayer!==null? this.uids[this.lastDiscardPlayer]: 0,
            discardCardsCount: {}
        };

        this.players.forEach(function (el) {
            if (uid === el.uid) {
                msg.players[el.uid] = el.getInfos();
            } else {
                msg.players[el.uid] = el.getOtherInfos();
            }
        }, this);

        this.foldsList.forEach((el) => {
            if(el.cards.length !== 0) {
                el.cards.forEach((c) => {
                    if (msg.discardCardsCount[Poker.cardValue(c)]) {
                        msg.discardCardsCount[Poker.cardValue(c)] ++;
                    }
                    else {
                        msg.discardCardsCount[Poker.cardValue(c)] = 1;
                    }
                })
            }
        });

        this.send(uid, event.gameInfo, msg);
    }

    /***
     * 桌子状态改变
     * @param code
     */
    changeStatus(code) {
        this.log(`table change status: ${code}`);
        this.status = code;
        this.sendAll(event.gameStatus, {status: code});
        switch (code) {
            case status.ROB_BANKER:
                this.players.forEach((player) => {
                    if (player.seatId === this.turn) {
                        player.changeStatus(code)
                    }
                    else {
                        player.changeStatus(status.WAIT)
                    }
                });
                break;
            case status.CALL_SCORE:
                this.players.forEach((player) => {
                    if (player.seatId === this.turn) {
                        player.changeStatus(code)
                    }
                    else {
                        player.changeStatus(status.WAIT)
                    }
                });
                break;
            case status.DOUBLE_SCORE:
                this.dealBankerCards();
                this.players.forEach((player) => {
                    player.changeStatus(code)
                });
                break;
            case status.DISCARD:
                // this.turn = this.banker;
                this.nextTurn(this.banker);
                let banker = this.players[this.banker];
                this.players.forEach((player) => {
                    if (player.seatId === this.turn) {
                        player.status = status.DISCARD;
                        // player.changeStatus(status.DISCARD)
                    }
                    else {
                        player.status = status.WAIT;
                        // player.changeStatus(status.WAIT)
                    }
                });
                break;
        }
    }

    /**
     * 回放数据
     */
    getPlayback() {
        let history = {
            robMode: this.rule.robMode,
            maxRob: this.maxRob,
            robScore: [],
            doubleScore: [],
            banker: this.uids[this.banker],
            bankerCards: this.bankerCards,
            brightCard: this.brightCard,
            uids: this.uids,
            bombCount: this.bombCount,
            allCard: this.allCard,
            holdsList: this.holdsList,
            foldsList: this.foldsList,
            allScore: [],
        };

        this.players.forEach((el, index) => {
            history.allScore[index] = el.score ;
            history.robScore[index] = el.robScore;
            history.doubleScore[index] = el.doubleTimes;
        });

        this.log(history);
        return history;
    }

    log(info) {
        console.log(`table[${this.room.rid}] info：`, info)
    }
}

module.exports = Main;