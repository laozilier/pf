/**
 * Created by sam on 2020/5/19.
 *
 */
const Shuffle = require('../common/shuffle');

class Mj {
    constructor() {
        this.laizi = 35;
    }

    /***
     * 返回一副洗好的牌
     * @param color 缺哪一色
     * @param laizi 几个赖子
     * @param feng  是否有风
     * @param hua   是否有花
     * @returns {number[]}
     */
    deal(laizi=0, color=[], feng=false, hua=false) {
        let cards = [];
        /** 万子 1-9 条子 4*9张 11-19 4*9张 筒子 21-29 4*9张 共计108张 */
        for (let i = 0; i < 3; i++) {
            if (color.includes(i)) {
                continue;
            }

            for (let j = 0; j < 4; j++) {
                for (let k = 1; k < 10; k++) {
                    cards.push(i*10+k);
                }
            }
        }

        /** 风 31-37 4*7张 东南西北中发白 中45*/
        if (!!feng) {
            for (let j = 0; j < 4; j++) {
                for (let k = 1; k < 8; k++) {
                    cards.push(30+k);
                }
            }
        }

        /** 花 41-48 4*8张 春夏秋冬 梅兰菊竹 */
        if (!!hua) {
            for (let j = 0; j < 4; j++) {
                for (let k = 1; k < 9; k++) {
                    cards.push(40+k);
                }
            }
        }

        for (let i = 0; i < laizi; i++) {
            cards.push(this.laizi);
        }

        Shuffle.knuthDurstenfeldShuffle(cards);
        return cards;
    }
}

module.exports = Mj;
