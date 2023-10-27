/**
 * Created by T-Vick on 2018/10/11.
 */

const Pattern = {
    WU_LONG: 0,// 乌龙0x11100-0xEEEEE(0xEEEEE的10进制为978670<1000000)

    DUI_ZI: 10,// 对子0x1100 + 10 * 1000000 -- 0xEEEE + 10 * 1000000

    LIANG_DUI: 20,// 两对0x111 + 20 * 1000000 -- 0xEEE + 20 * 1000000

    SAN_TIAO: 30,// 三条 0x111 + 30 * 1000000 -- 0xEEE + 30 * 1000000

    CHONG_SAN: 31, // 冲三

    SHUN_ZI: 40,// 顺子 6 + 40 * 1000000 -- 14 + 40 * 100000

    TONG_HUA: 50,// 同花 0x11111 + 50 * 1000000 -- 0xEEEEE + 50 * 1000000

    HU_LU: 60,// 葫芦 0x11 + 60 * 1000000 -- 0xEE + 60 * 1000000

    ZHONG_DUN_HU_LU: 61,// 中墩葫芦

    TIE_ZHI: 70,// 铁支 0x11 + 70 * 1000000 -- 0xEE + 70 * 1000000

    TONG_HUA_SHUN: 80,// 同花顺 6 + 80 * 1000000 -- 14 + 80 * 1000000

    WU_TONG: 90,// 五同 2 + 90 * 1000000 -- 14 + 90 * 1000000

    SAN_TONG_HUA: 100,// 三同花 100 + 100000000

    LIU_XIAO: 110, // 六小 100 + 100000000 (todo: 新增牌型)

    SAN_SHUN_ZI: 120,// 三顺子 120 + 100000000

    LIU_DUI_BAN: 140,// 六对半 140 + 100000000

    WU_DUI_SAN_TIAO: 160,// 五对三条 160 + 100000000

    SI_SAN_TIAO: 180,//四套三条 180 + 100000000

    COU_YI_SE: 200,// 清一色 200 + 100000000

    QUAN_XIAO: 220,// 全小 220 + 100000000

    QUAN_DA: 240,// 全大 240 + 100000000

    SAN_TIAN_XIA: 260,// 三分天下 260 + 100000000

    SAN_TONG_HUA_SHUN: 280,// 三同花顺 280 + 100000000

    SHI_ER_HUANG_ZU: 300,// 十二皇族 300 + 100000000

    YI_TIAO_LONG: 320,// 一条龙 320 + 100000000

    QING_LONG: 340 // 青龙 340 + 100000000                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       00000
};

const Color = {
    FANG_PIAN: 0,
    MEI_HUA: 1,
    HONG_TAO: 2,
    HEI_TAO: 3
};

const pokers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];
const diamonds = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const clubs = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
const hearts = [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38];
const spades = [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51];

exports.getPokers = function (algRule) {
    let _pokers = pokers.concat();
    if (algRule.moreCards & 8) {
        _pokers = _pokers.concat(spades);
    }
    if (algRule.moreCards & 4) {
        _pokers = _pokers.concat(hearts);
    }

    if (algRule.moreCards & 2) {
        _pokers = _pokers.concat(clubs);
    }

    if (algRule.moreCards & 1) {
        _pokers = _pokers.concat(diamonds);
    }

    // if (algRule.oneMoreColor) {
    //     // 加一红桃色
    //     _pokers = _pokers.concat(hearts);
    // }
    //
    // if (algRule.twoMoreColor) {
    //     _pokers = _pokers.concat(clubs).concat(hearts);
    // }
    //洗乱牌
    _pokers.forEach(function (n, i) {
        let ii = parseInt(Math.random() * _pokers.length);
        _pokers[i] = _pokers[ii];
        _pokers[ii] = n;
    });
    return _pokers;
}
/**
 * 获取推荐牌型
 * @param pais
 * @param algRule
 * @returns {Array}
 */
exports.getRecommendations = function (cards, algRule) {
    let cardsMap = getCardsMap(cards);
    // 1. 获取特殊牌的推荐类型
    let specialList = findSpecial(cardsMap, algRule);
    // 2. 获取普通牌的推荐类型
    let generalList = findGeneral(cardsMap);
    return specialList.concat(generalList);
};

exports.checkPattern = checkPattern;

/**
 * 校验一道牌或一首特殊牌的牌型
 * @param cards
 * @param daoIndex
 * @param algRule
 * @returns {*}
 */
function checkPattern(cards, daoIndex, algRule) {
    if ([3, 5, 13].indexOf(cards.length) == -1) {
        return;
    }

    let cardsMap = getCardsMap(cards);
    let colorMap = getColorMap(cards);

    if (cards.length == 13) {
        return checkSpecial(cardsMap, colorMap, algRule);
    } else {
        return checkGeneral(cardsMap, colorMap, daoIndex, algRule);
    }
};

/**
 * 校验特殊牌型
 * @param cardsMap
 * @param colorMap
 * @param algRule
 * @returns {*}
 */
