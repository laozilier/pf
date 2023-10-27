/**
 *
 * 510k游戏
 * Created by t-vick on 2018/9/18.
 */

const Player = require('./Player');
const alg = require('../棋牌算法/13shuiAlgorithm');

const Status = require('../Status').shisanshui;
const gameConfig = require('./config');
const Event = require('./Event');

class Main extends require('../BaseMain') {
    constructor(uids, rule, room) {
        super(room);
        this.rule = rule;

        this.status = Status.BEGIN;

        /**底分*/
        this.ante = rule.ante || 5000;

        this.hasBanker = rule.hasBanker; // 是否带庄玩法

        this.maCard = gameConfig.maCardList[rule.maCard]; // 马牌[0,1,2,3]

        this.maPlayer = [];

        // this.oneMoreColor = rule.onMoreColor; // 加一色
        //
        // this.twoMoreColor = rule.twoMoreColor; // 加两色
        //
        // this.moreCards = 0;
        // if (this.oneMoreColor) {
        //     this.moreCards = 4;
        // }
        //
        // if (this.twoMoreColor) {
        //     this.moreCards = 6;
        // }

        /**
         * 玩家uid列表
         * @type {Array}
         */
        this.uids = uids;

        if (this.uids.length == 5) {
            this.moreCards = 4;
        } else if (this.uids.length == 6) {
            this.moreCards = 6
        } else if (this.uids.length > 6) {
            this.moreCards = 7;
        }

        this.withOutSpecial = rule.withOutSpecial; // todo: 默认有特殊牌型

        this.shootScore = rule.shootScore || 0; // 0打枪翻倍, 1打枪加1，

        this.aValue = 3; // 1 A只当1使用 2 A只当14使用 3 A既能作为1也能作为14

        this.aAllwaysBig = true; // A放在顺子中当1使用的时候，顺子是否只比10JQKA小

        this.algRule = {
            moreCards: this.moreCards,
            withOutSpecial: this.withOutSpecial,
            aValue: this.aValue,
            aAllwaysBig: this.aAllwaysBig
        };

        this.holdsAmount = 13;// todo: 可能会有多三张玩法

        /**保存玩家出的牌,经过转换的*/
        this.foldsList = [];
        /**保存玩家的牌，用来实现战绩回放*/
        this.holdsList = {};

        this.robbers = [];

        //下注底分
        this.bets = [1, 2, 3]; // 玩家下注，选择几倍底分下注

        if (!isNaN(rule.ante)) {
            this.bets = [parseInt(rule.ante), parseInt(rule.ante) * 2, parseInt(rule.ante) * 3];
        }

        /**
         * 庄家uid/上游
         * @type {Number}
         */
        this.zuid = 0; // 上一局的庄走了，需要重新抢庄

        this.zSeatId = -1; // todo: 这是游戏层的seatId不一定对应房间层的seatId
        /**
         * 玩家对象
         * @type {Array}
         */
        this.players = [];

        /**  整局的牌 **/
        this.allCard = undefined;

        // 游戏是否已经结束
        this.isOver = false;

        this.teShuPais = [];

        this.touDaoPais = [];
        this.touDaoPaisResult = [];

        this.zhongDaoPais = [];
        this.zhongDaoPaisResult = [];

        this.weiDaoPais = [];
        this.weiDaoPaisResult = [];

        this.daQiangResult = [];

        this.qunLeiDaResult = null;

        this.teShuPaisResult = [];

        this.compareResult = null;

        this.scoreResult = null;

        //创建玩家
        for (let i = 0; i < uids.length; ++i) {
            let uid = uids[i];
            let player = new Player(this);
            player.bets = this.bets.slice(0, this.bets.length); //保存下注列表
            // todo: 可以通过下列方法获取玩家在房间层中的其他属性，如seatId
            player.isTrusteeship = room.player(uids[i]).isTrusteeship; //托管状态
            player.uid = uid;
            player.seatId = i; // 此seatId不是在房间层的座位号
            this.players.push(player);  //把玩家保存到这个数组
            // uidObj.push(play); //用来发牌排序
        }

        // this.deal();
        // this.begin();
    }

    /**
     * 开始游戏
     */
    begin() {
        this.deal();
        this.sendAll(Event.gameBegin, {
            uids: this.uids
        });

        this.statusChange(Status.BEGIN);

        if (this.hasBanker) {
            //隔一秒后，通知前端抢庄
            this.setTimeout(() => {
                this.statusChange(Status.WAIT_BANKER);
                this.sendAll(Event.pleaseRob, {
                    max: 1 //最大倍数
                });
            }, 1000);
        } else {
            this.startGame();
        }
    }

    bankerEnd(zuid) {
        if (zuid) {
            this.robbers.push(zuid);
        }

        // let isAllRobbed = true;
        for (let p of this.players) {
            if (p.status != 1) {
                return;
            }
        }

        let delayTime = 500;
        if (!this.robbers.length) {
            // 随机指定庄家
            this.zSeatId = Math.floor(Math.random() * this.uids.length);
            this.zuid = this.uids[this.zSeatId];
            this.robbers = this.uids;
            delayTime += 1500;
        } else if (this.robbers.length == 1) {
            this.zuid = this.robbers[0];
            this.zSeatId = this.uids.indexOf(this.zuid);
        } else {
            let zIndex = Math.floor(Math.random() * this.robbers.length);
            this.zuid = this.robbers[zIndex];
            this.zSeatId = this.uids.indexOf(this.zuid);
            delayTime += 1500;
        }
        if (this.zSeatId > -1) {
            this.players[this.zSeatId].status = 2;
            this.players[this.zSeatId].isRob = 1;
            this.players[this.zSeatId].bets = null;
        }

        this.sendAll(Event.randomDeclarering, {uids: this.robbers});
        console.log('<bankerEnd> zSeatId: ', this.zSeatId, ', zuid: ', this.zuid);
        this.setTimeout(() => {
            this.sendAll(Event.randomDeclarer, {decl: this.zuid, uids: this.robbers});
        }, delayTime);

        this.setTimeout(() => {
            this.statusChange(Status.WAIT_BETS);
            for (let p of this.players) {
                p.send(Event.startBet, {bets: this.bets, uid: this.zuid});
            }
        }, delayTime+500);
    }

