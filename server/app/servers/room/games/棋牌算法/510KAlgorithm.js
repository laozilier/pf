/**
 * Created by apple on 2018/1/22.
 */
const ActType = {
    CT_ERROR: 0,						//错误类型
    CT_SINGLE: 100,						//单牌类型
    CT_DOUBLE: 200,						//对子类型
    CT_THREE: 300,						//三条类型
    CT_DOUBLE_LINK: 400,						//对连类型
    CT_SINGLE_LINK: 500,						//单连类型
    CT_HU_DIE: 600,						//飞机类型
    CT_510K_DC: 2000,						//杂510K
    CT_510K_SC: 3000,						//纯510K
    CT_BOMB_4: 4000,						//4炸类型
    CT_BOMB_5: 6000,						//5弹类型
    CT_BOMB_6: 8000,						//6炸类型
    CT_BOMB_7: 10000,						//7炸类型
    CT_BOMB_8: 12000,						//8炸类型
    CT_BOMB_9: 14000,						//9炸类型
    CT_BOMB_10: 16000,						//10炸类型
    CT_BOMB_11: 18000,						//11炸类型
    CT_BOMB_TW: 20000						//天王炸弹
};

const pokers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53];

/**
 * 分牌
 * @type {number[]}
 */

const socreCards = [4, 17, 30, 43, 9, 22, 35, 48, 12, 25, 38, 51];

/**
 * 获取牌的面值
 * A=1
 * J=11
 * Q=12
 * K=13
 * @param card
 * @return {number}  返回牌的面值； 1,2,3,4,5,6,7,8,9,10,11,12,13
 */
function val(card) {
    let value = card % 13;
    if (card == 52) {
        return 16;
    } else if (card == 53) {
        return 17;
    } else {
        let i = [0, 1].indexOf(value);
        if (i > -1) {
            return 13 + i + 1;
        }
    }
    return (value + 1);
}

/**
 * 获取牌的类型
 * 0.方片；1.梅花；2.红桃；3.黑桃
 * @param card
 * @return {number} 类型  0.方片；1.梅花；2.红桃；3.黑桃
 */
function getType(card) {
    if ([52, 53].indexOf(card) > -1) {
        return 4;
    }
    return Math.floor(card / 13);
}

/**
 * 两张牌是否相连
 * @return {boolean} 如果相连返回true
 */
function isContinuous(max, min) {
    // todo: 2连不连（连队和顺子）
    if ([15, 16, 17].indexOf(max) > -1 || [15, 16, 17].indexOf(min) > -1) {
        return false;
    }
    if (max - min === 1) {
        return true;
    }
}

/**
 * 查找数量相同，且连续的值
 * @param cardsMap
 * @param continueCount
 * @returns {Array}
 */
function findContinueVals(cardsMap, continueCount) {
    // todo: 找出所有的连对
    let continueList = [];
    for (let i = 0; i < cardsMap.mapOther.sortedValsDesc.length - 1; i++) {
        let v = cardsMap.mapOther.sortedValsDesc[i];
        if (cardsMap.mapOther.valCardsMap[v].length < continueCount) {
            continue;
        }
        let lianDuiVal = [v];
        for (let j = i + 1; j < cardsMap.mapOther.sortedValsDesc.length; j++) {
            let nextV = cardsMap.mapOther.sortedValsDesc[j];
            if (cardsMap.mapOther.valCardsMap[nextV].length < continueCount) {
                break;
            }
            let curV = lianDuiVal[0];
            if (isContinuous(curV, nextV)) {
                lianDuiVal.unshift(nextV);
            } else {
                break;
            }
        }

        if (lianDuiVal.length > 1) {
            continueList.unshift(lianDuiVal);
            i += lianDuiVal.length - 1;// ?????
        }
    }
    //
    return continueList;
}

/**
 * 获取牌中喜的数量
 * @param cards
 * @param algRule
 * @returns {number}
 */
function getXiCount(cards, algRule) {
    let cardsMap = getCardsMap(cards);
    let checkType = checkBomb(cardsMap, algRule);
    if (!checkType) {
        return 0;
    }

    if (checkType.type <= ActType.CT_510K_SC) {
        return 0;
    }

    if (checkType.type == ActType.CT_BOMB_TW) {
        return 8 - algRule.xiCount + 1;
    }

    let redCount = 0;
    let blackCount = 0;
    let xiAmount = 0;

    let bombVal = cardsMap.sortedVals[0];
    let bombCards = cardsMap.valCardsMap[bombVal];
    if (bombCards.length >= algRule.xiCount) {
        xiAmount += bombCards.length - algRule.xiCount + 1;
    }

    if (algRule.is4r4b) {
        bombCards.forEach((c) => {
            if ([0, 2].indexOf(getType(c)) > -1) {
                redCount++;
            } else {
                blackCount++;
            }
        });

        if (redCount == 4) {
            xiAmount++;
        }

        if (blackCount == 4) {
            xiAmount++;
        }
    }

    return xiAmount;
}

/**
 * 控制喜数量
 * @param pokers 整副牌
 * @param algRule 算法规则
 * @param maxXiAmount 有玩家手牌超过maxXiAmount重新洗牌
 * @returns {boolean}
 */
function controlXi(pokers, algRule, maxXiAmount) {
    for (let i = 0; i < 4; i++) {
        let holds = pokers.slice(i * algRule.holdsAmount, (i + 1) * algRule.holdsAmount);
        let xiList = findLeftXi(holds, algRule);
        if (xiList.length >= maxXiAmount) {
            return false;
        }
    }
    return true;
}

/**
 * 查找手牌中的喜
 * @param cards
 * @param algRule
 * @returns {Array}
 */
