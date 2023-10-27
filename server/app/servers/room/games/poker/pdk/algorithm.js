/**
 * 跑得快算法
 */
class Pdk_algorithm extends require('../Algorithm_2') {
    constructor() {
        super();
        this.cardsType = require('./const').cardsType;
        this.checkFunc.push(this.checkAAAABB);
        this.checkFunc.push(this.checkAAAABBB);
    }

    setRule(rule) {
        this.heitao3fisrt = rule.first == 0;
        this.model = rule.model;

        let playTypes = rule.playTypes;
        this.sandai_can_chu = playTypes[0] > 0;
        this.sandai_can_jie = playTypes[1] > 0;
        this.feiji_can_chu = playTypes[2] > 0;
        this.feiji_can_jie = playTypes[3] > 0;

        let gameRules = rule.gameRules;
        this.cannot_bomb = gameRules[0] > 0;
        this.can_sidaier = gameRules[1] > 0;
        this.can_sidaisan = gameRules[2] > 0;
    }

    /***
     * 返回一副洗好的牌
     * @param count 发几副牌
     * @param exclude 不包括哪些牌
     * @returns {number[]}
     */
    deal(count = 1, exclude=[]) {
        let cards = super.deal(count, [30,40]);
        if (this.model == 1) {
            /** 15张 */
            [1,14,27,0,13,26,12].forEach((el)=> {
                cards.splice(cards.indexOf(el), 1);
            });
        } else {
            /** 16张 */
            [1,14,27,0].forEach((el)=> {
                cards.splice(cards.indexOf(el), 1);
            });
        }

        return cards;
    }

    /**
     * 获取所有三带
     * @param out_holds
     * @param player_holds
     */
    get_all_AAABB(out_holds, player_holds) {
        let arr = [];
        if (out_holds.length < 3) {
            return arr;
        }

        let cardsMap = this.getCardsMap(out_holds);
        let keys = Object.keys(cardsMap);
        this.sortDown(keys);
        keys.forEach(key=> {
            let cards = cardsMap[key];
            if (cards.length == 3) {
                let tempHolds = [].concat(out_holds);
                this.delCards(tempHolds, cards);
                let card = cards[0];
                if (tempHolds.length >= 2) {
                    tempHolds.sort((a, b)=> {
                        let counta = this.getCardCount(out_holds, a);
                        let countb = this.getCardCount(out_holds, b);
                        if (counta == countb) {
                            return this.cardValue(a)-this.cardValue(b);
                        }

                        return counta-countb;
                    });
                    let others = tempHolds.slice(0,2);
                    arr.push({
                        type: this.cardsType.AAABB,
                        minVal: this.cardValue(card),
                        cards: cards.concat(this.sortCardValue(others))
                    });
                } else {
                    /** 如果没出完 那么则不能出 */
                    if (out_holds.length < player_holds.length) {
                        return;
                    }

                    /** 如果有上手牌 但是规则不能少接 那么则不能出 */
                    if (!!this.lastCards) {
                        if (!this.sandai_can_jie) {
                            return;
                        }
                    }
                    /** 如果没有上手牌 但是规则不能少出 那么则不能出 */
                    else {
                        if (!this.sandai_can_chu) {
                            return;
                        }
                    }

                    arr.push({
                        type: this.cardsType.AAABB,
                        minVal: this.cardValue(card),
                        cards: cards.concat(tempHolds)
                    });
                }
            }
        });

        return arr;
    }

    /**
     * 获取所有飞机
     * @param out_holds
     * @param player_holds
     * @returns {Array}
     */
    get_all_AAABBB(out_holds, player_holds) {
        let arr = [];
        if (out_holds.length < 6) {
            return arr;
        }

        let cardsMap = this.getCardsMap(out_holds);
        let keys = Object.keys(cardsMap);
        this.sort(keys);

        let tempArr = [];
        let tempCards = [];
        let min = -1;
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let cards = cardsMap[key];
            if (cards.length == 4 || cards.length < 3) {
                continue;
            }

            if (min < 0) {
                min = parseInt(key);
                tempCards = [cards];
            } else {
                let max = parseInt(key);
                if (this.isContinuous(max, min)) {
                    tempCards.push(cards);
                    min = max;
                } else {
                    if (tempCards.length > 1) {
                        tempArr.push(tempCards);
                    }
                    min = max;
                    tempCards = [cards];
                }
            }
        }

        if (tempCards.length > 1) {
            tempArr.push(tempCards);
        }

