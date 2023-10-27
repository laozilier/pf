/**
 * Created by sam on 2020/5/18.
 *
 */

class SbfAlgorithm extends require('../Algorithm_1') {
    constructor() {
        super();

        this.zhus.push.apply(this.zhus, [9,22,35,48]);
        this.cardsType = require('./const').cardsType;
        this.scoreMap['52'] = 20;
        this.scoreMap['53'] = 30;
    }

    setRule(rule) {
        this.isNotHas6 = true;//rule.isNotHas6;
    }

    /**
     * 获取叫主
     * @param zhu_10
     * @param wang
     * @returns {Array}
     */
    getJiaozhus(zhu_10, wang) {
        let jiaozhus = [];
        let specials = this.getSpecials(wang);
        jiaozhus.push([].concat(zhu_10));
        jiaozhus.push(specials);

        return jiaozhus;
    }

    /**
     * 获取特殊
     * @param wang
     * @returns {Array}
     */
    getSpecials(wang, tempZhuV) {
        let specials = [];
        if (wang.length > 1) {
            let map = {};
            wang.forEach(el => {
                if (map[el] == undefined) {
                    map[el] = 1;
                } else {
                    map[el] += 1;
                }
            });

            for (let key in map) {
                if (map[key] == 2) {
                    let v = parseInt(key);
                    if (typeof tempZhuV == 'number') {
                        if (tempZhuV < v) {
                            specials.push([v, v]);
                        }
                    } else {
                        specials.push([v, v]);
                    }
                }
            }
        }

        return specials;
    }

    /**
     * 获取所有能反的数组
     * @param jiaozhu
     * @param all_10
     * @param wang
     * @returns {Array}
     */
    getFanzhus(jiaozhu, all_10, wang) {
        let a = [];
        let dan10 = [9,22,35,48];
        let all10 = [9,9,22,22,35,35,48,48];
        all_10.forEach((el) => {
            let idx = all10.indexOf(el);
            if (idx > -1) {
                all10.splice(idx, 1);
            }
        });

        let dui10 = [];
        dan10.forEach((el) => {
            let idx = all10.indexOf(el);
            if (idx < 0) {
                dui10.push([el, el]);
            }
        });

        let v = jiaozhu[0];
        let t = this.cardType(v);
        let len = jiaozhu.length;
        let specials = [];
        if (len == 1) {
            a = a.concat(dui10);
            specials = this.getSpecials(wang);
        } else {
            if (v < 52) {
                dui10.forEach((el) => {
                    let card = el[0];
                    let cardType = this.cardType(card);
                    if (cardType > t) {
                        a.push(el);
                    }
                });

                specials = this.getSpecials(wang);
            } else {
                specials = this.getSpecials(wang, v);
            }
        }

        a = a.concat(specials);

        return a;
    }

    /***
     *牌面值(3 < A < 副2 < 主2 < 副10 < 主10 < 王)
     * @param card
     */
    cardValue(card) {
        if (this.zhuType == undefined) {
            return super.cardValue(card);
        }

        let value = card % 13;
        if (this.zhuType < 0) {
            if (card === 52) {
                return 22;
            } else if (card === 53) {
                return 23;
            } else if (value == 0) {
                return 13;
            } else if (value == 1) {
                let type = this.cardType(card);
                return 14+type;
            } else if (value == 9) {
                let type = this.cardType(card);
                return 18+type;
            } else if (value < 9) {
                return (value + 1);
            } else {
                return value;
            }
        } else {
            if (card === 52) {
                return 18;
            } else if (card === 53) {
                return 19;
            } else if (value == 0) {
                return 13;
            } else if (value == 1) {
                let type = this.cardType(card);
                return 14+(type == this.zhuType ? 1 : 0);
            } else if (value == 9) {
                let type = this.cardType(card);
                return 16+(type == this.zhuType ? 1 : 0);
            } else if (value < 9) {
                return (value + 1);
            } else {
                return value;
            }
        }
    }

