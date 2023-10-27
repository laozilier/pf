/**
 * 牛牛持久层
 * Created by THB on 2018/8/7
 */


class TtzLasting extends require('../BaseLasting'){
    constructor() {
        super();
        // 下一局要发的牌
        this.cards = null;

        // 当前发牌从第几张发起
        this.cardsIndex = 0;

        // 趋势
        this.trends = [[],[],[],[],[],[],[],[],[],[]];
    }
}

module.exports = TtzLasting;