    /**
     * 玩家每次下注之后调用
     */
    betEnd() {
        //判断是否所有玩家都下注
        for (let i = 0; i < this.players.length; ++i) {
            if (this.zuid === this.players[i].uid)
                continue;
            if (this.players[i].status != 2) {
                return;
            }
        }

        // todo: 下注之后发牌
        this.startGame();
    }

    /**
     * 发牌
     */
    deal() {
        let pokers = alg.getPokers(this.algRule);

        this.allCard = pokers.concat();
        this.players.forEach((player, i) => {
            player.holds = pokers.slice(i * this.holdsAmount, (i + 1) * this.holdsAmount);
            //保存整手牌
            this.holdsList[player.uid] = player.holds.concat();
            if (this.maCard && player.holds.indexOf(this.maCard) > -1) {
                player.hasMaCard = true;
                this.maPlayer.push(player.uid);
            }
            player.recommendations = alg.getRecommendations(player.holds, this.algRule);
            if (Array.isArray(player.recommendations) && player.recommendations.length) {
                let cardsList = [];
                player.recommendations[0].forEach((pattern) => {
                    cardsList.push(pattern.cards.concat());
                });
                player.autoCards = cardsList;
                console.log('autoCards: ', JSON.stringify(cardsList));
                if (cardsList.length == 1) {
                    player.specialPattern = player.recommendations[0];
                }
                // this.chupai(cardsList);
            }
        }, this);
    }


    /**
     * 通知前端开始游戏
     */
    startGame() {
        // todo: 获取推荐牌型，发送推荐牌型可以放到sendHolds中
        this.setTimeout(() => {
            this.players.forEach(player => {
                player.sendHolds();
            });

            this.statusChange(Status.CHU_PAI);
        }, 2000);
    }

    /**
     * 判断当前状态
     * @param s
     * @return {boolean}
     */
    isStatus(s) {
        return (parseInt(s) === this.status);
    }

    /**
     * 计时器
     * @param cb
     */
    schedule(cb) {
        this.clearTimeout(this.timeoutId);
        this.optEndTime = Date.now() + (gameConfig.statusAutoTime[this.status] * 1000);
        let times = gameConfig.statusAutoTime[this.status] * 1000;
        this.timeoutId = this.setTimeout(cb, times);
    }

    /**
     * 获取这一状态还剩多少时间
     */
    getSurplusTime() {
        let t = this.optEndTime - Date.now();
        return t > 0 ? t : 0;
    }

    /**
     * 游戏进入下一状态
     * @param status
     */
    statusChange(status) {
        console.log('<statusChange> status', status);
        this.status = status;
        this.sendAll(Event.gameStatus, {status: status});
        switch (status) {
            case Status.WAIT_BANKER:
                this.schedule(() => {
                    for (let p of this.players) {
                        p.banker(0);
                    }
                });

                //自动操作托管玩家
                this.setTimeout(() => {
                    this.players.forEach((el) => {
                        if (el.isTrusteeship) {
                            el.banker(0);
                        }
                    });
                }, 1000);

                //机器人随机抢庄
                this.players.forEach(el => {
                    if (el.getRobot()) { //机器人随机时间
                        this.setTimeout(() => {
                            // el.setMultiple(el.fourCardsValue >= 7 ? this._robs : 0);
                            // todo: 判断牌的大小决定抢不抢庄，暂时不抢
                            el.banker(0);
                        }, Math.randomRange(500, 2000));
                    }
                });
                break;
            case Status.WAIT_BETS:
                //一定时间后所有玩家自动下注
                this.schedule(() => {
                    this.players.forEach(function (el) {
                        el.setBet(0);
                    });
                });

                //自动操作托管玩家
                this.setTimeout(() => {
                    this.players.forEach((el) => {
                        if (el.isTrusteeship) {
                            el.setBet(0);
                        }
                    }, this);
                }, 1000);

                //机器人随机下注
                this.players.forEach(el => {
                    if (el.getRobot()) { //机器人随机时间
                        this.setTimeout(() => {
                            // el.bet(el.fourCardsValue >= 7 ? 1 : 0);
                            el.setBet(0);
                        }, Math.randomRange(500, 3000));
                    }
                });
                break;
            case Status.CHU_PAI:
                this.schedule(() => {
                    this.players.forEach(function (el) {
                        el.chupai(el.autoCards);
                    });
                });
                //托管玩家直接出牌
                this.setTimeout(() => {
                    this.players.forEach(function (el) {
                        if (el.isTrusteeship) {
                            el.chupai(el.autoCards);
                        }
                    });
                }, 1000);

                //机器人随机出牌
                this.players.forEach(el => {
                    if (el.getRobot()) { //机器人随机时间
                        this.setTimeout(() => {
                            el.chupai(el.autoCards);
                        }, Math.randomRange(1000, 3000));
                    }
                });
                break;
            case Status.BI_PAI:
                this.clearTimeout(this.timeoutId);
                // 设置定时器，到时间自动触发biPaiOver
                let timeSpan = 10000;
                let biPaiList = ['toudao', 'zhongdao', 'weidao', 'daqiang', 'quanleida', 'teshupai'];
                for (let biPai of biPaiList) {
                    if (biPai == 'quanleida') {
                        if (this.compareResult[biPai]) {
                            timeSpan += 1200;
                        }
                    } else if (this.compareResult[biPai].length) {
                        timeSpan += 1200 * this.compareResult[biPai].length;
                    }
                }
                this.gameOverTimer = this.setTimeout(() => {
                    this.calculateResult().then();
                }, timeSpan);
                break;
        }
    }

