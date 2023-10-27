// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

/** 
 * 此算法使用于 
 * 三百分 巴十 三打哈 
 * */
class Algorithm_1 extends require('./Algorithm') {
    constructor () {
        super();
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
        /** 去重 */
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

            /** 排序 */
            if (smalls.length > 1 && smalls[0].length == 1) {
                if (smalls[0].length == 0) {
                    smalls.sort((a, b)=> {
                        if (duizi.includes(a[0]) && !duizi.includes(b[0])) {
                            return 1;
                        }

                        if (!duizi.includes(a[0]) && duizi.includes(b[0])) {
                            return -1;
                        }

                        return this.cardValue(a[0])-this.cardValue(b[0]);
                    });
                } else {
                    smalls.sort((a, b)=> {
                        return this.getCardScore(a)-this.getCardScore(b);
                    });
                }
            }
        }

        let others = tipsCards.others;
        /** 去重 */
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

            /** 排序 */
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
     * 检查牌是否能出
     * @param cards
     * @param holds
     * @returns {* || undefined}
     */
    checkCanOut(cards, holds) {
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

        let cardsData = this.getCardsData(cards);
        if (!!this.firstCards) {
            let isZhu = this.firstCards.isZhu;
            let type = this.firstCards.type;
            /** 检查合法性 合法就能出 首先检查长度 */
            let fcs = this.firstCards.cards;
            if (fcs.length != cards.length) {
                return;
            }

            /** 如果出的是主 */
            if (isZhu) {
                /** 有主必出主 */
                let zhus = this.getHoldsZhu(holds);
                let outzhus = this.getHoldsZhu(cards);
                /** 如果出的牌主长度比第一手牌的长度少 但是主数量够多 那么不能出 */
                if (outzhus.length < fcs.length && zhus.length >= fcs.length) {
                    return;
                }

                /** 如果主数量不够多 但是没出完主 那么不能出 */
                if (zhus.length < fcs.length && outzhus.length < zhus.length) {
                    return;
                }

                /** 对子 有对必出对 */
                if (type == this.cardsType.AA) {
                    let duizis = this.getAllDuizi(zhus);
                    let outduizis = this.getAllDuizi(outzhus);
                    if (duizis.length > 0 && outduizis.length == 0) {
                        return;
                    }
                }

                /** 拖拉机 先出拖拉机 有对必出对 */
                if (type == this.cardsType.AABB) {
                    let zhus = this.getHoldsZhu(holds);
                    /** 找到所有拖拉机 */
                    let aabbs = this.getMaxLenAABB(zhus);
                    /** 如果有拖拉机 */
                    if (aabbs.length > 0) {
                        for (let i = 0; i < aabbs.length; i++) {
                            let aabb = aabbs[i];
                            if (aabb.length >= fcs.length) {
                                if (!this.checkAABB(cards)) {
                                    return;
                                }
                            }
                        }
                    }
                    let duizis = this.getAllDuizi(zhus);
                    let outduizis = this.getAllDuizi(outzhus);
                    let len = fcs.length/2;
                    if (duizis.length >= len) {
                        if (outduizis.length < len) {
                            return;
                        }
                    } else {
                        if (outduizis.length < duizis.length) {
                            return;
                        }
                    }
                }
            } else {
                let cardType = this.cardType(fcs[0]);
                /** 有相同花色必须出相同花色的牌 */
                let typeCards = this.getHoldsTypeCards(holds, cardType);
                let outTypeCards = this.getHoldsTypeCards(cards, cardType);
                if (typeCards.length >= fcs.length && outTypeCards.length < fcs.length) {
                    return;
                }

                if (typeCards.length < fcs.length && outTypeCards.length < typeCards.length) {
                    return;
                }

                /** 对子 有对必出对 */
                if (type == this.cardsType.AA) {
                    let duizis = this.getHoldsTypeCardsDuizis(holds, cardType);
                    let outduizis = this.getHoldsTypeCardsDuizis(cards, cardType);
                    if (duizis.length > 0 && outduizis.length == 0) {
                        return;
                    }
                }

                /** 拖拉机 有对必出对 */
                if (type == this.cardsType.AABB) {
                    let len = fcs.length/2;
                    /** 找到所有拖拉机 */
                    let aabbs = this.getMaxLenAABB(typeCards);
                    /** 如果有拖拉机 */
                    if (aabbs.length > 0) {
                        for (let i = 0; i < aabbs.length; i++) {
                            let aabb = aabbs[i];
                            if (aabb.length >= fcs.length) {
                                if (!this.checkAABB(cards)) {
                                    return;
                                }
                            }
                        }
                    }

                    let duizis = this.getHoldsTypeCardsDuizis(holds, cardType);
                    let outduizis = this.getHoldsTypeCardsDuizis(cards, cardType);
                    if (duizis.length >= len) {
                        if (outduizis.length < len) {
                            return;
                        }
                    } else {
                        if (outduizis.length < duizis.length) {
                            return;
                        }
                    }
                }

                /** 如果类型相同 又是主牌 */
                if (!!cardsData && cardsData.type == type && cardsData.isZhu) {
                    cardsData.isSha = true;
                }
            }

            if (!cardsData) {
                return {
                    type: this.cardsType.NONE,
                    cards: cards,
                    minVal: -1,
                    isZhu: this.isAllZhu(cards),
                    isSha: false
                }
            }
        }

        return cardsData;
    }

