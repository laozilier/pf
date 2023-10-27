/**
 * Created by apple on 2017/10/27.
 */
const notifyHall = require('./notifyHall');
const Session = require("./Session");
const BaseLasting = require('../games/BaseLasting');
const BaseConfig = require('../games/BaseConfig');

/**
 * 创建房间
 * @namespace GameRoom
 * @param {String|Object}options  房间配置
 * <ul>
 *     <li> rid:String 房间号
 *     <li> game_type:Number  游戏类型
 *     <li> game_rule:Object  游戏规则
 *     <li> creator:Number    创建者uid
 *     <li> max:Number        最大局数
 * @param cb   回调
 * <ul>
 *     <li> err  错误信息
 */
class BaseRoom extends require("../../../../common/TimeoutClass") {
    constructor(options, roomRule, gameRule, app, pool) {
        super();
        this.app = app;
        this.pool = pool;         //房间池对象
        this.uuid = options.uuid; //房间uuid,房间唯一号，此房间所有玩家都进入此uuid的频道
        this.gameName = options.gameName; // 游戏名字

        //初始化channel，session对象（用来与客户端通信）
        this.session = new Session(this.app, this.uuid);

        // 其他成员初始化
        this.initConfig();                 //加载游戏config
        this.initMemberVariables(options, roomRule, gameRule); //初始化成员变量
    }

    initConfig() {
        //游戏组件路径，所有游戏脚本都在此路径下面，如果路径不存在，则游戏组件丢失
        this.componentPath = '../games/' + this.gameName.replace('_', "/") + "/";
        this.gameConfig = require(this.componentPath + "config");
        if (!this.gameConfig) {
            this.gameConfig = new BaseConfig();
        }
    }

    initMemberVariables(options, roomRule, gameRule) {
        this.cid = options.cid || 0;    //俱乐部id
        this.prid = options.prid || ""; //包间id
        this.rid = options.rid;         //房间id
        this.groupId = options.groupId; //房间分组id
        this.type = parseInt(options.game_type);   //游戏类型，寻址的name
        this.gameRule = gameRule;             //游戏规则
        this.roomRule = roomRule;             //房间规则
        this.creator = parseInt(options.creator);  //创建房间的玩家

        this.players = [];        //所有玩家对象数组
        this.playerMax = this.gameConfig.playerMax[roomRule.playerMax || 0]; // 最大玩家数量
        this.seats = new Array(this.playerMax);    // 坐下的玩家对象列表
        this.halfway = !!roomRule.halfway;  //中途加入
        this.startNumber = roomRule.startNumber || 9999;  //自动开始游戏人数；
        this.isStart = false;              // 游戏是否开始，只有首次创建为false,开始游戏后一直为true
        this.createTime = Date.format("yyyy-MM-dd hh:mm:ss");  //房间创建时间
        this.isDismiss = {
            dismissTimeoutId: -1,  //解散房间计时器id
            applyDismissUID: 0,    //申请解散房间的玩家uid
            applyDismissTime: 0    //申请解散的时间
        };
        this.isDismiss = undefined;
        this.tax = this.gameConfig.getTax(this.gameRule);  // todo:游戏税收率

        //局数相关参数
        this.currInning = 0;                           //记录房间局数
        this.lastInning = 0;                           //房间上一次玩家离开时的局数（用来做局数限制的判断条件）
        this.inningLimit = roomRule.inningLimit || 0;        //限制局数

        //游戏持久层数据
        try {
            let Lasting = require(this.componentPath + "Lasting");
            this.sd = new Lasting();
        } catch (e) {
            this.sd = new BaseLasting();
        }

        this.historyId = undefined; //历史记录id
        this.gameScript = null;     //游戏脚本对象
        this.autoNextId = -1;       //自动下一局的计时器id

        /** 房间超时,5分钟时间内没有开始，则释放房间 */
        this.roomTimeout();
    }

    // 删除游戏对象
    delGameScript() {
        this.gameScript && this.gameScript.onDestroy();
        delete this.gameScript;
    }