    /**
     * 开始比牌
     */
    doBiPai() {
        for (let p of this.players) {
            if (p.status != 3) {
                return;
            }
        }

        if (this.hasBanker) {
            this.biPaiZhuang();
        } else {
            this.biPai();
        }

        this.compareResult = {
            toudao: this.touDaoPaisResult,
            zhongdao: this.zhongDaoPaisResult,
            weidao: this.weiDaoPaisResult,
            daqiang: this.daQiangResult,
            quanleida: this.qunLeiDaResult,
            teshupai: this.teShuPaisResult
        };

        // todo: 发送比牌结果给玩家
        this.setTimeout(() => {
            if (this.maCard && this.maPlayer.length) {
                // todo: 先发送马牌玩家,再发送结果
                console.log('<maPlayer> ', this.maPlayer);
                this.sendAll(Event.maPlayer, this.maPlayer);
            }
            this.sendAll(Event.bipai, this.compareResult);
            this.statusChange(Status.BI_PAI);
        }, 1500);

    }

    biPai() {
        // 所有人都理牌完成
        // 开始比牌
        // if (game.touDaoPais.length > 1) {
        //1.头道
        this.biPaiResult("touDaoPais");

        //2.中道
        this.biPaiResult("zhongDaoPais");

        //3.尾道
        this.biPaiResult("weiDaoPais");

        //4.打枪
        let da_qiang_result = [];
        for (let index = 0; index < this.players.length; index++) {
            // if (game.gameSeats[index].userId > 0) {
            let seatData = this.players[index];
            let daQiangResult = {
                daQiangCount: 0,
                daQiangInfo: []
            };
            for (let failIndex in seatData.winIndex) {
                if (seatData.winIndex[failIndex] == 3) {
                    //1.记录打枪次数
                    daQiangResult.daQiangCount++;
                    //2.计算打枪分数变化 多少分
                    let seatData_fail = this.players[failIndex];
                    let shuFen = 1; // 打枪加1
                    if (this.shootScore == 0) {
                        // 打枪加倍
                        shuFen = seatData_fail.shuFen[seatData.seatId];
                    }

                    if (seatData.hasMaCard) {
                        this.recordMaFen(seatData, seatData_fail.seatId, shuFen);
                    }

                    if (seatData_fail.hasMaCard) {
                        this.recordMaFen(seatData_fail, seatData.seatId, -shuFen);
                    }
                    seatData_fail.shuFen[seatData.seatId] += shuFen;
                    seatData.winScore += shuFen;
                    seatData_fail.winScore -= shuFen;
                    //3.保存打枪结果
                    let daQiangInfo = {
                        uid: seatData.uid,
                        seatId: seatData.seatId,
                        fen: shuFen,
                        fenTotal: seatData.winScore,
                        daUser: {
                            uid: seatData_fail.uid,
                            seatId: seatData_fail.seatId,
                            fen: -shuFen,
                            fenTotal: seatData_fail.winScore
                        }
                    };
                    daQiangResult.daQiangInfo.push(daQiangInfo);
                }
            }
            if (daQiangResult.daQiangCount > 0) {
                //打枪数量 打枪详情
                seatData.daQiangCount = daQiangResult.daQiangCount;
                da_qiang_result.push(daQiangResult);
            }
            // }
        }
        if (da_qiang_result.length > 1) {
            da_qiang_result.sort(function (a, b) {
                return a.daQiangCount - b.daQiangCount;
            });
        }

        if (da_qiang_result.length > 0) {
            da_qiang_result.forEach((daQiangResult) => {
                let daQingInfo = daQiangResult.daQiangInfo;
                daQingInfo.forEach((info) => {
                    this.daQiangResult.push(info);
                });
            });
        }
        //5.全垒打
        if (this.uids.length > 3) {
            for (let index = 0; index < this.players.length; index++) {
                let seatData = this.players[index];
                if (seatData.daQiangCount == this.uids.length - 1) {
                    let qunLeiDaResult = {
                        uid: seatData.uid,
                        seatId: seatData.seatId,
                        fen: 0,
                        fenTotal: seatData.winScore,
                        results: []
                    };
                    for (let index_shu = 0; index_shu < this.players.length; index_shu++) {
                        let seatData_fail = this.players[index_shu];
                        if (seatData_fail.uid != seatData.uid) {
                            let shuFen = seatData_fail.shuFen[seatData.seatId];
                            if (seatData.hasMaCard) {
                                this.recordMaFen(seatData, seatData_fail.seatId, shuFen);
                            }

                            if (seatData_fail.hasMaCard) {
                                this.recordMaFen(seatData_fail, seatData.seatId, -shuFen);
                            }
                            seatData.winScore += shuFen;
                            qunLeiDaResult.fen += shuFen;
                            seatData_fail.winScore -= shuFen;
                            let shuData = {
                                uid: seatData_fail.uid,
                                seatId: seatData_fail.seatId,
                                fen: -shuFen,
                                fenTotal: seatData_fail.winScore
                            };
                            qunLeiDaResult.results.push(shuData);
                        }
                    }
                    qunLeiDaResult.fenTotal = seatData.winScore;
                    this.qunLeiDaResult = qunLeiDaResult;
                    return;// 有全垒打就没有特殊牌了
                }
            }
        }
        //6.特殊牌
        this.teShubiPaiResult();
    }