function findLeftXi(cards, algRule) {
    let xiList = [];
    let holdsMap = get510kMap(cards, algRule);
    if (holdsMap.mapVariable.hasTW) {
        xiList.unshift([53, 53, 52, 52]);
    }
    for (let v of holdsMap.mapBoom.sortedVals) {
        let xiCards = holdsMap.mapBoom.valCardsMap[v].concat();
        if (getXiCount(xiCards, algRule) > 0) {
            xiList.unshift(holdsMap.mapBoom.valCardsMap[v]);
        }
    }
    return xiList;
}

/**
 * 获取值牌映射
 * @param cards
 * @returns {{cards: Array, valCardsMap, sortedVals: number[]}}
 */
function getCardsMap(cards) {
    //记录每张牌的数量
    let valCardsMap = {};

    let tempCards = [];

    cards.forEach(el => {
        let v = val(el);
        if (valCardsMap[v]) {
            valCardsMap[v].push(el);
        } else {
            valCardsMap[v] = [el];
        }
    });

    for (let val in valCardsMap) {
        valCardsMap[val].sort(function (a, b) {
            return b - a
        });
    }

    let sortedVals = Object.keys(valCardsMap).map(function (val) {
        return parseInt(val)
    });

    for (let i = 0; i < sortedVals.length - 1; i++) {
        for (let j = i + 1; j < sortedVals.length; j++) {
            // 数量多的考前
            if (valCardsMap[sortedVals[j]].length > valCardsMap[sortedVals[i]].length) {
                let temp = sortedVals[i];
                sortedVals[i] = sortedVals[j];
                sortedVals[j] = temp;
            }

            // 数量相同的牌值大的靠前
            if (valCardsMap[sortedVals[j]].length == valCardsMap[sortedVals[i]].length) {
                if (sortedVals[j] > sortedVals[i]) {
                    let temp = sortedVals[i];
                    sortedVals[i] = sortedVals[j];
                    sortedVals[j] = temp;
                }
            }
        }
    }

    let sortedValsDesc = sortedVals.concat();

    for (let i = 0; i < sortedValsDesc.length - 1; i++) {
        for (let j = i + 1; j < sortedValsDesc.length; j++) {
            if (sortedValsDesc[j] > sortedValsDesc[i]) {
                let temp = sortedValsDesc[i];
                sortedValsDesc[i] = sortedValsDesc[j];
                sortedValsDesc[j] = temp;
            }
        }
    }

    for (let val of sortedVals) {
        tempCards = tempCards.concat(valCardsMap[val]);
    }

    return {cards: tempCards, valCardsMap, sortedVals, sortedValsDesc};
}

/**
 * 用于托管时，查找510k牌型，的前期数据准备
 * @param cards
 * @returns {{map510k: {cards: Array, sortedVals: Array, valCardsMap: {}}, mapBoom: {cards: Array, sortedVals: Array, valCardsMap: {}}, mapVariable: {cards: Array, sortedVals: Array, valCardsMap: {}}, mapOther: {cards: Array, sortedVals: Array, valCardsMap: {}}}}
 */
function get510kMap(cards, algRule) {
    let cardsMap = getCardsMap(cards);
    let dianTuoMap = {
        map510k: {
            cards: [],
            sortedVals: [],
            valCardsMap: {}
        },
        list510k: [],
        mapBoom: {
            cards: [],
            sortedVals: [],
            valCardsMap: {}
        },
        mapVariable: {
            cards: [],
            sortedVals: [],
            valCardsMap: {},
            hasTW: false
        },
        mapOther: {
            cards: [],
            sortedVals: [],
            valCardsMap: {}
        },
        cards: cardsMap.cards
    };

    for (let v of cardsMap.sortedVals) {
        let vList = cardsMap.valCardsMap[v];
        if (vList.length > 3) { // 数量大于3的归于炸弹类
            dianTuoMap.mapBoom.valCardsMap[v] = cardsMap.valCardsMap[v].concat();
            dianTuoMap.mapBoom.sortedVals.push(v);
            dianTuoMap.mapBoom.cards = dianTuoMap.mapBoom.cards.concat(cardsMap.valCardsMap[v]);
        } else if ([5, 10, 13].indexOf(v) > -1) { // 510k类
            dianTuoMap.map510k.valCardsMap[v] = cardsMap.valCardsMap[v].concat();
            dianTuoMap.map510k.sortedVals.push(v);
            dianTuoMap.map510k.cards = dianTuoMap.map510k.cards.concat(cardsMap.valCardsMap[v]);
        } else if ([16, 17].indexOf(v) > -1) { // 癞子类
            dianTuoMap.mapVariable.valCardsMap[v] = cardsMap.valCardsMap[v].concat();
            dianTuoMap.mapVariable.sortedVals.push(v);
            dianTuoMap.mapVariable.cards = dianTuoMap.mapVariable.cards.concat(cardsMap.valCardsMap[v]);
        } else { // 其他牌
            dianTuoMap.mapOther.valCardsMap[v] = cardsMap.valCardsMap[v].concat();
            dianTuoMap.mapOther.sortedVals.push(v);
            dianTuoMap.mapOther.cards = dianTuoMap.mapOther.cards.concat(cardsMap.valCardsMap[v]);
        }
    }


    if (dianTuoMap.map510k.sortedVals.length < 3) {
        // 没有510k,510k归到普通类
        if (dianTuoMap.map510k.cards.length) {
            let cards = dianTuoMap.map510k.cards.concat(dianTuoMap.mapOther.cards);
            dianTuoMap.map510k = {
                cards: [],
                sortedVals: [],
                valCardsMap: {}
            };
            dianTuoMap.mapOther = getCardsMap(cards);
        }
    } else {
        // 有510k把配成款
        // 先找纯510k
        let colorCardsMap = {};
        let left510k = []; // 配成款后剩余的510k牌
        let leftCards = []; // 最后剩下的不成款的510k
        for (let c of dianTuoMap.map510k.cards) {
            let type = getType(c);
            if (!colorCardsMap.hasOwnProperty(type)) {
                colorCardsMap[type] = [c];
            } else {
                colorCardsMap[type].push(c);
            }
        }

        for (let t in colorCardsMap) {
            let cards = colorCardsMap[t];
            let cMap = getCardsMap(cards);
            if (cMap.sortedVals.length < 3) {
                left510k.push(...cards);
            } else {
                let cardsMin = cMap.valCardsMap[cMap.sortedVals[2]];
                let cardsMore = cMap.valCardsMap[cMap.sortedVals[1]];
                let cardsMost = cMap.valCardsMap[cMap.sortedVals[0]];
                for (let i = 0; i < cardsMin.length; i++) {
                    let k105 = [];
                    k105.push(cardsMin[i]);
                    k105.push(cardsMore[i]);
                    k105.push(cardsMost[i]);
                    dianTuoMap.list510k.push(k105);
                }

                left510k.push(...cardsMore.splice(cardsMin.length));
                left510k.push(...cardsMost.splice(cardsMin.length));
            }
        }

        // 剩余的510k牌还能不能配成杂510k
        let leftMap = getCardsMap(left510k);
        if (leftMap.sortedVals.length < 3) {
            leftCards.push(...left510k);
        } else {
            let cardsMin = leftMap.valCardsMap[leftMap.sortedVals[2]];
            let cardsMore = leftMap.valCardsMap[leftMap.sortedVals[1]];
            let cardsMost = leftMap.valCardsMap[leftMap.sortedVals[0]];
            for (let i = 0; i < cardsMin.length; i++) {
                let k105 = [];
                k105.push(cardsMin[i]);
                k105.push(cardsMore[i]);
                k105.push(cardsMost[i]);
                dianTuoMap.list510k.push(k105);
            }

            leftCards.push(...cardsMore.splice(cardsMin.length));
            leftCards.push(...cardsMost.splice(cardsMin.length));
        }

        // leftCards归到其它类型中
        let cards = leftCards.concat(dianTuoMap.mapOther.cards);
        delete dianTuoMap.map510k;
        dianTuoMap.mapOther = getCardsMap(cards);
    }

    // todo: 癞子就是癞子,作为特殊类型，可用天王炸，于增加炸弹威力，打对，单打
    if (dianTuoMap.mapVariable.cards.length == 4) {
        dianTuoMap.mapVariable.hasTW = true;
    }

    // 没有癞子且没有天王归到普通类，
    if (!algRule.hasVar && !dianTuoMap.mapVariable.hasTW) {
        let cards = dianTuoMap.mapVariable.cards.concat(dianTuoMap.mapOther.cards);
        dianTuoMap.mapVariable = {
            cards: [],
            sortedVals: [],
            valCardsMap: {}
        };
        dianTuoMap.mapOther = getCardsMap(cards);
    }

    return dianTuoMap;
}

