const enum_hz = require('./enum');
const InPokerType = enum_hz.inPokerType;
const GangType = enum_hz.gangType;

class HzAlgorithm extends (require('../Mj')) {

    constructor() {
        super();
        this.laizi = 35;
    }

    setRule(rule) {

    }

    /**
     * 自动出一张牌
     * @param holds
     * @returns {number}
     */
    getAutoDicard(holds) {
        return holds[0];
    }

    /**
     * 检查牌是否能出
     * @param holds
     * @param card
     * @returns {boolean}
     */
    checkCanOut(holds, card) {
        if (isNaN(card)) {
            return false;
        }

        if (holds.indexOf(card) < 0) {
            return false;
        }

        return true;
    }

    /**
     * 判断是否可碰
     * @param player_holds
     * @param card
     * @returns {{v: number, vs: number[], t: number}}
     */
    checkPeng (player_holds, card) {
        let maps = this.calcPokersCount(player_holds);
        for (let key in maps) {
            let v = parseInt(key);
            if (v == this.laizi) {
                continue;
            }

            let c = maps[key];
            if (c > 1 && v == card) {
                return {
                    v: v,
                    vs: [v, v, v],
                    t: InPokerType.peng
                };
            }
        }
    }

    /**
     * 检查杠
     * @param player_holds
     * @param player_inPokers
     * @param card
     * @param disCard
     */
    checkGang(player_holds, player_inPokers=[], card, disCard=false) {
        let res = [];
        let holds = [].concat(player_holds);
        /** 如果是别人打出来的牌 则看看能不能点杠 */
        if (!!disCard) {
            let maps = this.calcPokersCount(holds);
            /** 首先是手里的暗杠和点杠 */
            for (let key in maps) {
                let v = parseInt(key);
                if (v == this.laizi) {
                    continue;
                }

                let c = maps[key];
                if (c == 3 && v == card) {
                    res.push({
                        v: v,
                        vs: [v, v, v, v],
                        t: InPokerType.gang,
                        gt: GangType.dian,
                    });
                    break;
                }
            }
        } else {
            /** 如果是摸出来的 */
            holds.push(card);
            let maps = this.calcPokersCount(holds);
            /** 首先是手里的暗杠 */
            for (let key in maps) {
                let v = parseInt(key);
                if (v == this.laizi) {
                    continue;
                }

                let c = maps[key];
                if (c == 4) {
                    res.push({
                        v: v,
                        vs: [v, v, v, -1],
                        t: InPokerType.gang,
                        gt: GangType.an,
                    });
                }
            }

            /** 再是进牌里面的碰 */
            for (let j = 0; j < player_inPokers.length; j++) {
                let obj = player_inPokers[j];
                let v = obj.v;
                if (obj.t == InPokerType.peng && holds.includes(v)) {
                    res.push({
                        v: v,
                        vs: [v, v, v, v],
                        t: InPokerType.gang,
                        gt: GangType.ming,
                    });
                    break;
                }
            }
        }

        if (res.length > 0) {
            return res;
        }
    }

    /**
     * 检查补
     * @param player_holds
     * @param player_inPokers
     * @param card
     * @param disCard
     */
    checkBu(player_holds, player_inPokers, card) {
        let res = [];
        let holds = [].concat(player_holds);
        holds.push(card);
        /** 遍历手牌所有的牌 */
        for (let i = 0; i < holds.length; i++) {
            let v = holds[i];
            if (v == this.laizi) {
                continue;
            }

            for (let j = 0; j < player_inPokers.length; j++) {
                let obj = player_inPokers[j];
                if (obj.t == InPokerType.peng && obj.v == v) {
                    res.push({
                        v: card,
                        vs: [card, card, card, card],
                        t: InPokerType.gang,
                    });
                    break;
                }
            }
        }

        if (res.length > 0) {
            return res;
        }
    }

    /**
     * 拷贝对象
     * @param obj
     * @returns {*}
     */
    deepCopy (obj){
        if(typeof obj != 'object') {
            return obj;
        }
        let newobj = {};
        for (let attr in obj) {
            newobj[attr] = this.deepCopy(obj[attr]);
        }
        return newobj;
    }

    //计算每张牌有几张
    calcPokersCount (pokers) {
        let obj = {};

        pokers.forEach((poker) => {
            if (obj[poker] == null) {
                obj[poker] = 1;
            } else {
                obj[poker]++;
            }
        });

        return obj;
    }

    /** 判断是否可吃 */
    checkChi (player_holds, card) {
        let res = [];
        /** 计算可吃牌 */
        let arr = this.getChiArrs(card);
        for (let i = 0; i < arr.length; i++) {
            let holds = [].concat(player_holds);
            holds.push(card);
            let chi = arr[i];
            let can = true;
            for (let j = 0; j < chi.length; j++) {
                let el = chi[j];
                let idx = holds.indexOf(el);
                if (idx < 0) {
                    can = false;
                    break;
                }

                holds.splice(idx, 1);
            }

            if (can) {
                res.push({
                    v: card,
                    vs: chi,
                    t: InPokerType.chi
                })
            }
        }

        if (res.length > 0) {
            return res;
        }
    }

    /**
     * 获取所有吃的样板
     * @param card
     * @returns {Array}
     */
    getChiArrs(card) {
        let arr = [];
        /** 如果是1或11或者21 */
        if (card === 1 || card === 11 || card === 21) {
            arr.push([card, card+1, card+2]);
        }

        /**如果是2或12或者22 */
        else if (card === 2 || card === 12 || card === 22) {
            arr.push([card, card+1, card+2]);
            arr.push([card, card-1, card+1]);
        }

        /** 如果是9或19或者29 */
        else if (card === 9 || card === 19 || card === 29) {
            arr.push([card, card-2, card-1]);
        }

        /** 如果是8或18或者28 */
        else if (card === 8 || card === 18 || card === 28) {
            arr.push([card, card-1, card+1]);
            arr.push([card, card-2, card-1]);
        }

        /** 其他的牌 */
        else {
            arr.push([card, card-2, card-1]);
            arr.push([card, card-1, card+1]);
            arr.push([card, card+1, card+2]);
        }

        return arr;
    }