    /**
     * 有马牌的玩家记录对其他玩家的总输赢
     * @param seatDataMa 有马牌的玩家
     * @param seatId 与有马牌玩家对比的玩家再players数组中索引
     * @param wScore 有马牌玩家本次对seatId所属玩家的输赢，带符号
     */
    recordMaFen(seatDataMa, seatId, wScore) {
        if (!seatDataMa.maFen) {
            seatDataMa.maFen = {};
            seatDataMa.maFen[seatId] = wScore;
        } else {
            if (seatDataMa.maFen.hasOwnProperty(seatId)) {
                seatDataMa.maFen[seatId] += wScore;
            } else {
                seatDataMa.maFen[seatId] = wScore;
            }
        }
    }

    /**
     * 比牌
     * @param game
     * @param bi_pai_type_name 比牌对象名称
     */
    biPaiResult(bi_pai_type_name) {
        let bi_pais = JSON.parse(JSON.stringify(this[bi_pai_type_name]));
        bi_pais.sort(function (a, b) {
            return a.value - b.value;
        });
        this.players.forEach(function (sd) {
            sd.roundWinFen = 0;
            sd.roundWinFenExt = 0;
        });
        //1.算分 todo:有马牌要翻倍
        for (let index_win = bi_pais.length - 1; index_win > -1; index_win--) {
            for (let index_fail = index_win - 1; index_fail > -1; index_fail--) {
                if (bi_pais[index_win].value > bi_pais[index_fail].value) {// todo: 有可能打和
                    let seatData_win = this.players[bi_pais[index_win].seatId];
                    let seatData_fail = this.players[bi_pais[index_fail].seatId];
                    // todo: 如果比牌双方都有马牌怎么办？
                    let wScore = bi_pais[index_win].scoreBig;
                    // if (seatData_win.hasMaCard || seatData_fail.hasMaCard) {
                    //     wScore *= 2;
                    // }
                    // todo: 有马牌的一方记录，对其他每一个玩家的输赢
                    if (seatData_win.hasMaCard) {
                        this.recordMaFen(seatData_win, seatData_fail.seatId, wScore);
                    }

                    if (seatData_fail.hasMaCard) {
                        this.recordMaFen(seatData_fail, seatData_win.seatId, -wScore);
                    }
                    seatData_win.winScore += wScore;
                    seatData_win.roundWinFen += wScore;
                    seatData_win.roundWinFenExt += bi_pais[index_win].scoreExt;

                    if (!seatData_win.winIndex) {
                        seatData_win.winIndex = {}; // winIndex中保存着每个被seatData_win玩家赢的玩家输给seatData_win的道数
                        seatData_win.winIndex[seatData_fail.seatId] = 1;
                    } else {
                        if (seatData_win.winIndex.hasOwnProperty(seatData_fail.seatId)) {
                            seatData_win.winIndex[seatData_fail.seatId]++;
                        } else {
                            seatData_win.winIndex[seatData_fail.seatId] = 1;
                        }
                    }
                    seatData_fail.winScore -= wScore;
                    seatData_fail.roundWinFen -= wScore;
                    seatData_fail.roundWinFenExt -= bi_pais[index_win].scoreExt;


                    if (!seatData_fail.shuFen) {
                        seatData_fail.shuFen = {};
                        seatData_fail.shuFen[seatData_win.seatId] = wScore;
                    } else {
                        if (seatData_fail.shuFen.hasOwnProperty(seatData_win.seatId)) {
                            seatData_fail.shuFen[seatData_win.seatId] += wScore;
                        } else {
                            seatData_fail.shuFen[seatData_win.seatId] = wScore;
                        }
                    }
                }
            }
        }
        //2.保存算分结果
        let biPaiResultKey = bi_pai_type_name + "Result";
        for (let i = 0; i < bi_pais.length; i++) {
            let seatData = this.players[bi_pais[i].seatId];
            let deFenResult = {
                uid: seatData.uid,
                seatId: seatData.seatId,
                cards: bi_pais[i].cards.concat(),
                pattern: bi_pais[i].pattern,
                value: bi_pais[i].value,
                fen: seatData.roundWinFen,// 本轮得分
                fenExt: seatData.roundWinFenExt,// 本轮额外得分
                fenTotal: seatData.winScore,// 本局目前得分
                // total: 0 // 总得分
            };
            seatData.rest.push({cards: deFenResult.cards.concat(), getScore: deFenResult.fen});
            this[biPaiResultKey].push(deFenResult);
        }
    }


