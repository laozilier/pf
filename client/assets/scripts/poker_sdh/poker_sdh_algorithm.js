// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html



class Poker_sdh_algorithm extends require('../poker/Algorithm_1') {

    constructor () {
        super();

        this.zhus.push.apply(this.zhus, [6,19,32,45]);
        this.cardsType = require('./poker_sdh_enum').cardsType;
    };

    setRule(rule) {

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
    /**
     * 自动出牌
     * @param holds
     * @returns {Array}
     */
    getAutoDicard(holds) {
        let tipsCards = super.getAutoDicard(holds);
        this.filterLowScores(tipsCards);
        return tipsCards;
    }
}
let algorithm = new Poker_sdh_algorithm();
module.exports = algorithm;

//
// let algorithm = new Poker_sdh_algorithm();
//
//
// console.log(algorithm.getCardsData(3,[35,1],[27,27]));
// console.log(algorithm.getAutoDicard(
//     {"type":3,"cards":[4,4,5,5],"minVal":4,"isZhu":false,"isSha":false,"uid":306822,"max":true},
// [6,6,7,7,8,8,37,34,13,24,21,20,11],
//     3,
// ));
// console.log(algorithm.getAutoDicard(
//     undefined,
//     [6,6,7,7,8,8,37,34,13,24,21,20,11],
//     3,
// ));