/**
 * 检查炸弹
 * @param {Array} cards
 * @return {{type: number, cards: Array, val: number} || void}
 */
function checkBomb(cardsMap, algRule) {
    // todo: 注意天王炸
    if ([4, 5, 6, 7, 8, 9, 10, 11].indexOf(cardsMap.cards.length) == -1) {
        return;
    }

    if (cardsMap.sortedVals.length > 3) {
        return;
    }

    if (cardsMap.cards.length == 4 && cardsMap.sortedVals.length == 2) {
        if (cardsMap.sortedVals.join('') == '1716' &&
            cardsMap.valCardsMap[cardsMap.sortedVals[0]].length == 2 && cardsMap.valCardsMap[cardsMap.sortedVals[1]].length == 2) {
            return {
                type: ActType.CT_BOMB_TW,
                cards: cardsMap.cards,
                val: ActType.CT_BOMB_TW,
                length: cardsMap.cards.length
            }
        }
        return;
    }

    // 天王炸的最多张为2
    if (cardsMap.valCardsMap[cardsMap.sortedVals[0]].length < 4) {
        return;
    }


    let laiziAmount = 0;
    for (let i = 1; i < cardsMap.sortedVals.length; i++) {
        let val = cardsMap.sortedVals[i];
        // 其他拍必须为癞子
        if ([16, 17].indexOf(val) == -1) {
            return;
        }
        laiziAmount += cardsMap.valCardsMap[val].length;
    }

    // 癞子数量不超过4个
    if (laiziAmount > 3) {
        return;
    }

    let val = 0;
    let ratio = 100;
    for (let v in cardsMap.valCardsMap) {
        if (ratio == 100) {
            val += parseInt(v) * ratio;
            ratio = 1;
        } else {
            // val += parseInt(v) * cardsMap.valCardsMap[v].length;
            val += 16 * cardsMap.valCardsMap[v].length;// 在炸弹中癞子不区分大小
        }
    }

    return {
        type: ActType['CT_BOMB_' + cardsMap.cards.length],
        cards: cardsMap.cards,
        val: ActType['CT_BOMB_' + cardsMap.cards.length] + val,
        length: cardsMap.cards.length
    };
}