    /**
     * 特殊牌比牌
     * @param game
     */
    teShubiPaiResult() {
        if (!this.teShuPais.length) {
            return;
        }
        let bi_pais = JSON.parse(JSON.stringify(this.teShuPais));
        if (bi_pais.length > 1) {
            bi_pais.sort(function (a, b) {
                return a.value - b.value;
            });
        }
        this.players.forEach(function (sd) {
            sd.roundWinFen = 0;
            sd.roundWinFenExt = 0;
        });
        //1.算分 todo: 马牌翻倍
        for (let index_win = 0; index_win < bi_pais.length; index_win++) {
            let seatData_win = this.players[bi_pais[index_win].seatId];
            let biPaiResult = {
                uid: seatData_win.uid,
                seatId: seatData_win.seatId,
                fen: 0,
                cards: bi_pais[index_win].cards.concat(),
                pattern: bi_pais[index_win].pattern,
                value: bi_pais[index_win].value,
                fenTotal: seatData_win.winScore,
                results: []
            };
            for (let index_fail = 0; index_fail < this.players.length; index_fail++) {
                let seatData_fail = this.players[index_fail];
                if (seatData_win.chuPaiPattern[0].value > seatData_fail.chuPaiPattern[0].value) {
                    // 算马牌翻倍
                    let wScore = bi_pais[index_win].scoreBig;
                    if (seatData_win.hasMaCard || seatData_fail.hasMaCard) {
                        wScore *= 2;
                    }
                    biPaiResult.fen += wScore;
                    biPaiResult.fenTotal += wScore;
                    seatData_win.winScore += wScore;
                    seatData_win.roundWinFen += wScore;
                    seatData_win.roundWinFenExt += bi_pais[index_win].scoreExt;

                    seatData_fail.winScore -= wScore;
                    seatData_fail.roundWinFen -= wScore;
                    seatData_fail.roundWinFenExt -= bi_pais[index_win].scoreExt;

                    // todo: 有马牌的一方记录，对其他每一个玩家的输赢
                    // if (seatData_win.hasMaCard) {
                    //     this.recordMaFen(seatData_win, seatData_fail.seatId, wScore);
                    // }
                    //
                    // if (seatData_fail.hasMaCard) {
                    //     this.recordMaFen(seatData_fail, seatData_win.seatId, -wScore);
                    // }

                    let shuResult = {
                        uid: seatData_fail.uid,
                        seatId: seatData_fail.seatId,
                        fen: seatData_fail.roundWinFen,
                        fenTotal: seatData_fail.winScore
                    };
                    biPaiResult.results.push(shuResult);
                }
            }
            seatData_win.rest.push({cards: biPaiResult.cards.concat(), getScore: biPaiResult.fen});
            this.teShuPaisResult.push(biPaiResult);
        }
    }

    /**
     * 比牌处理逻辑
     * @param game
     */
    biPaiZhuang() {
        //1.头道
        this.biPaiResultZhuang("touDaoPais");

        //2.中道
        this.biPaiResultZhuang("zhongDaoPais");

        //3.尾道
        this.biPaiResultZhuang("weiDaoPais");

        //4.打枪
        let seatDataZhuang = this.players[this.zSeatId];
        let da_qiang_result = [];
        for (let index = 0; index < this.players.length; index++) {
            // if (game.gameSeats[index].userId > 0) {
            let seatData = this.players[index];
            let daQiangResult = {
                daQiangCount: 0,
                daQiangInfo: []
            };
            if (seatData.hasOwnProperty('winIndex')) {
                for (let failIndex in seatData.winIndex) {
                    if (seatData.winIndex[failIndex] == 3) {
                        //1.记录打枪次数
                        daQiangResult.daQiangCount++;
                        //2.计算打枪分数变化 多少分
                        let seatData_fail = this.players[failIndex];
                        let shuFen = 1; // 打枪加1
                        if (this.shootScore == 0) {
                            // 打枪加倍
                            shuFen = seatData_fail.shuFen[seatData.seatId];
                        }

                        if (seatData.hasMaCard) {
                            this.recordMaFen(seatData, seatData_fail.seatId, shuFen);
                        }

                        if (seatData_fail.hasMaCard) {
                            this.recordMaFen(seatData_fail, seatData.seatId, -shuFen);
                        }

                        seatData_fail.shuFen[seatData.seatId] += shuFen;
                        seatData.winScore += shuFen;
                        seatData_fail.winScore -= shuFen;
                        //3.保存打枪结果
                        let daQiangInfo = {
                            uid: seatData.uid,
                            seatId: seatData.seatId,
                            fen: shuFen,
                            fenTotal: seatData.winScore,
                            daUser: {
                                uid: seatData_fail.uid,
                                seatId: seatData_fail.seatId,
                                fen: -shuFen,
                                fenTotal: seatData_fail.score
                            }
                        };
                        daQiangResult.daQiangInfo.push(daQiangInfo);

                        if (failIndex == this.zSeatId) {
                            if (!seatDataZhuang.hasOwnProperty('beiDaCount')) {
                                seatDataZhuang.beiDaCount = 1;
                            } else {
                                seatDataZhuang.beiDaCount++;
                            }
                        }
                    }
                }
            }

            if (daQiangResult.daQiangCount > 0) {
                //打枪数量 打枪详情
                seatData.daQiangCount = daQiangResult.daQiangCount;
                da_qiang_result.push(daQiangResult);
            }
            // }
        }
        if (da_qiang_result.length > 1) {
            da_qiang_result.sort(function (a, b) {
                return a.daQiangCount - b.daQiangCount;
            });
        }
        // game.daQiangResult = [];
        if (da_qiang_result.length > 0) {
            da_qiang_result.forEach((daQiangResult) => {
                let daQingInfo = daQiangResult.daQiangInfo;
                daQingInfo.forEach((info) => {
                    this.daQiangResult.push(info);
                });
            });
        }

        // 带庄模式没有全垒打

        // 庄全输
        // let zhuangQuanShu = [];
        //
        // if (seatDataZhuang.beiDaCount == 3) {
        //     let result_zhuang = {
        //         uid: seatDataZhuang.uid,
        //         seatId: seatDataZhuang.seatId,
        //         fen: 0,
        //         fenTotal: seatDataZhuang.winScore
        //     };
        //     for (let index_sd = 0; index_sd < this.players.length; index_sd++) {
        //         let seatData = this.players[index_sd];
        //         if ( seatData.seatId != this.zSeatId) {
        //             let yingFen = seatDataZhuang.shuFen[seatData.seatId];
        //             seatData.winScore += yingFen;
        //             seatDataZhuang.winScore -= yingFen;
        //             result_zhuang.fenTotal -= yingFen;
        //             result_zhuang.fen -= yingFen;
        //             let result = {
        //                 uid: seatData.uid,
        //                 seatId: seatData.seatId,
        //                 fen: yingFen,
        //                 fenTotal: seatData.winScore
        //             };
        //
        //             zhuangQuanShu.push(result);
        //         }
        //     }
        //     this.qunLeiDaResult = {
        //         uid: seatDataZhuang.uid,
        //         seatId: seatDataZhuang.seatId,
        //         fen: result_zhuang.fen,
        //         fenTotal: seatDataZhuang.winScore,
        //         results: zhuangQuanShu
        //     };
        //     return;// 有全垒打就没有特殊牌比较了
        // }
        //
        // //5.全垒打
        // // game.qunLeiDaResult = null;
        // if (seatDataZhuang.daQiangCount == 3) {
        //     let qunLeiDaResult = {
        //         uid: seatDataZhuang.uid,
        //         seatId: seatDataZhuang.seatId,
        //         fen: 0,
        //         fenTotal: seatDataZhuang.winScore,
        //         results: []
        //     };
        //     for (let index_shu = 0; index_shu < this.players.length; index_shu++) {
        //         let seatData_fail = this.players[index_shu];
        //         if (seatData_fail.uid != seatDataZhuang.uid) {
        //             let shuFen = seatData_fail.shuFen[seatDataZhuang.seatId];
        //             seatDataZhuang.winScore += shuFen;
        //             seatData_fail.winScore -= shuFen;
        //             qunLeiDaResult.fen += shuFen;
        //             qunLeiDaResult.fenTotal += shuFen;
        //             let shuData = {
        //                 uid: seatData_fail.uid,
        //                 seatId: seatData_fail.seatId,
        //                 fen: -shuFen,
        //                 fenTotal: seatData_fail.winScore
        //             };
        //             qunLeiDaResult.results.push(shuData);
        //         }
        //     }
        //     this.qunLeiDaResult = qunLeiDaResult;
        //     return;
        // }
        //6.特殊牌
        this.teShubiPaiResultZhuang();

    }

