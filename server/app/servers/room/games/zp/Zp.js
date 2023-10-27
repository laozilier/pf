/**
 * Created by sam on 2020/5/19.
 *
 */
const Shuffle = require('../common/shuffle');

class Zp {
    constructor() {

    }

    /***
     * 返回一副洗好的牌
     * @param count 几个王
     * @returns {number[]}
     */
    deal(count=0) {

        let cards = [];
        for (let i = 1; i < 21; i++) {
            for (let j = 0; j < 4; j++) {
                cards.push(i);
            }
        }

        for (let i = 0; i < count; i++) {
            cards.push(21);
        }

        Shuffle.knuthDurstenfeldShuffle(cards);
        return cards;
    }
}

let zp = new Zp();
module.exports = zp;
