/**
 *
 * 作者：THB
 * 创建时间：2019/8/13
 */
const MJBasePlayer = require('../MJBasePlayer');
const mjEvent = require('../mjEvent');
const mjConst = require('../mjConst');


class Player extends MJBasePlayer {
    constructor(main) {
        super(main);
    }

    initEvent() {
        super.initEvent();
    }

    /**
     * 更新胡，如果有value则判断是否放炮，如果无，则判断是否自摸
     * @param value        打出的牌，自摸无此参数
     * @param otherPlayer  出牌玩家，或者杠牌玩家
     * @param rob          抢杠胡，true=抢杠胡
     */
    updateHu(value, otherPlayer, rob) {
        //加上这张牌，判断是否能胡
        if(value !== undefined){
            this.holdsDic[value] ++;
        }
        if(this.huLogin.checkHu(this.holdsDic)){
            if(value === undefined){
                this.hu.push(0x9000 + this.holds[this.holds.length - 1]);
            } else {
                this.hu.push(0x9000 + value);
                this.otherPlayer = otherPlayer;
                this.robKongHu = !!rob;
            }
        }
        //判断完，需要减去这张牌
        if(typeof value !== undefined && value != null) {
            this.holdsDic[value]--;
        }
    }
}

module.exports = Player;