    /**
     * 检查手牌主
     * @param holds
     * @param filts
     * @returns {Array}
     */
    getHoldsZhu(holds, filts) {
        let zhus = [];
        holds.forEach((el)=> {
            if (!!filts) {
                if ((this.zhus.indexOf(el) > -1 || this.cardType(el) == this.zhuType) && !filts.includes(el)) {
                    zhus.push(el);
                }
            } else {
                if (this.zhus.indexOf(el) > -1 || this.cardType(el) == this.zhuType) {
                    zhus.push(el);
                }
            }
        });

        zhus.sort((el1, el2)=> {
            let v1 = this.cardValue(el1);
            let v2 = this.cardValue(el2);
            if (v1 == v2) {
                let t1 = this.cardType(el1);
                let t2 = this.cardType(el2);
                return t2-t1;
            }
            return v1-v2;
        });

        return zhus;
    }

    /**
     * 检查手牌副
     * @param holds
     * @param filts
     * @returns {Array}
     */
    getHoldsFu(holds, filts) {
        let fus = [];
        holds.forEach((el)=> {
            if (!!filts) {
                if (this.zhus.indexOf(el) < 0 && this.cardType(el) != this.zhuType && !filts.includes(el)) {
                    fus.push(el);
                }
            } else {
                if (this.zhus.indexOf(el) < 0 && this.cardType(el) != this.zhuType) {
                    fus.push(el);
                }
            }
        });
        return fus;
    }

    /**
     * 检查手牌主对子
     * @param holds
     * @returns {Array}
     */
    getHoldsZhuDuizis(holds) {
        let zhus = this.getHoldsZhu(holds);
        let duizis = this.getAllDuizi(zhus);
        return duizis;
    }

    /**
     * 获取所有对子
     * @param cards
     * @returns {Array}
     */
    getAllDuizi(cards) {
        let maps = this.getRealCardsMap(cards);
        let duizis = [];
        for (let key in maps) {
            if (maps[key] == 2) {
                duizis.push([parseInt(key), parseInt(key)]);
            }
        }

        return duizis;
    }