    /**
     * 比牌
     * @param game
     * @param bi_pai_type_name 比牌对象名称
     */
    biPaiResultZhuang(bi_pai_type_name) {
        let bi_pais = JSON.parse(JSON.stringify(this[bi_pai_type_name]));
        bi_pais.sort(function (a, b) {
            return a.value - b.value;
        });
        this.players.forEach(function (sd) {
            sd.roundWinFen = 0;
            sd.roundWinFenExt = 0;
        });

        let index_zhuang = -1;
        for (let index_sd = bi_pais.length - 1; index_sd > -1; index_sd--) {
            let sd = bi_pais[index_sd];
            if (sd.uid == this.zuid) {
                index_zhuang = index_sd;
                break;
            }
        }

        // todo: 带庄模式，普通牌型，牌值相同时，庄为大，不比花色，都为同类型特殊牌型时闲为大

        // 算分/庄为普通牌型
        if (index_zhuang != -1) {
            let bi_pais_zhuang = bi_pais[index_zhuang];
            let seatDataZhuang = this.players[this.zSeatId];
            // 庄输分
            for (let index_win = bi_pais.length - 1; index_win > index_zhuang; index_win--) {
                if (bi_pais[index_win].value > bi_pais_zhuang.value) {
                    let seatData_win = this.players[bi_pais[index_win].seatId];
                    // 算马牌翻倍
                    // todo: 带庄模式再乘以玩家选择的倍率
                    // let wScore = bi_pais[index_win].scoreBig * seatData_win.bet;
                    let wScore = bi_pais[index_win].scoreBig;
                    // if (seatData_win.hasMaCard || seatDataZhuang.hasMaCard) {
                    //     wScore *= 2;
                    // }
                    // todo: 有马牌的一方记录，对其他每一个玩家的输赢
                    if (seatData_win.hasMaCard) {
                        this.recordMaFen(seatData_win, seatDataZhuang.seatId, wScore);
                    }

                    if (seatDataZhuang.hasMaCard) {
                        this.recordMaFen(seatDataZhuang, seatData_win.seatId, -wScore);
                    }
                    seatData_win.winScore += wScore;
                    seatData_win.roundWinFen += wScore;
                    seatData_win.roundWinFenExt += bi_pais[index_win].scoreExt;
                    if (!seatData_win.winIndex) {
                        seatData_win.winIndex = {};
                        seatData_win.winIndex[seatDataZhuang.seatId] = 1;
                    } else {
                        if (seatData_win.winIndex.hasOwnProperty(seatDataZhuang.seatId)) {
                            seatData_win.winIndex[seatDataZhuang.seatId]++;
                        } else {
                            seatData_win.winIndex[seatDataZhuang.seatId] = 1;
                        }
                    }

                    seatDataZhuang.winScore -= wScore;
                    seatDataZhuang.roundWinFen -= wScore;
                    seatDataZhuang.roundWinFenExt -= bi_pais[index_win].scoreExt;
                    if (!seatDataZhuang.shuFen) {
                        seatDataZhuang.shuFen = {};
                        seatDataZhuang.shuFen[seatData_win.seatId] = wScore;
                    } else {
                        if (seatDataZhuang.shuFen.hasOwnProperty(seatData_win.seatId)) {
                            seatDataZhuang.shuFen[seatData_win.seatId] += wScore;
                        } else {
                            seatDataZhuang.shuFen[seatData_win.seatId] = wScore;
                        }
                    }
                }
            }
            // 庄赢分
            for (let index_fail = index_zhuang - 1; index_fail > -1; index_fail--) {
                if (bi_pais_zhuang.value >= bi_pais[index_fail].value) { // 牌值相等的时候，庄赢
                    let seatData_fail = this.players[bi_pais[index_fail].seatId];
                    // 算马牌翻倍
                    // todo: 带庄模式再乘以玩家选择的倍率
                    // let wScore = bi_pais_zhuang.scoreBig * seatData_fail.bet;
                    let wScore = bi_pais_zhuang.scoreBig;
                    // if (seatData_fail.hasMaCard || seatDataZhuang.hasMaCard) {
                    //     wScore *= 2;
                    // }
                    // todo: 有马牌的一方记录，对其他每一个玩家的输赢
                    if (seatDataZhuang.hasMaCard) {
                        this.recordMaFen(seatDataZhuang, seatData_fail.seatId, wScore);
                    }

                    if (seatData_fail.hasMaCard) {
                        this.recordMaFen(seatData_fail, seatDataZhuang.seatId, -wScore);
                    }
                    seatDataZhuang.winScore += wScore;
                    seatDataZhuang.roundWinFen += wScore;
                    seatDataZhuang.roundWinFenExt += bi_pais_zhuang.scoreExt;
                    if (!seatDataZhuang.winIndex) {
                        seatDataZhuang.winIndex = {};
                        seatDataZhuang.winIndex[seatData_fail.seatId] = 1;
                    } else {
                        if (seatDataZhuang.winIndex.hasOwnProperty(seatData_fail.seatId)) {
                            seatDataZhuang.winIndex[seatData_fail.seatId]++;
                        } else {
                            seatDataZhuang.winIndex[seatData_fail.seatId] = 1;
                        }
                    }

                    seatData_fail.winScore -= wScore;
                    seatData_fail.roundWinFen -= wScore;
                    seatData_fail.roundWinFenExt -= bi_pais_zhuang.scoreExt;
                    if (!seatData_fail.shuFen) {
                        seatData_fail.shuFen = {};
                        seatData_fail.shuFen[seatDataZhuang.seatId] = wScore;
                    } else {
                        if (seatData_fail.shuFen.hasOwnProperty(seatDataZhuang.seatId)) {
                            seatData_fail.shuFen[seatDataZhuang.seatId] += wScore;
                        } else {
                            seatData_fail.shuFen[seatDataZhuang.seatId] = wScore;
                        }
                    }
                }
            }
        }

        //2.保存算分结果
        let biPaiResultKey = bi_pai_type_name + "Result";
        for (let i = 0; i < bi_pais.length; i++) {
            let seatData = this.players[bi_pais[i].seatId];
            let deFenResult = {
                uid: seatData.uid,
                seatId: seatData.seatId,
                cards: bi_pais[i].cards.concat(),
                pattern: bi_pais[i].pattern,
                value: bi_pais[i].value,
                fen: seatData.roundWinFen,// 本轮得分
                fenExt: seatData.roundWinFenExt,// 本轮额外得分
                fenTotal: seatData.winScore// 本局目前得分
            };
            this[biPaiResultKey].push(deFenResult);
            seatData.rest.push({cards: deFenResult.cards.concat(), getScore: deFenResult.fen});
        }
    }