function checkSpecial(cardsMap, colorMap, algRule) {
    // todo: 根据算法规则过滤掉一些不支持的特殊牌型
    let cards = cardsMap.cards;
    let maxCount = cardsMap.valCardsMap[cardsMap.sortedVals[0]].length;
    let maxColor = colorMap.colorCardsMap[colorMap.sortedColors[0]].length;
    if (maxCount == 1 && maxColor == 13) {
        if (algRule.withOutSpecial) {
            //青龙
            return {
                cards: cards,
                pattern: Pattern.YI_TIAO_LONG,
                value: 100000000 + Pattern.YI_TIAO_LONG,
                scoreBig: 52,
                scoreExt: 0
            };
        }
        //青龙
        return {
            cards: cards,
            pattern: Pattern.QING_LONG,
            value: 100000000 + Pattern.QING_LONG,
            scoreBig: 108,
            scoreExt: 0
        };
    }

    // 勾选了无特殊牌型，只保留清龙牌型
    if (algRule.withOutSpecial) {
        return;
    }

    //一条龙
    if (maxCount == 1) {
        //一条龙
        return {
            cards: cards,
            pattern: Pattern.YI_TIAO_LONG,
            value: 100000000 + Pattern.YI_TIAO_LONG,
            scoreBig: 52,
            scoreExt: 0
        };
    }

    // todo: 广西十三水没有十二皇族
    //十二皇族
    // if (cardsMap.sortedValsDesc[cardsMap.sortedValsDesc.length - 1] > 10) {
    //     //十二皇族
    //     return {
    //         cards: cards,
    //         pattern: Pattern.SHI_ER_HUANG_ZU,
    //         value: 100000000 + Pattern.SHI_ER_HUANG_ZU,
    //         scoreBig: 24,
    //         scoreExt: 0
    //     };
    // }
    // 三同花顺
    let sths_list = checkABC3sameColor(colorMap);
    if (sths_list) {
        // todo: 比较中道和尾道两个顺子的大小，如果倒水交换中道跟尾道
        // todo: 这一步主要是因为A2345可能比910JQK大，这里做一个配置选项A2345是否凭A大
        swapABC(sths_list, Pattern.TONG_HUA_SHUN);
        let tong_hua_shun_pai = [];
        sths_list.forEach(function (shunzi) {
            tong_hua_shun_pai = tong_hua_shun_pai.concat(shunzi);
        });
        return {
            cards: tong_hua_shun_pai,
            pattern: Pattern.SAN_TONG_HUA_SHUN,
            value: 100000000 + Pattern.SAN_TONG_HUA_SHUN,
            scoreBig: 18,
            scoreExt: 0
        };
    }

    //三分天下
    if (cardsMap.sortedVals.length < 5) {
        // todo: 必须有3个4张的
        let count4 = 0;
        for (let v of (cardsMap.sortedVals)) {
            count4 += Math.floor(cardsMap.valCardsMap[v].length / 4);
        }

        if (count4 == 3) {
            //三分天下
            return {
                cards: cards,
                pattern: Pattern.SAN_TIAN_XIA,
                value: 100000000 + Pattern.SAN_TIAN_XIA,
                scoreBig: 16,
                scoreExt: 0
            };
        }
    }
    // todo: 广西没有全大全小、凑一色
    //全大全小
    // if (cardsMap.sortedValsDesc[cardsMap.sortedValsDesc.length - 1] > 7) {
    //     //全大
    //     return {
    //         cards: cards,
    //         pattern: Pattern.QUAN_DA,
    //         value: 100000000 + Pattern.QUAN_DA,
    //         scoreBig: 10,
    //         scoreExt: 0
    //     };
    // }
    // if (cardsMap.sortedValsDesc[0] < 9) {
    //     //全小
    //     return {
    //         cards: cards,
    //         pattern: Pattern.QUAN_XIAO,
    //         value: 100000000 + Pattern.QUAN_XIAO,
    //         scoreBig: 10,
    //         scoreExt: 0
    //     };
    // }
    //
    // if ((colorMap.sortedColors.indexOf(0) == -1 && colorMap.sortedColors.indexOf(2) == -1) || (colorMap.sortedColors.indexOf(1) == -1 && colorMap.sortedColors.indexOf(3) == -1)) {
    //     //凑一色
    //     return {
    //         cards: cards,
    //         pattern: Pattern.COU_YI_SE,
    //         value: 100000000 + Pattern.COU_YI_SE,
    //         scoreBig: 10,
    //         scoreExt: 0
    //     };
    // }

    //四套三条
    // if (cardsMap.sortedVals.length < 6) {
    //     let count3 = 0;
    //     for (let v of cardsMap.sortedVals) {
    //         count3 += Math.floor(cardsMap.valCardsMap[v].length / 3);
    //     }
    //
    //     if (count3 == 4) {
    //         //四套三条
    //         return {
    //             cards: cards,
    //             pattern: Pattern.SI_SAN_TIAO,
    //             value: 100000000 + Pattern.SI_SAN_TIAO,
    //             scoreBig: 8,
    //             scoreExt: 0
    //         };
    //     }
    // }

    // todo: 广西十三水没有五对三条
    //五对三条
    // if (cardsMap.sortedVals.length < 7) {
    //     let count2 = 0;
    //     for (let v of cardsMap.sortedVals) {
    //         count2 += Math.floor(cardsMap.valCardsMap[v].length / 2);
    //     }
    //
    //     let leastVal = cardsMap.sortedVals[cardsMap.sortedVals.length - 1];
    //     if (count2 == 6 && cardsMap.valCardsMap[leastVal].length > 1) {
    //         //五对三条
    //         return {
    //             cards: cards,
    //             pattern: Pattern.WU_DUI_SAN_TIAO,
    //             value: 100000000 + Pattern.WU_DUI_SAN_TIAO,
    //             scoreBig: 5,
    //             scoreExt: 0
    //         };
    //     }
    // }

    //六对半
    if (cardsMap.sortedVals.length < 8) {
        let count2 = 0;
        for (let v of cardsMap.sortedVals) {
            count2 += Math.floor(cardsMap.valCardsMap[v].length / 2);
        }
        // todo: 这里不需要判断最小的牌值对应的牌的数量是否为1
        if (count2 == 6) {
            //六对半
            return {
                cards: cards,
                pattern: Pattern.LIU_DUI_BAN,
                value: 100000000 + Pattern.LIU_DUI_BAN,
                scoreBig: 4,
                scoreExt: 0
            };
        }
    }
    // 三顺子
    let shunzi_list = checkABC3(cardsMap);
    if (shunzi_list) {
        // todo: 比较中道和尾道两个顺子的大小，如果倒水交换中道跟尾道
        // todo: 这一步主要是因为A2345可能比910JQK大，这里做一个配置选项A2345是否凭A大
        swapABC(shunzi_list, Pattern.SHUN_ZI);
        let shuzi_pai = [];
        shunzi_list.forEach(function (shunzi) {
            shuzi_pai = shuzi_pai.concat(shunzi);
        });
        return {
            cards: shuzi_pai,
            pattern: Pattern.SAN_SHUN_ZI,
            value: 100000000 + Pattern.SAN_SHUN_ZI,
            scoreBig: 4,
            scoreExt: 0
        };
    }

    // todo: 六小
    if (cardsMap.sortedValsDesc[0] < 11 || (cardsMap.sortedValsDesc[0] == 14 && cardsMap.sortedValsDesc[1] < 11)) {
        //六小
        return {
            cards: cards,
            pattern: Pattern.LIU_XIAO,
            value: 100000000 + Pattern.LIU_XIAO,
            scoreBig: 4,
            scoreExt: 0
        };
    }

    //三同花
    if (colorMap.sortedColors.length < 4) {
        let is_san_tong_hua = true;
        for (let color of colorMap.sortedColors) {
            // todo: 如果没有凑一色牌型，13张牌都为同样的花色就是三同花
            if ([3, 5, 8, 10, 13].indexOf(colorMap.colorCardsMap[color].length) == -1) {
                is_san_tong_hua = false;
                break;
            }
        }
        if (is_san_tong_hua) {
            //三同花
            return {
                cards: cards,
                pattern: Pattern.SAN_TONG_HUA,
                value: 100000000 + Pattern.SAN_TONG_HUA,
                scoreBig: 4,
                scoreExt: 0
            };
        }
    }
}

/**
 * 判断三顺子和三同花顺中道和尾道的大小，如果中道大于尾道交换顺序
 * 主要是有的玩法A2345大于910JQK
 * @param shunzi_list
 * @param pattern
 */
function swapABC(shunzi_list, pattern) {
    let zhongDaoCards = shunzi_list[1].concat();
    let weiDaoCards = shunzi_list[2].concat();
    let zhongDaoMap = getCardsMap(zhongDaoCards);
    let weiDaoMap = getCardsMap(weiDaoCards);
    let zhongDaoVal = getDaoValue(zhongDaoMap, pattern);
    let weiDaoVal = getDaoValue(weiDaoMap, pattern);
    if (zhongDaoVal > weiDaoVal) {
        let tempShunZi = shunzi_list[1];
        shunzi_list[1] = shunzi_list[2];
        shunzi_list[2] = tempShunZi;
    }
}

/**
 * 校验普通牌型的一道
 * @param cardsMap
 * @param colorMap
 * @param daoIndex
 * @param algRule
 * @returns {{cards: *, pattern: number, value: Number, scoreBig: number, scoreExt: number}}
 */
function checkGeneral(cardsMap, colorMap, daoIndex, algRule) {
    // todo: 牌型(cards里面的牌的顺序)还未整理
    let cards = cardsMap.cards;
    let maxCount = cardsMap.valCardsMap[cardsMap.sortedVals[0]].length;
    let maxColor = colorMap.colorCardsMap[colorMap.sortedColors[0]].length;
    let has_shunzi = false;

    let shun_zi = findABC(cardsMap, 5);
    if (shun_zi) {
        has_shunzi = true;
    }

    //普通牌
    //1.五同
    if (maxCount == 5) {
        //1.五同
        return {
            cards: cards,
            pattern: Pattern.WU_TONG,
            value: getDaoValue(cardsMap, Pattern.WU_TONG),
            scoreBig: (daoIndex == 2) ? 20 : 10,
            scoreExt: (daoIndex == 2) ? 19 : 9
        }
    }
    //2.同花顺
    if (maxColor == 5) {
        if (has_shunzi) {
            //同花顺
            return {
                cards: cards,
                pattern: Pattern.TONG_HUA_SHUN,
                value: getDaoValue(cardsMap, Pattern.TONG_HUA_SHUN),
                scoreBig: (daoIndex == 2) ? 10 : 5,
                scoreExt: (daoIndex == 2) ? 9 : 4
            };
        }
    }
    //3.铁枝
    if (maxCount == 4) {
        //3.铁枝
        return {
            cards: cards,
            pattern: Pattern.TIE_ZHI,
            value: getDaoValue(cardsMap, Pattern.TIE_ZHI),
            scoreBig: (daoIndex == 2) ? 8 : 4,
            scoreExt: (daoIndex == 2) ? 7 : 3
        };
    }
    //4.葫芦
    if (maxCount == 3 && cardsMap.sortedVals.length == 2) {
        //4.葫芦
        return {
            cards: cards,
            pattern: (daoIndex == 2) ? Pattern.ZHONG_DUN_HU_LU : Pattern.HU_LU,
            value: getDaoValue(cardsMap, Pattern.HU_LU),
            scoreBig: (daoIndex == 2) ? 2 : 1,
            scoreExt: (daoIndex == 2) ? 1 : 0
        };
    }

    //5.同花
    if (maxColor == 5) {
        //5.同花
        return {
            cards: cards,
            pattern: Pattern.TONG_HUA,
            value: getDaoValue(cardsMap, Pattern.TONG_HUA),
            scoreBig: 1,
            scoreExt: 0
        };
    }
    //6.顺子
    if (has_shunzi) {
        //6.顺子
        return {
            cards: cards,
            pattern: Pattern.SHUN_ZI,
            value: getDaoValue(cardsMap, Pattern.SHUN_ZI),
            scoreBig: 1,
            scoreExt: 0
        };
    }
    //7.三条
    if (maxCount == 3) {
        // if (pais.length == 3) {
        //   //冲三
        // } else {
        //   //三条
        // }
        return {
            cards: cards,
            pattern: (daoIndex == 1) ? Pattern.CHONG_SAN : Pattern.SAN_TIAO,
            value: getDaoValue(cardsMap, Pattern.SAN_TIAO),
            scoreBig: (daoIndex == 1) ? 3 : 1,
            scoreExt: (daoIndex == 1) ? 2 : 0
        };
    }
    //8.两对
    if (maxCount == 2 && cardsMap.sortedVals.length < 4 && daoIndex != 1) {
        //两对
        return {
            cards: cards,
            pattern: Pattern.LIANG_DUI,
            value: getDaoValue(cardsMap, Pattern.LIANG_DUI),
            scoreBig: 1,
            scoreExt: 0
        };
    }
    //9.对子
    if (maxCount == 2) {
        //9.对子
        return {
            cards: cards,
            pattern: Pattern.DUI_ZI,
            value: getDaoValue(cardsMap, Pattern.DUI_ZI),
            scoreBig: 1,
            scoreExt: 0
        };
    }
    //10乌龙
    return {
        cards: cards,
        pattern: Pattern.WU_LONG,
        value: getDaoValue(cardsMap, Pattern.WU_LONG),
        scoreBig: 1,
        scoreExt: 0
    };
}

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
        let i = [0].indexOf(value);
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
function getColor(card) {
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
    let continueList = [];
    for (let i = 0; i < cardsMap.sortedValsDesc.length - 1; i++) {
        let v = cardsMap.sortedValsDesc[i];
        if (cardsMap.valCardsMap[v].length < continueCount) {
            continue;
        }
        let lianVal = [v];
        for (let j = i + 1; j < cardsMap.sortedValsDesc.length; j++) {
            let nextV = cardsMap.sortedValsDesc[j];
            if (cardsMap.valCardsMap[nextV].length < continueCount) {
                break;
            }
            let curV = lianVal[0];
            if (isContinuous(curV, nextV)) {
                lianVal.unshift(nextV);
            } else {
                break;
            }
        }

        if (lianVal.length > 1) {
            continueList.unshift(lianVal);
            i += lianVal.length - 1;// ?????
        }
    }

    //todo: A放在头部或者尾部时的大小判断
    // continueList.sort((a, b) => {
    //     if (a.length == b.length) {
    //         // todo: A放在头部或者尾部时的大小判断
    //         return val(b[0]) - val(a[0]);
    //     } else {
    //         return b.length - a.length;
    //     }
    // });
    //
    return continueList;
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

    // console.log(valCardsMap,  sortedVals);
    return {cards: tempCards, valCardsMap, sortedVals, sortedValsDesc};
}

