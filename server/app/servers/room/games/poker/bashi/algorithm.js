/**
 * Created by sam on 2020/5/18.
 *
 */
const Poker = require('../Poker');

class BashiAlgorithm extends require('../PokerAlgorithm') {
    constructor() {
        super([1,14,27,40,52,53,9,22,35,48], require('./const').cardsType);
    }

    /**
     * 获取特殊
     * @param red_2
     * @param black_2
     * @param wang
     * @returns {Array}
     */
    getSpecials(red_2, black_2, wang) {
        let specials = [];
        if (red_2.length > 2) {
            if (red_2.length > 3) {
                specials.push(red_2.slice(0,3));
            }
            specials.push(red_2);
        }

        if (black_2.length > 2) {
            if (black_2.length > 3) {
                specials.push(black_2.slice(0,3));
            }
            specials.push(black_2);
        }

        if (wang.length > 2) {
            if (wang.length > 3) {
                specials.push(wang.slice(0,3));
            }
            specials.push(wang);
        }

        if (specials.length > 0) {
            return specials;
        }
    }

    /**
     * 获取所有能反的数组
     * @param jiaozhu
     * @param all_10
     * @param red_2
     * @param black_2
     * @param wang
     * @returns {Array}
     */
    getFanzhus(jiaozhu, all_10, red_2, black_2, wang) {
        let a = [];
        let dan10 = [9,22,35,48];
        let all10 = [9,9,22,22,35,35,48,48];
        all_10.forEach((el) => {
            let idx = all10.indexOf(el);
            if (idx > -1) {
                all10.splice(idx, 1);
            }
        });

        let dui10 = [];
        dan10.forEach((el) => {
            let idx = all10.indexOf(el);
            if (idx < 0) {
                dui10.push([el, el]);
            }
        });

        jiaozhu.sort((a, b) => { return a-b;});
        red_2.sort((a, b) => { return a-b;});
        black_2.sort((a, b) => { return a-b;});

        let v = jiaozhu[0];
        let t = Poker.cardType(v);
        let specials = this.getSpecials(red_2, black_2, wang) || [];
        let len = jiaozhu.length;
        if (len == 1) {
            a = a.concat(dui10).concat(specials);
        } else if (len == 2) {
            dui10.forEach((el) => {
                let card = el[0];
                let cardType = Poker.cardType(card);
                if (cardType > t) {
                    a.push(el);
                }
            });

            a = a.concat(specials);
        } else if (len == 3) {
            specials.forEach((el) => {
                if (el.length > 3) {
                    a.push(el);
                } else {
                    let card = el[0];
                    let cardType = Poker.cardType(card);
                    if (cardType > t) {
                        a.push(el);
                    }
                }
            });
        } else {
            specials.forEach((el) => {
                if (el.length > 3) {
                    let card = el[0];
                    let cardType = Poker.cardType(card);
                    if (cardType > t) {
                        a.push(el);
                    }
                }
            });
        }

        if (a.length > 0) {
            return a;
        }
    }

    /***
     *牌面值(3 < A < 副2 < 主2 < 副10 < 主10 < 王)
     * @param card
     * @param zhuType
     */
    cardValue(card, zhuType) {
        let value = card % 13;
        if (card === 52) {
            return 18;
        } else if (card === 53) {
            return 19;
        } else if (value == 0) {
            return 13;
        } else if (value == 1) {
            let type = Poker.cardType(card);
            return 14+(type == zhuType ? 1 : 0);
        } else if (value == 9) {
            let type = Poker.cardType(card);
            return 16+(type == zhuType ? 1 : 0);
        } else if (value < 9) {
            return (value + 1);
        } else {
            return value;
        }
    }

    /**
     * 自动出牌
     * @param firstCard
     * @param holds
     * @param zhuType
     * @param maxCard
     * @returns {Array}
     */
    getAutoDicard(firstCard, holds, zhuType, maxCard, isNotHas6=true) {
        let tipsCards = super.getAutoDicard(firstCard, holds, zhuType, maxCard, isNotHas6);
        this.filterLowScores(tipsCards, zhuType);
        let cards = tipsCards.musts.concat(tipsCards.cans[0] || []);
        return cards;
    }
}

let algorithm = new BashiAlgorithm();
module.exports = algorithm;