    // todo: 房间超时
    roomTimeout() {
        this.roomTimeoutId = this.setTimeout(() => {
            this.dismiss();
        }, 5 * 60 * 1000);
    }

    // 释放房间
    onDestroy() {
        super.onDestroy();
    }

    /**
     * 返回玩家类
     * @returns {BasePlayer}
     */
    getClassPlayer() {
        return require('./BasePlayer');
    }

    /** 获取游戏组件入口脚本 */
    getClassGame() {
        return require(this.componentPath + "Main");
    }

    /**
     * 修改玩家分数
     * @param playerScores  json格式 [{uid:152456, score:100},{uid:258964, score:-100}]
     * @returns {Promise<{result}>}
     */
    async writeScore(playerScores, tax) {
        let result = await DB_POOL.queryProcessSync(`sp_game_writescore(?, ?, ?, ?)`,
            [this.uuid, JSON.stringify(playerScores), tax, this.currInning]).catch(err => {
            APP_LOG.error(err);
        });

        if (tax > 0) {
            if(Array.isArray(result)){
                notifyHall.calculateProfit(this.app, this.cid, this.gameScript.uids, tax, (err) => {
                    if (err) {
                        APP_LOG.error(err);
                        APP_LOG.warn("抽水失败");
                    }
                });
            } else {
                APP_LOG.error(result);
            }
        }

        return result;
    }

    /**
     * 中途分数计算 ，如果跑得快炸弹喜分，麻将起手胡
     * @param win   赢家数组
     * @param lose  输家数组
     */
    async pushHalfwayScore(win, lose) {
        let actualScores = {};     //这一小局真实分数
        let winTotalScore = 0;
        let loseTotalScore = 0;
        let finalScore = 0;

        let playerScores = {}; //记录分数差
        let uids = this.gameScript.uids;
        uids.forEach((uid) => {
            playerScores[uid] = 0;
            actualScores[uid] = 0;
        });

        //计算赢家总分
        for (let uid in win) {
            let actualScore = this.player(uid).getActualScore() + this.tax;
            if (win[uid] >= actualScore) {
                winTotalScore += actualScore;
                win[uid] = actualScore;
            } else {
                winTotalScore += win[uid];
            }
        }

        //计算输家总分
        for (let uid in lose) {
            let actualScore = this.player(uid).getActualScore() - this.tax;
            if (lose[uid] >= actualScore) {
                loseTotalScore += (actualScore);
                lose[uid] = (actualScore);
            } else {
                loseTotalScore += Math.abs(lose[uid]);
            }
        }

        //分数比
        let scale = 1;
        if (winTotalScore != 0 && loseTotalScore != 0) {
            scale = (winTotalScore > loseTotalScore) ? (loseTotalScore / winTotalScore) : (winTotalScore / loseTotalScore);
        }

        //扣除输家的分数
        for (let uid in lose) {
            let score = Math.abs((winTotalScore > loseTotalScore ? lose[uid] : Math.round(lose[uid] * scale)));//如果输家的分数大于赢家分数，则向上取整
            this.player(uid).reduceScore(score);
            finalScore += score;

            //保存玩家这一小局真实的输分
            actualScores[uid] -= score;

            //保存输家分数差
            playerScores[uid] -= score;
        }

        //根据比例计算赢家进分
        for (let uid in win) {
            let score = (winTotalScore > loseTotalScore ? Math.floor(win[uid] * scale) : win[uid]); //如果赢家的分数大于输家分数，则向下取整
            let player = this.player(uid);
            if (finalScore >= score) {
                player.score += score;
                finalScore -= score;

                //保存赢家分数差
                playerScores[uid] += score;
            } else {
                player.score += finalScore;
                finalScore = 0;
                //保存赢家分数差
                playerScores[uid] += finalScore;
            }

            //保存玩家这一小局真实的赢分
            actualScores[uid] += score;
        }

        //分数变化写入数据库
        let scoreList = [];
        for (let key in playerScores) {
            scoreList.push({uid: key, score: playerScores[key]});
            if (!!this.inningLimit) {
                let settleScores = this.sd.settleScores[key];
                if (!!settleScores) {
                    let marginInning = this.currInning-this.lastInning;
                    let cur = marginInning%this.inningLimit;
                    if (!!settleScores[cur]) {
                        settleScores[cur] += playerScores[key];
                    } else {
                        this.sd.settleScores[key].push(playerScores[key]);
                    }
                } else {
                    this.sd.settleScores[key] = [playerScores[key]];
                }
            }
        }

        let finalScoreList = await this.writeScore(scoreList, 0);
        if (Array.isArray(finalScoreList)) {
            finalScoreList.forEach(obj=> {
                let uid = obj.uid;
                let score = obj.score;
                this.player(uid).score = score;
            });
        }
        
        // let finalScoreList = {};
        // uids.forEach((uid) => {
        //     finalScoreList[uid] = this.player(uid).getActualScore();
        // });
        //把玩家的分数发送给前端
        this.session.sendAll("finalScores", finalScoreList);

        return actualScores;
    }