/**
 * 获取手牌的值-牌的映射
 * @param pais
 * @returns {{}}
 */
function getValPaiMap(pais) {
    let countMap = {};
    for (let value = 2; value < 15; value++) {
        countMap[value] = [];
    }
    for (let pai_index = 0; pai_index < pais.length; pai_index++) {
        let pai = pais[pai_index];
        let pai_val = pai % 20;
        if (countMap.hasOwnProperty(pai_val)) {
            countMap[pai_val].push(pai);
        }
    }

    // 黑红梅方排序
    for (let val in countMap) {
        let list = countMap[val];
        list.sort(function (a, b) {
            return b - a;
        });
    }
    return countMap;
}

/**
 * 获取花色与牌的映射
 * @param cards
 * @returns {{cards: Array, colorCardsMap, sortedColors: number[]}}
 */
function getColorMap(cards) {
    //记录每张牌的数量
    let colorCardsMap = {};

    let tempCards = [];

    cards.forEach(c => {
        let color = getColor(c);
        if (colorCardsMap[color]) {
            colorCardsMap[color].push(c);
        } else {
            colorCardsMap[color] = [c];
        }
    });

    // for (let color in colorCardsMap) {
    //     colorCardsMap[color].sort(function(a, b) {return b - a});
    // }

    let sortedColors = Object.keys(colorCardsMap).map(function (color) {
        return parseInt(color)
    });

    for (let i = 0; i < sortedColors.length - 1; i++) {
        for (let j = i + 1; j < sortedColors.length; j++) {
            // 数量多的考前
            if (colorCardsMap[sortedColors[j]].length > colorCardsMap[sortedColors[i]].length) {
                let temp = sortedColors[i];
                sortedColors[i] = sortedColors[j];
                sortedColors[j] = temp;
            }

            // 数量相同的牌值大的靠前
            if (colorCardsMap[sortedColors[j]].length == colorCardsMap[sortedColors[i]].length) {
                if (sortedColors[j] > sortedColors[i]) {
                    let temp = sortedColors[i];
                    sortedColors[i] = sortedColors[j];
                    sortedColors[j] = temp;
                }
            }
        }
    }

    for (let val of sortedColors) {
        tempCards = tempCards.concat(colorCardsMap[val]);
    }

    // console.log(colorCardsMap,  sortedColors);
    return {cards: tempCards, colorCardsMap, sortedColors};
}

/**
 * 获取每个花色的valCardsMap
 * @param colorMap
 */
function getColorCardsMap(colorMap) {
    // let colorMap = getColorMap(cards);
    let colorCardsMap = {};
    for (let color of colorMap.sortedColors) {
        let colorCards = colorMap.colorCardsMap[color];
        let cardsMap = getCardsMap(colorCards);
        colorCardsMap[color] = cardsMap;
    }
    return colorCardsMap;
}

/**
 * 获取凑成牌型之后的多三张的牌
 * @param exceptCards 要扣除的牌
 * @param originCards 所有的牌
 * @returns {Array.<T>|string|Buffer}
 */
function getLeftCards(exceptCards, originCards) {
    let leftCards = originCards.concat();
    exceptCards.forEach(function (c) {
        let index = leftCards.indexOf(c);
        leftCards.splice(index, 1);
    });
    return leftCards;
}

/**
 * 获取特殊牌型
 * @param cards
 * @param algRule
 * @returns {Array}
 */
function findSpecial(cardsMap, algRule) {
    let specialList = [];
    let colorMap = getColorMap(cardsMap.cards);

    let mostColorCards = colorMap.colorCardsMap[colorMap.sortedColors[0]];
    let mostColorCardsMap = getCardsMap(mostColorCards);
    if (mostColorCards.length >= 13 && mostColorCardsMap.sortedVals.length == 13) {
        //青龙
        let shunZi = findABC(mostColorCardsMap, 13);
        let leftCards = getLeftCards(shunZi, cardsMap.cards);
        if (shunZi) {
            let result = [];
            if (algRule.withOutSpecial) {
                result.push({
                    cards: shunZi,
                    pattern: Pattern.YI_TIAO_LONG,
                    value: 100000000 + Pattern.YI_TIAO_LONG,
                    index: 0,// 特殊牌为0
                    scoreBig: 52,
                    scoreExt: 0,
                    cardsExt: leftCards
                });
            } else {
                // 青龙
                result.push({
                    cards: shunZi,
                    pattern: Pattern.QING_LONG,
                    value: 100000000 + Pattern.QING_LONG,
                    index: 0,// 特殊牌为0
                    scoreBig: 108,
                    scoreExt: 0,
                    cardsExt: leftCards
                });
            }
            specialList.push(result);
        }
    }

    // 勾选了无特殊牌型，只保留清龙牌型
    if (algRule.withOutSpecial) {
        return specialList;
    }

    //一条龙
    if (specialList.length == 0 && cardsMap.sortedVals.length == 13) {
        //一条龙
        let shunZi = findABC(cardsMap, 13);
        let leftCards = getLeftCards(shunZi, cardsMap.cards);
        if (shunZi) {
            // 一条龙
            let result = [{
                cards: shunZi,
                pattern: Pattern.YI_TIAO_LONG,
                value: 100000000 + Pattern.YI_TIAO_LONG,
                index: 0,// 特殊牌为0
                scoreBig: 52,
                scoreExt: 0,
                cardsExt: leftCards
            }];
            specialList.push(result);
        }
    }

    // todo: 广西没有十二皇族
    //十二皇族 J-A
    // if (specialList.length == 0) {
    //     let huangZuAmount = 0;
    //     let huangZuCards = [];
    //     for (let v of cardsMap.sortedVals) {
    //         if ([11, 12, 13, 14].indexOf(v) > -1) {
    //             huangZuAmount += cardsMap.valCardsMap[v].length;
    //             huangZuCards = huangZuCards.concat(cardsMap.valCardsMap[v]);
    //         }
    //     }
    //     if (huangZuAmount >= 13) {
    //         huangZuCards = huangZuCards.splice(0, 13);
    //         let leftCards = getLeftCards(huangZuCards, cardsMap.cards);
    //         let result = [{
    //             cards: huangZuCards,
    //             pattern: Pattern.SHI_ER_HUANG_ZU,
    //             value: 100000000 + Pattern.SHI_ER_HUANG_ZU,
    //             index: 0,// 特殊牌为0
    //             scoreBig: 24,
    //             scoreExt: 0,
    //             cardsExt: leftCards
    //         }];
    //         specialList.push(result);
    //     }
    // }
    //三同花顺
    if (specialList.length == 0) {
        let result = findABC3sameColor(colorMap);
        specialList = specialList.concat(result);
    }

    //三分天下
    if (specialList.length == 0) {
        let sanTianXia = findSpecialMulti(cardsMap, Pattern.SAN_TIAN_XIA);
        if (sanTianXia) {
            let leftCards = getLeftCards(sanTianXia, cardsMap.cards);
            let result = [{
                cards: sanTianXia,
                pattern: Pattern.SAN_TIAN_XIA,
                value: 100000000 + Pattern.SAN_TIAN_XIA,
                index: 0,// 特殊牌为0
                scoreBig: 16,
                scoreExt: 0,
                cardsExt: leftCards
            }];
            specialList.push(result);
        }
    }

    // todo: 广西没有全大全小
    //全大全小
    // if (specialList.length == 0) {
    //     let result = findAllLS(cardsMap);
    //     if (result) {
    //         specialList.push(result);
    //     }
    // }


    // todo: 广西没有凑一色
    // 凑一色
    // if (specialList.length == 0) {
    //     let result = findAllRB(colorMap);
    //     if (result) {
    //         specialList.push(result);
    //     }
    // }

    //四套三条
    // if (specialList.length == 0) {
    //     let siSanTiao = findSpecialMulti(cardsMap, Pattern.SI_SAN_TIAO);
    //     if (siSanTiao) {
    //         let leftCards = getLeftCards(siSanTiao, cardsMap.cards);
    //         let result = [{
    //             cards: siSanTiao,
    //             pattern: Pattern.SI_SAN_TIAO,
    //             value: 100000000 + Pattern.SI_SAN_TIAO,
    //             index: 0,// 特殊牌为0
    //             scoreBig: 8,
    //             scoreExt: 0,
    //             cardsExt: leftCards
    //         }];
    //         specialList.push(result);
    //     }
    // }

    // todo: 广西没有五对三条
    // 五对三条
    // if (specialList.length == 0) {
    //     let wuDuiSanTiao = findAAA5BB(cardsMap.valCardsMap);
    //     if (wuDuiSanTiao) {
    //         let leftCards = getLeftCards(wuDuiSanTiao, cardsMap.cards);
    //         let result = [{
    //             cards: wuDuiSanTiao,
    //             pattern: Pattern.WU_DUI_SAN_TIAO,
    //             value: 100000000 + Pattern.WU_DUI_SAN_TIAO,
    //             index: 0,// 特殊牌为0
    //             scoreBig: 5,
    //             scoreExt: 0,
    //             cardsExt: leftCards
    //         }];
    //         specialList.push(result);
    //     }
    // }


    //六对半
    if (specialList.length == 0) {
        let liuDuiBan = findSpecialMulti(cardsMap, Pattern.LIU_DUI_BAN);
        if (liuDuiBan) {
            let leftCards = getLeftCards(liuDuiBan, cardsMap.cards);
            let result = [{
                cards: liuDuiBan,
                pattern: Pattern.LIU_DUI_BAN,
                value: 100000000 + Pattern.LIU_DUI_BAN,
                index: 0,// 特殊牌为0
                scoreBig: 4,
                scoreExt: 0,
                cardsExt: leftCards
            }];
            specialList.push(result);
        }
    }
    // 三顺子
    if (specialList.length == 0) {
        let result = findABC3(cardsMap);
        if (result) {
            specialList.push(result);
        }
    }

    // 六小
    if (specialList.length == 0) {
        let smallCards = [];
        for (let v of cardsMap.sortedVals) {
            if (v == 14 || v < 11) {
                smallCards = smallCards.concat(cardsMap.valCardsMap[v]);
            }
        }
        if (smallCards.length >= 13) {
            let liuXiaoCards = smallCards.splice(0, 13);
            let leftCards = getLeftCards(liuXiaoCards, cardsMap.cards);
            let result = [{
                cards: liuXiaoCards,
                pattern: Pattern.LIU_XIAO,
                value: 100000000 + Pattern.LIU_XIAO,
                index: 0,// 特殊牌为0
                scoreBig: 4,
                scoreExt: 0,
                cardsExt: leftCards
            }];
            specialList.push(result);
        }
    }


    //三同花
    if (specialList.length == 0) {
        let result = findSameColor3(colorMap);
        if (result) {
            specialList.push(result);
        }
    }
    return specialList;
}

