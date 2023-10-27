let Game_net = require('../games/Game_net');

class Psz_net extends Game_net {
    constructor(model) {
        super(model);

        cc.connect.eventlist['deal'] = this.deal;                     /** 发牌 */
        cc.connect.eventlist['turn'] = this.turn;                     /** 轮转 */
        cc.connect.eventlist['currentAction'] = this.currentAction;   /** 玩家操作 */
        cc.connect.eventlist['auto'] = this.auto;                     /** 自动跟 */
        cc.connect.eventlist['xi'] = this.xi;                         /** 喜分 */
        cc.connect.eventlist['compare'] = this.compare;               /** 弃牌状态 */

        this.initEvents();
    };

    deal (data) { 
        this.cclog("发牌 deal = ", data);
        this._model.deal(data);
    }

    turn (data) {
        this.cclog("轮转 turn = ", data);
        this._model.turn(data);
    }

    currentAction (data) {
        this.cclog(" 玩家操作 currentAction = ", data);
        this._model.currentAction(data);
    }

    cancel () {
        this._model.cancel();
    }

    auto (data) {
        this._model.auto(data);
    }

    xi (data) {
        this.cclog(" 喜分 = ", data);
        this._model.xi(data);
    }

    compare (data) {
        this.cclog(" 弃牌状态 = ", data);
        this._model.compare(data);
    }

}

module.exports = Psz_net;
