/**
 * Created by sam on 2020/5/19.
 *
 */
const Shuffle = require('../common/shuffle');

const PokerCode = [
    0,  1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12,     //方片A-K
    13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,     //梅花A-K
    26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,     //红桃A-K
    39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,     //黑桃A-K
    52, 53                                                  //小王，大王
];


class Poker {
    constructor() {
        this.maxCards = undefined;
        this.firstCards = undefined;
        this.lastCards = undefined;
        this.zhus = [1,14,27,40,52,53];
        this.zhuType = -1;
        this.pokers = PokerCode;
        this.scoreMap = {};
        let scoreCards = [4,9,12];
        let scores = [5,10,10];
        for (let i = 0; i < 4; i++) {
            scoreCards.forEach((el, idx)=> {
                this.scoreMap[((i*13)+el).toString()] = scores[idx];
            });
        }

        this.isNotHas6 = false;     //是否没有6
        this.notHasJoker = false;   //是否无王牌
    }

    /**
     * 检查是否10
     * @param card
     * @returns {boolean}
     */
    isCard10(card) {
        return [9,22,35,48].includes(card);
    }

    /**
     * 检查是否王
     * @param card
     * @returns {boolean}
     */
    isWang(card) {
        return [52,53].includes(card);
    }

    /***
     *牌面值(3最小，2最大)
     * @param card
     */
    cardValue(card) {
        let value = card % 13;
        if (card === 52) {
            return 16;
        } else if (card === 53) {
            return 17;
        }else {
            let i = [0, 1].indexOf(value);
            if (i > -1) {
                return 13 + i + 1;
            }
        }
        return (value + 1);
    }

    /**
     * 获取牌的花色
     * 0.方片；1.梅花；2.红桃；3.黑桃
     * @param card
     * @return {number} 类型  0.方片；1.梅花；2.红桃；3.黑桃
     */
    cardType(card) {
        if ([52, 53].indexOf(card) > -1) {
            return 4;
        }
        return Math.floor(card / 13);
    }

    /***
     * 返回一副洗好的牌
     * @param count 发几副牌
     * @param exclude 不包括哪些牌
     * @returns {number[]}
     */
    deal(count = 1, exclude=[]) {
        if (this.isNotHas6) {
            exclude.push(6);
        }

        if (this.notHasJoker) {
            exclude.push(16);
            exclude.push(17);
        }

        let cards = this.pokers.slice();
        if (exclude.length !== 0) {
            cards = cards.filter(item => !exclude.includes(this.cardValue(item)));
        }

        let finalCards = [];
        for (let i = 0; i < count; ++i) {
            finalCards = finalCards.concat(cards);
        }

        Shuffle.knuthDurstenfeldShuffle(finalCards);
        return finalCards;
    }

    /** 递归组合 */
    combination(arr, size) {
        let result = [];
        function combine(selected, arr, size) {
            if (size === 0) {
                result.push(selected);
                return;
            }

            for (let i = 0; i < arr.length-(size-1); i++) {
                let temp = selected.slice();
                temp.push(arr[i]);
                combine(temp, arr.slice(i+1), size-1);
            }
        }

        combine([], arr, size);
        return result;
    }

    /**
     * 比较两组牌的分数
     * @param cards1
     * @param cards2
     * @returns {boolean}
     */
    compareCardsScore(cards1, cards2) {
        let score1 = this.getCardScore(cards1);
        let score2 = this.getCardScore(cards2);
        return score2 > score1;
    }

    /**
     * 获取一张牌的分数
     * @param card
     * @returns {number}
     */
    getCardScore(card) {
        let score = 0;
        if (Array.isArray(card)) {
            card.forEach(el=> {
                score += (this.scoreMap[el.toString()] || 0);
            })
        } else {
            score += (this.scoreMap[card.toString()] || 0);
        }

        return score;
    }

    /**
     * 获取每张牌值的数组
     * @param cards
     */
    getCardsMap(cards) {
        let valCardsMap = {};
        cards.forEach((card) =>{
                let v = this.cardValue(card);
                if (valCardsMap[v]) {
                    valCardsMap[v].push(card);
                } else {
                    valCardsMap[v] = [card];
                }
            }
        );

        return valCardsMap;
    }

    /**
     * 获取每张牌的真实数量
     * @param cards
     */
    getRealCardsMap(cards) {
        let cardsMap = {};
        cards.forEach((card) =>{
                if (cardsMap[card]) {
                    cardsMap[card] += 1;
                } else {
                    cardsMap[card] = 1;
                }
            }
        );

        return cardsMap;
    }