/**
 * 获取普通牌型的推荐类型
 * @param pais
 */
function findGeneral(cardsMap) {
    let typeList = findGeneralPattern(cardsMap);
    let tuiJianList = [];
    let existTuiJian = [];
    let tuiJianMap = {};
    typeList.forEach(function (tp) {
        let usedPai = [];
        tp.forEach(function (dao) {
            usedPai = usedPai.concat(dao.cards);
        });
        let leftPai = getLeftCards(usedPai, cardsMap.cards);
        let group = completePattern(tp[0], tp[1], tp[2], leftPai, 0);
        if (group) {
            let group_type = group.map(function (dao) {
                return dao.pattern;
            });

            // todo: 翻倍要多，pattern总和要大，pattern差值要小，value总合要大，value差值要小

            // 牌型补全之后有的牌型改变了，会出现重复，这里要排重
            let group_type_code = group_type.join('-');
            // let group_value = group[0].value + group[1].value + group[2].value;


            let group_score = group[0].scoreBig + group[1].scoreBig + group[2].scoreBig;
            let group_pattern = group[0].pattern + group[1].pattern + group[2].pattern;
            let group_d_pattern = group[0].pattern - group[2].pattern;
            let group_value = group[0].value + group[1].value + group[2].value;
            let group_d_value = group[0].value - group[2].value;
            let group_factor = group_score * 100000000 * 10000 +
                        group_pattern * 100000000 * 1000 +
                        group_d_pattern * 100000000 * 100 +
                        group_value * 10 +
                        group_d_value;
            // 排重，且优先取大的
            if (!tuiJianMap.hasOwnProperty(group_type_code) ||
                tuiJianMap[group_type_code].factor < group_factor) {
                tuiJianMap[group_type_code] = {
                    group: group,
                    factor: group_factor
                }
            }
        }
    });

    for (let code in tuiJianMap) {
        let group_map = tuiJianMap[code];
        tuiJianList.push(group_map);
    }

    tuiJianList.sort(function (a, b) {
        return b.factor - a.factor;
    });
    return tuiJianList.map(function (group_map) {
        return group_map.group;
    });
}

/**
 * 补全牌型
 * @param toudao
 * @param zongdao
 * @param weidao
 * @param left
 */
