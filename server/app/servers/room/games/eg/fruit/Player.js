/**
 * Created by sam on 2020/5/18.
 *
 */
const BasePlayer = require('../../BasePlayer');
const Event = require('./event');

class Player extends BasePlayer {
    constructor(main) {
        super(main);
        this.uid = 0;
        this.seatId = 0;
        this.beted = false;
        this.betData = undefined;
        this.initEvent();
    }

    /***
     * 客户端事件绑定
     */
    initEvent() {
        this.on(Event.bet, this.bet);
    }

    setTrusteeship(isTrusteeship) {
        if (isTrusteeship == this.isTrusteeship) {
            return;
        }

        this.isTrusteeship = isTrusteeship;
        this.main.checkPlayerIsTrusteeship(this);
        if (!!this._autoTimeout) {
            this.startTimeout();
        }
    }

    /**
     * 玩家下注
     */
    bet(data) {
        if (!!this.beted) {
            this.send(Event.toast, '你已经下过注了');
            return;
        }

        if (this.main.playerBet(this, data)) {
            this.beted = true;
            this.betData = data;
        }
    }

    /***
     * 玩家信息，用于重连
     * @returns {{}}
     */
    getInfos(uid) {
        let data = {
            uid: this.uid,
            beted: this.beted,
            betData: this.betData,
        };

        // console.log(data);
        return data;
    }

    log(msg, info) {
        console.log(`table[${this.main.room.rid}] player[${this.uid} ${this.seatId}] ${msg} info:`, info);
    }
}


module.exports = Player;