    /**
     * 获取手牌中某种花色的所有牌
     * @param holds
     * @param cardType
     * @returns {Array}
     */
    getHoldsTypeCards(holds, cardType) {
        let typeCards = [];
        holds.forEach((el)=> {
            if (this.zhus.indexOf(el) < 0 && this.cardType(el) == cardType) {
                typeCards.push(el);
            }
        });

        typeCards.sort((el1, el2)=> {
            let v1 = this.cardValue(el1, -1);
            let v2 = this.cardValue(el2, -1);
            if (v1 == v2) {
                let t1 = this.cardType(el1);
                let t2 = this.cardType(el2);
                return t2-t1;
            }
            return v1-v2;
        });

        return typeCards;
    }

    /**
     * 检查手牌某种花色对子
     * @param holds
     * @param cardType
     * @returns {Array}
     */
    getHoldsTypeCardsDuizis(holds, cardType) {
        let typeCards = this.getHoldsTypeCards(holds, cardType);
        let duizis = this.getAllDuizi(typeCards);
        return duizis;
    }

    /**
     * 获取出牌的数据类型
     * @param cards
     * @returns {*}
     */
    getCardsData(cards) {
        if (cards.length == 1) {
            return {
                type: this.cardsType.A,
                cards: cards,
                minVal: this.cardValue(cards[0]),
                isZhu: this.isAllZhu(cards),
                isSha: false
            }
        }

        let cardsData = this.checkAA(cards);
        if (!!cardsData) {
            return cardsData;
        }

        cardsData = this.checkAABB(cards);
        if (!!cardsData) {
            return cardsData;
        }

        if (!this.firstCards) {
            return this.checkShuani(cards);
        }
    }

    /**
     * 检查对子
     * @param cards
     * @returns {{type: number, cards: *, minVal: (number|*), isZhu: boolean} || undefined}
     */
    checkAA(cards) {
        if (cards.length != 2) {
            return;
        }

        if (!this.isSameCardType(cards)) {
            return;
        }

        if (!this.isSameCardValue(cards)) {
            return;
        }

        return {
            type: this.cardsType.AA,
            cards: cards,
            minVal: this.cardValue(cards[0]),
            isZhu: this.isAllZhu(cards),
            isSha: false
        }
    }

    /**
     * 检查拖拉机
     * @param cards
     * @returns {{type: number, cards: *, minVal: (number|*), isZhu: boolean, isSha: boolean} || undefined}
     */
    checkAABB(cards) {
        /** 如果长度小于4 */
        if (cards.length < 4) {
            return;
        }

        let isZhu = this.isAllZhu(cards);
        /** 如果既不都是主并且也不是同一种花色 */
        if (!isZhu && !this.isSameCardType(cards)) {
            return;
        }

        let aabbs = this.getMaxLenAABB(cards);
        if (!!aabbs && aabbs.length == 1 && aabbs[0].length == cards.length) {
            let aabb = aabbs[0];
            return {
                type: this.cardsType.AABB,
                cards: cards,
                minVal: this.cardValue(aabb[0]),
                isZhu: isZhu,
                isSha: false
            };
        }
    }

    /**
     * 获取所有的拖拉机
     * @param cards
     * @returns {Array || undefined}
     */
    getMaxLenAABB(cards) {
        /** 找出所有对子 */
        let duizis = this.getAllDuizi(cards);
        duizis.sort((el1, el2)=> {
            let v1 = this.cardValue(el1[0]);
            let v2 = this.cardValue(el2[0]);
            if (v1 == v2) {
                let t1 = this.cardType(el1[0]);
                let t2 = this.cardType(el2[0]);
                return t2-t1;
            }
            return v1-v2;
        });

        /** 从对子中找到所有的拖拉机 */
        let aabbs = [];
        let aabb = [];
        let first = -1;
        for (let i = 0; i < duizis.length; i++) {
            let duizi = duizis[i];
            /** 如果是第一个 */
            if (first == -1) {
                first = this.cardValue(duizi[0]);
                aabb = duizi;
            } else {
                let cur = this.cardValue(duizi[0]);
                if (first == cur) {
                    continue;
                }

                if ((this.isNotHas6 && cur == 7 && first == 5) || cur-first == 1) {
                    aabb = aabb.concat(duizi);
                } else {
                    if (aabb.length > 3) {
                        aabbs.push(aabb);
                    }

                    aabb = duizi;
                }

                first = cur;
            }
        }

        if (aabb.length > 3) {
            aabbs.push(aabb);
        }

        return aabbs;
    }

