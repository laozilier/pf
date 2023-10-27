let Game_net = require('../Games/Game_net');

class Sanshui_net extends Game_net {
    constructor(model) {
        super(model);

        cc.connect.eventlist['pleaseRob'] = this.pleaseRob;                   /** 请抢庄 */
        cc.connect.eventlist['rob'] = this.rob;                               /** 玩家抢庄 */
        cc.connect.eventlist['randomDeclarering'] = this.randomDeclarering;   /** 正在抢庄 */
        cc.connect.eventlist['randomDeclarer'] = this.randomDeclarer;         /** 系统随机生成庄家的信息 */
        cc.connect.eventlist['startBet'] = this.startBet;                     /** 下注列表 */
        cc.connect.eventlist['bet'] = this.bet;                               /** 玩家下注 */

        cc.connect.eventlist['holds'] = this.holdArrays;       /** 抓牌 */
        cc.connect.eventlist['chupai'] = this.chuPai;         /** 出牌 */
        cc.connect.eventlist['bipai'] = this.bipai;           /** 比牌 */
        cc.connect.eventlist['cannotOut'] = this.cannotOut;   /** 牌不能出 */
        cc.connect.eventlist['maPlayer'] = this.maPlayer;     /** 比牌显示马牌 */

        this.initEvents();
    };

    /**
     * 请抢庄
     * @param {*} data 
     */
    pleaseRob (data) { 
        this.cclog("请抢庄 pleaseRob = ", data);
        this._model.pleaseRob(data);
    }
    
    /**
     * 玩家抢庄
     * @param {*} data 
     */
    rob (data) { 
        this.cclog("玩家抢庄 rob = ", data);
        this._model.rob(data);
    }
    /**
     * 正在抢庄
     * @param {*} data 
     */
    randomDeclarering (data) { 
        this.cclog("抢庄中 randomDeclarering = ", data);
        this._model.randomDeclarering(data);
    }

    /**
     * 系统随机生成庄家的信息
     * @param {*} data 
     */
    randomDeclarer (data) { 
        this.cclog("系统随机生成庄家的信息 randomDeclarer = ", data);
        this._model.randomDeclarer(data);
    }

    /**
     * 下注列表
     * @param {*} data 
     */
    startBet (data) { 
        this.cclog("下注列表 startBet = ", data);
        this._model.startBet(data);
    }

    /**
     * 玩家下注
     * @param {*} data 
     */
    bet (data) { 
        this.cclog("玩家下注 bet = ", data);
        this._model.bet(data);
    }

    /***
     *  抓牌
     * @param data
     */
    holdArrays  (data) {
        this.cclog(" 抓牌！！！ holdArrays = ",data);
        this._model.holdArrays(data);
    }

    /**
     * 监听出牌
     * @param data
     */
    chuPai (data){
        this.cclog("收到出牌 chuPai = ",data);
        this._model.chuPai(data);
    }

    /**
     * 比牌
     */
    bipai(data) {
        this.cclog("bipai: ", data);
        this._model.bipai(data);
    }
    
    /**
     * 牌不能出
     * @param data
     */
    cannotOut(data) {
        this.cclog("牌不能出: ", data);
        this._model.cannotOut(data);
    }

    /**
     * 马牌
     * @param data
     */
    maPlayer(data) {
        this.cclog("马牌: ", data);
        this._model.maPlayer(data);
    }
}

module.exports = Sanshui_net;