function completePattern(toudao, zhongdao, weidao, left, algRule) {
    toudao = JSON.parse(JSON.stringify(toudao));
    zhongdao = JSON.parse(JSON.stringify(zhongdao));
    weidao = JSON.parse(JSON.stringify(weidao));

    // let left_count_map = getValPaiMap(left);
    let cardsMap = getCardsMap(left);
    // 1. 补全尾道的牌
    let wd_other = [];// 用于补全到尾道中的牌
    let wd_other_num = 5 - weidao.cards.length;// 尾道还需要补充的牌的数量

    if (wd_other_num > 0) {
        // 从大到小尽量补充不同牌值的牌
        for (let val of cardsMap.sortedValsDesc) {
            let pais = cardsMap.valCardsMap[val];
            if (pais.length > 0) {
                let pai = pais.shift();
                wd_other.push(pai);
                if (wd_other.length == wd_other_num) {
                    break;
                }
            }
        }

        // 不同牌值的牌不够数，再补充相同牌值的牌
        while (wd_other.length < wd_other_num) {
            for (let pai_index = 0; pai_index < wd_other.length; pai_index++) {
                let other_pai = wd_other[pai_index];
                let pai_val = val(other_pai);
                let pai_list = cardsMap.valCardsMap[pai_val];
                if (pai_list.length > 0) {
                    let pai = pai_list.shift();
                    wd_other.push(pai);
                    break;
                }
            }
        }
    }

    weidao.cards = weidao.cards.concat(wd_other);

    // 判断补全后牌型是否改变了
    // let wd_type_val = exports.checkPaiType(weidao.cards.concat());
    // weidao.value = exports.getPaisValue(weidao.cards, wd_type_val);

    // 如果补全牌后尾道的牌型改变了，牌型type和牌值value以补全后的为准
    let wd_type_val = checkPattern(weidao.cards, 3, algRule);
    // let wd_val_count_map = getPaiValCountMap(weidao.cards);
    let wdCardsMap = getCardsMap(weidao.cards);
    weidao.pattern = wd_type_val.pattern;
    weidao.value = getDaoValue(wdCardsMap, weidao.pattern);

    // 2. 补全中道的牌
    let zd_other = []; // 用于补全到中道中的牌
    let zd_other_num = 5 - zhongdao.cards.length; // 中道需要补充的牌的数量


    if (zd_other_num > 0) {
        for (let val of cardsMap.sortedValsDesc) {
            let pais = cardsMap.valCardsMap[val];
            if (pais.length > 0) {
                let pai = pais.shift();
                zd_other.push(pai);
                if (zd_other.length == zd_other_num) {
                    break;
                }
            }
        }

        while (zd_other.length < zd_other_num) {
            for (let pai_index = 0; pai_index < zd_other.length; pai_index++) {
                let other_pai = zd_other[pai_index];
                let pai_val = val(other_pai);
                let pai_list = cardsMap.valCardsMap[pai_val];
                if (pai_list.length > 0) {
                    let pai = pai_list.shift();
                    zd_other.push(pai);
                    break;
                }
            }
        }
    }


    zhongdao.cards = zhongdao.cards.concat(zd_other);
    // 判断补全后牌型是否改变了
    // let zd_type_val = exports.checkPaiType(zhongdao.cards.concat());
    // zhongdao.pattern = zd_type_val.pattern;
    // zhongdao.value = exports.getPaisValue(zhongdao.cards, zd_type_val);

    // 如果补全牌后尾道的牌型改变了，牌型type和牌值value以补全后的为准
    let zd_type_val = checkPattern(zhongdao.cards, 2, algRule);
    // let zd_val_count_map = getPaiValCountMap(zhongdao.cards);
    let zdCardsMap = getCardsMap(zhongdao.cards);
    zhongdao.pattern = zd_type_val.pattern;
    zhongdao.value = getDaoValue(zdCardsMap, zhongdao.pattern);


    // 3. 补全头道的牌（头道只有对子牌型不要补牌）
    if (toudao.pattern == Pattern.DUI_ZI && toudao.cards.length < 3) {
        for (let val of cardsMap.sortedValsDesc) {
            let pais = cardsMap.valCardsMap[val];
            if (pais.length > 0) {
                let pai = pais.shift();
                toudao.cards.push(pai);
                break;
            }
        }
    }

    // 判断补全后牌型是否改变了
    // let td_type_val = exports.checkPaiType(toudao.cards.concat());
    // toudao.pattern = td_type_val.pattern;
    // toudao.value = exports.getPaisValue(toudao.cards, td_type_val);

    // 如果补全牌后尾道的牌型改变了，牌型type和牌值value以补全后的为准
    let td_type_val = checkPattern(toudao.cards, 1, algRule);
    // let td_val_count_map = getPaiValCountMap(toudao.cards);
    let tdCardsMap = getCardsMap(toudao.cards);
    toudao.pattern = td_type_val.pattern;
    toudao.value = getDaoValue(tdCardsMap, toudao.pattern);


    // 不能倒水,不能通过type判断要通过value判断，不能用type
    if (zhongdao.value > weidao.value || toudao.value > zhongdao.value) {
        return;
    }

    let left_pai = [];
    for (value of cardsMap.sortedVals) {
        let pai_list = cardsMap.valCardsMap[value];
        left_pai = left_pai.concat(pai_list);
    }
    let toudaoObj = {
        cards: toudao.cards,
        pattern: toudao.pattern == Pattern.SAN_TIAO ? Pattern.CHONG_SAN : toudao.pattern,
        value: toudao.value,
        index: 1,// 头道为1
        scoreBig: toudao.pattern == Pattern.SAN_TIAO ? 3 : 1,
        scoreExt: toudao.pattern == Pattern.SAN_TIAO ? 2 : 0,
        cardsExt: left_pai
    };

    let zhongdao_fen = 1;
    let zhongdao_fenext = 0;
    switch (zhongdao.pattern) {
        case Pattern.HU_LU:
            zhongdao_fen = 2;
            zhongdao_fenext = 1;
            break;
        case Pattern.TIE_ZHI:
            zhongdao_fen = 7;
            zhongdao_fenext = 6;
            break;
        case Pattern.TONG_HUA_SHUN:
            zhongdao_fen = 9;
            zhongdao_fenext = 8;
            break;
        case Pattern.WU_TONG:
            zhongdao_fen = 11;
            zhongdao_fenext = 10;
            break;
        default:
            break;
    }

    let zhongdaoObj = {
        cards: zhongdao.cards,
        pattern: zhongdao.pattern == Pattern.HU_LU ? Pattern.ZHONG_DUN_HU_LU : zhongdao.pattern,
        value: zhongdao.value,
        index: 2,// 头道为1
        scoreBig: zhongdao_fen,
        scoreExt: zhongdao_fenext,
        cardsExt: []
    };

    let weidao_fen = 1;
    let weidao_fenext = 0;
    switch (weidao.pattern) {
        case Pattern.TIE_ZHI:
            weidao_fen = 4;
            weidao_fenext = 3;
            break;
        case Pattern.TONG_HUA_SHUN:
            weidao_fen = 5;
            weidao_fenext = 4;
            break;
        case Pattern.WU_TONG:
            weidao_fen = 6;
            weidao_fenext = 5;
            break;
        default:
            break;
    }

    let weidaoObj = {
        cards: weidao.cards,
        pattern: weidao.pattern,
        value: weidao.value,
        index: 3,// 头道为1
        scoreBig: weidao_fen,
        scoreExt: weidao_fenext,
        cardsExt: []
    };
    let group = [toudaoObj, zhongdaoObj, weidaoObj];
    return group;
}

/**
 * 获取普通牌的牌型组合，只拿牌型
 * @param pais
 * @returns {Array}
 */
function findGeneralPattern(cardsMap) {
    let generals = [];
    let existTypeCode = [];// 保存已经存在的牌型组合代码用于排重
    let weiPattern = [Pattern.WU_TONG, Pattern.TONG_HUA_SHUN, Pattern.TIE_ZHI, Pattern.HU_LU, Pattern.TONG_HUA, Pattern.SHUN_ZI, Pattern.SAN_TIAO, Pattern.LIANG_DUI, Pattern.DUI_ZI];
    let zhongPattern = [Pattern.WU_TONG, Pattern.TONG_HUA_SHUN, Pattern.TIE_ZHI, Pattern.HU_LU, Pattern.TONG_HUA, Pattern.SHUN_ZI, Pattern.SAN_TIAO, Pattern.LIANG_DUI, Pattern.DUI_ZI, Pattern.WU_LONG];
    let touPattern = [Pattern.SAN_TIAO, Pattern.DUI_ZI, Pattern.WU_LONG];
    let patternList = [touPattern, zhongPattern, weiPattern];
    let patternGroup = [];// 保存单个牌型组合

    let getOnePattern = function (daoIndex, startPattern) {
        let daoPatternList = patternList[daoIndex];
        // let patterIndex = (daoPatternList.indexOf(startPattern) == -1) ? 0 : daoPatternList.indexOf(startPattern);
        for (let patterIndex = 0; patterIndex < daoPatternList.length; patterIndex++) {
            let basePattern = daoPatternList[patterIndex];
            if (basePattern > startPattern) {
                continue;
            }
            // let pList = getCountTypes(pais, base_type, paiType);// 通过函数匹配出所有指定的牌型
            let pList = findDaoPatterns(cardsMap, basePattern, patternGroup);// 通过函数匹配出所有指定的牌型
            if (pList.length == 0) {
                continue;
            } else {
                for (let pIndex = 0; pIndex < pList.length; pIndex++) {
                    let tp = pList[pIndex];
                    if (patternGroup.length > 0 && tp.pattern > patternGroup[0].pattern) {
                        continue;
                    }
                    patternGroup.unshift(tp);
                    if (daoIndex == 0) {
                        generals.push(patternGroup.concat());
                        // 匹配到一个清空，继续匹配下一个
                        patternGroup.shift();
                    } else {
                        getOnePattern(daoIndex - 1, tp.pattern);
                    }
                }
            }
        }
        // 没有找到一个匹配的
        patternGroup.shift();
    };

    getOnePattern(2, Pattern.WU_TONG);
    // logger.info('<排重>: ', JSON.stringify(existTypeCode));
    return generals;
}

/**
 * 根据基础类型，获取所有符合该基础类型的普通牌的牌型具体实现
 * @param pais
 * @param base_type 基础类型
 * @param paiType 保存已经找到的头中尾道的牌型的数组
 */
function findDaoPatterns(cardsMap, basePattern, patternGroup) {
    let usedPais = [];
    patternGroup.forEach(function (pt) {
        usedPais = usedPais.concat(pt.cards);
    });
    // 1. 找出除了牌型已使用的牌之外剩余的牌
    let leftPais = getLeftCards(usedPais, cardsMap.cards);
    // 2. 将牌的类型分为3大类查找（数量重叠类型，顺子/同花顺类型，同花类型）
    switch (basePattern) {
        // 数量重叠类型
        case Pattern.WU_TONG:
        case Pattern.TIE_ZHI:
        case Pattern.HU_LU:
        case Pattern.SAN_TIAO:
        case Pattern.LIANG_DUI:
        case Pattern.DUI_ZI:
        case Pattern.WU_LONG:
            // return getCountTypes(leftPais, base_type, paiType);
            // return getCountTypesBuChai(leftPais, base_type, paiType);
            return matchAllMulti(leftPais, basePattern, patternGroup);
        case Pattern.TONG_HUA_SHUN:
            // 同花顺类型
            return matchAllABC(leftPais, true);
        case Pattern.SHUN_ZI:
            // 顺子类型
            return matchAllABC(leftPais, false);
        case Pattern.TONG_HUA:
            // 同花类型
            return matchAllSameColor(leftPais);
    }
}


/**
 * 获取所有数量重叠类型的牌型组合，头道拆多余三张的，组冲三
 * @param pais
 * @param base_type
 * @param paiType
 * @returns {Array}
 */