module.exports = {

    ActType: ActType,

    val: val,

    /**
     * 获取一副扑克牌
     * @param type true 16张模式
     */
    getPokers: function (algRule) {
        let _pokers = pokers.concat();
        if (algRule.withOut34) {
            _pokers = _pokers.filter((c) => val(c) > 4);
        }
        // 最大重洗牌次数
        let maxDealAmount = 4;
        //洗乱牌,控制喜
        do {
            _pokers.forEach(function (n, i) {
                let ii = parseInt(Math.random() * _pokers.length);
                _pokers[i] = _pokers[ii];
                _pokers[ii] = n;
            });
            maxDealAmount--;
        } while (maxDealAmount && !controlXi(_pokers, algRule, 2));
        return _pokers;
    },

    /**
     *  查找牌的类型
     *  1: 单张
     *  2: 对子
     *  3: 三张
     *  4: 连对
     *  5: 顺子
     *  6: 飞机
     *  7: 杂510K
     *  8: 纯510K
     *  9: 4炸类型
     * 10: 5炸类型
     * 11: 6炸类型
     * 12: 7炸类型
     * 13: 8炸类型
     * 14: 9炸类型
     * 15: 10炸类型
     * 16: 11炸类型
     * 17: 天王炸弹
     * @param cards
     * @return {{type: number, cards: *}}
     */

    /**
     * 获取值牌映射
     * @param cards
     * @returns {{cards: Array, valCardsMap, sortedVals: number[]}}
     */
    getCardsMap: getCardsMap,

    /**
     * 用于托管时，查找510k牌型，的前期数据准备
     * @param cards
     * @returns {{map510k: {cards: Array, sortedVals: Array, valCardsMap: {}}, mapBoom: {cards: Array, sortedVals: Array, valCardsMap: {}}, mapVariable: {cards: Array, sortedVals: Array, valCardsMap: {}}, mapOther: {cards: Array, sortedVals: Array, valCardsMap: {}}}}
     */
    get510kMap: get510kMap,

    /**
     * 查找飞机三带的随牌
     * @param cardsMap
     * @param length
     * @param exceptVals
     * @returns {Array}
     */
    findFollows: function (cardsMap, length, exceptVals) {
        // todo: typeObj为null即托管时，主动出牌，选取一张最小的牌(单独做一个方法)
        let cards = [];
        for (let i = cardsMap.mapOther.sortedVals.length - 1; i > -1; i--) {
            let v = cardsMap.mapOther.sortedVals[i];

            if (exceptVals.indexOf(v) == -1) {
                let k = cardsMap.mapOther.valCardsMap[v].length - 1;
                while (k > -1 && cards.length < length) {
                    cards.unshift(cardsMap.mapOther.valCardsMap[v][k]);
                    k--;
                }
            }
            if (cards.length == length) {
                // return cards;
                break;
            }
            // let cards = cardsMap.mapOther.valCardsMap[v];
            // let checkObj = this.parseType([card]);
            // if (this.compare(typeObj, checkObj)) {
            //     return [cardsMap.mapOther.valCardsMap[v].pop()]; // 返回要出的牌
            // }
        }

        // todo: 没有炸弹找癞子，天王炸不拆
        if (cards.length < length && !cardsMap.mapBoom.sortedVals.length && !cardsMap.mapVariable.hasTW) {
            for (let i = cardsMap.mapVariable.sortedVals.length - 1; i > -1; i--) {
                let v = cardsMap.mapVariable.sortedVals[i];
                if (exceptVals.indexOf(v) == -1) {
                    let k = cardsMap.mapVariable.valCardsMap[v].length - 1;
                    while (k > -1 && cards.length < length) {
                        cards.unshift(cardsMap.mapVariable.valCardsMap[v][k]);
                        k--;
                    }
                }
                if (cards.length == length) {
                    // return cards;
                    break;
                }
            }
        }

        return cards;
    },

    /**
     * 找出一个最小的单张
     * @param cardsMap
     * @returns {(ListItem|Buffer|*|T)[]}
     */
    findAMin: function (cards, algRule) {
        // todo: typeObj为null即托管时，主动出牌，选取一张最小的牌(单独做一个方法)
        let cardsMap = get510kMap(cards, algRule);
        for (let i = cardsMap.mapOther.sortedVals.length - 1; i > -1; i--) {
            let v = cardsMap.mapOther.sortedVals[i];
            if (cardsMap.mapOther.valCardsMap[v].length) {
                return [cardsMap.mapOther.valCardsMap[v].pop()];
            }
        }

        // todo: 没有炸弹找癞子，天王炸不拆
        if (cardsMap.mapBoom.sortedVals.length < 2 && !cardsMap.mapVariable.hasTW) {
            for (let i = cardsMap.mapVariable.sortedVals.length - 1; i > -1; i--) {
                let v = cardsMap.mapVariable.sortedVals[i];
                if (cardsMap.mapVariable.valCardsMap[v].length) {
                    return [cardsMap.mapVariable.valCardsMap[v].pop()];
                }
            }
        }

        return this.findBomb(cardsMap, algRule);
    },

    findA: function (cardsMap, typeObj) {
        // todo: typeObj为null即托管时，主动出牌，选取一张最小的牌(单独做一个方法)
        for (let i = cardsMap.mapOther.sortedVals.length - 1; i > -1; i--) {
            let v = cardsMap.mapOther.sortedVals[i];
            let card = cardsMap.mapOther.valCardsMap[v][0];
            let aMap = getCardsMap([card]);
            // let checkObj = this.parseType([card]);
            let checkObj = this.checkA(aMap);
            if (this.compare(typeObj, checkObj)) {
                return [cardsMap.mapOther.valCardsMap[v].pop()]; // 返回要出的牌
            }
        }

        // todo: 没有炸弹找癞子，天王炸不拆，只剩一个或0个炸弹时可拆癞子
        if (cardsMap.mapBoom.sortedVals.length < 2 && !cardsMap.mapVariable.hasTW) {
            for (let i = cardsMap.mapVariable.sortedVals.length - 1; i > -1; i--) {
                let v = cardsMap.mapVariable.sortedVals[i];
                let card = cardsMap.mapVariable.valCardsMap[v][0];
                let aMap = getCardsMap([card]);
                // let checkObj = this.parseType([card]);
                let checkObj = this.checkA(aMap);
                if (this.compare(typeObj, checkObj)) {
                    return [cardsMap.mapVariable.valCardsMap[v].pop()]; // 返回要出的牌
                }
            }
        }
    },

    /**
     * 查找对子
     * @param cardsMap
     * @param typeObj
     * @returns {*}
     */
    findAA: function (cardsMap, typeObj) {
        for (let i = cardsMap.mapOther.sortedVals.length - 1; i > -1; i--) {
            let v = cardsMap.mapOther.sortedVals[i];
            if (cardsMap.mapOther.valCardsMap[v].length > 2 && v > val(typeObj.cards[0])) {
                let cards = cardsMap.mapOther.valCardsMap[v].concat();
                cards = cards.splice(cards.length - 2);
                // let checkObj = this.parseType(cards);
                let aaMap = getCardsMap(cards);
                let checkObj = this.checkAA(aaMap);
                if (this.compare(typeObj, checkObj)) {
                    return cards; // 返回要出的牌
                }
            }
        }

        // todo: 没有炸弹找癞子，天王炸不拆
        if (!cardsMap.mapBoom.sortedVals.length && !cardsMap.mapVariable.hasTW) {
            for (let i = cardsMap.mapVariable.sortedVals.length - 1; i > -1; i--) {
                let v = cardsMap.mapVariable.sortedVals[i];
                if (cardsMap.mapVariable.valCardsMap[v].length > 2 && v > val(typeObj.cards[0])) {
                    let cards = cardsMap.mapVariable.valCardsMap[v].concat();
                    // let checkObj = this.parseType(cards);
                    let aaMap = getCardsMap(cards);
                    let checkObj = this.checkAA(aaMap);
                    if (this.compare(typeObj, checkObj)) {
                        return cards; // 返回要出的牌
                    }
                }
            }
        }
    },

    /**
     * 查找三张
     * @param cardsMap
     * @param typeObj
     * @returns {*}
     */
    findAAA: function (cardsMap, typeObj, algRule) {
        for (let i = cardsMap.mapOther.sortedVals.length - 1; i > -1; i--) {
            let v = cardsMap.mapOther.sortedVals[i];
            if (cardsMap.mapOther.valCardsMap[v].length == 3) {
                let body = cardsMap.mapOther.valCardsMap[v].concat();
                // cards = cards.splice(cards.length - 3);
                // todo: 匹配长度
                let followLength = typeObj.cards.length - 3;
                let exceptVals = [v];
                let follow = this.findFollows(cardsMap, followLength, exceptVals);
                let cardsLength = body.length + follow.length;
                if (follow.length == followLength || (cardsLength == cardsMap.cards.length)) {
                    let cards = body.concat(follow);
                    // let checkObj = this.parseType(cards);
                    let aaaMap = getCardsMap(cards);
                    let checkObj = this.checkAAA(aaaMap, algRule);
                    if (this.compare(typeObj, checkObj)) {
                        return cards; // 返回要出的牌
                    }
                }
            }
        }
    },

    /**
     * 查找顺子
     * @param cardsMap
     * @param typeObj
     * @returns {Array}
     */
    findABC: function (cardsMap, typeObj) {
        let count = 1;
        let continueList = findContinueVals(cardsMap, count);
        for (let lianVal of continueList) {
            if (lianVal.length < 5 || lianVal.length < typeObj.length) {
                continue;
            }

            for (let i = 0; i < lianVal.length - typeObj.length + 1; i++) {
                let cards = [];
                for (let v of lianVal) {
                    let cs = cardsMap.mapOther.valCardsMap[v].concat();
                    cs = cs.splice(cs.length - count);
                    cards.push(...cs);
                }

                // let checkObj = this.parseType(cards);
                let abcMap = getCardsMap(cards);
                let checkObj = this.checkABC(abcMap);
                if (this.compare(typeObj, checkObj)) {
                    return cards;
                }
            }
        }
    },

    /**
     * 查找连对
     * @param cardsMap
     * @param typeObj
     * @returns {Array}
     */
    findAABB: function (cardsMap, typeObj) {
        let count = 2;
        let continueList = findContinueVals(cardsMap, count);
        for (let lianVal of continueList) {
            if (lianVal.length < typeObj.length) {
                continue;
            }

            for (let i = 0; i < lianVal.length - typeObj.length + 1; i++) {
                let cards = [];
                for (let v of lianVal) {
                    let cs = cardsMap.mapOther.valCardsMap[v].concat();
                    cs = cs.splice(cs.length - count);
                    cards.push(...cs);
                }

                // let checkObj = this.parseType(cards);
                let aabbMap = getCardsMap(cards);
                let checkObj = this.checkAABB(aabbMap);
                if (this.compare(typeObj, checkObj)) {
                    return cards;
                }
            }
        }
    },

    /**
     * 查找飞机
     * @param cardsMap
     * @param typeObj
     * @returns {* || []}
     */
    findAAABBB: function (cardsMap, typeObj, algRule) {
        let count = 3;
        let continueList = findContinueVals(cardsMap, count);
        for (let lianVal of continueList) {
            if (lianVal.length < typeObj.length) {
                continue;
            }

            for (let i = 0; i < lianVal.length - typeObj.length + 1; i++) {
                let cards = [];
                let exceptVals = [];
                for (let j = i; j < i + typeObj.length; j++) {
                    let v = lianVal[j];
                    let cs = cardsMap.mapOther.valCardsMap[v].concat();
                    cs = cs.splice(cs.length - count);
                    cards.push(...cs);
                    exceptVals.push(v);
                }
                // for (let v of lianVal) {
                //     let cs = cardsMap.mapOther.valCardsMap[v].concat();
                //     cs = cs.splice(cs.length - count);
                //     cards.push(...cs);
                //     exceptVals.push(v);
                // }

                let followAmount = typeObj.cards.length - typeObj.length * count;
                let follow = this.findFollows(cardsMap, followAmount, exceptVals);
                let cardsLength = cards.length + follow.length;
                if ((follow.length < followAmount) && (cardsLength < cardsMap.cards.length)) {
                    return;
                }

                cards = cards.concat(follow);

                // let checkObj = this.parseType(cards);
                let aaabbbMap = getCardsMap(cards);
                let checkObj = this.checkAAABBB(aaabbbMap, algRule);
                if (this.compare(typeObj, checkObj)) {
                    return cards;
                }
            }
        }
    },

    /**
     * 要出能大于当前出牌的炸弹类型（包括510k）
     * @param cardsMap 通过get510kMap获得
     * @param typeObj
     * @returns {*}
     */
    findBomb: function (cardsMap, algRule, typeObj) {
        if (!typeObj || typeObj.type < ActType.CT_510K_DC) {
            // todo: 打510k
            if (cardsMap.list510k.length) {
                let k105 = cardsMap.list510k[cardsMap.list510k.length - 1];
                return k105.concat();
            }

            // todo: 出炸弹
            if (cardsMap.mapBoom.sortedVals.length) {
                return cardsMap.mapBoom.valCardsMap[cardsMap.mapBoom.sortedVals[cardsMap.mapBoom.sortedVals.length - 1]].concat();
            }

            // 出天王炸
            if (cardsMap.mapVariable.hasTW) {
                return cardsMap.mapVariable.cards.concat();
            }
        } else {
            // 510k，炸弹，癞子炸，天王炸
            if (cardsMap.list510k.length) {
                let k105 = cardsMap.list510k[0];
                let k105Map = getCardsMap(k105);
                let checkObj = this.check510k(k105Map, algRule);
                if (this.compare(typeObj, checkObj)) {
                    return k105.concat(); // 返回要出的牌
                }
            }

            if (cardsMap.mapBoom.sortedVals.length) {
                // 不加癞子
                for (let i = cardsMap.mapBoom.sortedVals.length - 1; i > -1; i--) {
                    let v = cardsMap.mapBoom.sortedVals[i];
                    if (cardsMap.mapBoom.valCardsMap[v].length >= typeObj.length) {
                        let boomCardsMap = getCardsMap(cardsMap.mapBoom.valCardsMap[v]);
                        let checkObj = this.checkBomb(boomCardsMap, algRule);
                        if (this.compare(typeObj, checkObj)) {
                            return cardsMap.mapBoom.valCardsMap[v].concat();
                        }
                    }
                }

                // 走到这里typeObj肯定不是510k,要加癞子的情况: 牌数量不够，数量够，牌值小
                // 判断凑几个癞子可以解决
                if (algRule.hasVar) {
                    let variableAmount = cardsMap.mapVariable.cards.length;
                    if (variableAmount > 0 && variableAmount < 4) {
                        // 癞子组合
                        let variableList = null;
                        if (variableAmount == 1) {
                            variableList = [[[52]], [[53]]];
                        } else if (variableAmount == 2) {
                            variableList = [[[52]], [[53]], [[52, 52,], [53, 52], [53, 53]]];
                        } else {
                            variableList = [[[52]], [[53]], [[52, 52,], [53, 52], [53, 53]], [[53, 52, 52], [53, 53, 52]]];
                        }
                        // let variableList = [[[52]],[[53]], [[52, 52,], [53, 52], [53, 53]], [[53, 52, 52], [53, 53, 52]]];
                        for (let vList of variableList) {
                            for (let i = cardsMap.mapBoom.sortedVals.length - 1; i > -1; i--) {
                                let v = cardsMap.mapBoom.sortedVals[i];
                                if ((cardsMap.mapBoom.valCardsMap[v].length + vList[0].length) >= typeObj.length) {
                                    for (let variable of vList) {// variable是个数组
                                        let boom = cardsMap.mapBoom.valCardsMap[v].concat(variable);
                                        let boomCardsMap = getCardsMap(boom);
                                        let checkObj = this.checkBomb(boomCardsMap, algRule);
                                        if (this.compare(typeObj, checkObj)) {
                                            // todo: 判断癞子是不是都在手牌中，返回炸弹和癞子的组合
                                            let isDone = true;
                                            let mapVar = getCardsMap(variable);
                                            for (let laiziVal of mapVar.sortedVals) {
                                                if (!cardsMap.mapVariable.valCardsMap.hasOwnProperty(laiziVal) || cardsMap.mapVariable.valCardsMap[laiziVal].length < mapVar.valCardsMap[laiziVal].length) {
                                                    // return boom;
                                                    isDone = false;
                                                    break;
                                                }
                                            }

                                            if (isDone) {
                                                return boom;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 天王炸
            if (cardsMap.mapVariable.cards.length == 4) {
                return cardsMap.mapVariable.cards.concat();
            }
        }
    },

    /**
     * 查找一首能够出的牌
     * @param cards
     * @param typeObj
     * @returns {*}
     */
    findGreater: function (cards, typeObj, algRule) {
        // todo: 没有typeObj返回最小的单张,或者癞子，或者510k,或者炸弹（桃江，灰山岗逻辑不同）
        if (!typeObj) {
            return this.findAMin(cards);
        }

        if (typeObj.type == ActType.CT_BOMB_TW) {
            return;
        }

        let holdsMap = get510kMap(cards, algRule);

        let checkCards = null;
        switch (typeObj.type) {
            case ActType.CT_SINGLE:
                checkCards = this.findA(holdsMap, typeObj);
                break;
            case ActType.CT_DOUBLE:
                checkCards = this.findAA(holdsMap, typeObj);
                break;
            case ActType.CT_THREE:
                checkCards = this.findAAA(holdsMap, typeObj, algRule);
                break;
            case ActType.CT_SINGLE_LINK:
                checkCards = this.findABC(holdsMap, typeObj);
                break;
            case ActType.CT_DOUBLE_LINK:
                checkCards = this.findAABB(holdsMap, typeObj);
                break;
            case ActType.CT_HU_DIE:
                checkCards = this.findAAABBB(holdsMap, typeObj, algRule);
                break;
        }

        if (!checkCards) {
            checkCards = this.findBomb(holdsMap, algRule, typeObj);
        }

        return checkCards;
    },

    /**
     * 解析牌型
     * @param cards
     * @returns {*}
     */
    parseType: function (cards, algRule) {
        console.log("查找牌的类型 " + cards);
        let func = [this.checkA, this.checkAA, this.checkAAA, this.checkABC, this.checkAABB, this.checkAAABBB, this.check510k, this.checkBomb];
        if (!algRule.allowSZ) {
            func.splice(3, 1);
        }
        let cardsMap = getCardsMap(cards);
        for (let i = 0; i < func.length; ++i) {
            let obj = func[i](cardsMap, algRule);
            if (obj) {
                return obj;
            }
        }
    },

    /**
     * 检查是否为单张
     * @param cards
     * @return {{type: number, cards: Array, val: number}}
     */
    checkA: function (cardsMap) {
        if (cardsMap.cards.length === 1) {
            return {
                type: ActType.CT_SINGLE,
                cards: cardsMap.cards,
                val: ActType.CT_SINGLE + cardsMap.sortedVals[0],
                length: cardsMap.cards.length
            };
        }
    },

    /**
     * 检查是否为对子
     * @param cards
     * @return {{type: number, cards: Array, val: number}}
     */
    checkAA: function (cardsMap) {
        if (cardsMap.cards.length === 2 && cardsMap.sortedVals.length == 1) {
            return {
                type: ActType.CT_DOUBLE,
                cards: cardsMap.cards,
                val: ActType.CT_DOUBLE + cardsMap.sortedVals[0],
                length: cardsMap.cards.length
            };
        }
    },

    /**
     * 检查三张
     * @param cards
     * @return {{type: number, cards: Array, val: number} || void}
     */
    checkAAA: function (cardsMap, algRule) {
        if (cardsMap.cards.length < 3) {
            return;
        }
        let allowLength = [3, 4, 5];
        // if (!algRule.allowAAABC && !algRule.allowAAABB) {
        //     allowLength.pop();
        //
        //     if (!algRule.allowAAAB) {
        //         allowLength.pop();
        //
        //         if (!algRule.allowAAA) {
        //             allowLength.pop();
        //         }
        //     }
        // }

        if (allowLength.indexOf(cardsMap.cards.length) == -1) {
            return;
        }

        let unregular = false;
        if (!algRule.allowAAA && cardsMap.cards.length == 3) {
            unregular = true;
        }

        if (!algRule.allowAAAB && cardsMap.cards.length == 4) {
            unregular = true;
        }


        // 不允许炸弹拆了做三带
        // if (cardsMap.valCardsMap[cardsMap.sortedVals[0]].length != 3) {
        //     return;
        // }

        // 5张只允许带对子
        // if (allowAAABB > 0 && allowAAABC == 0 && cardsMap.cards.length == 5) {
        //     if (cardsMap.sortedVals.length > 2) {
        //         return;
        //     }
        // }

        // 允许炸弹拆了做三带
        if (cardsMap.valCardsMap[cardsMap.sortedVals[0]].length < 3) {
            return;
        }

        if (cardsMap.valCardsMap[cardsMap.sortedVals[0]].length > 3) {
            if (cardsMap.sortedVals.length < 2) {
                console.log(`这不是三带，这是炸弹cards${cardsMap.cards}`);
                return;
            }

            // 有癞子的情况所带的牌全是王也不行
            if (algRule.hasVar) {
                let isAllVar = true;
                for (let i = 1; i < cardsMap.sortedVals.length; i++) {
                    let v = cardsMap.sortedVals[i];
                    if ([16, 17].indexOf(v) == -1) {
                        isAllVar = false;
                        break;
                    }
                }
                if (isAllVar) {
                    console.log(`这不是三带，这是带癞子的炸弹cards${cardsMap.cards}`);
                    return;
                }
            }
        }

        let jieAmount = cardsMap.cards.length;

        if (unregular) {
            if (algRule.allowAAAB && ([3].indexOf(cardsMap.cards.length) > -1)) {
                jieAmount = 4;
            } else {
                jieAmount = 5;
            }
        }

        return {
            type: ActType.CT_THREE,
            cards: cardsMap.cards,
            val: ActType.CT_THREE + cardsMap.sortedVals[0],
            length: 1,
            unregular: unregular,
            jieAmount: jieAmount
        };
    },

    /**
     * 检查顺子
     * @param cards
     */
    checkABC: function (cardsMap) {
        console.log("进入顺子的判定");
        if (cardsMap.cards.length < 5) {
            return;
        }

        // 每个值都必须有一张牌
        for (let i = 0; i < cardsMap.sortedVals.length; i++) {
            let val = cardsMap.sortedVals[i];
            if (cardsMap.valCardsMap[val].length != 1) {
                return;
            }

            if (i < cardsMap.sortedVals.length - 1) {
                let nextVal = cardsMap.sortedVals[i + 1];
                if (!isContinuous(val, nextVal)) {
                    return;
                }
            }
        }

        return {
            type: ActType.CT_SINGLE_LINK,
            cards: cardsMap.cards,
            val: ActType.CT_SINGLE_LINK + cardsMap.sortedVals[0],
            length: cardsMap.cards.length
        };
    },

    /**
     * 检查连对
     * @param cards
     * @return {*}
     */
    checkAABB: function (cardsMap) {
        if ((cardsMap.cards.length < 4) || (cardsMap.cards.length % 2 !== 0)) {
            return;
        }

        // 每个值都必须有两张牌
        for (let i = 0; i < cardsMap.sortedVals.length; i++) {
            let val = cardsMap.sortedVals[i];
            if (cardsMap.valCardsMap[val].length != 2) {
                return;
            }

            if (i < cardsMap.sortedVals.length - 1) {
                let nextVal = cardsMap.sortedVals[i + 1];
                if (!isContinuous(val, nextVal)) {
                    return;
                }
            }
        }

        // for(let i = 0; i < cardsMap.sortedVals.length - 1; ++i){
        //     let max = cardsMap.sortedVals[i];
        //     let min = cardsMap.sortedVals[i + 1];
        //     if(!isContinuous(min, max)){
        //         return;
        //     }
        // }

        return {
            type: ActType.CT_DOUBLE_LINK,
            cards: cardsMap.cards,
            val: ActType.CT_DOUBLE_LINK + cardsMap.sortedVals[0],
            length: cardsMap.cards.length / 2
        };
    },

    /**
     * 检查飞机
     * @param cards
     * @param length 飞机长度
     * @return {*}
     */
    checkAAABBB: function (cardsMap, algRule) {
        console.log('进入飞机检查');
        if (cardsMap.cards.length < 6) {
            return;
        }

        // todo: 炸弹不可拆
        // let mainVals = [];
        //
        // // 此处默认可拆炸弹
        // cardsMap.sortedVals.forEach(function(val) {
        //     if (cardsMap.valCardsMap[val].length > 2) {
        //         mainVals.push(val);
        //     }
        // });
        //
        // // 是否连续
        // for (let i = 0; i < mainVals.length - 1; i++) {
        //     let val = mainVals[i];
        //     let nextVal = mainVals[i + 1];
        //     if(!isContinuous(val, nextVal)){
        //         return;
        //     }
        // }

        // todo: 炸弹可拆
        let feiJiMap = {
            mapOther: JSON.parse(JSON.stringify(cardsMap))
        };

        // 自动选牌中mapOther中是不存在4个的牌，而主动出牌，有可能把炸弹作为飞机出，所以此处应把sortedVals从大到小排序
        feiJiMap.mapOther.sortedVals.sort((a, b) => b - a);

        let continueList = findContinueVals(feiJiMap, 3);

        if (!continueList || !continueList.length) {
            return;
        }

        // todo: 找到一个最长的三连作为主体,长度相同取值大的
        continueList.sort((a, b) => {
            if (a.length == b.length) {
                return val(b[0]) - val(a[0]);
            } else {
                return b.length - a.length;
            }
        });

        if (continueList[0].length < 2) {
            return;
        }

        let mainVals = continueList[0];//

        // 所带的牌只能少不能多，unregular表示不符合正常牌型，如果是最后一手牌则可出
        let mainAmount = 3 * mainVals.length;
        let followAmount = cardsMap.cards.length - mainAmount;

        // 所带的牌只能少不能多, 此处默认最多带两张
        if (followAmount > 2 * mainVals.length) {
            return;
        }


        let allowLength = [3, 4, 5];
        let threeLength = Math.ceil(cardsMap.cards.length / mainVals.length);
        if (allowLength.indexOf(threeLength) == -1) {
            return;
        }

        let unregular = false;
        let jieAmount = cardsMap.cards.length;
        if (followAmount % mainVals.length == 0) {
            if (!algRule.allowAAA && threeLength == 3) {
                unregular = true;
            }

            if (!algRule.allowAAAB && threeLength == 4) {
                unregular = true;
            }
        } else {
            unregular = true;
        }

        // 不规则的加一个jieAmount属性，当当为不规则三带或者飞机的时候，
        if (unregular) {
            if (algRule.allowAAAB && ([3, 4].indexOf(threeLength) > -1)) {
                jieAmount = mainVals.length * 4;
            } else {
                jieAmount = mainVals.length * 5;
            }
        }

        return {
            type: ActType.CT_HU_DIE,
            cards: cardsMap.cards,
            val: ActType.CT_HU_DIE + cardsMap.sortedVals[0],
            length: mainVals.length,
            unregular: unregular,
            jieAmount: jieAmount
        };
    },

    /**
     * 510k判定
     * @param cardsMap
     * @param algRule
     * @returns {{type: number, cards: *, val: number, length: *} || void}
     */
    check510k: function (cardsMap, algRule) {
        console.log("进入５１０Ｋ的判定");
        if (cardsMap.cards.length != 3) {
            return;
        }

        if (cardsMap.sortedVals.join('') != '13105') {
            return;
        }

        // for (let i = 0; i < cardsMap.sortedVals.length; i++) {
        //     let val = cardsMap.sortedVals[i];
        //     if ([5, 10, 13].indexOf(val) == -1) {
        //         return;
        //     }
        // }

        let type5 = getType(cardsMap.valCardsMap[5][0]);
        let type10 = getType(cardsMap.valCardsMap[10][0]);
        let typek = getType(cardsMap.valCardsMap[13][0]);

        let type = ActType.CT_510K_DC;
        if (type5 == type10 && type10 == typek) {
            type = ActType.CT_510K_SC
        }
        // todo: 510k分花色
        let value = type;
        if (algRule.color510k && type == ActType.CT_510K_SC) {
            value += type5 * 100;
        }
        return {
            type: type,
            cards: cardsMap.cards,
            val: value,//type + cardsMap.sortedVals[0]
            length: cardsMap.cards.length
        };
        console.log("进入５１０Ｋ判断不成立");
    },

    /**
     * 检查炸弹
     * @param {Array} cards
     * @return {{type: number, cards: Array, val: number} || void}
     */
    checkBomb: checkBomb,

    /**
     * 比较两手牌大小
     * @param left
     * @param right
     * @return {boolean}  左>右 = true
     */
    compare: function (prev, curr) {
        if (curr.type < prev.type) {
            return false;
        }

        // 顺子连对必须数量严格匹配，三带飞机看选项
        if (curr.type == prev.type) {
            if (prev.type == ActType.CT_SINGLE_LINK || prev.type == ActType.CT_DOUBLE_LINK || prev.type == ActType.CT_HU_DIE) {
                if (prev.length != curr.length) {
                    return false;
                }
            }

            // todo: 三带，飞机，要带上玩法选项去比较
            if (curr.val > prev.val) {
                return true;
            } else {
                return false;
            }
        }

        if (curr.type >= ActType.CT_510K_DC) {
            return true;
        }
        return false;
    },
    /**
     * 获取牌中喜的数量
     * @param cards
     * @param algRule
     * @returns {number}
     */
    getXiCount: getXiCount,
    /**
     * 获取剩余手牌中的喜
     * @param cards
     * @param algRule
     * @returns {Array}
     */
    findLeftXi: findLeftXi
};