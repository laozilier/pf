/**
 * Created by sam on 2020/6/3.
 *
 */

const Player = require('./Player');
const Status = require('./const').status;
const Event = require('./event');
const Conf = require('./config');
const Shuffle = require('../../common/shuffle');

class Main extends require('../../BaseMain') {
    constructor(uids, rule, room) {
        super(room);
        this.uids = uids;               //玩家uid列表
        this.rule = rule;
        this.ante = rule.ante;          //底分
        this.props = [1,2,3,4,5,6,7,8];
        this.muls = [2,4,5,8,10,15,20,25];
        this.idxs = [0,5,103,1,2,7,106,0,1,103,105,6,4,3,1,2,8,106,102,1,3,104];

        this.leftTime = 0;
        this.finalPropId = -1;
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

    /***
     * 游戏开始
     */
    async begin() {
        this.log('game begin.............');
        this.changeStatus(Status.BEGIN);
        this.sendAll(Event.gameBegin, {uids: this.uids});
        this.players.forEach((player) => {
            /** 推送托管状态 */
            this.sendAll(Event.tuoGuang, [player.uid, player.isTrusteeship]);
        });

        this.sendAll(Event.poolScore, {poolScore: POOLSCORE.score});

        this.setTimeout(()=> {
            /** 下注 */
            this.changeStatus(Status.BET);
        });
    }

    async playerBet(player, data) {
        this.log(`uid = ${player.uid}, data = '${JSON.stringify(data)}'`);
        if (this.status != Status.BET) {
            player.send(Event.toast, '当前状态不能下注');
            return false;
        }

        if (!Array.isArray(data) || data.length == 0) {
            player.send(Event.toast, '下注数据错误');
            return false;
        }

        let score = 0;
        data.forEach(bet=> {
            let mul = bet.mul;
            score+=(this.ante)*mul;
        });

        let roomPlayer = this.room.player(player.uid);
        if (score > roomPlayer.getActualScore()) {
            player.send(Event.toast, '下注失败，分数不足');
            return false;
        }

        player.score -= score;
        POOLSCORE.score += score;
        this.sendAll(Event.poolScore, {poolScore: POOLSCORE.score});

        return true;
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
        this.status = code;
        this.sendAll(Event.gameStatus, {status: code});
        if (this.status == Status.BET) {
            this.leftTime = Date.now()+Conf.betTime;
            this.setTimeout(()=> {
                this.changeStatus(Status.GAME);
            }, Conf.betTime);
        }

        if (this.status == Status.GAME) {
            this.leftTime = Date.now()+Conf.gameTime;
            /** 根据玩家下注 当前奖池 算出每个玩家可以中哪些奖 */
            let poolScore = POOLSCORE.score*0.9;
            /** 获取所有下注数据 */
            let maps = {};
            this.players.forEach(el=> {
                !!el.betData && el.betData.forEach(bet=> {
                    let pid = bet.id;
                    let mul = bet.mul;
                    if (maps[pid] == undefined) {
                        maps[pid] = mul;
                    } else {
                        maps[pid] += mul;
                    }
                });
            });

            this.log(`poolScore = ${poolScore}`);
            this.log(`maps = ${JSON.stringify(maps)}`);

            let canIdxs = [];
            for (let i = 0; i < this.idxs.length; i++) {
                let pid = this.idxs[i];
                if (pid == 0) {
                    canIdxs.push(i);
                    continue;
                }

                let needDouble = false;
                if (pid > 100) {
                    pid = pid%100;
                    needDouble = true;
                }

                let mul = maps[pid];
                if (mul == undefined) {
                    canIdxs.push(i);
                    continue;
                }

                let total = this.ante*mul*this.muls[this.props.indexOf(pid)];
                if (needDouble) {
                    total *= 2;
                }

                if (total < poolScore) {
                    canIdxs.push(i);
                }
            }

            Shuffle.knuthDurstenfeldShuffle(canIdxs);
            this.log(`canIdxs = ${canIdxs}`);
            this.finalIdx = canIdxs[0];
            this.finalPropId = this.idxs[this.finalIdx]%100;
            /** 将中奖道具发给玩家 */
            let result = {idx: this.finalIdx, prop: this.finalPropId};
            this.sendAll(Event.reward, result);
            this.getLasting().results.unshift(result);
            if (this.getLasting().results.length > 20) {
                this.getLasting().results.pop();
            }

            this.setTimeout(()=> {
                this.gameOver();
            }, Conf.gameTime);
        }
    }

    /**
     * 游戏结束
     */
    gameOver() {
        if (this._gameEnd) {
            return;
        }

        this.changeStatus(Status.SETTLE);
        this._gameEnd = true;
        /** 计算输赢分数 */
        this.players.forEach(el=> {
            !!el.betData && el.betData.forEach(bet=> {
                let pid = bet.id;
                let mul = bet.mul;
                if (this.finalPropId == pid) {
                    let score = this.ante*mul*this.muls[this.props.indexOf(pid)];
                    let idxPid = this.idxs[this.finalIdx];
                    if (idxPid > 100) {
                        score *= 2;
                    }

                    el.score+=score;
                    POOLSCORE.score-=score;
                }
            });
        });

        this.setTimeout(()=> {
            this.calculateResult();
        }, 2000);
    }

    /**
     * 计算结果
     */
    async calculateResult() {
        /** 上传分数 */
        let actualScores = await this.pushScore();
        let msg = {
            allScore: actualScores,
            poolScore: POOLSCORE.score
        };

        this.sendAll(Event.gameResult, msg);
        this.end();
    }

    /**
     * 玩家主动托管
     * @param player
     */
    checkPlayerIsTrusteeship(player) {

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
     * 获取游戏信息
     */
    getInfo(uid) {
        uid = parseInt(uid);
        let msg = {
            uids: this.uids,                        //当前游戏中的玩家
            poolScore: POOLSCORE.score,
            status: this.status,
            idx: this.finalIdx,
            prop: this.finalPropId,
            results: this.getLasting().results,
            leftTime: Math.floor((this.leftTime-Date.now())/1000),
            players: {},
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
        };

        this.players.forEach((player, index) => {
            history[player.uid] = {
                score: player.score
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