    /**
     * 检查甩牌
     * @param cards
     * @returns {{type: number, cards: *, minVal: (number|*), isZhu: boolean, isSha: boolean} || undefined}
     */
    checkShuani(cards) {
        let zhus = this.getHoldsZhu(cards);
        if (zhus.length != cards.length) {
            return;
        }

        return {
            type: this.cardsType.SHUAIZHU,
            cards: cards,
            minVal: this.cardValue(zhus[0]),
            isZhu: true,
            isSha: false
        }
    }

    /**
     * 比较两手牌大小
     * @param cardsData1 为先出的牌
     * @param cardsData2
     */
    compareCardsDatas(cardsData1, cardsData2) {
        if (!cardsData1) {
            return true;
        }

        if (!cardsData2) {
            return false;
        }

        if (cardsData2.type == cardsData1.type) {
            if (cardsData2.isZhu && !cardsData1.isZhu) {
                return true;
            } else if (cardsData2.isZhu && cardsData1.isZhu) {
                if (cardsData2.minVal > cardsData1.minVal) {
                    return true;
                }
            } else if (!cardsData2.isZhu && !cardsData1.isZhu) {
                let cardType2 = this.cardType(cardsData2.cards[0]);
                let cardType1 = this.cardType(cardsData1.cards[0]);
                if (cardType2 == cardType1) {
                    if (cardsData2.minVal > cardsData1.minVal) {
                        return true;
                    }
                }
            }
        }

        cardsData2.isSha = false;
        return false;
    }

    /**
     * 自动出牌
     * @param holds
     * @returns {Array}
     */
    getAutoDicard(holds) {
        let tipsCards = {all:[], musts: [], cans: [], bigs: [], smalls: [], others: []};
        if (!!this.firstCards) {
            let isZhu = this.firstCards.isZhu;
            let type = this.firstCards.type;
            if (isZhu) {
                if (type == this.cardsType.A) {
                    return this.getZhuTypeATipsCards(holds, tipsCards);
                } else if (type == this.cardsType.AA) {
                    return this.getZhuTypeAATipsCards(holds, tipsCards);
                } else if (type == this.cardsType.AABB) {
                    return this.getZhuTypeAABBTipsCards(holds, tipsCards);
                } else if (type == this.cardsType.SHUAIZHU) {
                    return this.getZhuTypeSHUAITipsCards(holds, tipsCards);
                }
            } else {
                if (type == this.cardsType.A) {
                    return this.getFuTypeATipsCards(holds, tipsCards);
                } else if (type == this.cardsType.AA) {
                    return this.getFuTypeAATipsCards(holds, tipsCards);
                } else if (type == this.cardsType.AABB) {
                    return this.getFuTypeAABBTipsCards(holds, tipsCards);
                }
            }
        } else {
            let isAllZhu = this.isAllZhu(holds);
            if (isAllZhu) {
                tipsCards.cans.push(holds);
            }

            let fus = this.getHoldsFu(holds);
            let maps = this.getRealCardsMap(fus);
            /** 先找副牌的单张A */
            for (let key in maps) {
                let v = parseInt(key);
                if (maps[key] == 1 && this.cardValue(v) == 13) {
                    tipsCards.cans.push([v]);
                    let idx = fus.indexOf(v);
                    if (idx > -1) {
                        fus.splice(idx, 1);
                    }
                }
            }
            
            /** 再找副牌的拖拉机 */
            for (let i = 0; i < 4; i++) {
                if (i != this.zhuType) {
                    let typeCards = this.getHoldsTypeCards(fus, i);
                    let aabbs = this.getMaxLenAABB(typeCards);
                    tipsCards.cans = tipsCards.cans.concat(aabbs);
                    aabbs.forEach(aabb=> {
                        aabb.forEach(el=> {
                            let idx = fus.indexOf(el);
                            if (idx > -1) {
                                fus.splice(idx, 1);
                            }
                        });
                    });
                }
            }

            /** 再找副牌的对子 */
            let duizis = this.getAllDuizi(fus);
            tipsCards.cans = tipsCards.cans.concat(duizis);
            duizis.forEach(duizi=> {
                duizi.forEach(el=> {
                    let idx = fus.indexOf(el);
                    if (idx > -1) {
                        fus.splice(idx, 1);
                    }
                });
            });

            /** 再找主牌的拖拉机 */
            let zhus = this.getHoldsZhu(holds);
            let aabbs = this.getMaxLenAABB(zhus);
            tipsCards.cans = tipsCards.cans.concat(aabbs);
            aabbs.forEach(aabb=> {
                aabb.forEach(el=> {
                    let idx = zhus.indexOf(el);
                    if (idx > -1) {
                        zhus.splice(idx, 1);
                    }
                });
            });

            /** 再找主牌的对子 */
            duizis = this.getAllDuizi(zhus);
            tipsCards.cans = tipsCards.cans.concat(duizis);
            duizis.forEach(duizi=> {
                duizi.forEach(el=> {
                    let idx = zhus.indexOf(el);
                    if (idx > -1) {
                        zhus.splice(idx, 1);
                    }
                });
            });

            /** 再找主牌的单张 从小往大出 */
            for (let i = 0; i < zhus.length; i++) {
                tipsCards.cans.push([zhus[i]]);
            }

            /** 再找副牌的其他单张 从大往小出 */
            for (let i = fus.length-1; i >= 0; i--) {
                tipsCards.cans.push([fus[i]]);
            }
        }

        return tipsCards;
    }

