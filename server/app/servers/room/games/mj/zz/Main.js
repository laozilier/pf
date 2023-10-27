/**
 *
 * 作者：THB
 * 创建时间：2019/8/13
 */
const BaseMain = require("../../BaseMain");
const Player = require('./Player');
const mjEvent = require('../mjEvent');
const shuffle = require('../../common/shuffle');
const ZZHuLogin = require('./ZZHuLogin');
const ZZRule = require('./ZZRule');
const huLogin = require('./ZZHuLogin');
const mjConst = require('../mjConst');
const mahjongConst = require('../mjConst');

/**
 * 打麻将为一个递归过程
 * 1.摸牌，判断自己杠、胡（如果杠->步骤5；如果胡->步骤6；无操作->步骤3）
 * 2.判断自己杠、胡（这里有分支，如果开杠->步骤5；如果胡->步骤6；无操作->步骤3），
 * 3.出牌，其他玩家碰、杠、胡检查（这里有分支；碰->步骤4；杠->步骤5；胡->步骤6）
 * 4.碰，如果碰->步骤3
 * 5.杠，检查其他玩家是否抢杠胡，有抢杠胡->步骤7；无抢杠胡->步骤1
 * 6.胡
 */
class Main extends BaseMain {
    constructor(uids, rule, room) {
        super(room);
        /**@type {ZZRule}*/
        this.rule = new ZZRule(rule);
        this.uids = uids;
        this.bankerUid = this.uids[0]; // 庄家uid
        this.turn = 0;                // 当前操作玩家坐位号
        this.allMahjongs = [];        // 整副麻将牌
        this.mahjongIndex = 0;        // 摸牌位置
        this.recordDiscard = undefined;     // 记录打出的牌，{uid:123456, card:1}
        this.robKongHu = false;   //触发杠胡，如果杠胡的玩家选择过，则开杠的玩家接着摸牌
        this.gameOver = false;        //游戏结束

        this.huPlayers = [];         //胡牌玩家数组 保存player对象
        this.paoPlayer = undefined; //放炮玩家

        this.initMember(); //初始化成员变量
    }


