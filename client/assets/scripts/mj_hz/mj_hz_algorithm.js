const enum_hz = require('./mj_hz_enum');
const InPokerType = enum_hz.inPokerType;

class HzAlgorithm {
    constructor() {
        this.laizi = 35;
    }

    setRule(rule) {

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

    /**
     * 检查手牌打出后可听的牌
     * @param {*} player_holds 
     */
    checkHoldsTing(player_holds) {
        let arr = [];
        for (let i = 0; i < player_holds.length; i++) {
            let card = player_holds[i];
            if (arr.includes(card)) {
                continue;
            }

            let obj = this.checkTing(player_holds, card);
            if (!!obj) {
                arr.push(card);
            }
        }

        return arr;
    }

    /**
     * 检查听牌
     * @param {*} player_holds 
     * @param {*} card 
     */
    checkTing(player_holds, card) {
        let holds = player_holds;
        if (typeof card == 'number') {
            holds = [].concat(holds);
            holds.splice(holds.indexOf(card), 1);
        }

        let wangdiao = this.checkWangDiao(holds);
        if (!!wangdiao) {
            return {all: true};
        }

        let arr = [];
        let allCards = [1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28,29,35];
        for (let i = 0; i < allCards.length; i++) {
            let v = allCards[i];
            let obj = this.checkHu(holds, v);
            if (!!obj) {
                arr.push(v);
            }
        }

        if (arr.length > 0) {
            return {arr: arr};
        }
    }

    /**
     * 检查王吊
     * @param player_holds
     */
    checkWangDiao(player_holds) {
        /** 王数量小于1个 */
        let wCount = this.calcCountInArray(player_holds, this.laizi);
        if (wCount < 1) {
            return;
        }

        /** 先移除1个王 然后再看是否成牌了 */
        let holds = [].concat(player_holds);
        holds.splice(holds.indexOf(this.laizi), 1);
        return this.checkHu(holds);
    }

    /**
     * 判断胡
     * @param player_holds
     * @param card
     */
    checkHu (player_holds, card) {
        let holds = [].concat(player_holds);
        let finalGroup = [];

        if (isNaN(card)) {} else {
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

        /** 如果是8或18或者28 */
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

let algorithm = new HzAlgorithm();
module.exports = algorithm;