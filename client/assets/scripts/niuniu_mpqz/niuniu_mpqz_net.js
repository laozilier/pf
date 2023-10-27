// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

let Game_net = require('../games/Game_net');

class niuniu_mpqz_net extends Game_net {
    constructor(model) {
        super(model);

        cc.connect.eventlist['randomDeclarering'] = this.randomDeclarering;   /** 正在抢庄 */
        cc.connect.eventlist['randomDeclarer'] = this.randomDeclarer;         /** 系统随机生成庄家的信息 */
        cc.connect.eventlist['canTuizhu'] = this.canTuizhu;                   /** 可以推注的玩家 */
        cc.connect.eventlist['deal'] = this.deal;                             /** 发牌 */
        cc.connect.eventlist['startBet'] = this.startBet;                     /** 下注列表 */
        cc.connect.eventlist['bet'] = this.bet;                               /** 玩家下注 */
        cc.connect.eventlist['showHolds'] = this.showHolds;                   /** 亮牌 */
        cc.connect.eventlist['holds4'] = this.holds4;                         /** 发四张牌 */
        cc.connect.eventlist['holds1'] = this.holds1;                         /** 发一张牌 */
        cc.connect.eventlist['rob'] = this.rob;                               /** 玩家抢庄 */
        cc.connect.eventlist['pleaseRob'] = this.pleaseRob;                   /** 请抢庄 */
        cc.connect.eventlist['laiziPoker'] = this.getLaiziPoker;              /** 游戏赖子 */
        cc.connect.eventlist['startCuoPai'] = this.startCuoPai;               /** 开始搓牌 */

        this.initEvents();
    };

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
     * 可以推注的玩家
     * @param {*} data 
     */
    canTuizhu (data) { 
        this.cclog("可以推注的玩家 canTuizhu = ", data);
        this._model.canTuizhu(data);
    }

    /**
     * 发牌
     * @param {*} data 
     */
    deal (data) { 
        this.cclog("发牌 deal = ", data);
        this._model.deal(data);
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

    /**
     * 亮牌
     * @param {*} data 
     */
    showHolds (data) { 
        this.cclog("亮牌 showHolds = ", JSON.stringify(data));
        this._model.showHolds(data);
    }

    /**
     * 发四张牌
     * @param {*} data 
     */
    holds4 (data) { 
        this.cclog("发四张牌 holds4 = ",JSON.stringify(data));
        this._model.holds4(data);
    }

    /**
     * 发一张牌
     * @param {*} data 
     */
    holds1 (data) { 
        this.cclog("发一张牌 holds1 = ", JSON.stringify(data));
        this._model.holds1(data);
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
     * 请抢庄
     * @param {*} data 
     */
    pleaseRob (data) { 
        this.cclog("请抢庄 pleaseRob = ", data);
        this._model.pleaseRob(data);
    }

    /**
     * 开始搓牌
     * @param {*} data 
     */
    startCuoPai (data) { 
        this.cclog("开始搓牌 startCuoPai = ", data);
        this._model.startCuoPai(data);
    }

    /**
     * 得到赖子牌
     * @param {*} data 
     */
    getLaiziPoker(data) {
        this.cclog("得到赖子牌 getLaiziPoker = ", data);
        this._model.getLaiziPoker(data);
    }
}

module.exports = niuniu_mpqz_net;
