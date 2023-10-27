/**
 * Created by sam on 2020/5/18.
 *
 */

class SdhAlgorithm extends require('../Algorithm_1') {
    constructor() {
        super();

        this.zhus.push.apply(this.zhus, [6,19,32,45]);
        this.cardsType = require('./const').cardsType;
    }

    setRule(rule, len) {
        let gameRules = rule.gameRules;
        if (len == 3) {
            this.isNotHas6 = true;      //是否没有6
        } else {
            this.isNotHas6 = gameRules[0] || false;     //是否没有6
        }

        this.notHasJoker = gameRules[5] || false;   //是否无王牌
    }

    /***
     *牌面值(3 < A < 副2 < 主2 < 副7 < 主7 < 王)
     * @param card
     */
    cardValue(card) {
        if (this.zhuType == undefined) {
            return super.cardValue(card);
        }

        if (this.zhuType < 0) {
            let value = card % 13;
            if (card === 52) {
                return 19;
            } else if (card === 53) {
                return 20;
            } else if (value == 0) {
                return 13;
            } else if (value == 1) {
                return 15;
            } else if (value == 6) {
                return 17;
            } else if (value < 6) {
                return (value + 1);
            } else {
                return value;
            }
        } else {
            let value = card % 13;
            if (card === 52) {
                return 18;
            } else if (card === 53) {
                return 19;
            } else if (value == 0) {
                return 13;
            } else if (value == 1) {
                let type = this.cardType(card);
                return 14+(type == this.zhuType ? 1 : 0);
            } else if (value == 6) {
                let type = this.cardType(card);
                return 16+(type == this.zhuType ? 1 : 0);
            } else if (value < 6) {
                return (value + 1);
            } else {
                return value;
            }
        }
    }
}

module.exports = SdhAlgorithm;