function matchAllMulti(cards, pattern, patternGroup) {
    let cardsMap = getCardsMap(cards);
    let countMap = cardsMap.valCardsMap;

    let wu_tong_list = [];
    let tie_zhi_list = [];
    let hu_lu_list = [];
    let san_tiao_list = [];
    let liang_dui_list = [];
    let dui_zi_list = [];
    let dan_zhang_list = [];
    let wulong_list = [];

    // todo: 如果考虑到要优先最大的对子，三条，等，就得从最大的值开始遍历
    for (let val of cardsMap.sortedValsDesc) {
        let count = countMap[val].length;
        let pai_list = countMap[val].concat();
        switch (count) {
            case 1:
                dan_zhang_list = dan_zhang_list.concat(pai_list);
                break;
            case 2:
                dui_zi_list.push({
                    pattern: Pattern.DUI_ZI,
                    cards: pai_list.concat()
                });
                break;
            case 3:
                san_tiao_list.push({
                    pattern: Pattern.SAN_TIAO,
                    cards: pai_list.concat()
                });
                break;
            case 4:
                if (patternGroup.length == 2) {
                    let san = pai_list.concat();
                    san = san.splice(-3, 3);
                    san_tiao_list.push({
                        pattern: Pattern.SAN_TIAO,
                        cards: san
                    });
                } else {
                    tie_zhi_list.push({
                        pattern: Pattern.TIE_ZHI,
                        cards: pai_list.concat()
                    });
                    if (patternGroup.length == 1) {
                        let dan_zhang = pai_list[0];
                        dan_zhang_list = dan_zhang_list.concat(dan_zhang);
                    }
                }
                break;
            case 5:
                if (patternGroup.length == 2) {
                    let san = pai_list.concat();
                    // let dan_zhang = san.splice(0, 1);
                    // dan_zhang_list = dan_zhang_list.concat(dan_zhang);
                    san = san.splice(-3, 3);
                    san_tiao_list.push({
                        pattern: Pattern.SAN_TIAO,
                        cards: san
                    });
                } else {
                    wu_tong_list.push({
                        pattern: Pattern.WU_TONG,
                        cards: pai_list.concat()
                    });
                    if (patternGroup.length == 1) {
                        let duizi = pai_list.concat();
                        duizi = duizi.splice(-2, 2);
                        dui_zi_list.push({
                            pattern: Pattern.DUI_ZI,
                            cards: duizi
                        });
                    }
                }
                break;
            case 6:
                if (patternGroup.length != 1) {
                    let san = pai_list.concat();
                    san = san.splice(-3, 3);
                    san_tiao_list.push({
                        pattern: Pattern.SAN_TIAO,
                        cards: san
                    });
                }

                if (patternGroup.length != 2) {
                    let wu = pai_list.concat();
                    wu = wu.splice(-5, 5);
                    wu_tong_list.push({
                        pattern: Pattern.WU_TONG,
                        cards: wu
                    });
                }
                break;
            case 7:
                if (patternGroup.length == 2) {
                    let san = pai_list.concat();
                    san = san.splice(-3, 3);
                    san_tiao_list.push({
                        pattern: Pattern.SAN_TIAO,
                        cards: san
                    });
                } else {
                    let wu = pai_list.concat();
                    wu = wu.splice(-5, 5);
                    wu_tong_list.push({
                        pattern: Pattern.WU_TONG,
                        cards: wu
                    });
                    if (patternGroup.length == 1) {
                        let si = pai_list.concat();
                        si = si.splice(-4, 4);
                        tie_zhi_list.push({
                            pattern: Pattern.TIE_ZHI,
                            cards: si
                        });
                    }
                }
                break;
            case 8:
                if (patternGroup.length == 2) {
                    let san = pai_list.concat();
                    san = san.splice(0, 3);
                    san_tiao_list.push({
                        pattern: Pattern.SAN_TIAO,
                        cards: san
                    });
                } else {
                    let wu = pai_list.concat();
                    wu = wu.splice(-5, 5);
                    wu_tong_list.push({
                        pattern: Pattern.WU_TONG,
                        cards: wu
                    });
                }
                break;
            default:
                break;
        }
    }

    // 匹配出所有的葫芦
    if (san_tiao_list.length > 0 && dui_zi_list.length > 0) {
        for (let san_index = 0; san_index < san_tiao_list.length; san_index++) {
            let san_tiao = san_tiao_list[san_index];
            let san_val = val(san_tiao.cards[0]);
            for (let dui_index = 0; dui_index < dui_zi_list.length; dui_index++) {
                let duizi = dui_zi_list[dui_index];
                let duizi_val = val(duizi.cards[0]);
                if (san_val != duizi_val) {
                    let hulu_pai = san_tiao.cards.concat(duizi.cards);
                    hu_lu_list.push({
                        pattern: Pattern.HU_LU,
                        cards: hulu_pai
                    });
                }
            }
        }
    }

    // 匹配出所有的两对牌型
    if (dui_zi_list.length > 1) {
        for (let dui_index_1 = 0; dui_index_1 < dui_zi_list.length - 1; dui_index_1++) {
            let duizi_1 = dui_zi_list[dui_index_1];
            for (let dui_index_2 = dui_index_1 + 1; dui_index_2 < dui_zi_list.length; dui_index_2++) {
                let duizi_2 = dui_zi_list[dui_index_2];
                let liangdui_pai = duizi_1.cards.concat(duizi_2.cards);
                liang_dui_list.push({
                    pattern: Pattern.LIANG_DUI,
                    cards: liangdui_pai
                });
            }
        }
    }

    // 找出一个乌龙, 单张的够数才推荐乌龙，否则不推荐
    let wulong_count = (patternGroup.length == 2) ? 3 : 5;
    let wulong_pai = [];
    if (patternGroup.length > 0 && dan_zhang_list.length >= wulong_count) {
        wulong_pai = dan_zhang_list.splice(0, wulong_count);
        let type_index = 3 - patternGroup.length;
        let pt = checkPattern(wulong_pai, type_index, 0);
        if (pt.pattern == Pattern.WU_LONG) {
            wulong_list.push({
                pattern: Pattern.WU_LONG,
                cards: wulong_pai
            });
        }
    }

    switch (pattern) {
        case Pattern.WU_TONG:
            return wu_tong_list;
        case Pattern.TIE_ZHI:
            return tie_zhi_list;
        case Pattern.HU_LU:
            return hu_lu_list;
        case Pattern.SAN_TIAO:
            return san_tiao_list;
        case Pattern.LIANG_DUI:
            return liang_dui_list;
        case Pattern.DUI_ZI:
            return dui_zi_list;
        case Pattern.WU_LONG:
            return wulong_list;
        default:
            return [];
    }
}


/**
 * 获取所有同花顺，顺子类型的组合
 * @param cards
 * @param isTongHua
 * @returns {Array}
 */
function matchAllABC(cards, isTongHua) {
    let shunzi_list = [];
    let getAllShunZi = function (countMap, shunzi_num, start_val) {
        let shunzi_pai = [];
        for (let pai_val = start_val; pai_val > 0; pai_val--) {
            if (countMap[pai_val] && countMap[pai_val].length > 0) {
                shunzi_pai.unshift(countMap[pai_val].pop());
            } else {
                // 中间断了，长度不够,恢复之前扣除的牌
                while (shunzi_pai.length > 0) {
                    let last_value = pai_val + shunzi_pai.length;
                    let pai = shunzi_pai.pop();
                    countMap[last_value].push(pai);
                }

                continue;
            }

            if (shunzi_pai.length == shunzi_num) {
                // 达到指定长度
                // shunzi_list.push(shunzi_pai.concat());
                shunzi_list.push({
                    pattern: isTongHua ? Pattern.TONG_HUA_SHUN : Pattern.SHUN_ZI,
                    cards: shunzi_pai.concat()
                });

                while (shunzi_pai.length > 0) {
                    let last_value = pai_val + shunzi_pai.length - 1;
                    let pai = shunzi_pai.pop();
                    countMap[last_value].push(pai);
                }

                let start = pai_val + 3;//??????????
                if (start > 4) {
                    getAllShunZi(countMap, 5, start);
                }
            }
        }
    };

    if (isTongHua) {
        let colorMap = getColorMap(cards);
        let colorCardsMap = getColorCardsMap(colorMap);
        for (let color of colorMap.sortedColors) {
            let cMap = colorCardsMap[color];
            cMap.valCardsMap[1] = cMap.valCardsMap[14];
            getAllShunZi(cMap.valCardsMap, 5, 14);
        }
    } else {
        let cardsMap = getCardsMap(cards);
        let countMap = cardsMap.valCardsMap;
        countMap[1] = countMap[14];
        getAllShunZi(countMap, 5, 14);
    }
    return shunzi_list;
}

/**
 * 获取所有同花类型的牌型
 * @param pais
 * @returns {Array}
 */
function matchAllSameColor(cards) {
    let tonghua_list = [];
    let getAllTongHua = function (color_pais) {
        for (let pai_index = 0; pai_index < color_pais.length - 4; pai_index++) {
            let thp = color_pais.concat();
            thp = thp.splice(pai_index, 5);
            tonghua_list.push({
                pattern: Pattern.TONG_HUA,
                cards: thp
            });
        }
    };

    let colorMap = getColorMap(cards);
    for (let color of colorMap.sortedColors) {
        let cp = colorMap.colorCardsMap[color];
        getAllTongHua(cp);
    }

    return tonghua_list;
}