    /**
     * 获取主单张提示
     * @param {*} holds 
     * @param {*} tipsCards 
     */
    getZhuTypeATipsCards(holds, tipsCards) {
        let zhus = this.getHoldsZhu(holds);
        if (zhus.length > 0) {
            /** 有主 则主牌先出比最大的大的牌 对子最后出 */
            for (let i = 0; i < zhus.length; i++) {
                let v = zhus[i];
                let tempCradsData = this.getCardsData([v]);
                if (this.compareCardsDatas(this.maxCards, tempCradsData)) {
                    tipsCards.bigs.push([v]);
                } else {
                    tipsCards.smalls.push([v]);
                }
            }
        } else {
            /** 没主 副牌从小往大垫 对子最后垫 */
            let fus = this.getHoldsFu(holds);
            tipsCards.others = this.combination(fus, 1);
        }

        return tipsCards;
    }

    /**
     * 获取主对子提示
     * @param {*} holds 
     * @param {*} tipsCards 
     */
    getZhuTypeAATipsCards(holds, tipsCards) {
        /** 先找对子 */
        let zhus = this.getHoldsZhu(holds);
        if (zhus.length < 2) {
            if (zhus.length > 0) {
                tipsCards.musts = tipsCards.musts.concat(zhus);
            }

            let tempHolds = [].concat(holds);
            zhus.forEach(el=> {
                tempHolds.splice(tempHolds.indexOf(el), 1);
            });
            tipsCards.others = this.combination(tempHolds, 2-zhus.length);
        } else {
            let duizis = this.getHoldsZhuDuizis(holds);
            for (let i = 0; i < duizis.length; i++) {
                let duizi = duizis[i];
                let tempCradsData = this.getCardsData(duizi);
                    if (this.compareCardsDatas(this.maxCards, tempCradsData)) {
                    tipsCards.bigs.push(duizi);
                } else {
                    tipsCards.smalls.push(duizi);
                }
            }

            if (tipsCards.bigs.length == 0 && tipsCards.smalls.length == 0) {
                tipsCards.others = this.combination(zhus, 2);
            }
        }

        return tipsCards;
    }