    /**
     * 判断一组牌有比另外一组牌数量分数小的组合
     * @param cards1
     * @param cards2
     * @returns {boolean}
     */
    isHasLowScoreCards(cards1, cards2) {
        let allCards = this.combination(cards1, cards2.length);
        for (let i = 0; i < allCards.length; i++) {
            if (this.compareCardsScore(allCards[i], cards2)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 判断一组牌是否包含分数
     * @param cards
     * @returns {boolean}
     */
    isHasScores(cards) {
        let score = 0;
        for (let i = 0; i < cards.length; i++) {
            let card = cards[i];
            score += this.getCardScore(card);
        }

        return score > 0;
    }

    /**
     * 检查是否全是主
     * @param cards
     * @returns {boolean}
     */
    isAllZhu(cards) {
        let isZhu = true;
        for (let i = 0; i < cards.length; i++) {
            let card = cards[i];
            if (this.zhus.indexOf(card) < 0 && this.cardType(card) != this.zhuType) {
                isZhu = false;
                break;
            }
        }

        return isZhu;
    }

    getZhuCount(cards) {
        let count = 0;
        for (let i = 0; i < cards.length; i++) {
            let card = cards[i];
            if (this.zhus.indexOf(card) > -1 || this.cardType(card) == this.zhuType) {
                count+= 1;
            }
        }

        return count;
    }

    getCardValeCount(cards) {
        let count = 0;
        for (let i = 0; i < cards.length; i++) {
            let card = cards[i];
            count += this.cardValue(card);
        }

        return count;
    }

    /**
     * 是否有主
     * @param cards
     * @returns {boolean}
     */
    isHasZhu(cards) {
        for (let i = 0; i < cards.length; i++) {
            let card = cards[i];
            if (this.zhus.indexOf(card) > -1 || this.cardType(card) == this.zhuType) {
                return true;
            }
        }

        return false;
    }

    /**
     * 检查是否是同一花色
     * @param cards
     * @returns {boolean}
     */
    isSameCardType(cards) {
        let cardTypes = [];
        cards.forEach((el) => {
            let cardType = this.cardType(el);
            if (!cardTypes.includes(cardType)) {
                cardTypes.push(cardType);
            }

        });

        return cardTypes.length < 2;

    }

    /**
     * 检查是否是同一牌值
     * @param cards
     * @returns {boolean}
     */
    isSameCardValue(cards) {
        let cardValues = [];
        cards.forEach((el) => {
            let cardValue = this.cardValue(el);
            if (!cardValues.includes(cardValue)) {
                cardValues.push(cardValue);
            }

        });

        return cardValues.length < 2;
    }

    /**
     * 获取某张牌真实的数量
     * @param holds
     * @param card
     * @returns {*|number}
     */
    getRealCards(holds, card) {
        let key = card.toString();
        let cardsMap = this.getRealCardsMap(holds);
        return cardsMap[key];
    }

    /**
     * 获取某个牌值牌的数量
     * @param holds
     * @param card
     * @returns {*|number}
     */
    getCards(holds, card) {
        let key = this.cardValue(card).toString();
        let cardsMap = this.getCardsMap(holds);
        return cardsMap[key];
    }

    isMaxA(minVal, holds) {
        for (let i = 0; i < holds.length; i++) {
            let val = this.cardValue(holds[i]);
            if (val > minVal) {
                return false;
            }
        }

        return true;
    }

    /**
     * 获取某张牌的数量
     * @param holds
     * @param card
     * @returns {*|number}
     */
    getCardCount(holds, card) {
        let key = this.cardValue(card).toString();
        let cardsMap = this.getCardsMap(holds);
        return cardsMap[key].length;
    }

    /***
     * 对数组升序排序
     * @param array
     * @returns {array}
     */
    sort(array) {
        return array.sort(function(a, b){
            return a - b;
        })
    }

    /***
     * 对数组降序排序
     * @param array
     * @returns {array}
     */
    sortDown(array) {
        return array.sort(function(a, b){
            return b - a;
        })
    }

    /**
     * 两张牌是否相连
     * @return {boolean} 如果相连返回true
     */
    isContinuous(max, min) {
        return max - min === 1;
    }

    sortCardValue(array) {
        return array.sort((a, b)=> {
            return this.cardValue(a) - this.cardValue(b);
        })
    }

    sortCardValueDown(array) {
        return array.sort((a, b)=> {
            return this.cardValue(b) - this.cardValue(a);
        })
    }

    hasSingle(arr) {
        let singles = [];
        for (let i = 0; i < arr.length; i++) {
            let v = arr[i];
            let idx = singles.indexOf(v);
            if (idx < 0) {
                singles.push(v);
            } else {
                singles.splice(idx, 1);
            }
        }

        return singles.length > 0;
    }
}

module.exports = Poker;