    /**
     * 检查牌是否能出
     * @param cards
     * @param holds
     * @returns {* || undefined}
     */
    checkCanOut(cards, holds) {
        let cardsData = super.checkCanOut(cards, holds);
        if (!cardsData) {
            return;
        }

        if (cardsData.type == undefined) {
            return;
        }

        if (!!this.firstCards && !!this.maxCards && this.isHasScores(cards) && !this.compareCardsDatas(this.maxCards, cardsData)) {
            let isZhu = this.firstCards.isZhu;
            let type = this.firstCards.type;
            let zhus = this.getHoldsZhu(holds);
            /** 如果出的是主 */
            if (isZhu) {
                if (type == this.cardsType.A) {
                    /** 有主必出主 */
                    if (zhus.length > 0) {
                        /** 有大的 则不能出小分 */
                        for (let i = 0; i < zhus.length; i++) {
                            let v = zhus[i];
                            let tempCardsData = this.getCardsData([v]);
                            if (this.compareCardsDatas(this.maxCards, tempCardsData)) {
                                return;
                            }
                        }
                        /** 如果有分数更小的主牌 则不能出 */
                        if (this.isHasLowScoreCards(zhus, cards)) {
                            return;
                        }
                    } else {
                        /** 如果有分数更小的任何手牌 则不能出 */
                        if (this.isHasLowScoreCards(holds, cards)) {
                            return;
                        }
                    }
                }

                /** 对子 有对必出对 */
                if (type == this.cardsType.AA) {
                    let duizis = this.getAllDuizi(zhus);
                    /** 如果有对子 */
                    if (duizis.length > 0) {
                        for (let i = 0; i < duizis.length; i++) {
                            let duizi = duizis[i];
                            /** 有大对的 则不能出有分的小对 */
                            let tempCardsData = this.getCardsData(duizi);
                            if (this.compareCardsDatas(this.maxCards, tempCardsData)) {
                                return;
                            }

                            /** 如果有分更小的对子 则不能出 */
                            if (this.isHasLowScoreCards(duizi, cards)) {
                                return;
                            }
                        }
                    } else {
                        /** 如果主有一对牌以上 */
                        if (zhus.length > 1) {
                            /** 任意组合 有分更少的 则不能出 */
                            if (this.isHasLowScoreCards(zhus, cards)) {
                                return;
                            }
                        } else {
                            let leftCards = [].concat(cards);
                            let tempHolds = [].concat(holds);
                            let outzhus = this.getHoldsZhu(cards);
                            outzhus.forEach(el=> {
                                leftCards.splice(leftCards.indexOf(el), 1);
                                tempHolds.splice(tempHolds.indexOf(el), 1);
                            });
                            if (this.isHasLowScoreCards(tempHolds, leftCards)) {
                                return;
                            }
                        }
                    }
                }

                /** 拖拉机 先出拖拉机 有对必出对 */
                if (type == this.cardsType.AABB) {
                    /** 找到所有拖拉机 */
                    let aabbs = this.getMaxLenAABB(zhus);
                    let duizis = this.getAllDuizi(zhus);
                    let fcs = this.firstCards.cards;
                    let len = fcs.length/2;
                    /** 如果有拖拉机 */
                    let canaabbs = [];
                    if (aabbs.length > 0) {
                        /** 先找出够长度的拖拉机 */
                        let leftaabbs = [];
                        for (let i = 0; i < aabbs.length; i++) {
                            let aabb = aabbs[i];
                            if (aabb.length >= fcs.length) {
                                leftaabbs.push(aabb);
                            }
                        }

                        /** 将够长度的拖拉机组合成刚好够长度的 */
                        for (let i = 0; i < leftaabbs.length; i++) {
                            let leftaabb = leftaabbs[i];
                            while (leftaabb.length >= this.maxCards.cards.length) {
                                let tempCards = leftaabb.slice(0, this.maxCards.cards.length);
                                leftaabb.splice(0,2);
                                canaabbs.push(tempCards);
                            }
                        }

                        /** 遍历这些拖拉机 看有没有分更少的 */
                        for (let i = 0; i < canaabbs.length; i++) {
                            let aabb = canaabbs[i];
                            /** 有大拖拉机的 则不能出小分 */
                            let tempCardsData = this.getCardsData(aabb);
                            if (this.compareCardsDatas(this.maxCards, tempCardsData)) {
                                return;
                            }

                            if (this.isHasLowScoreCards(aabb, cards)) {
                                return;
                            }
                        }
                    }

                    /** 如果没有能出的拖拉机 */
                    if (canaabbs.length == 0) {
                        /** 如果对子够出 */
                        if (duizis.length >= len) {
                            /** 有分更小的对子组合 则不能出 */
                            if (this.isHasLowScoreCards(duizis, cards)) {
                                return;
                            }
                        } else {
                            /** 先去掉对子牌 */
                            let leftCards = [].concat(cards);
                            let leftZhuCards = [].concat(zhus);
                            let tempHolds = [].concat(holds);
                            duizis.forEach(duizi=> {
                                duizi.forEach(el=> {
                                    leftCards.splice(leftCards.indexOf(el), 1);
                                    leftZhuCards.splice(leftZhuCards.indexOf(el), 1);
                                    tempHolds.splice(tempHolds.indexOf(el), 1);
                                });
                            });

                            /** 如果剩余的同花色牌比出的多 */
                            if (leftZhuCards.length >= leftCards.length) {
                                /** 有分更小的出牌组合 则不能出 */
                                if (this.isHasLowScoreCards(leftZhuCards, leftCards)) {
                                    return;
                                }
                            } else {
                                leftZhuCards.forEach(el=> {
                                    leftCards.splice(leftCards.indexOf(el), 1);
                                    tempHolds.splice(tempHolds.indexOf(el), 1);
                                });

                                /** 有分更小的出牌组合 则不能出 */
                                if (this.isHasLowScoreCards(tempHolds, leftCards)) {
                                    return;
                                }
                            }
                        }
                    }
                }
            } else {
                let fcs = this.firstCards.cards;
                let cardType = this.cardType(fcs[0]);
                /** 有相同花色必须出相同花色的牌 */
                let typeCards = this.getHoldsTypeCards(holds, cardType);
                if (type == this.cardsType.A) {
                    /** 如果这门花色有牌 */
                    if (typeCards.length > 0) {
                        /** 有大的 则不能出小分 */
                        for (let i = 0; i < typeCards.length; i++) {
                            let v = typeCards[i];
                            let tempCardsData = this.getCardsData([v]);
                            if (this.compareCardsDatas(this.maxCards, tempCardsData)) {
                                return;
                            }
                        }

                        /** 如果有分数更小的同色牌 则不能出 */
                        if (this.isHasLowScoreCards(typeCards, cards)) {
                            return;
                        }
                    } else {
                        /** 有主且比最大的大 则不能出小分 */
                        let zhus = this.getHoldsZhu(holds);
                        if (zhus.length > 0) {
                            for (let i = 0; i < zhus.length; i++) {
                                let v = zhus[i];
                                let tempCardsData = this.getCardsData([v]);
                                if (this.compareCardsDatas(this.maxCards, tempCardsData)) {
                                    return;
                                }
                            }
                        }

                        /** 如果有分数更小的任何手牌 则不能出 */
                        if (this.isHasLowScoreCards(holds, cards)) {
                            return;
                        }
                    }
                }

                /** 对子 有对必出对 */
                if (type == this.cardsType.AA) {
                    let duizis = this.getAllDuizi(typeCards);
                    /** 如果有对子 */
                    if (duizis.length > 0) {
                        for (let i = 0; i < duizis.length; i++) {
                            let duizi = duizis[i];
                            let tempCardsData = this.getCardsData(duizi);
                            if (this.compareCardsDatas(this.maxCards, tempCardsData)) {
                                return;
                            }

                            /** 如果有分更小的对子 则不能出 */
                            if (this.isHasLowScoreCards(duizi, cards)) {
                                return;
                            }
                        }
                    } else {
                        /** 如果这门花色有一对牌以上 */
                        if (typeCards.length > 1) {
                            /** 任意组合 有分更少的 则不能出 */
                            if (this.isHasLowScoreCards(typeCards, cards)) {
                                return;
                            }
                        } else {
                            if (typeCards.length == 0) {
                                /** 有主且比最大的大 则不能出小分 */
                                let duizis = this.getHoldsZhuDuizis(holds);
                                /** 如果有对子 */
                                if (duizis.length > 0) {
                                    for (let i = 0; i < duizis.length; i++) {
                                        let duizi = duizis[i];
                                        let tempCardsData = this.getCardsData(duizi);
                                        if (this.compareCardsDatas(this.maxCards, tempCardsData)) {
                                            return;
                                        }
                                    }
                                }
                            }

                            let outTypeCards = this.getHoldsTypeCards(cards, cardType);
                            let leftCards = [].concat(cards);
                            let tempHolds = [].concat(holds);
                            outTypeCards.forEach(el=> {
                                leftCards.splice(leftCards.indexOf(el), 1);
                                tempHolds.splice(tempHolds.indexOf(el), 1);
                            });
                            if (this.isHasLowScoreCards(tempHolds, leftCards)) {
                                return;
                            }
                        }
                    }
                }

                /** 拖拉机 有对必出对 */
                if (type == this.cardsType.AABB) {
                    if (typeCards.length < fcs.length) {
                        if (typeCards.length == 0) {
                            let zhus = this.getHoldsZhu(holds);
                            if (zhus.length > 0) {
                                let aabbs = this.getMaxLenAABB(zhus);
                                /** 如果有拖拉机 */
                                let canaabbs = [];
                                if (aabbs.length > 0) {
                                    /** 先找出够长度的拖拉机 */
                                    let leftaabbs = [];
                                    for (let i = 0; i < aabbs.length; i++) {
                                        let aabb = aabbs[i];
                                        if (aabb.length >= fcs.length) {
                                            leftaabbs.push(aabb);
                                        }
                                    }

                                    /** 将够长度的拖拉机组合成刚好够长度的 */
                                    for (let i = 0; i < leftaabbs.length; i++) {
                                        let leftaabb = leftaabbs[i];
                                        while (leftaabb.length >= this.maxCards.cards.length) {
                                            let tempCards = leftaabb.slice(0, this.maxCards.cards.length);
                                            leftaabb.splice(0,2);
                                            canaabbs.push(tempCards);
                                        }
                                    }

                                    /** 遍历这些拖拉机 看有没有分更少的 */
                                    for (let i = 0; i < canaabbs.length; i++) {
                                        let aabb = canaabbs[i];
                                        /** 有大拖拉机的 则不能出小分 */
                                        let tempCardsData = this.getCardsData(aabb);
                                        if (this.compareCardsDatas(this.maxCards, tempCardsData)) {
                                            return;
                                        }
                                    }
                                }
                            }
                        }

                        let leftCards = [].concat(cards);
                        let tempHolds = [].concat(holds);
                        typeCards.forEach(el=> {
                            leftCards.splice(leftCards.indexOf(el), 1);
                            tempHolds.splice(tempHolds.indexOf(el), 1);
                        });

                        /** 有分更小的出牌组合 则不能出 */
                        if (this.isHasLowScoreCards(tempHolds, leftCards)) {
                            return;
                        }

                    } else {
                        /** 找到所有拖拉机 */
                        let aabbs = this.getMaxLenAABB(typeCards);
                        /** 如果有够长度的拖拉机 */
                        let canaabbs = [];
                        if (aabbs.length > 0) {
                            /** 先找出够长度的拖拉机 */
                            let leftaabbs = [];
                            for (let i = 0; i < aabbs.length; i++) {
                                let aabb = aabbs[i];
                                if (aabb.length >= fcs.length) {
                                    leftaabbs.push(aabb);
                                }
                            }

                            /** 将够长度的拖拉机组合成刚好够长度的 */
                            for (let i = 0; i < leftaabbs.length; i++) {
                                let leftaabb = leftaabbs[i];
                                for (let j = 0; j < leftaabb.length-fcs.length; j+=2) {
                                    let temp = [].concat(leftaabb);
                                    canaabbs.push(temp.splice(j, fcs.length));
                                }
                            }

                            /** 遍历这些拖拉机 看有没有分更少的 */
                            for (let i = 0; i < canaabbs.length; i++) {
                                let aabb = canaabbs[i];
                                let tempCardsData = this.getCardsData(aabb);
                                if (this.compareCardsDatas(this.maxCards, tempCardsData)) {
                                    return;
                                }
                                if (this.isHasLowScoreCards(aabb, cards)) {
                                    return;
                                }
                            }
                        }

                        /** 如果没有能出的拖拉机 */
                        if (canaabbs.length == 0) {
                            let duizis = this.getHoldsTypeCardsDuizis(holds, cardType);
                            /** 如果对子够出 */
                            if (duizis.length >= fcs.length/2) {
                                /** 有分更小的对子组合 则不能出 */
                                if (this.isHasLowScoreCards(duizis, cards)) {
                                    return;
                                }
                            } else {
                                /** 先去掉对子牌 */
                                let leftCards = [].concat(cards);
                                let leftTypeCards = [].concat(typeCards);
                                duizis.forEach(duizi=> {
                                    duizi.forEach(el=> {
                                        leftCards.splice(leftCards.indexOf(el), 1);
                                        leftTypeCards.splice(leftTypeCards.indexOf(el), 1);
                                    });
                                });

                                /** 有分更小的出牌组合 则不能出 */
                                if (this.isHasLowScoreCards(leftTypeCards, leftCards)) {
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }

        return cardsData;
    }

    /**
     * 过滤不能出的牌
     * @param tipsCards
     */
    filterLowScores(tipsCards) {
        /** 先去重 */
        let bigs = tipsCards.bigs;
        if (bigs.length > 1) {
            let filts = [];
            for (let i = 0; i < bigs.length; i++) {
                let el = bigs[i].sort().toString();
                if (filts.includes(el)) {
                    bigs.splice(i, 1);
                    i-=1;
                } else {
                    filts.push(el);
                }
            }
        }

        let smalls = tipsCards.smalls;
        if (smalls.length > 0) {
            if (bigs.length > 0) {
                /** 如果有大的 那么小的有分的都不可以出 */
                smalls = smalls.filter(small=> {
                    return this.getCardScore(small) == 0;
                });
            } else {
                /** 如果没有大的 那么小的只能出分最少的 */
                smalls.sort((a, b)=> {
                    return this.getCardScore(a)-this.getCardScore(b);
                });

                let score = -1;
                for (let i = 0; i < smalls.length; i++) {
                    let small = smalls[i];
                    if (score < 0) {
                        score = this.getCardScore(small);
                    } else {
                        if (this.getCardScore(small) > score) {
                            smalls = smalls.splice(0, i);
                            break;
                        }
                    }
                }
            }

            /** 再去重 */
            if (smalls.length > 1) {
                let filts = [];
                let duizi = [];
                for (let i = 0; i < smalls.length; i++) {
                    let small = smalls[i];
                    let el = small.sort().toString();
                    if (filts.includes(el)) {
                        smalls.splice(i, 1);
                        i-=1;
                        if (small.length == 1) {
                            duizi.push(small[0]);
                        }
                    } else {
                        filts.push(el);
                    }
                }

                /** 再排序 */
                if (smalls.length > 1 && smalls[0].length == 1) {
                    smalls.sort((a, b)=> {
                        if (duizi.includes(a[0]) && !duizi.includes(b[0])) {
                            return 1;
                        }

                        if (!duizi.includes(a[0]) && duizi.includes(b[0])) {
                            return -1;
                        }

                        return this.cardValue(a[0])-this.cardValue(b[0]);
                    });
                }
            }
        }

        let others = tipsCards.others;
        if (others.length > 0) {
            if (bigs.length > 0) {
                /** 如果有大的 那么其他的有分的都不可以出 */
                others = others.filter(other=> {
                    return this.getCardScore(other) == 0;
                });
            } else {
                /** 如果没有大的 那么其他的只能出分最少的 */
                others.sort((a, b)=> {
                    return this.getCardScore(a)-this.getCardScore(b);
                });

                let score = -1;
                for (let i = 0; i < others.length; i++) {
                    let other = others[i];
                    if (score < 0) {
                        score = this.getCardScore(other);
                    } else {
                        if (this.getCardScore(other) > score) {
                            others = others.splice(0, i);
                            break;
                        }
                    }
                }
            }

            /** 再去重 */
            if (others.length > 1) {
                let filts = [];
                let duizi = [];
                for (let i = 0; i < others.length; i++) {
                    let other = others[i];
                    let el = other.sort().toString();
                    if (filts.includes(el)) {
                        others.splice(i, 1);
                        i-=1;
                        if (other.length == 1) {
                            duizi.push(other[0]);
                        }
                    } else {
                        filts.push(el);
                    }
                }

                /** 再排序 */
                if (others.length > 1) {
                    others.sort((a, b)=> {
                        if (a.length == 1) {
                            if (duizi.includes(a[0]) && !duizi.includes(b[0])) {
                                return 1;
                            }

                            if (!duizi.includes(a[0]) && duizi.includes(b[0])) {
                                return -1;
                            }

                            return this.cardValue(a[0])-this.cardValue(b[0]);
                        }

                        /** 主多放后面 */
                        let zhucounta = this.getZhuCount(a);
                        let zhucountb = this.getZhuCount(b);
                        if (zhucounta == zhucountb) {
                            return this.getCardValeCount(a)-this.getCardValeCount(b);
                        }

                        return zhucounta-zhucountb;
                    });
                }
            }
        }

        tipsCards.cans = tipsCards.cans.concat(bigs);
        tipsCards.cans = tipsCards.cans.concat(smalls);
        tipsCards.cans = tipsCards.cans.concat(others);

        for (let i = 0; i < tipsCards.musts.length; i++) {
            let el = tipsCards.musts[i];
            if (!tipsCards.all.includes(el)) {
                tipsCards.all.push(el);
            }
        }

        for (let i = 0; i < tipsCards.cans.length; i++) {
            let can = tipsCards.cans[i];
            can.forEach(el=> {
                if (!tipsCards.all.includes(el)) {
                    tipsCards.all.push(el);
                }
            });
        }
    }

    /**
     * 自动出牌
     * @param holds
     * @returns {Array}
     */
    getAutoDicard(holds) {
        let tipsCards = super.getAutoDicard(holds);
        this.filterLowScores(tipsCards);
        let cards = tipsCards.musts.concat(tipsCards.cans[0] || []);
        return cards;
    }
}

module.exports = SbfAlgorithm;