        for (let i = 0; i < tempArr.length; i++) {
            let cards = tempArr[i];
            for (let j = 0; j < cards.length; j++) {
                let idx = j+2;
                while (idx <= cards.length) {
                    let temps = cards.slice(j, idx);
                    idx+=1;
                    if (!!this.lastCards && temps.length != this.lastCards.len) {
                        continue;
                    }

                    let finalCards = [];
                    temps.forEach(el=> {
                        finalCards = finalCards.concat(el);
                    });

                    let tempHolds = [].concat(out_holds);
                    this.delCards(tempHolds, finalCards);
                    let card = finalCards[0];
                    if (tempHolds.length >= temps.length*2) {
                        tempHolds.sort((a, b)=> {
                            let counta = this.getCardCount(out_holds, a);
                            let countb = this.getCardCount(out_holds, b);
                            if (counta == countb) {
                                return this.cardValue(a)-this.cardValue(b);
                            }

                            return counta-countb;
                        });
                        let others = tempHolds.slice(0,temps.length*2);
                        arr.push({
                            type: this.cardsType.AAABBB,
                            minVal: this.cardValue(card),
                            cards: finalCards.concat(this.sortCardValue(others)),
                            len: temps.length
                        });
                    } else {
                        if (out_holds.length < player_holds.length) {
                            break;
                        }

                        if (!!this.lastCards) {
                            if (!this.feiji_can_jie) {
                                break;
                            }
                        } else {
                            if (!this.feiji_can_chu) {
                                break;
                            }
                        }

                        arr.push({
                            type: this.cardsType.AAABBB,
                            minVal: this.cardValue(card),
                            cards: finalCards.concat(this.sortCardValue(tempHolds)),
                            len: temps.length
                        });
                    }

                    if (!!this.lastCards && temps.length == this.lastCards.len) {
                        break;
                    }
                }
            }
        }

        return arr;
    }

    /**
     * 自动先出牌 如果是单牌必然往大的出 不用考虑下家报单
     * @param player_holds
     * @returns {*}
     */
    findAutoCards(player_holds) {
        /** 如果是首出 并且是黑桃三先出 则必出黑桃三 */
        if (this.heitao3fisrt && player_holds.includes(41)) {
            let cards = this.getCards(player_holds, 41);
            if (!!cards && cards.length > 0) {
                if (cards.length >= 4) {
                    return this.getCardsData(cards);
                }

                return this.getCardsData([41]);
            }
        }

        let cardsData = super.findAutoCards(player_holds);
        return cardsData;
    }

    /**
     * 检查能不能出
     * @param player_holds
     * @param cards
     * @param alert
     */
    checkCanOut(player_holds, cards, alert=false) {
        let cardsData = super.checkCanOut(player_holds, cards, alert);
        if (!!cardsData) {
            /** 如果黑桃三先出 有黑桃三必出 */
            if (this.heitao3fisrt) {
                if (player_holds.includes(41) && !cardsData.cards.includes(41)) {
                    return;
                }
            }

            /** 如果下家报单 */
            if (!!alert) {
                /** 如果是打单 不是最大不能出 */
                if (cardsData.type == this.cardsType.A && !this.isMaxA(cardsData.minVal, player_holds)) {
                    return;
                }
            }
        }

        return cardsData;
    }

    /***
     * 三带二检测
     * @param cards
     * @returns {{minVal: number,  type: number}|null|undefined}
     */
    checkAAABB(cards, holds) {
        let cardsLen = cards.length;
        if (cardsLen > 5 || cardsLen < 3) {
            return;
        }

        let arr = this.get_all_AAABB(cards, holds);
        return arr[0];
    }

    /***
     * 飞机检测（5556667778可出）
     * @param cards
     * @returns {{minVal: number, length: *, type: number}|null|undefined}
     */
    checkAAABBB(cards, holds) {
        let cardsLen = cards.length;
        if (cardsLen < 6) {
            return;
        }

        let arr = this.get_all_AAABBB(cards, holds);
        /** 移除牌数不相等的 */
        if (arr.length > 0) {
            arr = arr.filter((el)=> {
                return el.cards.length == cards.length;
            });
        }

        if (arr.length > 0) {
            arr.sort((a, b)=> {
                if (a.len == b.len) {
                    return this.compareCardsData(a, b) ? 1 : -1;
                }

                return b.len-a.len;
            });
        }

        return arr[0];
    }

    /***
     * 四带二
     * @param cards
     * @returns {{minVal: number,  type: number}|null|undefined}
     */
    checkAAAABB(cards) {
        if (!this.can_sidaier) {
            return;
        }

        if (cards.length == 6) {
            let cardsMap = this.getCardsMap(cards);
            let keys = [];
            for (let key in cardsMap) {
                if (cardsMap[key].length == 4){
                    keys.push(key);
                    break;
                }
            }

            if (keys.length == 0) {
                return;
            }

            return {
                type: this.cardsType.AAAABB,
                cards: cards,
                minVal: parseInt(keys[0]),
            }
        }
    }

    /***
     * 四带三
     * @param cards
     * @returns {{minVal: number,  type: number}|null|undefined}
     */
    checkAAAABBB(cards) {
        if (!this.can_sidaisan) {
            return;
        }

        if (cards.length == 7) {
            let cardsMap = this.getCardsMap(cards);
            let keys = [];
            for (let key in cardsMap) {
                if (cardsMap[key].length == 4){
                    keys.push(key);
                    break;
                }
            }

            if (keys.length == 0) {
                return;
            }

            return {
                type: this.cardsType.AAAABBB,
                cards: cards,
                minVal: parseInt(keys[0]),
            }
        }
    }
}

// let algorithm = new Pdk_algorithm();
module.exports = Pdk_algorithm;