    /**
     * 获取主拖拉机提示
     * @param {*} holds 
     * @param {*} tipsCards 
     */
    getZhuTypeAABBTipsCards(holds, tipsCards) {
        let zhus = this.getHoldsZhu(holds);
        if (zhus.length < this.firstCards.cards.length) {
            tipsCards.musts = tipsCards.musts.concat(zhus);
            let fus = this.getHoldsFu(holds);
            tipsCards.others = tipsCards.others.concat(this.combination(fus, this.firstCards.cards.length-zhus.length));
        } else {
            let aabbs = this.getMaxLenAABB(zhus);
            /** 找到所有跟打出去的牌一样的拖拉机 */
            for (let i = 0; i < aabbs.length; i++) {
                let aabb = aabbs[i];
                while (aabb.length >= this.firstCards.cards.length) {
                    let tempCards = aabb.slice(0, this.firstCards.cards.length);
                    aabb.splice(0,2);
                    let tempCradsData = this.getCardsData(tempCards);
                    if (this.compareCardsDatas(this.maxCards, tempCradsData)) {
                        tipsCards.bigs.push(tempCards);
                    } else {
                        tipsCards.smalls.push(tempCards);
                    }
                }
            }

            /** 没有拖拉机 继续找对子 */
            if (tipsCards.bigs.length == 0 && tipsCards.smalls.length == 0) {
                let duizis = this.getAllDuizi(zhus);
                /** 有足够的对子 则随机组合 */
                if (duizis.length*2 >= this.firstCards.cards.length) {
                    let allGroup = this.combination(duizis, this.firstCards.cards.length/2);
                    allGroup.forEach(group=> {
                        let temp = [];
                        group.forEach(duizi=>{
                            temp = temp.concat(duizi);
                        });
                        tipsCards.smalls.push(temp);
                    });
                } else {
                    /** 对子不够 则先出对子 */
                    duizis.forEach(duizi=> {
                        tipsCards.musts = tipsCards.musts.concat(duizi);
                    });
                    /** 再将主中的对子牌去掉 */
                    tipsCards.musts.forEach(el=> {
                        zhus.splice(zhus.indexOf(el), 1);
                    });
                    /** 再将主中的其他牌组合 */
                    tipsCards.others = this.combination(zhus, this.firstCards.cards.length-tipsCards.musts.length);
                }
            }
        }

        return tipsCards;
    }

    /**
     * 获取甩主提示
     * @param {*} holds 
     * @param {*} tipsCards 
     */
    getZhuTypeSHUAITipsCards(holds, tipsCards) {
        tipsCards.others = this.combination(holds, this.firstCards.cards.length);
        return tipsCards;
    }

    /**
     * 获取副单张提示
     * @param {*} holds 
     * @param {*} tipsCards 
     */
    getFuTypeATipsCards(holds, tipsCards) {
        let cardType = this.cardType(this.firstCards.cards[0]);
        /** 有相同花色必须出相同花色的牌 */
        let typeCards = this.getHoldsTypeCards(holds, cardType);
        if (typeCards.length > 0) {
            /** 有同花色 则先出比最大的大的牌 对子最后出 */
            for (let i = 0; i < typeCards.length; i++) {
                let v = typeCards[i];
                /** 如果最大的牌是杀 则从小往大出 */
                if (!!this.maxCards && !!this.maxCards.isSha) {
                    tipsCards.smalls.push([v]);
                } else {
                    let tempCradsData = this.getCardsData([v]);
                    if (this.compareCardsDatas(this.maxCards, tempCradsData)) {
                        tipsCards.bigs.push([v]);
                    } else {
                        tipsCards.smalls.push([v]);
                    }
                }
            }
        } else {
            /** 没同花色 */
            /** 有主则先杀 */
            let zhus = this.getHoldsZhu(holds);
            if (zhus.length > 0) {
                for (let i = 0; i < zhus.length; i++) {
                    let v = zhus[i];
                    if (!!this.maxCards && !!this.maxCards.isSha) {
                        let tempCradsData = this.getCardsData([v]);
                        if (this.compareCardsDatas(this.maxCards, tempCradsData)) {
                            tipsCards.bigs.push([v]);
                        }
                    } else {
                        tipsCards.bigs.push([v]);
                    }
                }
            } 
            let tempHolds = [].concat(holds);
            if (tipsCards.bigs.length > 0) {
                /** 杀得起 */
                tipsCards.bigs.forEach(big=> {
                    big.forEach(el=> {
                        tempHolds.splice(tempHolds.indexOf(el), 1);
                    });
                });
            }
            tipsCards.others = this.combination(tempHolds, 1);
        }

        return tipsCards;
    }