    /***
     * 计算最终结果分
     * 返回真实赢输分
     * @returns {Promise<void>}
     */
    async pushScore() {
        let resultScore = this.gameScript.getScoreResult();
        let scores = [];
        let actualScores = {};     //这一小局真实分数
        if (Array.isArray(resultScore)) {
            scores = resultScore;
        } else {
            scores.push(resultScore);
        }

        let playerScores = {}; //记录这一小局的分数变化
        let uids = this.gameScript.uids;
        uids.forEach((uid) => {
            playerScores[uid] = 0;
            actualScores[uid] = 0;
        });

        scores.forEach((obj) => {
            let win = obj.win;
            let lose = obj.lose;
            let winTotalScore = 0;
            let loseTotalScore = 0;
            let finalScore = 0; //保存所有输家的分数

            //计算赢家总分
            for (let uid in win) {
                let actualScore = this.player(uid).getActualScore() + this.tax;
                if (win[uid] > actualScore) {
                    //如果所赢分数比玩家手上剩余分数加上抽水要大，则玩家只能进剩余分数加抽水的分
                    winTotalScore += actualScore;
                    win[uid] = actualScore;
                } else {
                    winTotalScore += win[uid];
                }
            }

            //计算输家总分
            for (let uid in lose) {
                let actualScore = this.player(uid).getActualScore() - this.tax;
                if (lose[uid] > actualScore) {
                    // 如果玩家分数不够输，则只输剩余分数减去抽水
                    loseTotalScore += actualScore;
                    lose[uid] = actualScore;
                } else {
                    loseTotalScore += Math.abs(lose[uid]);
                }
            }

            //分数比
            let scale = 1;
            if (winTotalScore != 0 && loseTotalScore != 0) {
                scale = (winTotalScore > loseTotalScore) ? (loseTotalScore / winTotalScore) : (winTotalScore / loseTotalScore);
            }

            //扣除输家的分数
            for (let uid in lose) {
                let score = Math.abs((winTotalScore > loseTotalScore ? lose[uid] : Math.round(lose[uid] * scale)));//如果输家的分数大于赢家分数，则向上取整
                let player = this.player(uid);
                player.reduceScore(score);
                finalScore += score; //所有输家分数累加

                //保存输的分数
                playerScores[uid] -= score;

                //保存玩家这一小局真实的输分
                actualScores[uid] -= score;

                player.reduceScore(this.tax);
            }

            //根据比例计算赢家进分
            for (let uid in win) {
                let score = (winTotalScore > loseTotalScore ? Math.floor(win[uid] * scale) : win[uid]); //如果赢家的分数大于输家分数，则向下取整
                let player = this.player(uid);
                if (finalScore >= score) {
                    player.score += score; //玩家加分
                    finalScore -= score;   //总分减去这一次加分
                    //保存这一小局的分数
                    playerScores[uid] += score;
                } else {
                    player.score += finalScore;
                    //保存这一小局的分数
                    playerScores[uid] += finalScore;
                    //输家累计分数归0
                    finalScore = 0;
                }

                //保存玩家这一小局真实的赢分
                actualScores[uid] += score;

                player.reduceScore(this.tax);
            }
        });

        //分数变化写入数据库
        let scoreList = [];
        for (let key in playerScores) {
            scoreList.push({uid: key, score: playerScores[key]});
            if (!!this.inningLimit) {
                let settleScores = this.sd.settleScores[key];
                if (!!settleScores) {
                    let marginInning = this.currInning-this.lastInning;
                    let cur = marginInning%this.inningLimit;
                    if (!!settleScores[cur]) {
                        settleScores[cur] += playerScores[key];
                    } else {
                        this.sd.settleScores[key].push(playerScores[key]);
                    }
                } else {
                    this.sd.settleScores[key] = [playerScores[key]];
                }
            }
        }
		
        let finalScoreList = await this.writeScore(scoreList, this.tax);
        if (Array.isArray(finalScoreList)) {
            finalScoreList.forEach(obj=> {
                let uid = obj.uid;
                let score = obj.score;
                this.player(uid).score = score;
            });
        }
        
        // let finalScoreList = {};
        // uids.forEach((uid) => {
        //     finalScoreList[uid] = this.player(uid).getActualScore();
        // });
        //把玩家的分数发送给前端
        this.session.sendAll("finalScores", finalScoreList);
        //保存历史记录
        this.actualScores = actualScores;
        this.finalScoreList = finalScoreList;
        return actualScores;
    }

