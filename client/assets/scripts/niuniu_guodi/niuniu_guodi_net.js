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

        cc.connect.eventlist['ask_lianzhuang'] = this.ask_lianzhuang;         /** 询问连庄 */
        cc.connect.eventlist['ask_dangzhuang'] = this.ask_dangzhuang;         /** 询问当庄 */
        cc.connect.eventlist['randomDeclarering'] = this.randomDeclarering;   /** 正在抢庄 */
        cc.connect.eventlist['randomDeclarer'] = this.randomDeclarer;         /** 系统随机生成庄家的信息 */
        cc.connect.eventlist['start_guodi'] = this.start_guodi;               /** 打锅底 */
        cc.connect.eventlist['ask_shouzhuang'] = this.ask_shouzhuang;         /** 可以收庄 */
        cc.connect.eventlist['shouzhuang'] = this.shouzhuang;                 /** 收庄 */
        cc.connect.eventlist['xiazhuang'] = this.xiazhuang;                   /** 下庄 */
        cc.connect.eventlist['deal'] = this.deal;                             /** 发牌 */
        cc.connect.eventlist['startBet'] = this.startBet;                     /** 下注列表 */
        cc.connect.eventlist['bet'] = this.bet;                               /** 玩家下注 */
        cc.connect.eventlist['showHolds'] = this.showHolds;                   /** 亮牌 */
        cc.connect.eventlist['holds5'] = this.holds5;                         /** 发五张牌 */
        cc.connect.eventlist['holds4'] = this.holds4;                         /** 发四张牌 */
        cc.connect.eventlist['holds1'] = this.holds1;                         /** 发一张牌 */
        cc.connect.eventlist['rob'] = this.rob;                               /** 玩家抢庄 */
        cc.connect.eventlist['pleaseRob'] = this.pleaseRob;                   /** 请抢庄 */
        cc.connect.eventlist['laiziPoker'] = this.getLaiziPoker;              /** 游戏赖子 */

        this.initEvents();
    };

    ask_lianzhuang(data) {
        this.cclog("询问连庄 ask_lianzhuang = ", data);
        this._model.ask_lianzhuang(data);
    }

    ask_dangzhuang(data) {
        this.cclog("询问当庄 ask_dangzhuang = ", data);
        this._model.ask_dangzhuang(data);
    }

    randomDeclarering (data) { 
        this.cclog("抢庄中 randomDeclarering = ", data);
        this._model.randomDeclarering(data);
    }

    randomDeclarer (data) { 
        this.cclog("系统随机生成庄家的信息 randomDeclarer = ", data);
        this._model.randomDeclarer(data);
    }
    
    start_guodi(data) {
        this.cclog("庄家打锅底 start_guodi = ", data);
        this._model.start_guodi(data);
    }

    ask_shouzhuang(data) {
        this.cclog("庄家可收庄 ask_shouzhuang = ", data);
        this._model.ask_shouzhuang(data);
    }

    shouzhuang(data) {
        this.cclog("庄家收庄 shouzhuang = ", data);
        this._model.shouzhuang(data);
    }

    xiazhuang(data) {
        this.cclog("庄家下庄 xiazhuang = ", data);
        this._model.xiazhuang(data);
    }

    holds5 (data) { 
        this.cclog("发五张牌 holds5 = ", data);
        this._model.holds5(data);
    }

    holds4 (data) { 
        this.cclog("发四张牌 holds4 = ", data);
        this._model.holds4(data);
    }

    holds1 (data) { 
        this.cclog("发一张牌 holds1 = ", data);
        this._model.holds1(data);
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

    rob (data) { 
        this.cclog("玩家抢庄 rob = ", data);
        this._model.rob(data);
    }

    pleaseRob (data) { 
        this.cclog("请抢庄 pleaseRob = ", data);
        this._model.pleaseRob(data);
    }

    getLaiziPoker(data) {
        this.cclog("得到赖子牌 getLaiziPoker = ", data);
        this._model.getLaiziPoker(data);
    }
}

module.exports = niuniu_mpqz_net;