    /**
     * 特殊牌比牌
     * @param game
     */
    teShubiPaiResultZhuang() {
        if (!this.teShuPais.length) {
            return;
        }
        let bi_pais = JSON.parse(JSON.stringify(this.teShuPais));
        if (bi_pais.length > 1) {
            bi_pais.sort(function (a, b) {
                return a.value - b.value;
            });
        }
        this.players.forEach(function (sd) {
            sd.roundWinFen = 0;
            sd.roundWinFenExt = 0;
        });

        let seatDataZhuang = this.players[this.zSeatId];
        //1.算分
        for (let index_win = 0; index_win < bi_pais.length; index_win++) {
            let seatData_win = this.players[bi_pais[index_win].seatId];
            let biPaiResult = {
                uid: seatData_win.uid,
                seatId: seatData_win.seatId,
                fen: 0,
                cards: bi_pais[index_win].cards.concat(),
                pattern: bi_pais[index_win].pattern,
                value: bi_pais[index_win].value,
                fenTotal: seatData_win.winScore,
                results: []
            };

            // 庄家为当前特殊牌
            if (seatData_win.uid == seatDataZhuang.uid) {
                for (let index_fail = 0; index_fail < this.players.length; index_fail++) {
                    let seatData_fail = this.players[index_fail];
                    if (seatData_fail.uid != seatDataZhuang.uid && seatData_win.chuPaiPattern[0].value > seatData_fail.chuPaiPattern[0].value) {
                        // 算马牌翻倍
                        // let wScore = bi_pais[index_win].scoreBig * seatData_fail.bet;
                        let wScore = bi_pais[index_win].scoreBig;
                        if (seatData_win.hasMaCard || seatData_fail.hasMaCard) {
                            wScore *= 2;
                        }
                        // todo: 有马牌的一方记录，对其他每一个玩家的输赢
                        // if (seatDataZhuang.hasMaCard) {
                        //     this.recordMaFen(seatDataZhuang, seatData_fail.seatId, wScore);
                        // }
                        //
                        // if (seatData_fail.hasMaCard) {
                        //     this.recordMaFen(seatData_fail, seatDataZhuang.seatId, -wScore);
                        // }
                        biPaiResult.fen += wScore;
                        biPaiResult.fenTotal += wScore;
                        seatData_win.winScore += wScore;
                        seatData_win.roundWinFen += wScore;
                        seatData_win.roundWinFenExt += bi_pais[index_win].scoreExt;

                        seatData_fail.winScore -= wScore;
                        seatData_fail.roundWinFen -= wScore;
                        seatData_fail.roundWinFenExt -= bi_pais[index_win].scoreExt;
                        let shuResult = {
                            uid: seatData_fail.uid,
                            seatId: seatData_fail.seatId,
                            fen: seatData_fail.roundWinFen,
                            fenTotal: seatData_fail.winScore
                        };
                        biPaiResult.results.push(shuResult);
                    } else {
                        // todo: 闲家赢
                    }
                }
            } else {
                let seatData_fail = seatDataZhuang;
                // 特殊牌型值相等，闲家赢
                if (seatData_win.chuPaiPattern[0].value >= seatData_fail.chuPaiPattern[0].value) {
                    // 算马牌翻倍
                    // let wScore = bi_pais[index_win].scoreBig * seatData_win.bet;
                    let wScore = bi_pais[index_win].scoreBig;
                    // if (seatData_win.hasMaCard || seatData_fail.hasMaCard) {
                    //     wScore *= 2;
                    // }
                    // todo: 有马牌的一方记录，对其他每一个玩家的输赢
                    if (seatData_win.hasMaCard) {
                        this.recordMaFen(seatData_win, seatData_fail.seatId, wScore);
                    }

                    if (seatData_fail.hasMaCard) {
                        this.recordMaFen(seatData_fail, seatData_win.seatId, -wScore);
                    }
                    biPaiResult.fen += wScore;
                    biPaiResult.fenTotal += wScore;
                    seatData_win.winScore += wScore;
                    seatData_win.roundWinFen += wScore;
                    seatData_win.roundWinFenExt += bi_pais[index_win].scoreExt;

                    seatData_fail.winScore -= wScore;
                    seatData_fail.roundWinFen -= wScore;
                    seatData_fail.roundWinFenExt -= bi_pais[index_win].scoreExt;
                    let shuResult = {
                        uid: seatData_fail.uid,
                        seatId: seatData_fail.seatId,
                        fen: seatData_fail.roundWinFen,
                        fenTotal: seatData_fail.winScore
                    };
                    biPaiResult.results.push(shuResult);
                }
            }
            seatData_win.rest.push({cards: biPaiResult.cards.concat(), getScore: biPaiResult.fen});
            this.teShuPaisResult.push(biPaiResult);
        }
    }

