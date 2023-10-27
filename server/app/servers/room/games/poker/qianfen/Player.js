/**
 * Created by sam on 2020/5/18.
 *
 */
const BasePlayer = require('../../BasePlayer');
const Event = require('../qianfen/event');

class Player extends BasePlayer {
    constructor(main) {
        super(main);
        this.uid = 0;
        this.seatId = 0;
        this.score = 0;             //玩家分数
        this.xiScore = 0;           //炸弹喜分
        this.roundScore = 0;        //当局输赢分数
        this.rankScore = 0;         //排名分
        this.rewardScore = 0;       //奖励分
        this.finalScore = 0;
        this.rank = undefined;

        this.initEvent();
    }

    /***
     * 客户端事件绑定
     */
    initEvent() {
        this.on(Event.cutCard, this.cutCard);
        this.on(Event.discard, this.discard);
    }

    setTrusteeship(isTrusteeship) {
        if (isTrusteeship == this.isTrusteeship) {
            return;
        }

        this.isTrusteeship = isTrusteeship;
        this.main.checkPlayerIsTrusteeship(this);
    }

    /***
     * 是否游戏中 牌是否打完了
     * @returns {boolean}
     */
    isNotPlaying() {
        return this.holds.length == 0;
    }

    /***
     * 玩家切牌
     * @param index 切牌位置
     */
    cutCard (index) {
        this.main.cutCard(index);
    }

    /**
     * 发送牌到前端
     */
    sendHolds(c) {
        this.holds = [].concat(this.beginHolds);
        this.send(Event.holds, {holds: this.holds, c: c});
    }

    /***
     * 玩家出牌
     * @param cards
     */
    discard(cards) {
        this.main.discard(this, cards);
    }

    /***
     * 从手牌中移除打出的牌
     * @param cards
     */
    removeHolds(cards) {
        cards.forEach((el) => {
            let index = this.holds.indexOf(el);
            if (index !== -1){
                this.holds.splice(index, 1);
            }
        });
    }

    /***
     * 玩家信息，用于重连
     * @returns {{}}
     */
    getInfos(uid) {
        let data = {};
        data.uid = this.uid;
        data.holds = this.uid === uid? this.holds: this.holds.length;
        data.rank = (this.main.uids.length == 2 && this.rank == 1) ? 2 : this.rank;
        return data;
    }

    log(info) {
        console.log(`table[${this.main.room.rid}] player[${this.uid} ${this.seatId}] info:`, info);
    }
}


module.exports = Player;