    /**
     * 获取副对子提示
     * @param {*} holds 
     * @param {*} tipsCards 
     */
    getFuTypeAATipsCards(holds, tipsCards) {
        let cardType = this.cardType(this.firstCards.cards[0]);
        /** 有相同花色必须出相同花色的牌 */
        let typeCards = this.getHoldsTypeCards(holds, cardType);
        if (typeCards.length < 2) {
            if (typeCards.length == 0) {
                /** 先杀 */
                let zhus = this.getHoldsZhu(holds);
                let zhuduizis = this.getAllDuizi(zhus);
                for (let i = 0; i < zhuduizis.length; i++) {
                    let duizi = zhuduizis[i];
                    if (!!this.maxCards && !!this.maxCards.isSha) {
                        let tempCradsData = this.getCardsData(duizi);
                        if (this.compareCardsDatas(this.maxCards, tempCradsData)) {
                            tipsCards.bigs.push(duizi);
                        }
                    } else {
                        tipsCards.bigs.push(duizi);
                    }
                }
                let tempHolds = [].concat(holds);
                if (tipsCards.bigs.length > 0) {
                    /** 杀得起 */
                    tipsCards.bigs.forEach(big=> {
                        big.forEach(el=> {
                            tempHolds.splice(tempHolds.indexOf(el), 1);
                        });
                    });
                }
                tipsCards.others = this.combination(tempHolds, 2);
            } else {
                tipsCards.musts = tipsCards.musts.concat(typeCards);
                let tempHolds = [].concat(holds);
                typeCards.forEach(el=> {
                    tempHolds.splice(tempHolds.indexOf(el), 1);
                });
                tipsCards.others = this.combination(tempHolds, 1);
            }
        } else {
            /** 先找对子 */
            let duizis = this.getAllDuizi(typeCards);
            if (duizis.length > 0) {
                for (let i = 0; i < duizis.length; i++) {
                    let duizi = duizis[i];
                    let tempCradsData = this.getCardsData(duizi);
                    if (this.compareCardsDatas(this.maxCards, tempCradsData)) {
                        tipsCards.bigs.push(duizi);
                    } else {
                        tipsCards.smalls.push(duizi);
                    }
                }
            }  

            if (tipsCards.bigs.length == 0 && tipsCards.smalls.length == 0) {
                tipsCards.others = this.combination(typeCards, 2);
            }
        }

        return tipsCards;
    }