    /** 保存这一局的数据 */
    async saveHistory() {
        //给玩家增加局数
        let uids = this.gameScript.uids;
        uids.forEach((uid) => {
            let player = this.player(uid);
            player && player.addTotalInning();
        });

        this.currInning++;   //房间局数加一
        /** 写入记录开始 */
        let bigWinner = this.countInningBigWinner();
        let userinfos = {};
        this.players.forEach(el => {
            userinfos[el.uid] = {
                name: el.name,
                sex: el.sex,
                headimg: el.pic
            }
        });

        let scores = this.gameScript.getAllScores();
        let playback = this.gameScript.getPlayback();
        await this.generateHistoryId();
        await DB_POOL.querySync(`INSERT INTO t_history SET ?`, {
            cid: this.cid,
            prid: this.prid,
            room_history_id: this.historyId,
            game_name: this.gameName,
            uids: JSON.stringify(uids),
            scores: JSON.stringify(scores),
            actual_scores: JSON.stringify(this.actualScores || {}),
            big_winner: JSON.stringify(bigWinner),
            inning: this.currInning,
            tax: this.tax * uids.length,
            playback: JSON.stringify(playback),
            final_scores: JSON.stringify(this.finalScoreList || {}),
            userinfo: JSON.stringify(userinfos)
        });
        /** 写入记录结束 */

        if (!SERVER_PARAMS.create || this.gameScript.isEnd()) {
            return this.dismiss();
        }

        this.delGameScript();  //删除这一局游戏
        this.roomTimeout();    //5分钟时间内没有开始，则释放房间
        this.filterPlayer();  //过滤玩家,（离线、分数不足）

        let autoNextTimeMargin = 0;
        if (!!this.inningLimit) {
            if (this.getInningLimit() == 0) {
                this.session.sendAll("settleScores", this.sd.settleScores);
                this.sd.settleScores = {};
                autoNextTimeMargin = 10;
            }
        }

        //托管玩家自动准备
        this.seats.forEach((el) => {
            if (el && el.isTrusteeship) {
                el.ready();
            }
        });

        //自动开始游戏计时器(在指定时间内没有准备的玩家，会自动准备)
        let autoNextTime = 5; //自动开始时间
        if(this.gameConfig.autoNextTime && this.gameConfig.autoNextTime > 0) {
            autoNextTime = this.gameConfig.autoNextTime;
        }

        autoNextTime += autoNextTimeMargin;
        this.autoNextId = this.setTimeout(() => {
            this.seats.forEach((player) => {
                //没有准备的玩家站起来
                if (player && !player.isReady) {
                    player.isReady = true;
                    this.session.sendAll("ready", player.uid);
                }
            });
            this.beginGame();
        }, autoNextTime * 1000);

        //如果所有玩家都已经准备，则直接开始游戏
        this.beginGame();
    }

