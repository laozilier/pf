// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


class Game_net {
    constructor (model) {
        this._model = model;
        if (!!cc.connect.eventlist) {
            for (let key in cc.connect.eventlist) {
                cc.connect.off(key);
            }

            cc.connect.eventlist = undefined;
        }
        
        cc.connect.eventlist = {
            'inning': this.inning,              /**当前局数*/
            'okDismiss': this.okDismiss,        /**同意解散*/
            'notDismiss': this.notDismiss,      /**不同意解散*/
            'applyDismiss': this.applyDismiss,  /**申请解散房间*/
            'applySuccess': this.applySuccess,  /**成功解散房间*/
            'roomInfo': this.onRoomInfo,        /**监听房间信息*/
            'gameBegin': this.gameBegin,        /**游戏开始*/
            'dismiss': this.dismiss,            /**监听解散房间*/
            'leave': this.leave,                /**监听离开房间*/
            'sitDown': this.sitDown,            /**玩家坐下监听*/
            'ready': this.ready,                /**玩家准备*/
            'isOnline': this.isOnline,          /**玩家离线上线*/
            'gameInfo': this.gameInfo,          /**断线重连 游戏数据*/
            'cWord': this.cWord,                /**常用语*/
            'chat': this.chat,                  /**聊天*/
            'emoji': this.emoji,                /**表情*/
            'voice': this.voice,                /**语音*/
            'animate': this.animate,            /**动画*/
            'tuoGuang': this.tuoGuang,          /**托管*/
            'toast': this.toast,                /**各种错误提示（如金币不足）情况*/
            'notExists': this.notExists,        /**房间不存在*/
            'finalScores': this.finalScores,    /**最后实际分数**/
            'settleScores': this.settleScores,  /**打满局数的结算分数**/
            'changeSeat': this.changeSeat,      /**换位置**/
            'getAllHolds': this.getAllHolds,    
            'gameStatus': this.gameStatus,      /** 状态切换 */
            'gameResult': this.gameResult,      /** 游戏结果*/
        };

        // cc.connect.off('rg');
        // cc.connect.on('rg', (params) => {
        //     let event = params[0];
        //     if (event == 'rg') {
        //         params = params[1];
        //         event = params[0];
        //     }
        //     let data = params[1];
        //     let func = cc.connect.eventlist[event];
        //     if (!!func) {
        //         func.call(this, data);
        //     } else {
        //         console.error('没有找到监听方法 rg = ', params);
        //     }
        // });
    };

    initEvents() {
        for (let key in cc.connect.eventlist) {
            cc.connect.on(key, (msg) => {
                let func = cc.connect.eventlist[key];
                if (!!func) {
                    func.call(this, msg);
                } else {
                    console.error('没有找到监听方法 rg = ', msg);
                }
            });
        }
    }

    cclog (key, msg) {
        if (!cc.sys.isNative) {
            console.log(key, msg);
        }
    }

    /**
     * 当前局数
     * @param {*} data 
     */
    inning (data) { 
        this.cclog("当前局数 inning = ", data);
        this._model.inning(data);
    }

    /**
     * 同意解散
     * @param {*} data 
     */
    okDismiss (data) { 
        this.cclog("同意解散 okDismiss = ", data);
        this._model.okDismiss(data);
    }

    /**
     * 不同意解散
     * @param {*} data 
     */
    notDismiss (data) { 
        this.cclog("不同意解散 notDismiss = ", data);
        this._model.notDismiss(data);
    }

    /**
     * 申请解散房间
     * @param {*} data 
     */
    applyDismiss (data) { 
        this.cclog("申请解散房间 applyDismiss = ", data);
        this._model.applyDismiss(data);
    }

    /**
     * 成功解散房间
     * @param {*} data 
     */
    applySuccess (data) { 
        this.cclog("成功解散房间 applySuccess = ", data);
        this._model.applySuccess(data);
    }

    /**
     * 房间信息
     * @param info
     */
    onRoomInfo (info) {
        this.cclog("收到房间信息 onRoomInfo = ", info);
        //初始化房间数据
        this._model.onRoomInfo(info);
    }

    /***
     *  游戏开始
     * @param data
     */
    gameBegin (data) {
        this.cclog("游戏开始 gameBegin = ", data);
        this._model.gameBegin(data);
    }