    /**
     * 计算结果
     * @param winId 胜利的玩家的座位id
     */
    async calculateResult() {
        if (this.isOver) {
            return;
        }
        clearTimeout(this.gameOverTimer);

        this.isOver = true;

        this.statusChange(Status.END);

        //计算玩家得分
        this.calScore();
        //记录这一局第一名，方便下一局使用
        // this.getLasting().winnerUid = this.winner.uid;
        // todo: 记录庄

        //上传分数
        let actualScores = await this.pushScore();
        // todo: 把patternCards加到result中去
        let result = {
            allScore: actualScores,
            resultCards: {}
        };

        for (let p of this.players) {
            // result.resultCards[p.uid] = p.patternCards;
            result.resultCards[p.uid] = p.rest;
        }

        // todo:完善result断线重连的玩家直接看结果
        this.scoreResult = result;
        this.sendAll(Event.gameResult, result);
        this.end();
    }

    /**
     * 计算结果得分
     * @param winId
     */
    calScore(winId) {
        for (let p of this.players) {
            if (p.hasMaCard) {
                for (let seatIndex in p.maFen) {
                    let fen = p.maFen[seatIndex];
                    let pp = this.players[seatIndex];
                    p.winScore += fen;
                    pp.winScore -= fen;
                    console.log('<maFen> ', -fen);
                }
            }
        }
        let xianTotal = 0;
        for (let p of this.players) {
            // p.score += p.winScore * this.ante; // winScore只是游戏分，并不是最终的金币
            if (this.hasBanker) {
                // todo: 每个玩家赢多少金币

                // todo: 算闲家总共赢多少金币
                // todo: 庄家总输金币等于玩家总赢
                if (!p.isBanker()) {
                    p.score += p.winScore * p.bet;
                    xianTotal += p.winScore * p.bet;
                }
            } else {
                p.score += p.winScore * this.ante;
            }
        }

        if (this.hasBanker) {
            console.log('<zSeatId>',this.zSeatId);
            let zPlayer = this.players[this.zSeatId];
            zPlayer.score -= xianTotal;
        }
    }

    /**
     * 回放数据
     */
    getPlayback() {
        //历史记录
        let history = {
            zuid: this.zuid,
            uids: this.uids,
            // bombCount: this.bombCount,
            holdsList: [],
            foldsList: [],
            allScore: [],
            lastHolds: [],
            allCard: this.allCard
        };

        //计算分数
        let allScore = {};
        let loserCard = {}; //剩下的牌
        this.players.forEach(el => {
            allScore[el.uid] = el.score;
            if (el.holds.length > 0) {
                loserCard[el.uid] = el.holds;
            }
        });

        let index = 0;
        this.foldsList.forEach((el) => {
            index = this.uids.indexOf(parseInt(el.uid));
            history.foldsList.push({index: index, cards: el.cards, type: el.type});
        }, this);
        for (let uid in this.holdsList) {
            index = this.uids.indexOf(parseInt(uid));
            history.holdsList[index] = this.holdsList[uid];
        }
        for (let uid in allScore) {
            index = this.uids.indexOf(parseInt(uid));
            history.allScore[index] = allScore[uid];
        }
        this.players.forEach((el) => {
            // history.lastHolds.push(el.holds);
            history.lastHolds.push(el.rest);
        });
        return history;
    }

    /**
     * 获取游戏信息
     */
    getInfo(uid) {
        uid = parseInt(uid);
        let msg = {
            status: this.status,
            hasBanker: this.hasBanker,
            zuid: this.zuid,
            uids: this.uids,                        //当前游戏中的玩家
            players: {},
            robbers: this.robbers,
            surplusTime: this.getSurplusTime(), //这一状态剩下的时间
            maCard: this.maCard,
            compareResult: this.compareResult,// 比牌结果
            scoreResult: this.scoreResult// 输赢结果
        };

        this.players.forEach(function (el) {
            if (uid === el.uid) {
                msg.players[el.uid] = el.getInfos();
            } else {
                msg.players[el.uid] = el.getOtherInfos();
            }
        }, this);

        this.send(uid, Event.gameInfo, msg);
    }
}

module.exports = Main;