    /** 过滤掉离线与分数不足的玩家 */
    filterPlayer() {
        let minScore = this.gameConfig.leaveScore(this.gameRule);
        let maxScore = this.gameConfig.maxLeaveScore(this.gameRule);
        this.seats.forEach((player) => {
            if (player && player.leaveLimit(true, minScore, maxScore) == 0) {
                this.leave(player);
                /*
                //1.低于或高于房间最低分与最高分的
                //2.达到局数并且离线状态
                //3.需要被踢出的（拉黑或者封号的玩家）
                if(player.getActualScore() < minScore){
                    player.send("toast", STATE_CODE.lockOfScore);
                    this.leave(player);
                } else if(player.getActualScore() > maxScore){
                    player.send("toast", STATE_CODE.tooManyScore);
                    this.leave(player);
                } else if(this.getInningLimit() === 0 && player.isOnline){
                    this.leave(player);
                } else if(player.isKick){
                    player.send("toast", STATE_CODE.alreadyKicked);
                    this.leave(player);
                }
                */
            }
        });
    }

    /** 解散房间 */
    dismiss() {
        this.session.sendAll('dismiss');  //发送房间解散通知
        this.delGameScript();
        this.players = [];
        this.seats = [];
        this.session.destroyChannel();     //释放频道
        this.pool.destroyRoom(this.rid);   //删除房间
    }

    /**
     * 获取历史记录的id
     * @returns {Promise<number>}
     */
    async generateHistoryId() {
        if (this.historyId)
            return this.historyId;

        let result = await DB_POOL.querySync(`INSERT INTO t_room_history SET ?`, {
            uuid: this.uuid,
            cid: this.cid,
            rid: this.rid,
            game_name: this.gameName,
            game_rule: JSON.stringify(this.gameRule),
            room_rule: JSON.stringify(this.roomRule),
            creator: this.creator,
            create_time: this.createTime,
            inning_limit: this.inningLimit,
            halfway: 1
        });
        this.historyId = result.insertId;
        return this.historyId;
    }

    /**
     * 找到这一小局的大赢家
     * @returns {Array}
     */
    countInningBigWinner() {
        let score = -1;
        let winners = [];
        this.gameScript.players.forEach((player) => {
            if (player.score > score) {
                winners = [];
                winners.push(player.uid);
            } else if (player.score === score) {
                winners.push(player.uid);
            }
        });
        return winners;
    }

    /**
     * 玩家登录房间
     * @param uid
     * @param sid 服务器id
     * @param ip  登录ip
     */
    login(uid, sid, ip) {
        //把玩家压入频道
        let play = this.player(uid);
        if (play) {
            this.session.addChannel(uid, sid);
            play.isOnline = true;

            //取消托管状态
            play.isTrusteeship = false;
            let gamePlayer = this.gamePlayer(uid);
            if (gamePlayer && gamePlayer.isTrusteeship) {
                gamePlayer.setTrusteeship(false);
            }

            if (play.seatId !== -1) {
                this.session.sendAll("tuoGuang", [uid, false]);
                this.session.sendAll("isOnline", [uid, true]);
            }
        }
    }

    /**
     * 玩家加入房间
     * @param user 玩家数据
     */
    join(user) {
        if (!this.player(user.uid)) {
            let PlayerClass = this.getClassPlayer();
            let play = new PlayerClass(user, this);
            this.players.push(play);
            //机器人一进入房间就会坐下
            //if (play.isRobot) {
                // play.sitDown();
            // }
        }
        return true;
    }

    /**
     * 玩家主动离开房间
     * @param {./BasePlayer} player
     */
    leave(player) {
        //离开玩家没有进行游戏，才可以离开
        if (!this.isPlaying(player.uid)) {
            this.session.sendAll('leave', player.uid);
            this.delPlayer(player);
        }
        this.beginGame();
    }

