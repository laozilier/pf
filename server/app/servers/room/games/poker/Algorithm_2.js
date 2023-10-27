/**
 * 此算法适用于
 * 跑得快 千分 掂坨
 * */
class Algorithm_2 extends require('./Poker') {
    constructor() {
        super();

        this.checkFunc = [
            this.checkA,
            this.checkAA,
            this.checkAAABB,
            this.checkAABB,
            this.checkABC,
            this.checkAAABBB,
            this.checkAAAA,
        ];
    }

    /***
     * 牌面值
     * @param card
     */
    cardValue(card) {
        let value = card % 13;
        if (card === 53) {
            return 40;
        } else if (card === 52) {
            return 30;
        } else if (value == 1) {
            return 20;
        } else if (value == 0) {
            return 14;
        } else {
            return value+1;
        }
    }

    /**
     * 获取所有炸弹
     * @param holds
     */
    get_all_AAAA(holds) {
        let arr = [];
        let cardsMap = this.getCardsMap(holds);
        let keys = Object.keys(cardsMap);
        this.sortDown(keys);
        keys.forEach(key=> {
            let cards = cardsMap[key];
            if (cards.length >= 4) {
                arr.push({
                    type: this.cardsType.AAAA,
                    cards: cards,
                    minVal: this.cardValue(cards[0])
                });

                this.delCards(holds, cards);
            }
        });

        arr.sort((a, b)=> {
            let lena = a.cards.length;
            let lenb = b.cards.length;

            if (lena == lenb) {
                return b.minVal-a.minVal;
            }

            return lenb-lena;
        });

        return arr;
    }

    /**
     * 删除手牌
     * @param holds
     * @param cards
     */
    delCards(holds, cards) {
        cards.forEach(el=> {
            holds.splice(holds.indexOf(el), 1);
        });
    }

    /**
     * 获取所有单张
     * @param holds
     */
    get_all_A(holds) {
        let arr = [];
        if (holds.length == 0) {
            return arr;
        }

        let cardsMap = this.getCardsMap(holds);
        let keys = Object.keys(cardsMap);
        this.sortDown(keys);
        keys.forEach(key=> {
            let cards = cardsMap[key];
            if (cards.length < 4) {
                let card = cards[0];
                arr.push({
                    type: this.cardsType.A,
                    minVal: this.cardValue(card),
                    cards: [card]
                });
            }
        });

        return arr;
    }

    /**
     * 获取所有对子
     * @param holds
     */
    get_all_AA(holds) {
        let arr = [];
        if (holds.length < 2) {
            return arr;
        }

        let cardsMap = this.getCardsMap(holds);
        let keys = Object.keys(cardsMap);
        this.sortDown(keys);
        keys.forEach(key=> {
            let cards = cardsMap[key];
            if (cards.length < 4 && cards.length > 1) {
                let card = cards[0];
                arr.push({
                    type: this.cardsType.AA,
                    minVal: this.cardValue(card),
                    cards: cards.slice(0,2)
                });
            }
        });

        return arr;
    }

    /**
     * 获取所有连对
     * @param holds
     * @returns {Array}
     */
    get_all_AABB(holds) {
        let arr = [];
        if (holds.length < 4) {
            return arr;
        }

        let cardsMap = this.getCardsMap(holds);
        let keys = Object.keys(cardsMap);
        this.sort(keys);

        let tempArr = [];
        let tempCards = [];
        let min = -1;
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let cards = cardsMap[key];
            if (cards.length == 4 || cards.length < 2) {
                continue;
            }

            if (min < 0) {
                min = parseInt(key);
                tempCards = [cards.slice(0,2)];
            } else {
                let max = parseInt(key);
                if (this.isContinuous(max, min)) {
                    tempCards.push(cards.slice(0,2));
                    min = max;
                } else {
                    if (tempCards.length > 1) {
                        tempArr.push(tempCards);
                    }
                    min = max;
                    tempCards = [cards.slice(0,2)];
                }
            }
        }

        if (tempCards.length > 1) {
            tempArr.push(tempCards);
        }

        for (let i = 0; i < tempArr.length; i++) {
            let cards = tempArr[i];
            for (let j = 0; j < cards.length; j++) {
                let idx = 0;
                while (idx+j+2 <= cards.length) {
                    let temps = cards.slice(j, idx+j+2);
                    let finalCards = [];
                    temps.forEach(el=> {
                        finalCards = finalCards.concat(el);
                    });
                    arr.push({
                        type: this.cardsType.AABB,
                        minVal: this.cardValue(finalCards[0]),
                        cards: finalCards
                    });
                    idx+=1;
                }
            }
        }

