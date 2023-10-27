/**
 * 跑得快算法文件
 */
class Pdk_algorithm extends require('../poker/Algorithm_2') {
    constructor() {
        super();
        this.cardsType = require('./poker_pdk_enum').cardsType;
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

    /**
     * 自动先出牌
     * @param player_holds
     * @param alert
     * @returns {*}
     */
    findAutoCards(player_holds, alert) {
        let holds = [].concat(player_holds);
        let allTips = {cards: [], nots: []};
        let allCards = allTips.cards;
        /** 如果是首出 并且是黑桃三先出 则必出黑桃三 */
        if (this.heitao3fisrt && holds.includes(41)) {
            let cards = this.getCards(holds, 41);
            if (!!cards && cards.length > 0) {
                if (cards.length == 4) {
                    allCards.push(cards);
                } else {
                    allCards.push([41]);
                }
            }

            return allTips;
        }

        allTips = super.findAutoCards(player_holds, alert);
        return allTips;
    }

    /**
     * 检查能不能出
     * @param holds
     * @param cards
     * @param alert
     */
    checkCanOut(holds, cards, alert) {
        let cardsData = super.checkCanOut(holds, cards, alert);
        if (!!cardsData) {
            /** 如果黑桃三先出 有黑桃三必出 */
            if (this.heitao3fisrt) {
                if (holds.includes(41) && !cardsData.cards.includes(41)) {
                    return;
                }
            }

            /** 如果下家报单 */
            if (!!alert) {
                /** 如果是打单 不是最大不能出 */
                if (cardsData.type == this.cardsType.A && !this.isMaxA(cardsData.minVal, holds)) {
                    return;
                }
            }
        }

        return cardsData;
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

let algorithm = new Pdk_algorithm();
module.exports = algorithm;

// const rule = {first: 0, gameRules: [0,0,0,0,0,0], playTypes: [0,0,0,0]};
// algorithm.setRule(rule);

// console.log(algorithm.findAutoCards([11,12,11,12,8,8,9,9,9]));

// console.log(algorithm.findAutoBigCards(
//     [40, 39, 25, 38, 50, 10, 36, 22, 9, 8, 21, 19, 42, 41, 28],
//     {type: 4, cards: Array(4), minVal: 4, first: true, uid: 725859},
// ));