    /**
     * 初始化成员变量
     */
    initMember() {
        //胡牌逻辑对象
        this.huLogin = new ZZHuLogin(this.rule.rogue);

        //初始化一副牌
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 27; ++j) {
                this.allMahjongs.push(j);
            }
        }

        //洗牌
        shuffle.knuthDurstenfeldShuffle(this.allMahjongs);

        //创建玩家
        this.uids.forEach((uid, i) => {
            let player = new Player(this);
            player.uid = uid;
            player.seatId = i;
            this.players.push(player);
        }, this);
    }

    /**
     * 发牌
     */
    deal() {
        console.log(JSON.stringify(this.allMahjongs));
        //做的牌
        let cards = [0,0,0,1,1,1,2,2,2,3,3,3,4,
                     4,4,4,5,5,5,5,6,6,6,7,7,8, 4];
        this.allMahjongs.splice(0, 27);
        this.allMahjongs = cards.concat(this.allMahjongs);
        console.log(JSON.stringify(this.allMahjongs));

        this.players.forEach((player, i) => {
            this.allMahjongs.slice(i * 13, i * 13 + 13).forEach(el => {
                player.addHolds(el);
            });
            player.send(mjEvent.holds, player.holds); //自己的牌推送给客户端
            console.log("牌数量；" + JSON.stringify(player.holdsDic));
        }, this);

    }

    /**
     * 开始游戏,由房间层调用
     */
    begin() {
        this.mahjongIndex = this.players.length * 13;     //麻将牌下标,已经摸到第几张了
        //游戏开始数据推送给客户端
        this.sendAll(mjEvent.gameBegin, {
            uids: this.uids,
            bankerUid: this.bankerUid,
            surplusMahjong: this.allMahjongs.length - this.mahjongIndex
        });

        this.deal();  //发牌

        this.nextTurn(this.bankerUid);
    }

    /**
     * 下一家
     */
    nextTurn(uid) {
        if(this.gameOver) //游戏已经结束无法摸牌
            return;

        // 清除出牌记录
        this.recordDiscard = undefined;

        // 转换轮子
        if (uid) {
            this.turn = this.player(uid).seatId;
        } else {
            this.turn++;
            this.turn %= this.uids.length;
        }
        // 发送给客户端,当前轮子是谁
        this.sendAll(mjEvent.turn, this.uids[this.turn]);
        this.drawCard(this.uids[this.turn]);
    }

    /**
     * 摸牌
     * 检查自己是否能杠和胡
     * @param uid 摸牌玩家uid
     */
    drawCard(uid) {
        if (this.players[this.turn].isDrawcard) {
            let player = this.player(uid);
            let value = this.allMahjongs[this.mahjongIndex];
            this.mahjongIndex++;

            // 增加一张手牌
            player.addHolds(value);
            player.send(mjEvent.drawCard, [value]);
            this.sendAll(mjEvent.surplusMahjong, this.allMahjongs.length - this.mahjongIndex);
            console.log("摸牌："+ value + " : " + player.holds);

            //摸牌后需要判断是否能杠和胡
            player.updateKong(value, mahjongConst.SHOWING_KONG);
            player.updateKong(value, mahjongConst.HIDDEN_KONG);

            player.updateHu();
            player.sendOperator();
        } else {
            this.players[this.turn].isDrawcard = true;
        }
    }

    /**
     * 检查其他玩家碰、杠、胡条件
     * @param player   出牌玩家，或者杠牌玩家（可抢杠胡，所以杠了之后需要检查有没有玩家能抢杠胡）
     * @param value    打出的牌，或杠的牌
     */
    updateOperator(player, value) {
        let isOperator = false;
        this.players.forEach(el => {
            if (el.uid !== player.uid) {
                el.updatePong(value, player);
                el.updateKong(value, mahjongConst.RELEASE_KONG, player);
                el.updateHu(value, player, false);
                if(el.isOperator()){
                    el.sendOperator();  //发送操作项给客户端，如果有
                    isOperator = true;
                }
            }
        });
        if (!isOperator) {
            this.nextTurn();   //如果都不能操作，则下家摸牌
        }
    }

    /**
     * 排序操作列表，最前面的优先级最高
     * 如果第一个下标没有操作完成，则需要等待，如果第一个下标玩家操作完成，则不需要等待
     * @returns {[]}
     */
    sortOperator(){
        let operators = [];
        this.players.forEach(el => {
            if(el.recordOperator){
                operators.push({
                    player: el,
                    category: el.recordOperator.category,
                    complete: 0, //是否操作
                    distance: (el.seatId > this.turn ) ? (el.seatId - this.turn) : (el.seatId + this.turn), //离出牌者的距离
                });
            } else {
                let maxOperator = el.getMaxOperator();
                if(maxOperator){
                    operators.push({
                        player: el,
                        category: maxOperator,
                        complete: 1,
                        distance: (el.seatId > this.turn ) ? (el.seatId - this.turn) : (el.seatId + this.turn)
                    })
                }
            }
        });

        operators.sort((a, b) => {
            if(!this.rule.multiplayerHu){  // 不能一炮多响，则位置离出牌者近的才可胡牌
                return a.distance - b.distance;
            }
            //可以一炮多响，根据操作优先级排序，如果优先级相同，则没操作的在前
            if(a.category === b.category){
                return b.complete - a.complete;
            } else {
                return b.category - a.category;
            }
        });

        return operators;
    }

    /**
     * 玩家操作完成时, 找出优先级高的玩家
     * 如果是过，则没有任务玩家碰杠胡，直接进入下一家摸牌
     */
    operatorEnd() {
        let operators = this.sortOperator();
        if (operators.length > 0) {
            //有优先级更高的玩家还没有操作
            if(operators[0].complete === 1){
                return;
            }

            //只有胡操作，才需要判断一炮多响
            if(operators[0].category === 9){
                if(this.rule.multiplayerHu){
                    operators.forEach(el => {
                        if(el.category === 9)
                            el.implementOperator();
                    });
                } else {
                    operators[0].player.implementOperator();
                }
            } else {
                operators[0].player.implementOperator();
            }

            //如果是明杠，则需要判断其它玩家抢杠胡
            if(operators[0].player.recordOperator.operatorType === mjConst.SHOWING_KONG){
                this.checkRobKongHu(operators[0].player);
            }

            //清除所有玩家的操作记录
            this.players.forEach(player => {
                player.recordOperator = null;
            });

            //没有人抢杠胡，才可摸牌
            if(!this.robKongHu)
                this.nextTurn(operators[0].player.uid);
        } else if (this.recordDiscard) {
            //吃碰杠胡玩家选择过
            this.nextTurn();
        } else if(this.robKongHu){
            //杠胡玩家选择过，
            this.robKongHu = false; //重置
            this.nextTurn(this.uids[this.turn]);
        }
    }


    checkRobKongHu(player){
        this.players.forEach(el => {
            if(el.uid !== player.uid){
                el.updateHu(player.recordOperator.value, player, true);
                if(el.isOperator()) {
                    this.robKongHu = true;
                    el.sendOperator();
                }
            }
        })
    }

    /**
     * 把数据全部推送给客户端
     */
    getInfo(uid) {
        let msg = {
            zuid: this.bankerUid,
            uids: this.uids,
            turn: this.turn,
            players: {},
            recordDiscard: this.recordDiscard,
            surplusMahjong: this.allMahjongs.length - this.mahjongIndex
        };

        this.players.forEach((el) => {
            let isSelf = uid === el.uid;
            msg.players[el.uid] = el.dataRequiredByClient(isSelf);
        });

        this.send(uid, mjEvent.gameInfo, msg);
    }

    /**
     * 计算玩家得分情况
     */
    countScores(){
        if(!this.paoPlayer){
            this.players.forEach(player => {
                if(player.uid !== this.bankerUid){
                    player.score -= 1;
                    this.huPlayers[0].score += 1;
                }
            })
        } else {
            this.paoPlayer.score -= this.huPlayers.length;
            this.huPlayers.forEach(player => {
                player.score += 1;
            })
        }
    }

    /**
     * 回放数据
     * @returns {Object}
     */
    getPlayback(){
        return {};
    }

    over(){
        let allHolds = {};    // 保存所有玩家的牌
        let disOperator = {}; // 保存吃碰杠的牌
        let huTypes = {};     // 胡牌的牌型，所有胡牌玩家的 huInfo对象
        let birdIn = {};


        this.gameOver = true; //记录游戏已经结束

        //发送所有玩家的牌到客户端
        this.players.forEach(player => {
            allHolds[player.uid] = player.holds;
            disOperator[player.uid] = player.disOperator;
        });
        this.huPlayers.forEach(player => {
            huTypes[player.uid] = player.huInfo;
        });

        birdIn[this.uids[0]] = [1,1,1];


        //计算玩家得分
        this.countScores();
        //计算分数
        let actualScores = this.pushScore();
        this.sendAll(mjEvent.gameResult, {
            bird: [1,1,1], // 鸟
            birdIn,
            allHolds,
            huTypes,
            disOperator,
            actualScores
        });


        this.end(); // 结束本小局游戏
    }

    /**
     * 释放类
     */
    onDestroy() {
        super.onDestroy();
    }
}

module.exports = Main;