    /**
     * 直接解散房间
     * @param info  坐下的玩家信息
     */
    dismiss () {
        this.cclog("收到房间解散信息 dismiss");
        this._model.dismiss();
    }

    /**
     * 离开房间
     */
    leave (uid) {
        this.cclog("离开房间 leave = ", uid);
        let uu = null;
        if(typeof uid === "object"){
            uu = uid.uid;
        }else{
            uu = uid;
        }
        this._model.leave(uu);
    }

    /**
     * 玩家坐下
     * @param info  坐下的玩家信息
     */
    sitDown (info) {
        this.cclog("收到坐下 sitDown = ", info);
        this._model.sitDown(info);
    }

    /**
     * 断线重连  游戏数据
     * @param data  游戏数据
     */
    gameInfo(data){
        this.cclog("断线重连 gameInfo = ",data);
        this._model.gameInfo(data);
    }

    /**
     * 玩家准备
     * @param uid  准备玩家uid
     */
    ready (uid) {
        this.cclog("玩家准备 ready = ", uid);
        let uu = null;
        if(typeof uid === "object"){
            uu = uid.uid;
        }else{
            uu = uid;
        }
        this._model.ready(uu);
    }

    /***
     *  游戏开始
     * @param data
     */
    gameBegin (data) {
        this.cclog("游戏开始 gameBegin = ",data);
        this._model.gameBegin(data);
    }

    /**
     * 玩家在线状态
     * @param data
     */
    isOnline(data){
        this.cclog("上线离线 isOnline = ",data);
        this._model.isOnline(data);
    }

    /**
     * 表情符号
     * @param data
     */
    emoji (data) {
        this.cclog("表情 emoji = ",data);
        this._model.emoji(data);
    }

    /***
     *   常用语
     * @param data
     */
    cWord (data) {
        this.cclog("常用语 cWord = ", data);
        this._model.cWord(data);
    }

    /***
     *   聊天
     * @param data
     */
    chat (data) {
        this.cclog("聊天 chat =  ", data);
        this._model.chat(data);
    }

    /***
     *   语音
     * @param data
     */
    voice (data) {
        this.cclog("语音 voice = ", data);
        this._model.voice(data);
    }

    /***
     *   头像动画
     * @param param
     */
    animate (param) {
        this.cclog("扔动画 animate = ", param);
        this._model.animate(param);
    }

    /***
     *   大结算
     * @param data
     */
    roomEnd(data){
        this.cclog("游戏结束 大结算 roomEnd = ",data);
    }

    /**
     * 托管
     */
    tuoGuang(data) {
        this.cclog("收到托管 tuoGuang = ", data);
        this._model.tuoGuang(data);
    }

    /**
     * 错误提示
     */
    toast (data) {
        this.cclog("错误提示 toast = ",data);
        this._model.toast(data);
    }

    /**
     * 房间不存在
     */
    notExists (data) {
        this.cclog("房间不存在 toast = ",data);
        this._model.notExists(data);
    }

    /**
     * 最后实际分数
     */
    finalScores (data) {
        this.cclog("最后实际分数 finalScores = ", data);
        this._model.finalScores(data);
    }

    /**
     * 当前轮局数
     */
    minTotalInning (data) {
        this.cclog("当前轮局数 minTotalInning = ", data);
        this._model.minTotalInning(data);
    }

    /**
     * 大结算
     * @param {*} data 
     */
    settleScores(data) {
        this.cclog("当前轮局数 settleScores = ", data);
        this._model.settleScores(data);
    }

    changeSeat(data) {
        this.cclog("换位置 changeSeat = ", data);
        this._model.changeSeat(data);
    }

    getAllHolds(data) {
        this.cclog("--- getAllHolds = ", data);
    }

    /**
     * * 游戏结束
     *  @param data
     * */
    gameResult(data) {
        this.cclog("游戏结束 gameResult:",data);
        this._model.gameResult(data);
    }

    /***
     *  状态切换
     * @param data
     */
    gameStatus(data) {
        this.cclog('状态切换 gameStatus:',data);
        this._model.gameStatus(data);
    }
}

module.exports = Game_net;
