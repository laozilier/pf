/**
 * Created by sam on 2020/5/18.
 *
 */
const Poker = require('../Poker');
const cardsType = require('./ddzConst').cardsType;


class Algorithm {
    constructor() {
        this.checkFunc = [
            this.checkA,
            this.checkAA,
            this.checkAAA,
            this.checkAAAB,
            this.checkAAABB,
            this.checkAABB,
            this.checkABC,
            this.checkAAAABB,
            this.checkAAABBB,
            this.checkAAAA,
            this.checkBomb,
        ];
    }

    /***
     * 检测牌型
     * @param cards
     * @returns {number|*}
     */
    checkCardsType(cards) {
        for (let i = 0; i < this.checkFunc.length; ++i){
            let res = this.checkFunc[i].call(this, cards);
            if (!!res){
                return res
            }
        }

        return cardsType.NONE
    }

    getCardsMap(cards) {
        let valCardsMap = {};
        cards.forEach((card) =>{
                let v = Poker.cardValue(card);
                if(valCardsMap[v]) {
                    valCardsMap[v].push(card);
                }else {
                    valCardsMap[v] = [card];
                }
            }
        );

        return valCardsMap;
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

    /**
     * 两张牌是否相连
     * @return {boolean} 如果相连返回true
     */
    isContinuous(max, min) {
        // todo: 2连不连（连队和顺子）
        if ([15, 16, 17].indexOf(max) > -1 || [15, 16, 17].indexOf(min) > -1) {
            return false;
        }
        return max - min === 1;
    }

    /***
     * 单张检测
     * @param cards
     * @returns {{minVal: (number|*), length: number, type: number}}
     */
    checkA(cards) {
        if (cards.length === 1) {
            return {
                type: cardsType.A,
                minVal: Poker.cardValue(cards[0]),
                length: 1
            }
        }
    }

    /***
     * 对子检测
     * @param cards
     * @returns {{minVal: (number|*), length: number, type: number}}
     */
    checkAA(cards) {
        if (cards.length === 2 && Poker.cardValue(cards[0]) === Poker.cardValue(cards[1])) {
            return {
                type: cardsType.AA,
                minVal: Poker.cardValue(cards[0]),
                length: 2
            }
        }
    }

    /***
     * 三张检测
     * @param cards
     * @returns {{minVal: number, length: number, type: number}}
     */
    checkAAA(cards) {
        let cardsMap = this.getCardsMap(cards);
        if (cards.length === 3) {
            for (let v in cardsMap) {
                if (cardsMap[v].length === 3) {
                    return {
                        type: cardsType.AAA,
                        minVal: parseInt(v),
                        length: 3
                    }
                }
            }
        }
    }

    /***
     * 三带一检测
     * @param cards
     * @returns {{minVal: number, length: number, type: number}}
     */
    checkAAAB(cards) {
        let cardsMap = this.getCardsMap(cards);
        if (cards.length === 4) {
            for (let v in cardsMap) {
                if (cardsMap[v].length === 3) {
                    return {
                        type: cardsType.AAAB,
                        minVal: parseInt(v),
                        length: 4
                    }
                }
            }
        }
    }

    /***
     * 三带二检测
     * @param cards
     * @returns {{minVal: number, length: number, type: number}}
     */
    checkAAABB(cards) {
        let cardsMap = this.getCardsMap(cards);
        let keys = Object.keys(cardsMap);
        if (cards.length === 5 && keys.length === 2) {
            for (let v in cardsMap) {
                if (cardsMap[v].length === 3) {
                    return {
                        type: cardsType.AAABB,
                        minVal: parseInt(v),
                        length: 5
                    }
                }
            }
        }
    }

    /***
     * 连对检测
     * @param cards
     * @returns {{minVal: number, length: number, type: number}|null}
     */
    checkAABB(cards) {
        if (cards.length >= 6) {
            let cardsMap = this.getCardsMap(cards);
            let keys = Object.keys(cardsMap);

            for(let key in cardsMap) {
                if (cardsMap[key].length !== 2)
                    return null;

            this.sort(keys);
            for(let i = 1; i < keys.length; ++i){
                if(!this.isContinuous(parseInt(keys[i]), parseInt(keys[i-1])))
                    return null
            }}

            console.log(keys);
            return {
                type: cardsType.AABB,
                minVal: parseInt(keys[0]),
                length: keys.length
            }
        }
    }

    /***
     * 顺子检测
     * @param cards
     * @returns {{minVal: number, length: number, type: number}}
     */
    checkABC(cards) {
        if (cards.length >= 5) {
            let cardsMap = this.getCardsMap(cards);
            let keys = Object.keys(cardsMap);

            for(let key in cardsMap) {
                if (cardsMap[key].length !== 1)
                    return;

                this.sort(keys);
                for(let i = 1; i < keys.length; ++i){
                    if(!this.isContinuous(parseInt(keys[i]), parseInt(keys[i-1])))
                        return;
                }}

            return {
                type: cardsType.ABC,
                minVal: parseInt(keys[0]),
                length: keys.length
            }
        }
    }

    /***
     * 四带二检测
     * @param cards
     * @returns {{minVal: number, length: *, type: number}}
     */
    checkAAAABB(cards) {
        let cardsMap = this.getCardsMap(cards);

        let body = [];
        let tail = [];
        for (let key in cardsMap) {
            if (cardsMap[key].length === 4){
                body.push(key);
            }else if (cardsMap[key].length === 1 || cardsMap[key].length === 2) {
                tail.push(cardsMap[key])
            }
        }

        if (body.length === 1 && tail.length === 2 && tail[0].length === tail[1].length) {
            return {
                type: cardsType.AAAABB,
                minVal: parseInt(body[0]),
                length: cards.length
            };
        }
    }

    /***
     * 飞机检测 不带翅膀可出，翅膀中对子和三张也可以看成单张
     * @param cards
     * @returns {{minVal: number, length: *, type: number}}
     */
    checkAAABBB(cards) {
        let cardsMap = this.getCardsMap(cards);

        let body = [];
        let three = [];
        let single = 0;
        let double = 0;
        for (let key in cardsMap) {
            if (cardsMap[key].length >= 3){
                three.push(key);
                if (cardsMap[key].length === 4) {
                    single++;
                }
            }else if (cardsMap[key].length === 1) {
                single++;
            }else if (cardsMap[key].length === 2) {
                double++;
            }
        }

        if(three.length < 2){
            return;
        }

        if (three.length >= 2) {
            this.sort(three);
            let straight = [three[0]];
            for(let i = 1; i < three.length; ++i) {
                if(this.isContinuous(parseInt(three[i]), parseInt(three[i - 1]))){
                    straight.push(three[i]);
                } else {
                    if (straight.length >= 2){
                        break;
                    }
                    straight = [three[i]]
                }
            }
            if (straight.length < 2) {
                return;
            }
            body = straight;
        }

        // 翅膀中 对子和三张也可以看成单张
        if ((!double && body.length === single) || (!single && body.length === double) ||
            body.length === (single + double * 2 + (three.length - body.length) * 3) ||
            !single && !double && three.length === body.length) {
            return {
                type: cardsType.AAABBB,
                minVal: parseInt(body[0]),
                length: body.length
            }
        }
    }

    /***
     * 炸弹检测
     * @param cards
     * @returns {{minVal: number, length: number, type: number}}
     */
    checkAAAA(cards) {
        if (cards.length === 4){
            let cardsMap = this.getCardsMap(cards);
            let keys = Object.keys(cardsMap);
            if(keys.length === 1){
                return {
                    type: cardsType.AAAA,
                    minVal: parseInt(keys[0]),
                    length: 4
                }
            }
        }
    }

    /***
     * 王炸检查
     * @param cards
     * @returns {{minVal: number, length: number, type: number}}
     */
    checkBomb(cards) {
        if(cards.length === 2){
            if ([52, 53].indexOf(cards[0]) > -1 && [52, 53].indexOf(cards[1]) > -1) {
                return {
                    type: cardsType.BOMB,
                    minVal: 52,
                    length: 2
                }
            }
        }
    }

    /***
     * 自动出牌
     * @param cards
     * @returns {number[]|[]|*}
     */
    discard(cards) {
        let cardsMap = this.getCardsMap(cards);
        let keys = Object.keys(cardsMap);
        this.sort(keys);
        let four = [];
        let three = [];
        let single = [];
        let double = [];
        let bomb = [];

        keys.forEach((key) => {
            if (parseInt(key) === 16 || parseInt(key) === 17) {
                bomb.push(key);
            } else if (cardsMap[key].length === 4) {
                four.push(key);
            } else if (cardsMap[key].length === 3) {
                three.push(key);
            } else if (cardsMap[key].length === 2) {
                double.push(key);
            } else if (cardsMap[key].length === 1) {
                single.push(key);
            }
        });
        if (single.length !== 0) {
            let straight = this.findMaxStraight(single);
            if (straight && straight.length >= 5) {
                let discardCards = [];
                straight.forEach((el) => {
                   discardCards.push.apply(discardCards, cardsMap[el])
                });
                return discardCards;
            }
            return cardsMap[single[0]]
        } else if (double.length !== 0) {
            let straight = this.findMaxStraight(double);
            if (straight) {
                let discardCards = [];
                straight.forEach((el) => {
                    discardCards.push.apply(discardCards, cardsMap[el])
                });
                return discardCards;
            }
            return cardsMap[double[0]]
        }else if (three.length !== 0) {
            let straight = this.findMaxStraight(three);
            if (straight) {
                let discardCards = [];
                straight.forEach((el) => {
                    discardCards.push.apply(discardCards, cardsMap[el])
                });
                return discardCards;
            }
            return cardsMap[three[0]]
        }else if (four.length !== 0) {
            return cardsMap[four[0]]
        }else if (bomb.length !== 0) {
            if (bomb.length === 2) {
                return [52 ,53]
            } else {
                return cardsMap[bomb[0]]
            }
        }
    }

    /**
     * 找到最长的顺子
     * @param cards 手牌
     */
    findMaxStraight(cards) {
        let straight = [cards[0]];
        for(let i = 1; i < cards.length; ++i) {
            if(this.isContinuous(parseInt(cards[i]), parseInt(cards[i - 1]))){
                straight.push(cards[i]);
            } else {
                if (straight.length >= 3){
                    return straight;
                }
                straight = [cards[i]]
            }
        }

        if (straight.length >= 3){
            return straight;
        }
    }

    /***
     * 返回拍面值最小的一张牌
     * @param cards
     * @returns {number[]}
     */
    minCard (cards) {
        return [Math.min.apply(Math, cards.map((c) => {return Poker.cardValue(c);}))]
    }

    findBigCard(cards, lastDiscard) {
        let cardsMap = this.getCardsMap(cards);
        let keys = Object.keys(cardsMap);
        this.sort(keys);
        let four = [];
        let three = [];
        let single = [];
        let double = [];
        let bomb = [];

        keys.forEach((key) => {
            if (parseInt(key) === 16 || parseInt(key) === 17) {
                bomb.push(key);
            } else if (cardsMap[key].length === 4) {
                four.push(key);
            } else if (cardsMap[key].length === 3) {
                three.push(key);
            } else if (cardsMap[key].length === 2) {
                double.push(key);
            } else if (cardsMap[key].length === 1) {
                single.push(key);
            }
        });

        //只剩下最后一手王炸就炸
        if(bomb.length === 2 && bomb.length === cards.length) {
            return [52, 53];
        }

        let straight;
        switch (lastDiscard.type) {
            case cardsType.A:
                for (let i = 0; i <= single.length; ++i) {
                    if (parseInt(single[i]) > lastDiscard.minVal) {
                        return cardsMap[single[i]]
                    }
                }
                if (bomb.length === 1 && bomb[0] > lastDiscard.minVal) {
                    return cardsMap[bomb[0]]
                }
                for (let i = 0; i <= double.length; ++i) {
                    if (parseInt(double[i]) > lastDiscard.minVal) {
                        return [cardsMap[double[i]][0]]
                    }
                }
                break;
            case cardsType.AA:
                for (let i = 0; i <= double.length; ++i) {
                    if (parseInt(double[i]) > lastDiscard.minVal) {
                        return cardsMap[double[i]]
                    }
                }
                for (let i = 0; i <= three.length; ++i) {
                    if (parseInt(three[i]) > lastDiscard.minVal) {
                        return cardsMap[three[i]].slice(0, 2)
                    }
                }
                break;
            case cardsType.ABC:
                straight = this.findMaxStraight(single);
                if (straight) {
                    for (let i = 0; i <= straight.length; ++i) {
                        if (parseInt(straight[i]) > lastDiscard.minVal && straight.length - i >= lastDiscard.length) {
                            straight = straight.slice(i, lastDiscard.length);
                            let discardCards = [];
                            straight.forEach((el) => {
                                discardCards.push.apply(discardCards, cardsMap[el])
                            });
                            return discardCards;
                        }}
                }
                break;
            case cardsType.AABB:
                straight = this.findMaxStraight(double);
                if (straight) {
                    for (let i = 0; i <= straight.length; ++i) {
                        if (parseInt(straight[i]) > lastDiscard.minVal && (i + lastDiscard.length) <= straight.length) {
                            let discardCards = [];
                            for(let j = i; j<i + lastDiscard.length; ++j) {
                                discardCards.push.apply(discardCards, cardsMap[straight[j]])
                            }
                            return discardCards;
                        }}
                }
                break;
            case cardsType.AAA:
                for (let i = 0; i <= three.length; ++i) {
                    if (parseInt(three[i]) > lastDiscard.minVal) {
                        return cardsMap[three[i]]
                    }
                }
                break;
            case cardsType.AAAB:
                for (let i = 0; i <= three.length; ++i) {
                    if (parseInt(three[i]) > lastDiscard.minVal && single.length !==0) {
                        return cardsMap[three[i]].concat(cardsMap[single[0]])
                    }
                }
                break;
            case cardsType.AAABB:
                for (let i = 0; i <= three.length; ++i) {
                    if (parseInt(three[i]) > lastDiscard.minVal && double.length !==0) {
                        return cardsMap[three[i]].concat(cardsMap[double[0]])
                    }
                }
                break;
            case cardsType.AAABBB:
                straight = this.findMaxStraight(three);
                break;
        }
    }

}

let algorithm = new Algorithm();
module.exports = algorithm;
console.log(algorithm.checkCardsType([3, 16, 29, 4, 17, 30]));
// console.log(algorithm.findBigCard([ 52, 53],
//     {type: cardsType.AA,
//                 minVal: 9,
//                 length: 2}));

