let Game_net = require('../games/Game_net');

class Sangong_net extends Game_net {
    constructor(model) {
        super(model);

        cc.connect.eventlist['randomDeclarering'] = this.randomDeclarering;   /** 正在抢庄 */
        cc.connect.eventlist['randomDeclarer'] = this.randomDeclarer;         /** 系统随机生成庄家的信息 */
        cc.connect.eventlist['canTuizhu'] = this.canTuizhu;                   /** 可以推注的玩家 */
        cc.connect.eventlist['deal'] = this.deal;                             /** 发牌 */
        cc.connect.eventlist['startBet'] = this.startBet;                     /** 下注列表 */
        cc.connect.eventlist['bet'] = this.bet;                               /** 玩家下注 */
        cc.connect.eventlist['showHolds'] = this.showHolds;                   /** 亮牌 */
        cc.connect.eventlist['holds2'] = this.holds2;                         /** 发四张牌 */
        cc.connect.eventlist['holds1'] = this.holds1;                         /** 发一张牌 */
        cc.connect.eventlist['rob'] = this.rob;                               /** 玩家抢庄 */
        cc.connect.eventlist['pleaseRob'] = this.pleaseRob;                   /** 请抢庄 */
        //cc.connect.eventlist['laiziPoker'] = this.getLaiziPoker;              /** 游戏赖子 */
        cc.connect.eventlist['startCuoPai'] = this.startCuoPai;               /** 开始搓牌 */

        this.initEvents();
    };

    randomDeclarering (data) { 
        this.cclog("抢庄中 randomDeclarering = ", data);
        this._model.randomDeclarering(data);
    }
    
    randomDeclarer (data) { 
        this.cclog("系统随机生成庄家的信息 randomDeclarer = ", data);
        this._model.randomDeclarer(data);
    }

    holds (data) { 
        this.cclog(" 监听牌 holds = ", data);
        this._model.holds(data);
    }

    canTuizhu (data) { 
        this.cclog("可以推注的玩家 canTuizhu = ", data);
        this._model.canTuizhu(data);
    }

    deal (data) { 
        this.cclog("发牌 deal = ", data);
        this._model.deal(data);
    }

    startBet (data) { 
        this.cclog("下注列表 startBet = ", data);
        this._model.startBet(data);
    }

    bet (data) { 
        this.cclog("玩家下注 bet = ", data);
        this._model.bet(data);
    }

    showHolds (data) { 
        this.cclog("亮牌 showHolds = ", JSON.stringify(data));
        this._model.showHolds(data);
    }
    
    holds2 (data) {
        this.cclog("发两张牌 holds2 = ",JSON.stringify(data));
        this._model.holds2(data);
    }

    holds1 (data) { 
        this.cclog("发一张牌 holds1 = ", JSON.stringify(data));
        this._model.holds1(data);
    }
    rob (data) { 
        this.cclog("玩家抢庄 rob = ", data);
        this._model.rob(data);
    }
    
    pleaseRob (data) { 
        this.cclog("请抢庄 pleaseRob = ", data);
        this._model.pleaseRob(data);
    }

    startCuoPai (data) { 
        this.cclog("开始搓牌 startCuoPai = ", data);
        this._model.startCuoPai(data);
    }
}

module.exports = Sangong_net;
