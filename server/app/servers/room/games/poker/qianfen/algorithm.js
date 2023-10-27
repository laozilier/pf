/**
 * Created by sam on 2020/5/18.
 *
 */

class Qianfen_Algorithm extends require('../Algorithm_2') {
    constructor() {
        super();

        this.cardsType = require('./const').cardsType;
    }

    setRule(rule) {
        this.isHas67 = rule.isHas67 || 0;  //保留67 1 保留，0：不保留
        this.cannot_bomb = true;
    }

    /***
     * 返回一副洗好的牌
     * @param count 发几副牌
     * @param exclude 不包括哪些牌
     * @returns {number[]}
     */
    deal(count=1, exclude=[]) {
        exclude = exclude.concat([3,4,30,40]);
        if (!this.isHas67) {
            exclude = exclude.concat([6,7]);
        }
        let cards = super.deal(count, exclude);
        return cards;
    }
}

module.exports = Qianfen_Algorithm;