    /**
     * 删除用户
     * @namespace {GameRoom}
     * @param player
     */
    delPlayer(player) {
        //从map中删除玩家
        for (let i = 0; i < this.players.length; i++) {
            let p = this.players[i];
            if (!!p && p.uid === player.uid) {
                this.players.splice(i, 1);
                break;
            }
        }

        //从已经坐下玩家列表删除
        if (player.seatId !== -1) {
            this.seats[player.seatId] = undefined; //删除玩家
            if (player.start) { // 只有开始游戏的玩家离开才会重置局数限制
                this.lastInning = this.currInning;
                this.session.sendAll("inning", [this.lastInning, this.currInning]);
            }
        }
        notifyHall.delPlayer(this.app, this.rid, player.uid, (err) => {
        });
        this.session.kickChannel(player.uid);
        //如果房间已经没有玩家，则自动解散房间
        if (this.players.length === 0) {
            this.dismiss();
        }
    }

    /**
     * 玩家是否正在游戏
     * @param uid
     * @return {boolean} true=正在游戏
     */
    isPlaying(uid) {
        return this.gameScript && this.gameScript.uids.indexOf(uid) !== -1;
    }

    /**
     * 游戏中的玩家
     * @param uid
     * @returns {BasePlayer}
     */
    gamePlayer(uid) {
        if (this.gameScript) {
            return this.gameScript.player(uid);
        }
    }

    /**
     * 局数限制还剩多少局
     * @returns {number}
     */
    getInningLimit() {
        if (!this.inningLimit) {
            return 0;
        }

        let marginInning = this.currInning-this.lastInning;
        if (marginInning%this.inningLimit == 0) {
            return 0;
        }

        return this.inningLimit-marginInning%this.inningLimit;
    }

    /**
     * 获取玩家对象
     * @returns {./BasePlayer}
     */
    player(uid) {
        typeof uid === 'string' && (uid = parseInt(uid));
        for (let i = 0; i < this.players.length; i++) {
            let p = this.players[i];
            if (!!p && p.uid === uid) {
                return p;
            }
        }
    }

    /**
     * 玩家坐下
     * @param {./BasePlayer} player
     */
    sitDown(player) {
        //找到一个空位置
        for (let i = 0; i < this.seats.length; ++i) {
            if (!this.seats[i]) {
                this.seats[i] = player;
                player.seatId = i;
                notifyHall.sitDown(this.app, this.rid, player.seatId, player.uid, player.name, player.pic);
                return;
            }
        }
    }

    /**
     * 计算坐下的玩家数量
     * @return {number}
     */
    getSeatsCount() {
        let c = 0;
        for (let i = 0; i < this.seats.length; ++i) {
            this.seats[i] && (c++);
        }
        return c;
    }

    /**
     * 房间是否已经满员
     * @returns {boolean}
     */
    isFull() {
        return (this.getSeatsCount() === this.playerMax);
    }

    /**
     * 开始一局游戏
     */
    beginGame() {
        //判断是否全部准备
        for (let i = 0; i < this.seats.length; ++i) {
            if (this.seats[i] && !this.seats[i].isReady)
                return;
        }
        //开始人数达标
        if (this.getSeatsCount() < this.startNumber) {
            return;
        }
        //上一局游戏结束
        if (this.gameScript) {
            return;
        }

        clearTimeout(this.autoNextId);     //清除自动开始下一局计时器
        clearTimeout(this.roomTimeoutId);  //清除房间超时计时器

        let uids = [];
        this.seats.forEach(function (el) {
            if (el) {
                uids.push(el.uid);
                el.singleScore = 0;
                el.isReady = false;
                el.start = true; //状态变为开始游戏，不能退出房间
            }
        });

        //获取main文件
        let ClassGame = this.getClassGame();
        this.gameScript = new ClassGame(uids, this.gameRule, this);
        this.gameScript.begin(); //开始游戏

        this.isStart = true; //游戏已经开始
        //发送局数
        this.session.sendAll("inning", [this.lastInning, this.currInning]);
    }