/**
 * 寻找顺子
 * @param cardsMap
 * @param length
 * @returns {*}
 */
function findABC(cardsMap, length) {
    cardsMap = JSON.parse(JSON.stringify(cardsMap));
    if (cardsMap.valCardsMap[14]) {
        cardsMap.valCardsMap[1] = cardsMap.valCardsMap[14];
        cardsMap.sortedValsDesc.push(1);
    }
    let continueList = findContinueVals(cardsMap, 1);
    if (!Array.isArray(continueList) || !continueList.length) {
        return;
    }
    // list中的值是从小到大排序的
    let list = null;
    for (let lianVal of continueList) {
        if (lianVal.length >= length) {
            list = lianVal;
            break;
        }
    }

    if (!list) {
        return;
    }

    let shunZi = [];
    // 优先取最大的顺子
    for (let i = list.length - 1; i > -1; i--) {
        let v = list[i];
        shunZi.unshift(cardsMap.valCardsMap[v][0]); // 直接从黑桃先去
        if (shunZi.length == length) {
            break;
        }
    }

    return shunZi;
}


/**
 * 找出三同花顺/三顺子
 * @param pais
 * @param callback
 */
function findABC3(cardsMap) {
    let sanShunZi = checkABC3(cardsMap);
    // todo: 判断中道和尾道顺子的大小，主要是A2345可能比910JQK大
    if (sanShunZi) {
        let shunZiCards = [];
        sanShunZi.forEach(function (sz) {
            shunZiCards = shunZiCards.concat(sz);
        });

        let leftCards = getLeftCards(shunZiCards, cardsMap.cards);

        return [{
            cards: shunZiCards,
            pattern: Pattern.SAN_SHUN_ZI,
            value: 100000000 + Pattern.SAN_SHUN_ZI,
            index: 0,// 特殊牌为0
            scoreBig: 4,
            scoreExt: 0,
            cardsExt: leftCards
        }];
    }
}

/**
 * 判断一手牌中是否存在三顺子类型有则返回相应牌组合
 * @param pais
 * @returns {null | Array<Array<number>>}
 */
function checkABC3(cardsMap) {
    cardsMap = JSON.parse(JSON.stringify(cardsMap));
    cardsMap.valCardsMap[1] = cardsMap.valCardsMap[14];
    let countMap = cardsMap.valCardsMap;
    let shunzi_list = [];
    let getAllShunZi = function (shunzi_num, start_val) {
        let shunzi_pai = [];
        for (let pai_val = start_val; pai_val > 0; pai_val--) {
            if (countMap[pai_val] && countMap[pai_val].length > 0) {
                shunzi_pai.unshift(countMap[pai_val].pop());
                if (shunzi_pai.length == shunzi_num) {
                    // 达到指定长度
                    shunzi_list.unshift(shunzi_pai.concat());
                    // 中道的顺子不能大于尾道的顺子

                    if (shunzi_list.length == 3) {
                        return true;
                    } else {
                        // 判断已经找到了几个顺子，继续往下找
                        let num = shunzi_list.length == 2 ? 3 : 5;
                        let start = shunzi_list.length == 2 ? 14 : val(shunzi_pai[4]);
                        // let start = shunzi_pai[shunzi_pai.length - 1] % 20;
                        let result = getAllShunZi(num, start);
                        if (!result) {
                            shunzi_list.shift();
                            // let next_num = shunzi_list.length == 2 ? 3 : 5;
                            pai_val = val(shunzi_pai[shunzi_pai.length - 1]);
                            while (shunzi_pai.length > 0) {
                                let pai = shunzi_pai.shift();
                                let szp_val = val(pai);
                                countMap[szp_val].push(pai);
                            }
                            if (pai_val > num) {
                                continue;
                            }
                        }
                        return result;
                    }
                }
            } else {
                // 中间断了，长度不够,恢复之前扣除的牌
                while (shunzi_pai.length > 0) {
                    let last_value = pai_val + shunzi_pai.length;
                    let pai = shunzi_pai.pop();
                    countMap[last_value].push(pai);
                }
                continue;
            }
        }

        // 恢复countMap
        while (shunzi_pai.length > 0) {
            let pai = shunzi_pai.shift();
            let szp_val = val(pai);
            countMap[szp_val].push(pai);
        }
        return;
    };
    let res = getAllShunZi(5, 14);
    if (res) {
        return shunzi_list;
    }
}

/**
 * 从一首牌中找出三同花顺牌型
 * @param pais
 * @returns {Array}
 */
function findABC3sameColor(colorMap) {
    let san_shunzi_list = [];
    let san_shunzi = checkABC3sameColor(colorMap);
    // todo: 判断中道和尾道顺子的大小，主要是A2345可能比910JQK大
    if (san_shunzi != null) {
        let shunzi_pai = [];
        san_shunzi.forEach(function (sz) {
            shunzi_pai = shunzi_pai.concat(sz);
        });

        let left_pai = getLeftCards(shunzi_pai, colorMap.cards);

        let result = [{
            cards: shunzi_pai,
            pattern: Pattern.SAN_TONG_HUA_SHUN,
            value: 100000000 + Pattern.SAN_TONG_HUA_SHUN,
            index: 0,// 特殊牌为0
            scoreBig: 18,
            scoreExt: 0,
            cardsExt: left_pai
        }];
        san_shunzi_list.push(result);
    }
    return san_shunzi_list;
}

/**
 * 判断一手牌中是否存在三同花顺类型有则返回相应牌组合
 * @param pais
 * @returns {null | Array<Array<number>>}
 */
function checkABC3sameColor(colorMap) {
    let colorCardsMap = getColorCardsMap(colorMap);
    for (let color in colorCardsMap) {
        let cp = colorCardsMap[color];
        cp.valCardsMap[1] = cp.valCardsMap[14];
        // todo: A可以当1使用,sortedVals中要加上'1'这个元素
    }
    let shunzi_list = [];
    let getAllShunZi = function (shunzi_num, start_val) {
        let shunzi_pai = [];
        let colorIndex = 0;
        let color_val = colorMap.sortedColors[colorIndex];
        let countMap = colorCardsMap[color_val].valCardsMap;

        // todo: 如果不把A当1使用时的情况考虑进去下列循环的临界值不能为0
        for (let pai_val = start_val; pai_val > 0; pai_val--) {
            if (countMap[pai_val] && countMap[pai_val].length > 0) {
                shunzi_pai.unshift(countMap[pai_val].pop());
                if (shunzi_pai.length == shunzi_num) {
                    // 达到指定长度
                    shunzi_list.unshift(shunzi_pai.concat());
                    // 中道的顺子不能大于尾道的顺子,先拿大的再拿小的，这里中道不会大于尾道


                    if (shunzi_list.length == 3) {
                        // 头中尾都匹配好了
                        return true;
                    } else {
                        // 判断已经找到了几个顺子，继续往下找
                        let num = shunzi_list.length == 2 ? 3 : 5;
                        let start = shunzi_list.length == 2 ? 14 : val(shunzi_pai[4]); // 中道的顺子不能比尾道大
                        // let start = shunzi_pai[shunzi_pai.length - 1] % 20;
                        let result = getAllShunZi(num, start);
                        if (!result) {
                            // 此路行不通
                            shunzi_list.shift();
                            while (shunzi_pai.length > 0) {
                                let pai = shunzi_pai.shift();
                                let szp_val = val(pai);
                                countMap[szp_val].push(pai);
                            }
                            if (pai_val > num) { // todo: 如果A不当1使用，这里的条件要改
                                continue;
                            }
                            return;
                        }
                        return result;
                    }
                }
            } else {
                let start = 14;// 换花色后从哪里开始找
                if (shunzi_pai.length > 0) {
                    start = val(shunzi_pai[shunzi_pai.length - 1]) + 1;
                } else {
                    start = pai_val + 1;
                }

                // 中间断了，长度不够,恢复之前扣除的牌
                while (shunzi_pai.length > 0) {
                    let last_value = pai_val + shunzi_pai.length;
                    let pai = shunzi_pai.pop();
                    countMap[last_value].push(pai);
                }
                colorIndex++;
                // 当前牌值在所有的花色中均找不到
                if (colorIndex >= colorMap.sortedColors.length) {
                    colorIndex = 0;
                } else {
                    pai_val = start;// 对于当前开始值，还有花色没有覆盖到，调整pai_val从别的花色继续找
                }
                color_val = colorMap.sortedColors[colorIndex];
                countMap = colorCardsMap[color_val].valCardsMap;
                continue;
            }
        }

        // 恢复countMap
        while (shunzi_pai.length > 0) {
            let pai = shunzi_pai.shift();
            let szp_val = val(pai);
            countMap[szp_val].push(pai);
        }
        return;
    };

    let res = getAllShunZi(5, 14);
    if (res) {
        return shunzi_list;
    }
}