    /**
     * 检查王闯
     * @param player_holds
     * @param gameRules
     */
    checkWangChuang(player_holds, gameRules) {
        /** 王数量小于2个 */
        let wCount = this.calcCountInArray(player_holds, this.laizi);
        if (wCount < 2) {
            return;
        }

        /** 先移除2个王 然后再看是否成牌了 */
        let holds = [].concat(player_holds);
        for (let i = 0; i < 2; i++) {
            holds.splice(holds.indexOf(this.laizi), 1);
        }

        /** 找到所有胡牌数据 然后找到最大的 */
        return this.checkHu(holds, undefined, gameRules);
    }

    /**
     * 检查王吊
     * @param player_holds
     * @param gameRules
     */
    checkWangDiao(player_holds, gameRules) {
        /** 王数量小于1个 */
        let wCount = this.calcCountInArray(player_holds, this.laizi);
        if (wCount < 1) {
            return;
        }

        /** 先移除1个王 然后再看是否成牌了 */
        let holds = [].concat(player_holds);
        holds.splice(holds.indexOf(this.laizi), 1);
        return this.checkHu(holds, undefined, gameRules);
    }

    /**
     * 判断胡
     * @param player_holds
     * @param card
     * @param gameRules
     */
    checkHu (player_holds, card, gameRules=[]) {
        let holds = [].concat(player_holds);
        let finalGroup = [];
        if (typeof card == 'number')  {
            holds.push(card);
        }

        /** 最终递归 */
        holds.sort((a, b) => {
            return a-b;
        });

        let all = [];
        this.finalCheckOtherHu(holds, finalGroup, all);
        return all.length > 0;
    }

    /**
     * 最后递归检查其他剩余手牌的成牌
     * @param holds
     * @param finalGroup
     * @param all
     */
    finalCheckOtherHu(holds, finalGroup, all) {
        if (holds.length == 0) {
            all.push(finalGroup);
        }

        let card = holds[0];
        /** 如果还没组对子 先组对子 */
        if (holds.length%3 != 0) {
            let cardCount = this.calcCountInArray(holds, card);
            if (cardCount >= 2) {
                /** 牌数量为2 直接当成对子 */
                let tempFinalGroup = JSON.parse(JSON.stringify(finalGroup));
                tempFinalGroup.push({
                    v: -1,
                    vs: [card, card],
                    t: InPokerType.dui,
                });

                /** 并从手牌中移除 */
                let tempHolds = [].concat(holds);
                tempHolds.splice(0, 2);
                this.finalCheckOtherHu(tempHolds, tempFinalGroup, all);
            } else if (holds.includes(this.laizi)) {
                /** 牌数量为1 与赖子成对子 */
                let tempFinalGroup = JSON.parse(JSON.stringify(finalGroup));
                tempFinalGroup.push({
                    v: -1,
                    vs: [card, this.laizi],
                    t: InPokerType.dui,
                });

                /** 并从手牌中移除 */
                let tempHolds = [].concat(holds);
                tempHolds.splice(0, 1);
                tempHolds.pop();
                this.finalCheckOtherHu(tempHolds, tempFinalGroup, all);
            }
        }

        /** 剩下组吃牌 */
        let zuhes = this.getHuZuheArrs(card);
        for (let i = 0; i < zuhes.length; i++) {
            let vs = zuhes[i];
            if (this.holsdContainsVS(holds, vs)) {
                let tempFinalGroup = JSON.parse(JSON.stringify(finalGroup));
                tempFinalGroup.push({
                    v: -1,
                    vs: vs,
                    t: InPokerType.chi,
                });
                /** 并从手牌中移除 */
                let tempHolds = [].concat(holds);
                vs.forEach((el) => {
                    tempHolds.splice(tempHolds.indexOf(el), 1);
                });

                this.finalCheckOtherHu(tempHolds, tempFinalGroup, all);
            }
        }
    }

    /**
     * 判断手牌是否包含某些牌
     * @param holds
     * @param vs
     * @returns {boolean}
     */
    holsdContainsVS(holds, vs) {
        holds = [].concat(holds);
        for (let j = 0; j < vs.length; j++) {
            let el = vs[j];
            let idx = holds.indexOf(el);
            if (idx < 0) {
                return false;
            }

            holds.splice(idx, 1);
        }

        return true;
    }

    /**
     * 获取所有胡牌吃组合的样板
     * @param card
     * @returns {Array}
     */
    getHuZuheArrs(card) {
        let arr = [];
        arr.push([card, card, card]);
        arr.push([card, this.laizi, card]);
        arr.push([card, this.laizi, this.laizi]);

        /** 如果是9或19或29 */
        if (card === 9 || card === 19 || card === 29 || card === this.laizi) {

        }

        /** 如果是8或18或28 */
        else if (card === 8 || card === 18 || card === 28) {
            arr.push([card, this.laizi, card+1]);
        }

        /** 其他的牌 */
        else {
            arr.push([card, card+1, card+2]);
            arr.push([card, this.laizi, card+2]);
            arr.push([card, card+1, this.laizi]);
        }

        return arr;
    }

    //计算数组中有几个元素
    calcCountInArray (arr, el) {
        let count = 0;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === el) {
                count++;
            }
        }
        return count;
    }
}

module.exports = HzAlgorithm;