    /**
     * 房间信息
     * @param {BasePlayer} play
     */
    getRoomInfo(play) {
        let arr = new Array(this.seats.length);
        for (let i = 0; i < this.seats.length; ++i) {
            if (this.seats[i]) {
                arr[i] = this.seats[i].getInfo();
            }
        }

        let lasting;
        if (this.sd.dataRequiredByClient()) {
            lasting = this.sd.dataRequiredByClient();
        } else {
            lasting = this.sd;
        }


        let data = {
            cid: this.cid,
            prid: this.prid,
            //groupId: this.groupId,
            //uid: play.uid,
            //seatId: play.seatId,
            gameName: this.gameName,
            createTime: this.createTime,
            //inningLimit: this.inningLimit,
            currInning: this.currInning,
            lastInning: this.lastInning,
            rid: this.rid,
            //uuid: this.uuid,
            roomRule: this.roomRule,
            gameRule: this.gameRule,
            //creator: this.creator,
            isStart: this.isStart, //游戏是否已经开始
            isGameRun: !!this.gameScript,  //游戏是否正在运行
            //startNumber: this.startNumber,  //开桌人数
            //sd: lasting,
            //self: play.getInfo(),   //返回自己的状态
            players: arr
        };
        this.session.send(play.uid, 'roomInfo', data);

        //如果正在游戏，则发送游戏数据
        if (this.gameScript) {
            this.gameScript.getInfo(play.uid);
        }

        //发送解散房间通知
        if (this.isDismiss) {
            let uids = [];
            this.seats.forEach(function (el) {
                if (el && el.isDismiss) {
                    uids.push(el.uid);
                }
            });
            this.session.sendAll("applyDismiss", {
                uid: this.isDismiss.applyDismissUID,
                uids: uids,
                time: this.isDismiss.applyDismissTime
            });
        }
    }

    getAllHolds(uid) {
        if (!this.gameScript) {
            return;
        }

        let data = {};
        for (let i = 0; i < this.gameScript.players.length; ++i) {
            let gamePlayer = this.gameScript.players[i];
            if (!!gamePlayer) {
                data[gamePlayer.uid] = gamePlayer.holds;
            }
        }

        this.session.send(uid, 'getAllHolds', data);
    }

    /**
     * 申请解散成功
     */
    applySuccess() {
        if (this.isDismiss) {
            this.session.sendAll("applySuccess");
            this.clearTimeout(this.isDismiss.dismissTimeoutId);
            delete this.isDismiss;
        }
    }

    /**
     * 申请解散
     */
    applyDismiss(uid) {
        if (this.isDismiss || !this.isStart) {
            return;
        }

        this.isDismiss = {
            applyDismissUID: uid,
            applyDismissTime: Date.now()
        };
        //30秒之后自动解散
        this.isDismiss.dismissTimeoutId = this.setTimeout(function () {
            this.applySuccess();
        }, 30000);
        this.session.sendAll("applyDismiss", {
            uid: this.isDismiss.applyDismissUID,
            uids: [this.isDismiss.applyDismissUID],
            time: this.isDismiss.applyDismissTime
        });
    }

    /**
     * 同意解散
     * @param uid
     */
    okDismiss(uid) {
        if (this.isDismiss) {
            this.session.sendAll("okDismiss", uid);
            //判断是否全都同意
            for (let i = 0; i < this.seats.length; ++i) {
                let el = this.seats[i];
                if (el && !el.isDismiss) {
                    return;
                }
            }
            this.applySuccess();
        }
    }

    /**
     * 不同意解散
     * @param uid
     */
    notDismiss(uid) {
        if (this.isDismiss) {
            this.clearTimeout(this.isDismiss.dismissTimeoutId);
            this.session.sendAll("notDismiss", uid);
            //还原解散房间变量
            this.seats.forEach(function (el) {
                el && (el.isDismiss = false);
            });
            delete this.isDismiss;
        }
    }

    //踢出玩家
    kickPlayer(uid){
        let play = this.player(uid);
        if(play && !play.start){
            play.send('toast', STATE_CODE.alreadyKicked);
            if (play.seatId < 0) {
                play.send('leave', play.uid);
            } else {
                play.sendAll('leave', play.uid);
            }
            this.delPlayer(play);
        } else {
            play.isKick = true;
        }
    }
}

module.exports = BaseRoom;