/**
 * 找出全大，全小牌型
 * @param pais
 * @param callback
 */
function findAllLS(cardsMap) {
    let countMap = cardsMap.valCardsMap;
    let largeCards = [];
    let smallCards = [];
    for (let v of cardsMap.sortedVals) {
        if (v >= 8) {
            largeCards = largeCards.concat(countMap[v]);
        }

        if (v <= 8) {
            smallCards = smallCards.concat(countMap[val]);
        }
    }
    if (largeCards.length >= 13) {
        let allLarge = largeCards.splice(0, 13);
        let leftCards = getLeftCards(allLarge, cardsMap.cards);
        return [{
            cards: allLarge,
            pattern: Pattern.QUAN_DA,
            value: 100000000 + Pattern.QUAN_DA,
            index: 0,// 特殊牌为0
            scoreBig: 10,
            scoreExt: 0,
            cardsExt: leftCards
        }];
    }

    if (smallCards.length >= 13) {
        let allSmall = smallCards.splice(0, 13);
        let leftCards = getLeftCards(allSmall, cardsMap.cards);
        return [{
            cards: allSmall,
            pattern: Pattern.QUAN_XIAO,
            value: 100000000 + Pattern.QUAN_XIAO,
            index: 0,// 特殊牌为0
            scoreBig: 10,
            scoreExt: 0,
            cardsExt: leftCards
        }];
    }
}

/**
 * 查找凑一色牌型
 * @param pais
 */
function findAllRB(colorMap) {
    let redAmount = 0;
    let redCards = [];
    let blackAmount = 0;
    let blackCards = [];
    for (let color of colorMap.sortedColors) {
        if (color % 2 == 0) {
            redAmount += colorMap.colorCardsMap[color].length;
            redCards.concat(colorMap.colorCardsMap[color]);
        } else {
            blackAmount += colorMap.colorCardsMap[color].length;
            blackCards.concat(colorMap.colorCardsMap[color]);
        }
    }
    if (redAmount >= 13 || blackAmount >= 13) {
        let couYiSeCards = null;
        if (redAmount >= 13) {
            couYiSeCards = redCards.splice(0, 13);
        } else {
            couYiSeCards = blackCards.splice(0, 13);
        }
        let leftCards = getLeftCards(couYiSeCards, colorMap.cards);
        return [{
            cards: couYiSeCards,
            pattern: Pattern.COU_YI_SE,
            value: 100000000 + Pattern.COU_YI_SE,
            index: 0,// 特殊牌为0
            scoreBig: 10,
            scoreExt: 0,
            cardsExt: leftCards
        }];
    }
}

/**
 * 找出三同花牌型
 * @param colorMap
 * @returns {*|void}
 */
function findSameColor3(colorMap) {
    colorMap = JSON.parse(JSON.stringify(colorMap));
    let mostColorCards = colorMap.colorCardsMap[colorMap.sortedColors[0]];
    let sanTongHua = [];
    let getTongHua = function(mostColorCards, length) {
        if (mostColorCards.length >= length) {
            let dao = mostColorCards.splice(0, length);
            sanTongHua.unshift(dao);
            let sanTongHuaCards = [];
            sanTongHua.forEach(function (tongHuaCards) {
                sanTongHuaCards = sanTongHuaCards.concat(tongHuaCards);
            });
            let leftCards = getLeftCards(sanTongHuaCards, colorMap.cards);
            if (sanTongHua.length == 3) {
                return [{
                    cards: sanTongHuaCards,
                    pattern: Pattern.SAN_TONG_HUA,
                    value: 100000000 + Pattern.SAN_TONG_HUA,
                    index: 0,// 特殊牌为0
                    scoreBig: 4,
                    scoreExt: 0,
                    cardsExt: leftCards
                }];
            } else {
                let nextLength = (sanTongHua.length == 2) ? 3 : 5;
                let cMap = getColorMap(leftCards);
                let mostCCards = cMap.colorCardsMap[cMap.sortedColors[0]];

                return getTongHua(mostCCards, nextLength);
            }
        }
    };
    return getTongHua(mostColorCards, 5);
}


/**
 * 获取普通牌型的大小值
 * @param count_map
 * @param pais_value
 * @param pattern
 * @returns {Number}
 */
function getDaoValue(cardsMap, pattern) {
    let valStr = '0x';
    // 1. 纠正由于牌型再不同的道的别称的type便于计算出正确的牌值
    if (pattern == Pattern.ZHONG_DUN_HU_LU) {
        pattern = Pattern.HU_LU;
    }

    if (pattern == Pattern.CHONG_SAN) {
        pattern = Pattern.SAN_TIAO;
    }

    switch (pattern) {
        case Pattern.WU_TONG:
        case Pattern.TIE_ZHI:
        case Pattern.HU_LU:
        case Pattern.TONG_HUA:
        case Pattern.SAN_TIAO:
        case Pattern.LIANG_DUI:
        case Pattern.DUI_ZI:
            for (let v of cardsMap.sortedVals) {
                let cs = cardsMap.valCardsMap[v];
                for (let c of cs) {
                    valStr += val(c).toString(16);
                }
            }
            if (cardsMap.cards.length == 3) {
                valStr += '00';// 头道的同花，三条，对子，乌龙后面补上2个0
            }
            break;
        case Pattern.TONG_HUA_SHUN:
        case Pattern.SHUN_ZI:
        case Pattern.WU_LONG:
            for (let v of cardsMap.sortedValsDesc) {
                let cs = cardsMap.valCardsMap[v];
                for (let c of cs) {
                    valStr += val(c).toString(16);
                }
            }

            if (cardsMap.cards.length == 3) {
                valStr += '00'// 头道的同花，三条，对子，乌龙后面补上2个0
            }
            break;
        default:
            return 0;
    }

    let p = pattern;

    if (pattern == Pattern.TONG_HUA) {
        let length = cardsMap.cards.length;
        if (cardsMap.sortedVals.length < length) {
            p += length - cardsMap.sortedVals.length;
        }
    }
    return parseInt(valStr) + p * 1000000;
}

/**
 * 获取重叠类型的特殊牌
 * @param countMap
 * @param maxCountValue
 * @param paiType
 * @returns {*}
 */
function findSpecialMulti(cardsMap, paiType) {
    cardsMap = JSON.parse(JSON.stringify(cardsMap));
    let countMap = cardsMap.valCardsMap;
    let maxCountValue = cardsMap.sortedVals[0];
    let count = 0;// 每次取几张
    let cards = [];
    let loopCount = 0;// 取几次重叠牌
    switch (paiType) {
        case Pattern.SAN_TIAN_XIA:
            loopCount = 3;
            count = 4;
            break;
        case Pattern.SI_SAN_TIAO:
            loopCount = 4;
            count = 3;
            break;
        case Pattern.LIU_DUI_BAN:
            loopCount = 6;
            count = 2;
            break;
        default:
            return;
    }

    while (loopCount > 0) {
        if (countMap[maxCountValue].length >= count) {
            let mostCards = countMap[maxCountValue];
            cards = cards.concat(mostCards.splice(-count, count));
            // 更新maxCountValue
            for (let val in countMap) {
                let valCount = countMap[val].length;
                if (valCount > countMap[maxCountValue].length) {
                    maxCountValue = val;
                }
            }
        } else {
            return;
        }
        loopCount--;
    }

    // 再补上一张
    cards = cards.concat(countMap[maxCountValue].splice(-1, 1));
    return cards;
}

/**
 * 查找五对三条特殊牌型
 * @param cardsMap
 * @returns {Array}
 */
function findAAA5BB(cardsMap) {
    cardsMap = JSON.parse(JSON.stringify(cardsMap));
    let countMap = cardsMap.valCardsMap;
    let sanList = [];
    let wuDuiSanTiao = [];
    for (let v of cardsMap.sortedVals) {
        let cs = countMap[v];
        if (cs.length >= 3) {
            sanList.push(v);
        }
    }

    let complete = function (sanIndex) {
        let sanTiao = countMap[sanList[sanIndex]];
        wuDuiSanTiao = wuDuiSanTiao.concat(sanTiao.splice(-3, 3).reverse());// reverse方便牌的恢复
        for (let v of cardsMap.sortedVals) {
            let duizi = countMap[v];
            while (duizi.length >= 2) {
                wuDuiSanTiao = wuDuiSanTiao.concat(duizi.splice(-2, 2).reverse());
                if (wuDuiSanTiao.length == 13) {
                    return true;
                }
            }
        }

        sanIndex--;
        while (wuDuiSanTiao.length > 0) {
            let card = wuDuiSanTiao.pop();
            let cardValue = val(card);
            countMap[cardValue].push(card);
        }

        if (sanIndex >= 0) {
            complete(sanIndex);
        } else {
            return false;
        }
    };

    let result = false;
    if (sanList.length > 0) {
        result = complete(sanList.length - 1);
    }

    if (result) {
        return wuDuiSanTiao;
    }
}


