// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

class Game_model {
    constructor (scene) {
        this._scene = scene;
        this._playerDatas = [];
        this._uids = [];
        this._playerInfos = {};
    };

    /**
     * 房间信息
     * @param info
     */
    onRoomInfo (info) {
        //初始化房间数据
        this._room_rule = info.roomRule;
        this._game_rule = info.gameRule;
        this._startNumber = this._room_rule.startNumber;
        this._halfway = this._room_rule.halfway;
        this._inningLimit = this._room_rule.inningLimit;
        this._currInning = info.currInning;
        this._lastInning = info.lastInning;

        this._playerDatas = info.players;
        cc.gameargs.playersLen = info.players.length;
        this._playerCount = 0;
        this._rid = info.rid;
        this._groupId = info.groupId;
        this._running = info.isGameRun;
        this._cid = info.cid;
        this._prid = info.prid;
        this._gameName = info.gameName;

        cc.gameargs.rule = this._game_rule;
        for (let i = 0; i < this._playerDatas.length; i++) {
            let data = this._playerDatas[i];
            if (!!data) {
                this._playerCount+=1;
                let uid = data.uid;
                this._playerInfos[uid] = {name: data.name, pic: data.pic, sex: data.sex};
            }
        }

        this._scene.onRoomInfo(!this._running);
    };

    /**
     * 游戏信息，断线重连会收到
     * @param data
     */
    gameInfo(data){
        this._running = true;
        this._isStart = true;
        this._uids = data.uids;
        cc.gameargs.status = data.status;
        this._scene.gameInfo(data);
    };

    /**
     *  局数
     * @param data
     */
    inning (data) {
        this._lastInning = data[0];
        this._currInning = data[1];
        this._scene.setInning();
    }

    /***
     *  游戏开始
     * @param data
     */
    gameBegin (data) {
        this._uids = data.uids;
        this._running = true;
        this._playerDatas.forEach(function (userInfo) {
            if (!!userInfo) {
                userInfo.ready = false;
            }
        });
        this._scene.gameBegin(data);
    }

    /**
     * 直接解散房间
     * @param info  坐下的玩家信息
     */
    dismiss () {
        this.skipScenes();
    };

    /**
     * 离开房间
     */
    leave (uid) {
        let need = false;
        for (let i = 0; i < this._playerDatas.length; i++) {
            let data = this._playerDatas[i];
            if (!!data) {
                if (uid == data.uid) {
                    this._playerDatas[i] = null;
                    this._playerCount-=1;
                    need = true;
                    break;
                }
            }
        }

        if (need) {
            let idx = this._uids.indexOf(uid);
            if (idx > -1) {
                this._uids.splice(idx, 1);
            }
        }

        this._scene.leave(uid, need);
    };

    /**
     * 玩家坐下
     * @param info  坐下的玩家信息
     */
    sitDown (info) {
        if ((cc.enum.AutoList.indexOf(cc.dm.user.uid) > -1) && this._playerCount >= this._playerDatas.length) {
            cc.utils.openTips('错误！坐下的人数超出限制');
        }

        let seatId = info.seatId;
        this._playerDatas[seatId] = info;
        this._playerInfos[info.uid] = {name: info.name, pic: info.pic, sex: info.sex};
        this._playerCount+=1;
        this._scene.sitDown(info);
    };

    /**
     * 玩家准备
     * @param uid  准备玩家uid
     */
    ready (uid) {
        let userInfo = this.getUserInfo(uid);
        if (!!userInfo) {
            userInfo.ready = true;
        }

        this._scene.ready(uid);
    };

    /**
     * 表情符号
     * @param data
     */
    emoji (data) {
        this._scene.emoji(data);
    };

    /***
     *   常用语
     * @param data
     */
    cWord (data) {
        this._scene.cWord(data);
    };

    /***
     *   聊天
     * @param data
     */
    chat (data) {
        this._scene.chat(data);
    };

    /***
     *   语音
     * @param data
     */
    voice (data) {
        this._scene.voice(data);
    };

    /**
     * 房间结束
     * @param data
     */
    roomEnd(data){

    };

    /**
     * 用户上线下线
     * @param data
     */
    isOnline(data){
        let uid = data[0];
        let has = data[1];
        let playData = this.getUserInfo(uid);
        if (!!playData) {
            playData.isOnline = has;
        }

        this._scene.isOnline(data);
    };

    /***
     *   头像动画
     * @param param
     */
    animate (param) {
        this._scene.animate(param);
    };

    /**
     * 错误提示
     */
    toast (data) {
        this._scene.toast(data);
    };

    /**
     * 房间不存在
     */
    notExists (data) {
        this._running = false;
        this._scene.notExists(data);
    }

    /**
     * 获取用户信息
     * @param uid
     * @return {*}
     */
    getUserInfo (uid) {
        for (let i = 0; i < this._playerDatas.length; i++) {
            let data = this._playerDatas[i];
            if (!!data) {
                if (uid == data.uid) {
                    return data;
                }
            }
        }
    };

    /**
     * 获取用户信息
     * @param seat
     * @return {*}
     */
    getUserInfoBySeat (seat) {
        for (let i = 0; i < this._playerDatas.length; i++) {
            let data = this._playerDatas[i];
            if (!!data) {
                if (seat == data.seatId) {
                    return this._playerDatas[i];
                }
            }
        }
    };

    /**
     * 托管
     */
    tuoGuang(data){
        this._scene.tuoGuang(data);
    };

    /**
     * 最终分数
     * @param data
     */
    finalScores (data) {
        if (Array.isArray(data)) {
            data.forEach(obj=> {
                let uid = obj.uid;
                let score = obj.score;
                if(cc.dm.user.uid == uid) {
                    cc.dm.user.score = score;
                }
    
                let userInfo =  this.getUserInfo(uid);
                if(!!userInfo) {
                    userInfo.score = score;
                }
            });
        } else if (typeof data == "object") {
            for (let uid in data) {
                let obj = data[uid];
                let score = obj.score;
                if(cc.dm.user.uid == uid) {
                    cc.dm.user.score = score;
                }
    
                let userInfo =  this.getUserInfo(uid);
                if(!!userInfo) {
                    userInfo.score = score;
                }
            }
        }

        this._scene.finalScores(data);
    };

    /**
     * 大结算
     * @param {*} data 
     */
    settleScores(data) {
        this._scene.settleScores(data);
    }

    gameResult (data) {
        this._running = false;
        this._scene.gameResult(data);
    }

    gameStatus (data) {
        cc.gameargs.status = data.status;
        this._scene.gameStatus(data);
    }

    changeSeat(data) {
        let uid1 = data[0];
        let uid2 = data[1];
        /** 先将this._uids里面的uid换位置 */
		let idx1 = this._uids.indexOf(uid1);
		let idx2 = this._uids.indexOf(uid2);
		this._uids[idx2] = uid1;
        this._uids[idx1] = uid2;
        /** 再将this._playerDatas里面的数据换位置 */
        let pdata1 = this.getUserInfo(uid1);
        let seatId1 = pdata1.seatId;
        let pdata2 = this.getUserInfo(uid2);
        let seatId2 = pdata2.seatId;
        pdata1.seatId = seatId2;
        pdata2.seatId = seatId1;
        this._playerDatas[seatId1] = pdata2;
        this._playerDatas[seatId2] = pdata1;
        this._scene.changeSeat(data);
    }

    skipScenes() {
        cc.director.loadScene('club');
    };
}

module.exports = Game_model;

