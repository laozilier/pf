/** * * 牛大小顺序 * 无牛: 0 * 牛一: 1 * 牛二: 2 * 牛三: 3 * 牛四: 4 * 牛五: 5 * 牛六: 6 * 牛七: 7     倍数: 2(根据规则判断，可能为1) * 牛八: 8     倍数: 2 * 牛九: 9     倍数: 2or3(根据规则判断，可能为3) * 牛牛: 10    倍数: 3or4 * 五花牛: 11  倍数: 5 * 顺子牛: 12  倍数: 6 * 同花牛: 13  倍数: 7 * 葫芦牛: 14  倍数: 8 * 炸弹牛: 15  倍数: 9 * 全大牛: 16  倍数: 10 * 五小牛: 17  倍数: 10 * 同花顺: 18  倍数: 10 * * * * 牛牛返回结果 * { *  type:10,   代表牛类型 *  pai:32,    最大的一张牌, 如果是炸弹牛，则是炸弹那张牌 *  result:[], 结果牌，算出牛的两张牌 * } * * Created by apple on 2017/9/29. */const NiuType = {    NiuType_0: 0,       //五牛    NiuType_1: 1,       //牛一    NiuType_2: 2,       //牛二    NiuType_3: 3,       //牛三    NiuType_4: 4,       //牛四    NiuType_5: 5,       //牛五    NiuType_6: 6,       //牛六    NiuType_7: 7,       //牛七    NiuType_8: 8,       //牛八    NiuType_9: 9,       //牛九    NiuType_10: 10,     //牛牛    NiuType_WHN: 11,    //五花牛    NiuType_SZN: 12,    //顺子牛    NiuType_THN: 13,    //同花牛    NiuType_HLN: 14,    //葫芦牛    NiuType_ZDN: 15,    //炸弹牛    NiuType_QDN: 16,    //全大牛    NiuType_WXN: 17,    //五小牛    NiuType_THS: 18,    //同花顺};const shuffle = require("../common/shuffle");/** * 同花顺牛 * @param  cards * return {boolean|object} */function is_TongHuaShunNiu(cards, laizi) {    if(is_TongHuaNiu(cards, laizi) && is_ShunZiNiu(cards, laizi)){        return {            type:NiuType.NiuType_THS,            pai:sort(cards)[0]        }    }    return false;}/** * 五花牛, 如果不是会返回false * @return {boolean|Object} */function is_WuHuaNiu(cards, laizi) {    if (is_HasLaizi(cards, laizi)) {        return is_LZ_WuHuaNiu(cards, laizi);    }    for(let i = 0; i < cards.length; ++i) {        if(val(cards[i]) < 11) {            return false;        }    }    return {        type:NiuType.NiuType_WHN,        pai:sort(cards)[0],    };}function is_LZ_WuHuaNiu(cards, laizi) {    let count = 0;    for(let i = 0; i < cards.length; ++i) {        if(cards[i] !== laizi && val(cards[i]) >= 11) {            count++;        }    }    if(count === 4) {        return {            type: NiuType.NiuType_WHN,            pai: -1        };    }    return false;}/** * 炸弹牛 * @return {Object|boolean} */function is_ZhaDanNiu(cards, laizi) {    if (is_HasLaizi(cards, laizi)) {        return is_LZ_ZhaDanNiu(cards, laizi);    }    for(let i = 0; i < cards.length; ++i) {        let pai = cards[i],            count = 1;        for(let j = i+1; j < cards.length; ++j) {            val(pai) === val(cards[j]) && count++;        }        if(count === 4){            let arr = [];            cards.forEach(function (n) {                val(pai) !== val(n) && arr.push(n);            });            return {                type:NiuType.NiuType_ZDN,                pai:pai,                result:arr            }        }    }    return false;}function is_LZ_ZhaDanNiu(cards, laizi) {    for(let i = 0; i < cards.length; ++i) {        let pai = cards[i],            count = 1;        if (pai === laizi) {            continue;        }        for (let j = i + 1; j < cards.length; ++j) {            if (cards[j] !== laizi && val(pai) === val(cards[j])) {                count++;            }        }        if(count > 2) {            return {                type:NiuType.NiuType_ZDN,                pai:-1            }        }    }    return false;}function is_HasLaizi(cards, laizi) {    if (cards.indexOf(laizi) < 0) {        return false;    }    return true;}/** * 全大牛 * @param cards * @return {boolean|object} true or false */function is_QuandaNiu(cards, laizi) {    if (is_HasLaizi(cards, laizi)) {        return is_LZ_QuandaNiu(cards, laizi);    }    for(let i = 0; i < cards.length; ++i) {        if(val(cards[i]) > 9) {            return false;        }    }    let value = 0;    cards.forEach(function (n) {        value += val(n);    });    if(value >= 40){        return {            type:NiuType.NiuType_QDN,            pai:sort(cards)[0]        };    }    return false;}/** * 赖子全大牛 * @param cards * @param laizi * @returns {*} */function is_LZ_QuandaNiu(cards, laizi) {    for(let i = 0; i < cards.length; ++i){        if(cards[i] !== laizi && val(cards[i]) > 9) {            return false;        }    }    let value = 0;    cards.forEach(function (n) {        if(n !== laizi) {            value += val(n);        }    });    if(value >= 31){        return {            type:NiuType.NiuType_QDN,            pai:-1        };    }    return false;}/** * 五小牛 * @param cards * @return {boolean|object} true or false */function is_WuXiaoNiu(cards, laizi) {    // for(let i = 0; i < cards.length; ++i){    //     if(val(cards[i]) > 4)    //         return false;    // }    if (is_HasLaizi(cards, laizi)) {        return is_LZ_WuXiaoNiu(cards, laizi);    }    let value = 0;    cards.forEach(function (n) {        value += val(n);    });    if(value <= 10){        return {            type:NiuType.NiuType_WXN,            pai:sort(cards)[0]        };    }    return false;}/** * 计算癞子五小牛 * @param cards * @param laizi 癞子牌 */function is_LZ_WuXiaoNiu(cards, laizi) {    let sum = 0;    //计算总和    cards.forEach(function (n) {        if(n !== laizi){            sum += val(n);        }    });    if(sum < 10) {        return {            type: NiuType.NiuType_WXN,            pai: -1  //癞子牌，为-1,最小牌        }    }    return false;}/** * 顺子牛 * @param {Array} cards * return {boolean|object} */function is_ShunZiNiu(cards, laizi) {    if (is_HasLaizi(cards, laizi)) {        return is_LZ_ShunZiNiu(cards, laizi);    }    let pokers = [];    cards.forEach(function (el) {        pokers.push(val(el));    });    let has = isStraight(pokers);    if(has){        return {            type:NiuType.NiuType_SZN,            pai:sort(cards)[0]        }    }    return false;}/** * 顺子牛 * @param cards * @param laizi */function is_LZ_ShunZiNiu(cards, laizi) {    let pokers = [];    let count = 0;    cards.forEach(function (el) {        if(el !== laizi){            pokers.push(val(el));        }    });    //排序    pokers = pokers.sort(function (a, b) {        return b - a;    });    for(let i = 0; i < pokers.length - 1; ++i) {        if ((pokers[i] - pokers[i+1] > 0) && (pokers[i] - pokers[i+1] < 3)) {            count += pokers[i] - pokers[i+1] - 1;        } else {            count += 10;        }    }    if(count <= 1){        return {            type:NiuType.NiuType_SZN,            pai:-1        };    }    return false;}/** * 同花牛 * @param  cards * return {boolean|object} */function is_TongHuaNiu(cards, laizi) {    if (is_HasLaizi(cards, laizi)) {        return is_LZ_TongHuaNiu(cards, laizi);    }    let has = isIdentical(cards);    if(has){        return {            type:NiuType.NiuType_THN,            pai:sort(cards)[0]        }    }    return false;}function is_LZ_TongHuaNiu(cards, laizi) {    let pokers = [];    cards.forEach(el => {        if(el !== laizi) {            pokers.push(el);        }    });    let has = isIdentical(pokers);    if(has){        return {            type:NiuType.NiuType_THN,            pai:-1        }    }    return false;}/** * 葫芦牛 * @param cards * @returns {*} */function is_HuLuNiu(cards, laizi) {    if (is_HasLaizi(cards, laizi)) {        return is_LZ_HuLuNiu(cards, laizi);    }    for(let i = 0; i < cards.length; ++i){        let pai = cards[i],            count = 0;        for(let j = 0; j < cards.length; ++j){            if(val(pai) === val(cards[j])){                count++;            }        }        if(count >= 3){            let arr = [];            cards.forEach(function (n) {                val(n) !== val(pai) && arr.push(n);            });            if(val(arr[0]) === val(arr[1])) {                return {                    type:NiuType.NiuType_HLN,                    pai:pai,                    result:arr                }            }        }    }    return false;}/** * 癞子葫芦牛 * @param cards * @param laizi * @return */function is_LZ_HuLuNiu(cards, laizi) {    let count = {};    let result = {};    cards.forEach(el => {        if(el !== laizi){            if(count[val(el)] === undefined) {                count[val(el)] = 1;                result[val(el)] = [el];            } else {                count[val(el)] ++;                result[val(el)].push(el);            }        }    });    let keys = Object.keys(count);    if(keys.length === 2){        return {            type: NiuType.NiuType_HLN,            pai: -1,            result: count[keys[0]] < count[keys[1]] ? result[keys[0]] : result[keys[1]]        };    } else {        return false;    }}/** * 计算点数 * * @param cards 牌的数组 * @return {{type,pai,result}|boolean}  返回牛点数 */function cal(cards, laizi, wh) {    let tempCards = [];    let tCards = []; //把10移除之后的牌    let count = 0;   //所有点数加上的和    let dict = {};   //字典，记录点数相同牌的数量    let point = 0;   //模10得到的余数    let result = []; //点数的两张牌    let calres = false;    //把大于10点的牌踢出，不进行计算    for(let i = 0; i < cards.length; ++i){        let v = val(cards[i]);        if(v < 10){            tCards.push(v);            tempCards.push(cards[i]);        }    }    //如果所有的牌都大于10则直接返回牛牛    if(tCards.length === 0) {        calres =  {            type: 10,            pai: sort(cards)[0]        }    } else {        //所有点数相加        for (let i = 0; i < tCards.length; i++) {            let ci = tCards[i];            count += ci;            dict[ci] = dict[ci] === undefined ? 1 : dict[ci] + 1;        }        point = count % 10;        point === 0 && (point = 10);        //从字典查找是否有两张牌相加模10取余等于point        for (let key in dict) {            let other = (10 + point - key) % 10;            if (dict[other]) {                if ((other == key && dict[other] >= 2) || (other != key && dict[other] >= 1)) {                    result.push(parseInt(other));                    result.push(parseInt(key));                    break;                }            }        }        //计算由哪两张牌组成点数        function getResult() {            let res = [];            if(result.length > 0){                for(let i = 0; i < result.length; ++i){                    for(let j = 0; j < tempCards.length; ++j){                        if(val(tempCards[j]) === result[i]){                            res.push(tempCards[j]);                            tempCards.splice(j, 1);                            break;                        }                    }                }            } else {                for(let i = 0; i < tempCards.length; ++i){                    if(val(tempCards[i]) === point){                        res.push(tempCards[i]);                        break;                    }                }            }            return res;        }        //如果结果有数据        if(result.length > 0) {            calres = {                type: point,                pai: sort(cards)[0],                result: getResult()            };        } else if(tCards.length < 5){            if(dict[point] > 0){                calres = {                    type: point,                    pai: sort(cards)[0],                    result: getResult()                }            } else if(tCards.length === 3 && point === 10){                calres = {                    type: point,                    pai: sort(cards)[0],                    result: tempCards                }            }        }        if (is_HasLaizi(cards, laizi)) {            let lz_calres = is_LZ_cal(cards, laizi, wh);            if (lz_calres) {                if (!calres || (lz_calres.type >= calres.type)) {                    return lz_calres;                }            }        }    }    return calres;}function is_LZ_cal(cards, laizi, wh) {    let index = cards.indexOf(laizi);    let pokers = [];    let result = {type:-1};    let resIndex = -1;    let max = 10;    if (wh) {        max = 9;    }    for(let i = 0; i < max; ++i) {        pokers = cards.slice(0);        pokers[index] = i;        let tempResult = cal(pokers);        if(tempResult){            if(tempResult.type > result.type) {                result = tempResult;                if(result.result){                    resIndex = result.result.indexOf(i);                    if(resIndex > -1) {                        result.result[resIndex] = laizi;                    }                }            }            if(result.type === 10){                return {                    type: 10,                    pai : -1,                    result: result.result                }            }        }    }    return {        type: result.type,        pai: -1,        result: result.result    };}/** * 计算金牌牛点数 * * @param cards 牌的数组 * @return {{type,pai,result}|boolean}  返回牛点数 */function jinpaiCal(cards, laizi) {    let calres = false;    for(let i = 0; i < cards.length; ++i){        let pai = cards[i],            count = 0;        for(let j = 0; j < cards.length; ++j){            if(val(pai) === val(cards[j])){                count++;            }        }        if(count >= 3){            let arr = [];            cards.forEach(function (n) {                val(n) !== val(pai) && arr.push(n);            });            let point = 0;            arr.forEach(function (n) {                let value = val(n);                if (value < 10) {                    point+=value;                }            });            point = point%10;            point = (point == 0 ? 10 : point);            calres = {                type:point,                jinpai: true,                pai:pai,                result:arr            }        }    }    if (!calres) {        if (is_HasLaizi(cards, laizi)) {            let lz_calres = is_LZ_jinpaiCal(cards, laizi);            if (lz_calres) {                return lz_calres;            }        }    }    return calres;}/** * 计算金牌牛点数 * * @param cards 牌的数组 * @return {{type,pai,result}|boolean}  返回牛点数 */function is_LZ_jinpaiCal(cards, laizi) {    for(let i = 0; i < cards.length; ++i){        let pai = cards[i],            count = 0;        if (pai === laizi) {            continue;        }        for(let j = 0; j < cards.length; ++j){            if(cards[j] !== laizi && val(pai) === val(cards[j])) {                count++;            }        }        if(count > 1) {            let arr = [];            cards.forEach(function (n) {                if (n !== laizi && val(n) !== val(pai)) {                    arr.push(n);                }            });            let point = 0;            arr.forEach(function (n) {                let value = val(n);                if (value < 10) {                    point+=value;                }            });            point = point%10;            point = (point == 0 ? 10 : point);            return {                type:point,                jinpai: true,                pai:-1,                result:arr            }        }    }    return false;}/** * 获取牌的面值 * A=1 * J=11 * Q=12 * K=13 * @param card * @return {number}  返回牌的面值； 1,2,3,4,5,6,7,8,9,10,11,12,13 */function val(card) {    return (card%13 + 1);}/** * 获取牌的类型 * 0.方片；1.梅花；2.红桃；3.黑桃 * @param card * @return {number} 类型  0.方片；1.梅花；2.红桃；3.黑桃 */function type(card) {    return parseInt(card/13);}/** * 比较单张牌的大小，(如果面值相周，则比较花色，黑红梅方) * 如果 if(left > right)  return true; 反之false * @param left * @param right */function compareSizes(left, right) {    return cardWeight(left) > cardWeight(right);}/** * 计算牌的权重 * @param card 牌 * @return {number} 返回权重 */function cardWeight(card) {    return val(card) * 4 - (4 - type(card));}/** * 排序 */function sort(cards) {    let arr = cards.slice(0);    arr.sort(function (a, b) {        return compareSizes(a, b) ? -1 : 1;    });    return arr;}/** * 判断数组是否为顺子 */function isStraight(cards) {    let arr = cards.sort(function (a, b) {        return b - a;    });    for(let i = 0; i < arr.length - 1; ++i){        if(arr[i] - arr[i+1] !== 1){            return false;        }    }    return true;}/** * 是否同一花色 */function isIdentical(cards) {    let pai = type(cards[0]);    for(let i = 0; i < cards.length; ++i){        if(pai !== type(cards[i])){            return false;        }    }    return true;}module.exports = {    val:val,    type:type,    sort:sort,    /**     * 比较单张牌的大小，(如果面值相周，则比较花色，黑红梅方)     * 如果 if(left > right)  return true; 反之false     * @param left     * @param right     */    compareSizes: function (left, right) {        if(left === -1 || right === -1){            return (right === -1);        }        return cardWeight(left) > cardWeight(right);    },    /**     * 比较两手牌大小，左>右 = true     * @param left     * @param right     * @returns {Boolean}     */    compareHolds: function(left, right){        if(left.type > right.type){            return true;        }        if(left.type === right.type){            /** 普通牛比金牌牛小 **/            if (!!left.jinpai && !right.jinpai) {                if (left.pai === -1 && right.pai !== -1) {                    return false;                }                return true;            } else if (!left.jinpai && !!right.jinpai) {                if (left.pai !== -1 && right.pai === -1) {                    return true;                }                return false;            }            return this.compareSizes(left.pai, right.pai);        }        return false;    },    /**     * 获取牛牛结果     * @param cards 牌     * @param rule 规则信息     * @return {Object}     */    getResult:function (cards, rule, laizi) {        let arr = [];        if(rule !== undefined){            rule.thsn && arr.push(is_TongHuaShunNiu);            rule.wxn && arr.push(is_WuXiaoNiu);            rule.qdn && arr.push(is_QuandaNiu);            rule.zdn && arr.push(is_ZhaDanNiu);            rule.hln && arr.push(is_HuLuNiu);            rule.thn && arr.push(is_TongHuaNiu);            rule.sn  && arr.push(is_ShunZiNiu);            rule.whn && arr.push(is_WuHuaNiu);        }        for(let i = 0; i < arr.length; ++i){            let result = arr[i](cards, laizi);            if(result){                return result;            }        }        /** 获取普通牛 **/        let result1 = cal(cards, laizi, rule.wh);        /** 如果有金牌牛玩法 则需要获取金牌牛 **/        if (rule && rule.jpn) {            /** 获取金牌牛 **/            let result2 = jinpaiCal(cards, laizi);            /** 如果普通牛和金牌牛都有 则比较 **/            if (result1 && result2) {                /** 普通牛的点数大于金牌牛的点数则返回普通牛 否则返回金牌牛 **/                if (result1.type > result2.type) {                    return result1;                }                return result2;            } else if (result2) {                /** 如果只有金牌牛 则返回金牌牛 **/                return result2;            }        }        /** 如果有普通牛 返回普通牛 **/        if (result1) {            return result1;        }        return {            type:0,            pai:sort(cards)[0]        }    },    /**     * 发牌     * @param count 发几手牌     * @param rule  牛牛规则     * @param {Array} [cards]  一副牌     * @return {Object}     */    deal:function (count, rule, cards) {        //保存实际要发到玩家手上的牌        let holds = [];        let max = 10;        //发十手牌到这个数组，会从中间抽掉多余的牌        let allHolds = [[[], {}], [[], {}], [[], {}], [[], {}], [[], {}], [[], {}], [[], {}], [[], {}], [[], {}], [[], {}]];        if (!!rule.wh) {            max = 7;            allHolds = [[[], {}], [[], {}], [[], {}], [[], {}], [[], {}], [[], {}], [[], {}]];        }        //下一副牌        let nextCards = [];        let laizi = -1;        if(!cards){  //如果没有一副牌，则创建一手牌            cards = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51];            if (!!rule.wh) {                cards = [0,1,2,3,4,5,6,7,8,13,14,15,16,17,18,19,20,21,26,27,28,29,30,31,32,33,34,39,40,41,42,43,44,45,46,47];            }            if (!!rule && !!rule.isLaizi) {                laizi = 53;                cards.push(53);            }            shuffle.knuthDurstenfeldShuffle(cards);        } else {            shuffle.knuthDurstenfeldShuffle(cards);        }        // if (!!rule && !!rule.isLaizi) {        //     laizi = cards[Math.floor(Math.random()*cards.length)];        // }        //发牌        for(let i = 0; i < cards.length; ++i) {            if(i < max * 5){                let seat = i%max;                allHolds[seat][0].push(cards[i]);            }            nextCards.push(cards[i]);        }        //抽掉多余的牌        for(let i = 0; i < count; ++i) {            let randomId = Math.randomRange(0, allHolds.length);            let hold = allHolds.splice(randomId, 1)[0];            holds.push(hold);        }        //计算结果        for(let i = 0; i < count; ++i){            let arr = holds[i][0];            holds[i][1] = this.getResult(arr, rule, laizi);        }        return {            holds: holds,            cards: nextCards,            laizi: laizi        };    }};