        return arr;
    }

    /**
     * 获取所有三带
     * @param out_holds
     * @param player_holds
     */
    get_all_AAABB(out_holds, player_holds) {
        let arr = [];
        if (out_holds.length < 5) {
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
                if (tempHolds.length > 1) {
                    tempHolds.sort((a, b)=> {
                        let counta = this.getCardCount(out_holds, a);
                        let countb = this.getCardCount(out_holds, b);
                        if (counta == countb) {
                            return this.cardValue(a)-this.cardValue(b);
                        }

                        return counta-countb;
                    });
                    let others = tempHolds.slice(0,2);
                    let card = cards[0];
                    arr.push({
                        type: this.cardsType.AAABB,
                        minVal: this.cardValue(card),
                        cards: cards.concat(this.sortCardValue(others))
                    });
                }

            }
        });

        return arr;
    }

    /**
     * 获取所有顺子
     * @param holds
     * @returns {Array}
     */
    get_all_ABC(holds) {
        let arr = [];
        if (holds.length < 5) {
            return arr;
        }

        let cardsMap = this.getCardsMap(holds);
        let keys = Object.keys(cardsMap);
        this.sort(keys);
        let tempArr = [];
        let tempCards = [];
        let min = -1;
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let cards = cardsMap[key];
            if (min < 0) {
                min = parseInt(key);
                tempCards = [cards[0]];
            } else {
                let max = parseInt(key);
                if (this.isContinuous(max, min)) {
                    tempCards.push(cards[0]);
                    min = max;
                } else {
                    if (tempCards.length >= 5) {
                        tempArr.push(tempCards);
                    }
                    min = max;
                    tempCards = [cards[0]];
                }
            }
        }

        if (tempCards.length >= 5) {
            tempArr.push(tempCards);
        }

        for (let i = 0; i < tempArr.length; i++) {
            let cards = tempArr[i];
            for (let j = 0; j < cards.length; j++) {
                let idx = 0;
                while (idx+j+5 <= cards.length) {
                    let temps = cards.slice(j, idx+j+5);
                    arr.push({
                        type: this.cardsType.ABC,
                        minVal: this.cardValue(temps[0]),
                        cards: temps
                    });
                    idx+=1;
                }
            }
        }

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
        if (out_holds.length < 10) {
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
            if (cards.length != 3) {
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
     * 自动先出牌
     * @param player_holds
     * @returns {*}
     */
    findAutoCards(player_holds) {
        let holds = [].concat(player_holds);
        /** 如果剩下的手牌刚好能出完 */
        let cardsData = this.getCardsData(holds);
        if (!!cardsData) {
            return cardsData;
        }

        /** 否则先找炸弹 */
        let AAAAs = this.get_all_AAAA(holds);
        /** 再找单张 */
        let As = this.get_all_A(holds);
        if (As.length > 0) {
            cardsData = As[0];
            return cardsData;
        }

        cardsData = AAAAs[0];
        return cardsData;
    }

    /**
     * 自动找到一手比出的牌大的牌
     * @param player_holds
     */
    findAutoBigCards(player_holds) {
        let holds = [].concat(player_holds);
        let AAAAs = this.get_all_AAAA(holds);
        if (this.lastCards.type == this.cardsType.AAAA) {
            if (AAAAs.length > 0) {
                let cardsData = AAAAs[0];
                if (this.compareCardsData(this.lastCards, cardsData)) {
                    return cardsData;
                }
            }
        } else {
            let arr = [];
            if (this.lastCards.type == this.cardsType.A) {
                arr = this.get_all_A(holds);
            } else if (this.lastCards.type == this.cardsType.AA) {
                arr = this.get_all_AA(holds);
            } else if (this.lastCards.type == this.cardsType.AAABB) {
                arr = this.get_all_AAABB(holds);
            }

            if (arr.length > 0) {
                let cardsData = arr[0];
                if (this.compareCardsData(this.lastCards, cardsData)) {
                    return cardsData;
                }
            }

            if (this.lastCards.type == this.cardsType.AABB) {
                arr = this.get_all_AABB(holds);
            } else if (this.lastCards.type == this.cardsType.ABC) {
                arr = this.get_all_ABC(holds);
            } else if (this.lastCards.type == this.cardsType.AAABBB) {
                arr = this.get_all_AAABBB(holds);
            }

            if (arr.length > 0) {
                for (let i = 0; i < arr.length; i++) {
                    let cardsData = arr[i];
                    if (this.compareCardsData(this.lastCards, cardsData)) {
                        return cardsData;
                    }
                }
            }

            if (AAAAs.length > 0) {
                let cardsData = AAAAs[0];
                return cardsData;
            }
        }
    }

    /**
     * 检查能不能出
     * @param player_holds
     * @param cards
     * @param alert
     */
    checkCanOut(player_holds, cards, alert=false) {
        let holds = [].concat(player_holds);
        /** 检查手牌是否有打出去的牌 */
        let tempData = [].concat(cards);
        holds.forEach((el) => {
            let idx = tempData.indexOf(el);
            if (idx >= 0) {
                tempData.splice(idx, 1);
            }
        });

        if (tempData.length > 0) {
            return;
        }

        let cardsData = this.getCardsData(cards, holds);
        if (!cardsData) {
            return;
        }

        if (cardsData.type != this.cardsType.AAAA) {
            if (this.cannot_bomb) {
                let mapCards = this.getCardsMap(cardsData.cards);
                let mapHolds = this.getCardsMap(holds);
                for (let key in mapCards) {
                    let len1 = mapCards[key].length;
                    if (len1 >= 4) {
                        let len2 = mapHolds[key].length;
                        if (len1 != len2) {
                            return;
                        }
                    }
                }
            }
        }

        if (!!this.lastCards) {
            /** 如果比上一手牌小 则不能出 */
            if (!this.compareCardsData(this.lastCards, cardsData)) {
                return;
            }
        }

        return cardsData;
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
     * 比较两手牌的大小
     * @param left
     * @param right
     * @returns {boolean}
     */
    compareCardsData(left, right) {
        /** 如果右边没有直接返回false */
        if (!right || right.type == this.cardsType.NONE) {
            return false;
        }

        /** 如果左边是炸弹 则只有更大的炸弹才能出 */
        if (left.type == this.cardsType.AAAA) {
            if (right.type != this.cardsType.AAAA) {
                return false;
            }

            if (right.cards.length < left.cards.length) {
                return false;
            }

            if (right.cards.length > left.cards.length) {
                return true;
            }

            return right.minVal > left.minVal;
        } else {
            if (right.type == this.cardsType.AAAA) {
                return true;
            }

            if (right.type == left.type) {
                if (right.type == this.cardsType.AAABB) {
                    return right.minVal > left.minVal;
                } else if (right.type == this.cardsType.AAABBB) {
                    return right.len == left.len && right.minVal > left.minVal;
                } else {
                    return right.cards.length == left.cards.length && right.minVal > left.minVal;
                }
            }
        }

        return false;
    }

    getCardsData(cards, holds=[]) {
        for (let i = 0; i < this.checkFunc.length; ++i) {
            let res = this.checkFunc[i].call(this, cards, holds);
            if (!!res) {
                return res;
            }
        }
    }

    /***
     * 单张检测
     * @param cards
     * @returns {{minVal: (number|*),  type: number}}
     */
    checkA(cards) {
        if (cards.length === 1) {
            return {
                type: this.cardsType.A,
                cards: cards,
                minVal: this.cardValue(cards[0]),
            }
        }
    }

    /***
     * 对子检测
     * @param cards
     * @returns {{minVal: (number|*),  type: number}}
     */
    checkAA(cards) {
        if (cards.length === 2 && this.cardValue(cards[0]) === this.cardValue(cards[1])) {
            return {
                type: this.cardsType.AA,
                cards: cards,
                minVal: this.cardValue(cards[0]),
            }
        }
    }

    /***
     * 三带二检测
     * @param cards
     * @param holds
     * @returns {{minVal: number,  type: number}|null|undefined}
     */
    checkAAABB(cards, holds) {
        if (cards.length == 5) {
            let arr = this.get_all_AAABB(cards, holds);
            return arr[0];
        }
    }

    /***
     * 连对检测
     * @param cards
     * @returns {{minVal: number,  type: number}|null|undefined}
     */
    checkAABB(cards) {
        if (cards.length >= 4 && cards.length%2 == 0) {
            let cardsMap = this.getCardsMap(cards);
            let keys = Object.keys(cardsMap);

            for(let key in cardsMap) {
                if (cardsMap[key].length !== 2)
                    return;
            }

            this.sort(keys);
            for(let i = 1; i < keys.length; ++i){
                if(!this.isContinuous(parseInt(keys[i]), parseInt(keys[i-1])))
                    return;
            }

            console.log(keys);
            return {
                type: this.cardsType.AABB,
                cards: this.sortCardValue(cards),
                minVal: parseInt(keys[0]),
            }
        }
    }

    /***
     * 顺子检测
     * @param cards
     * @returns {{minVal: number,  type: number} \ null}
     */
    checkABC(cards) {
        if (cards.length >= 5) {
            let cardsMap = this.getCardsMap(cards);
            let keys = Object.keys(cardsMap);

            for(let key in cardsMap) {
                if (cardsMap[key].length !== 1)
                    return;
            }

            this.sort(keys);
            for(let i = 1; i < keys.length; ++i){
                if(!this.isContinuous(parseInt(keys[i]), parseInt(keys[i-1])))
                    return;
            }

            return {
                type: this.cardsType.ABC,
                cards: this.sortCardValue(cards),
                minVal: parseInt(keys[0]),
            }
        }
    }

    /***
     * 飞机检测（5556667778可出）
     * @param cards
     * @param holds
     * @returns {{minVal: number, length: *, type: number}|null|undefined}
     */
    checkAAABBB(cards, holds) {
        if (cards.length < 10 || cards.length%5 != 0) {
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
                return this.compareCardsData(a, b) ? 1 : -1;
            });
        }

        return arr[0];
    }

    /***
     * 炸弹检测
     * @param cards
     * @returns {{minVal: number,  type: number}}
     */
    checkAAAA(cards) {
        if (cards.length >= 4) {
            let cardsMap = this.getCardsMap(cards);
            let keys = Object.keys(cardsMap);
            if(keys.length === 1) {
                return {
                    type: this.cardsType.AAAA,
                    cards: cards,
                    minVal: parseInt(keys[0]),
                }
            }
        }
    }
}

module.exports = Algorithm_2;