    /**
     * 获取副牌拖拉机提示
     * @param {*} holds 
     * @param {*} tipsCards 
     */
    getFuTypeAABBTipsCards(holds, tipsCards) {
        let cardType = this.cardType(this.firstCards.cards[0]);
        /** 有相同花色必须出相同花色的牌 */
        let typeCards = this.getHoldsTypeCards(holds, cardType);
        if (typeCards.length < this.firstCards.cards.length) {
            /** 如果一张都没有 */
            if (typeCards.length == 0) {
                /** 看能不能杀 */
                let zhus = this.getHoldsZhu(holds);
                let aabbs = this.getMaxLenAABB(zhus);
                for (let i = 0; i < aabbs.length; i++) {
                    let aabb = aabbs[i];
                    while (aabb.length >= this.firstCards.cards.length) {
                        let tempCards = aabb.slice(0, this.firstCards.cards.length);
                        aabb.splice(0,2);
                        if (!!this.maxCards && !!this.maxCards.isSha) {
                            let tempCradsData = this.getCardsData(tempCards);
                            if (this.compareCardsDatas(this.maxCards, tempCradsData)) {
                                tipsCards.bigs.push(tempCards);
                            }
                        } else {
                            tipsCards.bigs.push(tempCards);
                        }
                    }
                }

                let tempHolds = [].concat(holds);
                if (tipsCards.bigs.length > 0) {
                    /** 杀得起 */
                    tipsCards.bigs.forEach(big=> {
                        big.forEach(el=> {
                            tempHolds.splice(tempHolds.indexOf(el), 1);
                        });
                    });
                }

                tipsCards.others = this.combination(tempHolds, this.firstCards.cards.length); 
            } else {
                /** 如果有 则这些牌必须出 */
                tipsCards.musts = tipsCards.musts.concat(typeCards);
                /** 删除手牌里面的这些牌 */
                let tempHolds = [].concat(holds);
                typeCards.forEach(el=> {
                    tempHolds.splice(tempHolds.indexOf(el), 1);
                });
                /** 将需要的牌进行组合 */
                tipsCards.others = this.combination(tempHolds, this.firstCards.cards.length-tipsCards.musts.length);
            }
        } else {
            let aabbs = this.getMaxLenAABB(typeCards);
            /** 找到所有跟打出去的牌一样的拖拉机 */
            for (let i = 0; i < aabbs.length; i++) {
                let aabb = aabbs[i];
                while (aabb.length >= this.firstCards.cards.length) {
                    let tempCards = aabb.slice(0, this.firstCards.cards.length);
                    aabb.splice(0,2);
                    let tempCradsData = this.getCardsData(tempCards);
                    if (this.compareCardsDatas(this.maxCards, tempCradsData)) {
                        tipsCards.bigs.push(tempCards);
                    } else {
                        tipsCards.smalls.push(tempCards);
                    }
                }
            }

            /** 没有拖拉机 继续找对子 */
            if (tipsCards.bigs.length == 0 && tipsCards.smalls.length == 0) {
                let duizis = this.getAllDuizi(typeCards);
                /** 有足够的对子 则随机组合 */
                if (duizis.length*2 >= this.firstCards.cards.length) {
                    let allGroup = this.combination(duizis, this.firstCards.cards.length/2);
                    allGroup.forEach(group=> {
                        let temp = [];
                        group.forEach(duizi=>{
                            temp = temp.concat(duizi);
                        });
                        tipsCards.smalls.push(temp);
                    });
                } else {
                    /** 对子不够 则先出对子 */
                    duizis.forEach(duizi=> {
                        tipsCards.musts = tipsCards.musts.concat(duizi);
                    });
                    /** 再将主中的对子牌去掉 */
                    tipsCards.musts.forEach(el=> {
                        typeCards.splice(typeCards.indexOf(el), 1);
                    });
                    /** 再将主中的其他牌组合 */
                    tipsCards.others = this.combination(typeCards, this.firstCards.cards.length-tipsCards.musts.length);
                }
            }
        }

        return tipsCards;
    }

    /** 获取提示牌 */
    getMaxLenCanOut(cards) {
        if (!!this.firstCards) {
            return;
        }

        let tipsCards = this.getAutoDicard(cards);
        let cans = tipsCards.cans;
        cans.sort((a, b)=> {
            return b.length-a.length;
        });

        return cans[0];
    }
}

module.exports = Algorithm_1;
