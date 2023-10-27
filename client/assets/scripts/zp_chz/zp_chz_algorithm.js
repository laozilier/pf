// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

const enum_chz = require('./zp_chz_enum');
const InPokerType = enum_chz.inPokerType;
const MingtangType = enum_chz.mingtangType;
const HuType = enum_chz.huType;

class zp_chz_algorithm {

    constructor () {
        super.constructor();

        this.laizi = 21;
        this.mul_mt = [0,1,2,3,4];
        this.mul_ht = [0,1,2,4,8,8,16,16,32];
    };

    setRule(rule) {
        let gameRules = rule.gameRules;
        this.ergunyi = gameRules[0];
        this.redblack = gameRules[1];
    }

    /**
     * 获取手牌的二维数组排列
     * @param {*} oriHolds 
     */
    getSortHolds(oriHolds) {
        let holds = [].concat(oriHolds);
        /** 将手牌分为赖子和普通牌两个数组 */
        let arr1 = holds.filter(el=> {
            return el > 20;
        });

        let arr2 = holds.filter(el => {
            return arr1.indexOf(el) < 0;
        });

        /** 将普通牌从大到小排序 */
        arr2 = arr2.sort((a, b) => {
            return b-a;
            /*
            if (a%10 == 0 && b%10 == 0) {
                return b-a;
            } else if (a%10 == 0 && b%10 != 0) {
                return -1;
            } else if (a%10 != 0 && b%10 == 0) {
                return 1;
            } else {
                if (a%10 == b%10) {
                    return b-a;
                } else {
                    return b%10-a%10;
                }
            }
            */
        });

        /** 获取普通牌各种牌的数量 */
        let counts = this.getCardCounts(arr2);

        let sortHolds = [];
        /** 找到所有倾 并从普通数组中移除 */
        let qings = this.getQings(counts);
        qings.forEach(el => {
            sortHolds.push(el);
            el.forEach(card => {
                let idx = arr2.indexOf(card);
                arr2.splice(idx, 1);
            });
        });

        /** 找到所有坎 并从普通数组中移除 */
        let kans = this.getKans(counts);
        kans.forEach(el => {
            sortHolds.push(el);
            el.forEach(card => {
                let idx = arr2.indexOf(card);
                arr2.splice(idx, 1);
            });
        });

        /** 找到所有对 并从普通数组中移除 */
        let duis = this.getDuis(counts);
        duis.forEach(el => {
            el.forEach(card => {
                let idx = arr2.indexOf(card);
                arr2.splice(idx, 1);
            });
        });

        /** 大2、7、10 */
        let idx_20 = arr2.indexOf(20);
        let idx_17 = arr2.indexOf(17);
        let idx_12 = arr2.indexOf(12);
        if (idx_20 > -1 && idx_17 > -1 && idx_12 > -1) {
            sortHolds.push([20,17,12]);
            [20,17,12].forEach(el => {
                let idx = arr2.indexOf(el);
                arr2.splice(idx, 1);
            });
        }

        /** 大1、2、3 */
        let idx_13 = arr2.indexOf(13);
        idx_12 = arr2.indexOf(12);
        let idx_11 = arr2.indexOf(11);
        if (idx_13 > -1 && idx_12 > -1 && idx_11 > -1) {
            sortHolds.push([13,12,11]);
            [13,12,11].forEach(el => {
                let idx = arr2.indexOf(el);
                arr2.splice(idx, 1);
            });
        }

        /** 小2、7、10 */
        let idx_10 = arr2.indexOf(10);
        let idx_7 = arr2.indexOf(7);
        let idx_2 = arr2.indexOf(2);
        if (idx_10 > -1 && idx_7 > -1 && idx_2 > -1) {
            sortHolds.push([10,7,2]);
            [10,7,2].forEach(el => {
                let idx = arr2.indexOf(el);
                arr2.splice(idx, 1);
            });
        }

        /** 小1、2、3 */
        let idx_3 = arr2.indexOf(3);
        idx_2 = arr2.indexOf(2);
        let idx_1 = arr2.indexOf(1);
        if (idx_3 > -1 && idx_2 > -1 && idx_1 > -1) {
            sortHolds.push([3,2,1]);
            [3,2,1].forEach(el => {
                let idx = arr2.indexOf(el);
                arr2.splice(idx, 1);
            });
        }

        /** 顺子 */
        let curCard = -1;
        let shunzis = [];
        let shunzi = [];
        for (let i = 0; i < arr2.length; i++) {
            let card = arr2[i];
            if (curCard == -1) {
                curCard = card;
                shunzi.push(card);
            } else {
                if (card == curCard-1 && ((card < 11 && curCard < 11) || (card > 10 && curCard > 10))) {
                    
                    shunzi.push(card);
                    curCard = card;
                    if (shunzi.length == 3) {
                        shunzis.push([].concat(shunzi));
                        shunzi = [];
                        curCard = -1;
                    }
                } else {
                    shunzi = [card];
                    curCard = card;
                }
            }
        }

        shunzis.forEach(el => {
            sortHolds.push(el);
            el.forEach(card => {
                let idx = arr2.indexOf(card);
                arr2.splice(idx, 1);
            });
        });
        
        /** 将剩下的看能不能补到对子上 */
        if (arr2.length > 0) {
            duis.forEach(el => {
                let card = el[0];
                let arrCard = card-10 < 0 ? card+10 : card-10;
                let idx = arr2.indexOf(arrCard);
                if (idx > -1) {
                    arr2.splice(idx, 1);
                    el.push(arrCard);
                }
            });
        }

        duis.forEach(el => {
            if (el.length == 2 && arr2.length > 0) {
                el.push(arr2.splice(0,1)[0]);
            }
            sortHolds.push(el);
        });

        /** 还有剩下的 */
        arr2 = arr2.concat(arr1);
        let lefts = [];
        for (let i = 0; i < arr2.length; i++) {
            let card = arr2[i];
            lefts.push(card);

            if (i == arr2.length-1) {
                sortHolds.push([].concat(lefts));
            } else {
                if (lefts.length >= 3) {
                    sortHolds.push([].concat(lefts));
                    lefts = [];
                }
            }
        }
        
        return sortHolds;
    }

    /**
     * 获取倾
     * @param {*} counts 
     */
    getQings(counts) {
        let qings = [];
        for (let key in counts) {
            let c = counts[key];
            if (c == 4) {
                let card = parseInt(key);
                qings.push([card, card, card, card]);
            }
        }
        return qings;
    }

    /**
     * 获取坎
     * @param {*} counts 
     */
    getKans(counts) {
        let kans = [];
        for (let key in counts) {
            let c = counts[key];
            if (c == 3) {
                let card = parseInt(key);
                kans.push([card, card, card]);
            }
        }
        return kans;
    }

    /**
     * 获取对
     * @param {*} counts 
     */
    getDuis(counts) {
        let duis = [];
        for (let key in counts) {
            let c = counts[key];
            if (c == 2) {
                let card = parseInt(key);
                duis.push([card, card]);
            }
        }
        return duis;
    }

    /**
     * 获取每种牌的数量
     * @param {*} arr2 
     */
    getCardCounts(arr2) {
        let counts = {};
        for (let i = 0; i < arr2.length; i++) {
            let card = arr2[i];
            if (counts[card] == undefined) {
                counts[card] = 1;
            } else {
                counts[card] += 1;
            }
        }

        return counts;
    }

    /**
     * 获取一种牌的数量
     * @param {*} v
     * @param {*} holds
     */
    getCardCount(v, holds) {
        let arr = [].concat(holds);
        let c = 0;
        let idx = arr.indexOf(v);
        while (idx > -1) {
            c+=1;
            arr.splice(idx, 1);
            idx = arr.indexOf(v);
        };

        return c;
    }

    /**
     * 获取手牌里面的胡子
     * @param {*} holds 
     */
    getAllHuzi(holds) {
        let c = 0;
        let counts = this.getCardCounts(holds);
        for (let key in counts) {
            let v = parseInt(key);
            if (v > 20) {
                continue;
            }

            if (counts[key] == 3) {
                if (v > 10) {
                    c+=6;
                } else {
                    c+=3;
                }
            }

            if (counts[key] == 4) {
                if (v > 10) {
                    c+=12;
                } else {
                    c+=9;
                }
            }
        }

        return c;
    }

    /**
     * 检查听牌
     * @param {*} player_holds 
     * @param {*} player_inPokers 
     * @param {*} v 
     */
    checkTing(player_holds, player_inPokers, v) {
        if (v == this.laizi) {
            return;
        }

        let holds = player_holds;
        if (typeof v == 'number') {
            holds = [].concat(holds);
            holds.splice(holds.indexOf(v), 1);
        }
        
        let wangzha = this.checkWangZha(holds, player_inPokers);
        if (!!wangzha) {
            return {wangzha: true};
        }

        let wangchuang = this.checkWangChuang(holds, player_inPokers);
        if (!!wangchuang) {
            return {wangchuang: true};
        }

        let wangdiao = this.checkWangDiao(holds, player_inPokers);
        if (!!wangdiao) {
            return {wangdiao: true};
        }

        let arr = [];
        for (let i = 1; i < 22; i++) {
            let obj = this.checkHu(holds, player_inPokers, i, null, null);
            if (!!obj) {
                arr.push(i);
            }
        }

        if (arr.length > 0) {
            return {arr: arr};
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

    /**
     * 检查王炸
     * @param player_holds
     * @param player_inPokers
     * @param card
     * @param xingInfo
     */
    checkWangZha(player_holds, player_inPokers, card, xingCard, xing) {
        /** 王数量小于3个 */
        let wCount = this.calcCountInArray(player_holds, this.laizi);
        if (wCount < 3) {
            return;
        }

        /** 开交了 */
        if (this.checkIsJiao(player_holds, player_inPokers)) {
            return;
        }

        /** 先移除3个王 然后再看是否成牌了 */
        let holds = [].concat(player_holds);
        for (let i = 0; i < 3; i++) {
            holds.splice(holds.indexOf(this.laizi), 1);
        }

        /** 找到所有胡牌数据 然后找到最大的 */
        let inPokers = JSON.parse(JSON.stringify(player_inPokers));
        let huType = HuType.wangzha;
        let minHu = 15;
        if (typeof card == 'number') {
            let hu = this.getHuzi(InPokerType.long, [card]);
            inPokers.push({
                v: card,
                vs: [card, this.laizi, this.laizi, this.laizi],
                t: InPokerType.zha,
                x: false,
                hu: hu,
                end: 1,
            });
            if (card > 20) {
                huType = HuType.wangzhawang;
            }
        } else {
            minHu-=9;
        }

        let maxObj = this.checkHu(holds, inPokers, null, xingCard, xing, minHu, huType);
        if (!!maxObj) { maxObj.huCard = card; }
        return maxObj;
    }

    /**
     * 检查王闯
     * @param player_holds
     * @param player_inPokers
     * @param card
     */
    checkWangChuang(player_holds, player_inPokers, card, xingCard, xing) {
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
        let inPokers = JSON.parse(JSON.stringify(player_inPokers));
        let huType = HuType.wangchuang;
        let minHu = 15;
        if (typeof card == 'number') {
            let hu = this.getHuzi(InPokerType.kan, [card]);
            inPokers.push({
                v: card,
                vs: [card, this.laizi, this.laizi],
                t: InPokerType.chuang,
                hu: hu,
                end: 1,
            });
            if (card > 20) {
                huType = HuType.wangchuangwang;
            }
        } else {
            minHu-=3;
        }

        let maxObj = this.checkHu(holds, inPokers, null, xingCard, xing, minHu, huType);
        if (!!maxObj) { maxObj.huCard = card; }
        return maxObj;
    }

    /**
     * 检查王吊
     * @param player_holds
     * @param player_inPokers
     * @param card
     */
    checkWangDiao(player_holds, player_inPokers, card, xingCard, xing) {
        /** 王数量小于1个 */
        let wCount = this.calcCountInArray(player_holds, this.laizi);
        if (wCount < 1) {
            return;
        }

        /** 没开交 而且只有1个王 */
        if (!this.checkIsJiao(player_holds, player_inPokers) && wCount == 1) {
            return;
        }

        /** 先移除1个王 然后再看是否成牌了 */
        let holds = [].concat(player_holds);
        holds.splice(holds.indexOf(this.laizi), 1);

        let inPokers = JSON.parse(JSON.stringify(player_inPokers));
        let huType = HuType.wangdiao;
        if (typeof card == 'number') {
            inPokers.push({
                v: card,
                vs: [card, this.laizi],
                t: InPokerType.diao,
                hu: 0,
                end: 1,
            });

            if (card > 20) {
                huType = HuType.wangdiaowang;
            }
        }
        let maxObj = this.checkHu(holds, inPokers, null, xingCard, xing, 15, huType);
        if (!!maxObj) { maxObj.huCard = card; }
        return maxObj;
    }

    /**
     * 得到牌型的胡数
     * @param t
     * @param vs
     * @returns {number}
     */
    getHuzi(t, vs) {
        if (t == InPokerType.long || t == InPokerType.qing || t == InPokerType.zha) {
            let v = vs[0];
            return v > 10 ? 12 : 9;
        }

        if (t == InPokerType.jiao) {
            let v = vs[0];
            return v > 10 ? 9 : 6;
        }

        if (t == InPokerType.xiao || t == InPokerType.kan || t == InPokerType.chuang) {
            let v = vs[0];
            return v > 10 ? 6 : 3;
        }

        if (t == InPokerType.peng) {
            let v = vs[0];
            return v > 10 ? 3 : 1;
        }

        if (t == InPokerType.chi) {
            /** 有小2有小7 3胡*/
            if (vs.indexOf(2) > -1 && vs.indexOf(7) > -1) {
                return 3;
            }

            /** 有小2有小7 3胡*/
            if (vs.indexOf(2) > -1 && vs.indexOf(10) > -1) {
                return 3;
            }

            /** 有小7有小10 3胡*/
            if (vs.indexOf(7) > -1 && vs.indexOf(10) > -1) {
                return 3;
            }

            /** 有大2有大7 6胡*/
            if (vs.indexOf(12) > -1 && vs.indexOf(17) > -1) {
                return 6;
            }

            /** 有大2有大10 6胡*/
            if (vs.indexOf(12) > -1 && vs.indexOf(20) > -1) {
                return 6;
            }

            /** 有大7有大10 6胡*/
            if (vs.indexOf(17) > -1 && vs.indexOf(20) > -1) {
                return 6;
            }

            /** 有小1有小2 3胡*/
            if (vs.indexOf(1) > -1 && vs.indexOf(2) > -1) {
                return 3;
            }

            /** 有小1有小3 3胡*/
            if (vs.indexOf(1) > -1 && vs.indexOf(3) > -1) {
                return 3;
            }

            /** 有小2有小3有王 3胡*/
            if (vs.indexOf(2) > -1 && vs.indexOf(3) > -1 && vs.indexOf(this.laizi) > -1) {
                return 3;
            }

            /** 有大1有大2 6胡*/
            if (vs.indexOf(11) > -1 && vs.indexOf(12) > -1) {
                return 6;
            }

            /** 有大1有大3 6胡*/
            if (vs.indexOf(11) > -1 && vs.indexOf(13) > -1) {
                return 6;
            }

            /** 有大2有大3有王 6胡*/
            if (vs.indexOf(12) > -1 && vs.indexOf(13) > -1 && vs.indexOf(this.laizi) > -1) {
                return 6;
            }
        }

        return 0;
    }

    /**
     * 检查是否已经开交了
     * @param player_holds
     * @param player_inPokers
     * @returns {boolean}
     */
    checkIsJiao(player_holds, player_inPokers) {
        let maps = this.calcPokersCount(player_holds);
        for (let p in maps) {
            if (parseInt(p) == this.laizi) {
                continue;
            }

            /** 如果是4张，那么就是龙 */
            if (maps[p] === 4) {
                return true;
            }
        }

        for (let i = 0; i < player_inPokers.length; i++) {
            let inPoker = player_inPokers[i];
            if (inPoker.t == InPokerType.qing || inPoker.t == InPokerType.jiao || inPoker.t == InPokerType.long) {
                return true;
            }
        }

        return false;
    }
    /**
     * 判断胡
     * @param player_holds
     * @param player_inPokers
     * @param card
     * @param xingInfo
     */
    checkHu (player_holds, player_inPokers, card, xingCard, xing=[], minHu=15, huType=1) {
        let holds = [].concat(player_holds);
        let inPokers = JSON.parse(JSON.stringify(player_inPokers));
        let all = [];
        let isJiao = this.checkIsJiao(player_holds, player_inPokers);
        if (huType == HuType.wangzha || huType == HuType.wangzhawang) {
            isJiao = true;
        }

        let hasDui = false;
        if (huType == HuType.wangdiao || huType == HuType.wangdiaowang) {
            hasDui = true;
        }

        /** 如果card没传值 则直接用手牌和进牌判断 在提前判断王炸王闯王吊时用到 */
        if (typeof card == 'number') {
            /** 如果摸到赖子 */
            if (card > 20) {
                /** 加入手牌 */
                holds.push(card);
            } else {
                /** 如果没开交 则先看看手牌牌里面有没有能开交的 递归一次 */
                if (!isJiao) {
                    let c = this.calcCountInArray(holds, card);
                    if (c == 3) {
                        /** 开始计算成牌 */
                        let finalGroup = [{
                            v: card,
                            vs: [card, card, card, card],
                            t: InPokerType.jiao,
                            x: false,
                            p: false,
                            hu: this.getHuzi(InPokerType.jiao, [card]),
                        }];
                        /** 创建临时手牌和进牌 开始递归计算成牌 */
                        let tempHolds = [].concat(holds);
                        let idx = tempHolds.indexOf(card);
                        while (idx > -1) {
                            tempHolds.splice(idx, 1);
                            idx = tempHolds.indexOf(card);
                        }
                        let tempInPokers = JSON.parse(JSON.stringify(inPokers));
                        this.nextCheckHu(tempHolds, tempInPokers, finalGroup, all, true, hasDui);
                    }

                    /** 如果没开交 则先看看进牌里面有没有能开交的 递归一次 */
                    for (let i = 0; i < inPokers.length; i++) {
                        let inPoker = inPokers[i];
                        if ((inPoker.t == InPokerType.xiao || inPoker.t == InPokerType.peng) && inPoker.v == card) {
                            /** 开始计算成牌 */
                            let v = inPoker.v;
                            let finalGroup = [{
                                v: v,
                                vs: [v, v, v, v],
                                t: InPokerType.jiao,
                                x: inPoker.t == InPokerType.xiao,
                                p: inPoker.t == InPokerType.peng,
                                hu: this.getHuzi(InPokerType.jiao, [v]),
                            }];
                            /** 创建临时手牌和进牌 开始递归计算成牌 */
                            let tempHolds = [].concat(holds);
                            let tempInPokers = JSON.parse(JSON.stringify(inPokers));
                            tempInPokers.splice(i, 1);
                            this.nextCheckHu(tempHolds, tempInPokers, finalGroup, all, true, hasDui);
                            break;
                        }
                    }
                }

                /** 加入手牌 */
                holds.push(card);
            }
        }

        /** 如果没开交 那么则判断是否能用赖子 跟3个 2个 1个 组成倾或龙 */
        if (!isJiao) {
            this.inPokersCount4(holds, inPokers, all, hasDui);
        }

        this.nextCheckHu(holds, inPokers, [], all, isJiao, hasDui);
        //console.log('all = ', all);
        /** 找到赢得最多的 */
        let maxObj = undefined;
        let maxMul = 0;
        let hu_mul = this.mul_ht[huType];
        for (let i = 0; i < all.length; i++) {
            let group = all[i];
            let huzi = 0;
            group.forEach((inPoker) => {
                huzi+=inPoker.hu;
            });
            if (huzi < minHu) {
                continue;
            }

            let fan = 0;
            fan = Math.ceil((huzi-minHu)/3)+1;
            if (!!this.ergunyi) {
                fan+=1;
            }
            let mtType = MingtangType.pinghu;
            if (!!this.redblack) {
                let isHei = this.isHeiHu(group);
                if (isHei) {
                    mtType = MingtangType.heihu;
                } else {
                    let isDianJu = this.isDianJu(group);
                    if (isDianJu) {
                        mtType = MingtangType.yidianzhu;
                    } else {
                        let isHong = this.isHongHu(group, xing);
                        if (isHong) {
                            mtType = MingtangType.honghu;
                        }
                    }
                }
            }

            let xingFan = 0;
            if (typeof xing == 'number') {
                xingFan = this.getXingFan(group, xing);
            }

            let mt_mul = this.mul_mt[mtType];
            let total = (fan+xingFan)*mt_mul*hu_mul;
            if (maxMul < total) {
                maxMul = total;
                maxObj = {
                    group: group,
                    xingCard: xingCard,
                    xing: xing,
                    huzi: huzi,
                    fan: fan,
                    xingFan: xingFan,
                    mtType: mtType,
                    mt_mul: mt_mul,
                    huType: huType,
                    hu_mul: hu_mul,
                    huCard: card,
                    total: total
                }
            }
        }

        if (!!maxObj && typeof card == 'number') {
            let maxData = maxObj.group;
            for (let i = maxData.length-1; i > -1; i--) {
                let inPoker = maxData[i];
                if (inPoker.vs.includes(card)) {
                    inPoker.end = 1;
                    break;
                }
            }
        }

        return maxObj;
    }


    /**
     * 获得翻醒的番数
     * @param group
     * @param xing
     * @returns {number}
     */
    getXingFan(group, xing) {
        let xingFan = 0;
        let map = {};
        let sInpoker = undefined;
        for (let i = 0; i < group.length; i++) {
            let obj = group[i];
            let vs = obj.vs;
            let v = vs[0];
            /** 如果是龙 倾 交 炸 则+4*/
            if (obj.t == InPokerType.long || obj.t == InPokerType.qing || obj.t == InPokerType.jiao || obj.t == InPokerType.zha) {
                if (map[v] == undefined) {
                    map[v] = 4;
                } else {
                    map[v] += 4;
                }

                if (v == this.laizi) {
                    sInpoker = obj;
                }
            }

            /** 如果是坎 啸 碰 闯 则+3*/
            if (obj.t == InPokerType.kan || obj.t == InPokerType.xiao || obj.t == InPokerType.peng || obj.t == InPokerType.chuang) {
                if (map[v] == undefined) {
                    map[v] = 3;
                } else {
                    map[v] += 3;
                }

                if (v == this.laizi) {
                    sInpoker = obj;
                }
            }

            /** 如果是对 吊 则+2*/
            if (obj.t == InPokerType.dui || obj.t == InPokerType.diao) {
                if (map[v] == undefined) {
                    map[v] = 2;
                } else {
                    map[v] += 2;
                }

                if (v == this.laizi) {
                    sInpoker = obj;
                }
            }

            /** 如果是吃 则需要遍历vs */
            if (obj.t == InPokerType.chi) {
                vs.forEach(el => {
                    let final = el;
                    if (el == this.laizi) {
                        if (obj.laizi > 0) {
                            final = obj.laizi;
                        } else {
                            if ((vs.includes(xing+1) && vs.includes(xing+2))
                            || (vs.includes(xing-1) && vs.includes(xing-2))
                            || (vs.includes(xing) && vs.includes(this.changeBigSmall(xing)))) {
                                final = xing;
                            } else {
                                final = 99;
                            }
                        }
                    }
                    if (map[final] == undefined) {
                        map[final] = 1;
                    } else {
                        map[final] += 1;
                    }
                });
            }
        }

        /** 醒是赖子 则找最多的那个 */
        if (xing == this.laizi) {
            if (!!sInpoker) {
                let hong_max_c = 0;
                let hei_max_c = 0;
                for (let key in map) {
                    let isHong = [2,7,10,12,17,20].includes(parseInt(key));
                    let c = map[key];
                    if (isHong) {
                        if (hong_max_c < c) {
                            hong_max_c = c;
                        }
                    } else {
                        if (hei_max_c < c) {
                            hei_max_c = c;
                        }
                    }
                }

                if (sInpoker.change == 'hong') {
                    hong_max_c+=map[this.laizi.toString()];
                } else if (sInpoker.change == 'hei') {
                    hei_max_c+=map[this.laizi.toString()];
                } else {
                    hong_max_c+=map[this.laizi.toString()];
                    hei_max_c+=map[this.laizi.toString()];
                }

                xingFan = Math.max(hong_max_c, hei_max_c);
            } else {
                let max_c = 0;
                for (let key in map) {
                    let c = map[key];
                    if (max_c < c) {
                        max_c = c;
                    }
                }

                xingFan = max_c;
            }
        } else {
            let isHong = [2,7,10,12,17,20].includes(xing);
            if (!!sInpoker) {
                if (sInpoker.change == 'hong') {
                    if (isHong) {
                        xingFan += map[this.laizi.toString()];
                    }
                } else if (sInpoker.change == 'hei') {
                    if (!isHong) {
                        xingFan += map[this.laizi.toString()];
                    }
                } else {
                    xingFan += map[this.laizi.toString()];
                }
            }
            xingFan += (map[xing] || 0);
        }

        return xingFan;
    }

    /**
     * 如果没有开交 则先组4个
     * @param holds
     * @param inPokers
     * @param all
     * @param hasDui
     */
    inPokersCount4(holds, inPokers, all, hasDui) {
        let laiziCount = this.calcCountInArray(holds, this.laizi);
        /** 一个赖子时 跟坎或者啸组成龙或倾 */
        if (laiziCount > 0) {
            let cardMap = this.calcPokersCount(holds);
            for (let key in cardMap) {
                let c = cardMap[key];
                if (c == 3) {
                    /** 开始计算成牌 */
                    let v = parseInt(key);
                    let finalGroup = [{
                        v: v,
                        vs: [v, -1, -1, this.laizi],
                        t: InPokerType.long,
                        x: false,
                        hu: this.getHuzi(InPokerType.long, [v]),
                    }];
                    /** 创建临时手牌和进牌 开始递归计算成牌 */
                    let tempHolds = [].concat(holds);
                    let tempInPokers = JSON.parse(JSON.stringify(inPokers));
                    tempHolds.splice(tempHolds.indexOf(this.laizi), 1);
                    for (let i = 0; i < 3; i++) {
                        tempHolds.splice(tempHolds.indexOf(v), 1)
                    }

                    this.nextCheckHu(tempHolds, tempInPokers, finalGroup, all, true, hasDui);
                }
            }

            for (let i = 0; i < inPokers.length; i++) {
                let inPoker = inPokers[i];
                if (inPoker.t == InPokerType.xiao) {
                    /** 开始计算成牌 */
                    let v = inPoker.v;
                    let finalGroup = [{
                        v: v,
                        vs: [v, -1, -1, this.laizi],
                        t: InPokerType.qing,
                        x: true,
                        hu: this.getHuzi(InPokerType.qing, [v]),
                    }];
                    /** 创建临时手牌和进牌 开始递归计算成牌 */
                    let tempHolds = [].concat(holds);
                    let tempInPokers = JSON.parse(JSON.stringify(inPokers));
                    tempHolds.splice(tempHolds.indexOf(this.laizi), 1);
                    tempInPokers.splice(i, 1);
                    this.nextCheckHu(tempHolds, tempInPokers, finalGroup, all, true, hasDui);
                }
            }

            if (laiziCount > 1) {
                for (let key in cardMap) {
                    let c = cardMap[key];
                    if (c == 2) {
                        /** 开始计算成牌 */
                        let v = parseInt(key);
                        let finalGroup = [{
                            v: v,
                            vs: [v, -1, this.laizi, this.laizi],
                            t: InPokerType.long,
                            x: false,
                            hu: this.getHuzi(InPokerType.long, [v]),
                        }];
                        /** 创建临时手牌和进牌 开始递归计算成牌 */
                        let tempHolds = [].concat(holds);
                        let tempInPokers = JSON.parse(JSON.stringify(inPokers));
                        for (let i = 0; i < 2; i++) {
                            tempHolds.splice(tempHolds.indexOf(this.laizi), 1);
                        }

                        for (let i = 0; i < 2; i++) {
                            tempHolds.splice(tempHolds.indexOf(v), 1);
                        }

                        this.nextCheckHu(tempHolds, tempInPokers, finalGroup, all, true, hasDui);
                    }
                }
                if (laiziCount > 2) {
                    for (let key in cardMap) {
                        let c = cardMap[key];
                        if (c == 1) {
                            /** 开始计算成牌 */
                            let v = parseInt(key);
                            let finalGroup = [{
                                v: v,
                                vs: [v, this.laizi, this.laizi, this.laizi],
                                t: InPokerType.long,
                                x: false,
                                hu: this.getHuzi(InPokerType.long, [v]),
                            }];
                            /** 创建临时手牌和进牌 开始递归计算成牌 */
                            let tempHolds = [].concat(holds);
                            let tempInPokers = JSON.parse(JSON.stringify(inPokers));
                            for (let i = 0; i < 3; i++) {
                                tempHolds.splice(tempHolds.indexOf(this.laizi), 1);
                            }

                            tempHolds.splice(tempHolds.indexOf(v), 1);
                            this.nextCheckHu(tempHolds, tempInPokers, finalGroup, all, true, hasDui);
                        }
                    }
                }
            }
        }
    }

    /**
     * 再计算手牌里面3个的 以及其他进牌
     * @param holds
     * @param inPokers
     * @param finalGroup
     * @param all
     * @param isJiao
     */
    nextCheckHu(holds, inPokers, finalGroup, all, isJiao, hasDui, card) {
        let cardMap = this.calcPokersCount(holds);
        for (let key in cardMap) {
            /** 开始计算成牌 */
            let v = parseInt(key);
            let c = cardMap[key];
            if (c == 4 && v != this.laizi) {
                if (typeof card == 'number' && v == card) {
                    finalGroup.push({
                        v: v,
                        vs: [v, -1, -1],
                        t: InPokerType.kan,
                        hu: this.getHuzi(InPokerType.kan, [v]),
                    });

                    /** 移除手牌中的坎 */
                    for (let i = 0; i < 3; i++) {
                        holds.splice(holds.indexOf(v), 1);
                    }
                } else {
                    finalGroup.push({
                        v: v,
                        vs: [v, -1, -1, -1],
                        t: InPokerType.long,
                        hu: this.getHuzi(InPokerType.long, [v]),
                    });

                    /** 移除手牌中的龙 */
                    for (let i = 0; i < 4; i++) {
                        holds.splice(holds.indexOf(v), 1);
                    }
                }
            }

            if (c == 3 && v != this.laizi) {
                /** 开始计算成牌 */
                let v = parseInt(key);
                if (isNaN(card) || v != card) {
                    finalGroup.push({
                        v: v,
                        vs: [v, -1, -1],
                        t: InPokerType.kan,
                        hu: this.getHuzi(InPokerType.kan, [v]),
                    });
                    /** 移除手牌中的坎 */
                    for (let i = 0; i < 3; i++) {
                        holds.splice(holds.indexOf(v), 1);
                    }
                }
            }
        }

        finalGroup = finalGroup.concat(inPokers);
        /** 最终递归 */
        holds.sort((a, b) => {
            return a-b;
        });

        this.finalCheckOtherHu(holds, finalGroup, all, isJiao, hasDui);
    }

    /**
     * 最后递归检查其他剩余手牌的成牌
     * @param holds
     * @param finalGroup
     * @param all
     * @param isJiao
     * @param hasDui
     */
    finalCheckOtherHu(holds, finalGroup, all, isJiao, hasDui) {
        /** 获取赖子牌，记录数量 */
        let laiZiCount = this.calcCountInArray(holds, this.laizi);
        /** 如果剩下都是赖子 或者手牌都组合完了 */
        if (holds.length == laiZiCount) {
            if (laiZiCount > 0) {
                if (laiZiCount == 2) {
                    finalGroup.push({
                        v: -1,
                        vs: [this.laizi, this.laizi],
                        t: InPokerType.dui,
                        hu: 0
                    });
                } else  if (laiZiCount == 3) {
                    finalGroup.push({
                        v: -1,
                        vs: [this.laizi, -1, -1],
                        t: InPokerType.kan,
                        hu: 6
                    });
                } else if (laiZiCount == 4) {
                    finalGroup.push({
                        v: -1,
                        vs: [this.laizi, -1, -1, -1],
                        t: InPokerType.long,
                        hu: 12
                    });
                }
            }
            all.push(finalGroup);
            return;
        }

        let card = holds[0];
        /** 如果开了交 但是还没组对子 先组对子 */
        if (isJiao && !hasDui) {
            let cardCount = this.calcCountInArray(holds, card);
            if (cardCount >= 2) {
                /** 牌数量为2 直接当成对子 */
                let tempFinalGroup = JSON.parse(JSON.stringify(finalGroup));
                tempFinalGroup.push({
                    v: -1,
                    vs: [card, card],
                    t: InPokerType.dui,
                    hu: 0
                });

                /** 并从手牌中移除 */
                let tempHolds = [].concat(holds);
                tempHolds.splice(0, 2);
                this.finalCheckOtherHu(tempHolds, tempFinalGroup, all, isJiao, true);
            } else if (laiZiCount > 0) {
                /** 牌数量为1 与赖子成对子 */
                let tempFinalGroup = JSON.parse(JSON.stringify(finalGroup));
                tempFinalGroup.push({
                    v: -1,
                    vs: [card, this.laizi],
                    t: InPokerType.dui,
                    hu: 0
                });

                /** 并从手牌中移除 */
                let tempHolds = [].concat(holds);
                tempHolds.splice(0, 1);
                tempHolds.pop();
                this.finalCheckOtherHu(tempHolds, tempFinalGroup, all, isJiao, true);
            }
        }

        /** 组成坎 */
        if (laiZiCount > 0) {
            let cardCount = this.calcCountInArray(holds, card);
            if (cardCount == 2) {
                let tempFinalGroup = JSON.parse(JSON.stringify(finalGroup));
                tempFinalGroup.push({
                    v: -1,
                    vs: [card, -1, this.laizi],
                    t: InPokerType.kan,
                    g: false,
                    hu: this.getHuzi(InPokerType.kan, [card])
                });
                /** 并从手牌中移除 */
                let tempHolds = [].concat(holds);
                tempHolds.splice(0, 2);
                tempHolds.pop();
                this.finalCheckOtherHu(tempHolds, tempFinalGroup, all, isJiao, hasDui);
            } else if (laiZiCount > 1) {
                let tempFinalGroup = JSON.parse(JSON.stringify(finalGroup));
                tempFinalGroup.push({
                    v: -1,
                    vs: [card, this.laizi, this.laizi],
                    t: InPokerType.kan,
                    g: false,
                    hu: this.getHuzi(InPokerType.kan, [card])
                });
                /** 并从手牌中移除 */
                let tempHolds = [].concat(holds);
                tempHolds.splice(0, 1);
                tempHolds.pop();
                tempHolds.pop();
                this.finalCheckOtherHu(tempHolds, tempFinalGroup, all, isJiao, hasDui);
            }
        }

        /** 剩下组吃牌 */
        let zuhes = this.getHuZuheArrs(card);
        for (let i = 0; i < zuhes.length; i++) {
            let zuhe = zuhes[i];
            let vs = zuhe.vs;
            if (this.holsdContainsVS(holds, vs)) {
                let tempFinalGroup = JSON.parse(JSON.stringify(finalGroup));
                tempFinalGroup.push({
                    v: -1,
                    vs: vs,
                    t: InPokerType.chi,
                    l: zuhe.laizi,
                    hu: this.getHuzi(InPokerType.chi, vs)
                });
                /** 并从手牌中移除 */
                let tempHolds = [].concat(holds);
                vs.forEach((el) => {
                    tempHolds.splice(tempHolds.indexOf(el), 1);
                });

                this.finalCheckOtherHu(tempHolds, tempFinalGroup, all, isJiao, hasDui);
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
        let change = this.changeBigSmall(card);
        /** 如果是1或11 */
        if (card === 9 || card === 19) {
            arr.push({vs: [card, card, change], laizi: -1});
            arr.push({vs: [card, change, change], laizi: -1});
            arr.push({vs: [this.laizi, card, card+1], laizi: card-1});
            arr.push({vs: [card, this.laizi, change], laizi: -1});
        }

        /**如果是2或12 */
        else if (card === 2 || card === 12) {
            arr.push({vs: [card, card+5, card+8], laizi: -1});
            arr.push({vs: [card, this.laizi, card+8], laizi: card+5});
            arr.push({vs: [card, card+5, this.laizi], laizi: card+8});
            arr.push({vs: [card, card+1, card+2], laizi: -1});
            arr.push({vs: [card, card, change], laizi: -1});
            arr.push({vs: [card, change, change], laizi: -1});
            arr.push({vs: [card, this.laizi, card+2], laizi: card+1});
            arr.push({vs: [this.laizi, card, card+1], laizi: card-1});
            arr.push({vs: [card, this.laizi, change], laizi: -1});
        }

        /**如果是7或17 */
        else if (card === 7 || card === 17) {
            arr.push({vs: [this.laizi, card, card+3], laizi: card-5});
            arr.push({vs: [card, card+1, card+2], laizi: -1});
            arr.push({vs: [card, this.laizi, card+2], laizi: card+1});
            arr.push({vs: [card, card+1, this.laizi], laizi: -1});
            arr.push({vs: [card, card, change], laizi: -1});
            arr.push({vs: [card, change, change], laizi: -1});
            arr.push({vs: [card, this.laizi, change], laizi: -1});
        }

        /** 如果是9或19 */
        else if (card === 9 || card === 19) {
            arr.push({vs: [this.laizi, card, card+1], laizi: card-1});
            arr.push({vs: [card, card, change], laizi: -1});
            arr.push({vs: [card, change, change], laizi: -1});
            arr.push({vs: [card, this.laizi, change], laizi: -1});
        }

        /** 如果是10或20 */
        else if (card === 10 || card === 20) {
            arr.push({vs: [card, card, change], laizi: -1});
            arr.push({vs: [card, change, change], laizi: -1});
            arr.push({vs: [card, this.laizi, change], laizi: -1});
        }

        /** 其他的牌 */
        else {
            arr.push({vs: [card, card+1, card+2], laizi: -1});
            arr.push({vs: [card, card, change], laizi: -1});
            arr.push({vs: [card, change, change], laizi: -1});
            arr.push({vs: [card, card+1, this.laizi], laizi: -1});
            arr.push({vs: [card, this.laizi, card+2], laizi: card+1});
            arr.push({vs: [card, this.laizi, change], laizi: -1});
        }

        return arr;
    }

    /**
     * 检查是否黑胡
     * @param group
     * @returns {boolean}
     */
    isHeiHu(group) {
        for (let i = 0; i < group.length; i++) {
            let inPoker = group[i];
            let vs = inPoker.vs;
            if (vs.includes(2) || vs.includes(7) || vs.includes(10) || vs.includes(12) || vs.includes(17) || vs.includes(20)) {
                return false;
            }

            if (vs.includes(1) && vs.includes(3)) {
                return false;
            }

            if (vs.includes(11) && vs.includes(13)) {
                return false;
            }

            if (vs.includes(8) && vs.includes(9)) {
                return false;
            }

            if (vs.includes(18) && vs.includes(19)) {
                return false;
            }

            /** 如果有 [5,6,this.laizi] [15,16,this.laizi] 组合 则赖子只能是黑的 计算翻醒时会用到 */
            if (vs.includes(5) && vs.includes(6) && vs.includes(this.laizi)) {
                inPoker.laizi = 4;
            }

            if (vs.includes(15) && vs.includes(16) && vs.includes(this.laizi)) {
                inPoker.laizi = 14;
            }

            /** 如果有 [3,4,this.laizi] [13,14,this.laizi] 组合 则赖子只能是黑的 计算翻醒时会用到 */
            if (vs.includes(3) && vs.includes(3) && vs.includes(this.laizi)) {
                inPoker.laizi = 5;
            }

            if (vs.includes(13) && vs.includes(14) && vs.includes(this.laizi)) {
                inPoker.laizi = 15;
            }

            /** 如果是王炸王 王闯王 王吊王 则只能算黑的 在翻醒的时候会用到 如果翻出来红的 那么就不能再加醒了 */
            if (inPoker.t == InPokerType.zha || inPoker.t == InPokerType.chuang || inPoker.t == InPokerType.diao) {
                if (vs[0] == this.laizi) {
                    inPoker.change = 'hei';
                }
            }
        }

        return true;
    }

    /**
     * 检查是不是点菊
     * @param group
     * @returns {boolean}
     */
    isDianJu(group) {
        let hong = 0;
        let hongs = [2,7,10,12,17,20];
        for (let i = 0; i < group.length; i++) {
            let inPoker = group[i];
            let vs = inPoker.vs;
            if (inPoker.t == InPokerType.qing || inPoker.t == InPokerType.long || inPoker.t == InPokerType.jiao || inPoker.t == InPokerType.zha) {
                if (hongs.includes(vs[0])) {
                    return false;
                }
            }

            if (inPoker.t == InPokerType.peng || inPoker.t == InPokerType.xiao || inPoker.t == InPokerType.kan || inPoker.t == InPokerType.chuang) {
                if (hongs.includes(vs[0])) {
                    return false;
                }
            }

            if (inPoker.t == InPokerType.dui || inPoker.t == InPokerType.diao) {
                if (hongs.includes(vs[0])) {
                    return false;
                }
            }

            if (vs.includes(this.laizi)) {
                if (vs.includes(1) && vs.includes(3)) {
                    hong+=1;
                }

                if (vs.includes(11) && vs.includes(13)) {
                    hong+=1;
                }

                if (vs.includes(8) && vs.includes(9)) {
                    hong+=1;
                }

                if (vs.includes(18) && vs.includes(19)) {
                    hong+=1;
                }
            } else {
                vs.forEach((el) => {
                    if (hongs.includes(el)) {
                        hong+=1;
                    }
                });
            }
        }

        /** 如果满足点菊 */
        if (hong == 1) {
            for (let i = 0; i < group.length; i++) {
                let inPoker = group[i];
                if (inPoker.t != InPokerType.chi) {
                    continue;
                }
                let vs = inPoker.vs;
                /** 一般来说 有[5,6,this.laizi] [15,16,this.laizi] 这种组合 赖子只能是黑的 否则就是黑胡了 翻醒时用到 */
                if (vs.includes(5) && vs.includes(6) && vs.includes(this.laizi)) {
                    inPoker.laizi = 4;
                }

                if (vs.includes(15) && vs.includes(16) && vs.includes(this.laizi)) {
                    inPoker.laizi = 14;
                }

                /** 如果有 [3,4,this.laizi] [13,14,this.laizi] 组合 则赖子只能是黑的 计算翻醒时会用到 */
                if (vs.includes(3) && vs.includes(4) && vs.includes(this.laizi)) {
                    inPoker.laizi = 5;
                }

                if (vs.includes(13) && vs.includes(14) && vs.includes(this.laizi)) {
                    inPoker.laizi = 15;
                }

                /** 如果是王炸王 王闯王 王吊王 则只能算黑的 在翻醒的时候会用到 如果翻出来红的 那么就不能再加醒了 */
                if (inPoker.t == InPokerType.zha || inPoker.t == InPokerType.chuang || inPoker.t == InPokerType.diao) {
                    if (vs[0] == this.laizi) {
                        inPoker.change = 'hei';
                    }
                }
            }

            return true;
        }

        return false;
    }

    /**
     * 检查是不是红胡
     * @param group
     * @param xing
     * @returns {boolean}
     */
    isHongHu(group, xing) {
        let hong = 0;
        let hongs = [2,7,10,12,17,20];
        let otherInpokers = [];
        let sInpoker = undefined;
        for (let i = 0; i < group.length; i++) {
            let inPoker = group[i];
            let vs = inPoker.vs;
            if (inPoker.t == InPokerType.qing || inPoker.t == InPokerType.long || inPoker.t == InPokerType.jiao || inPoker.t == InPokerType.zha) {
                if (hongs.includes(vs[0])) {
                    hong+=4;
                }

                if (vs[0] == this.laizi) {
                    sInpoker = inPoker;
                }
            }

            else if (inPoker.t == InPokerType.peng || inPoker.t == InPokerType.xiao || inPoker.t == InPokerType.kan || inPoker.t == InPokerType.chuang) {
                if (hongs.includes(vs[0])) {
                    hong+=3;
                }

                if (vs[0] == this.laizi) {
                    sInpoker = inPoker;
                }
            }

            else if (inPoker.t == InPokerType.dui || inPoker.t == InPokerType.diao) {
                if (hongs.includes(vs[0])) {
                    hong+=2;
                }

                if (vs[0] == this.laizi) {
                    sInpoker = inPoker;
                }
            }

            else if (vs.includes(this.laizi)) {
                if (vs.includes(1) && vs.includes(3)) {
                    hong+=1;
                }

                if (vs.includes(11) && vs.includes(13)) {
                    hong+=1;
                }

                if (vs.includes(8) && vs.includes(9)) {
                    hong+=1;
                }

                if (vs.includes(18) && vs.includes(19)) {
                    hong+=1;
                }

                if (vs.includes(3) && vs.includes(4)) {
                    if (xing == 5) {
                        otherInpokers.push(inPoker);
                    } else {
                        inPoker.laizi == 2;
                        hong+=1;
                    }
                }

                if (vs.includes(13) && vs.includes(14)) {
                    if (xing == 15) {
                        otherInpokers.push(inPoker);
                    } else {
                        inPoker.laizi == 12;
                        hong+=1;
                    }
                }

                if (vs.includes(5) && vs.includes(6)) {
                    if (xing == 4) {
                        otherInpokers.push(inPoker);
                    } else {
                        inPoker.laizi == 7;
                        hong+=1;
                    }
                }

                if (vs.includes(15) && vs.includes(16)) {
                    if (xing == 14) {
                        otherInpokers.push(inPoker);
                    } else {
                        inPoker.laizi == 17;
                        hong+=1;
                    }
                }
            } else {
                vs.forEach((el) => {
                    if (hongs.includes(el)) {
                        hong+=1;
                    }
                });
            }
        }

        /** 如果红不够 */
        if (hong < 10) {
            if (!!sInpoker && otherInpokers.length > 0) {
                let slen = 0;
                if (sInpoker.t == InPokerType.zha) {
                    slen = 4;
                } else if (sInpoker.t == InPokerType.chuang) {
                    slen = 3;
                } else {
                    slen = 2;
                }

                let len = otherInpokers.length;
                if (len+slen+hong >= 10) {
                    if (slen+hong <= 10) {
                        hong+=slen;
                        sInpoker.change = 'hong';
                        hong+=this.otherHongInPokers(hong, otherInpokers);
                    } else {
                        hong+=this.otherHongInPokers(hong, otherInpokers);
                        if (hong < 10) {
                            hong+=slen;
                            sInpoker.change = 'hong';
                        }
                    }
                }
            } else if (!!sInpoker) {
                let slen = 0;
                if (sInpoker.t == InPokerType.zha) {
                    slen = 4;
                } else if (sInpoker.t == InPokerType.chuang) {
                    slen = 3;
                } else {
                    slen = 2;
                }
                if (slen+hong >= 10) {
                    hong+=slen;
                    sInpoker.change = 'hong';
                }
            } else if (otherInpokers.length > 0) {
                let len = otherInpokers.length;
                if (len+hong >= 10) {
                    hong+=this.otherHongInPokers(hong, otherInpokers);
                }
            }
        }

        return hong >= 10;
    }

    /**
     * 赖子可变判断
     * @param hong
     * @param otherInpokers
     * @returns {*}
     */
    otherHongInPokers(hong, otherInpokers) {
        while (hong < 10 && otherInpokers.length > 0) {
            let inPoker = otherInpokers.pop();
            let vs = inPoker.vs;
            if (vs.includes(3) && vs.includes(4)) {
                inPoker.laizi == 2;
                hong+=1;
            }

            if (vs.includes(13) && vs.includes(14)) {
                inPoker.laizi == 12;
                hong+=1;
            }

            if (vs.includes(5) && vs.includes(6)) {
                inPoker.laizi == 7;
                hong+=1;
            }

            if (vs.includes(15) && vs.includes(16)) {
                inPoker.laizi == 17;
                hong+=1;
            }
        }

        return hong;
    }

    //大小写的转换
    changeBigSmall (poker) {
        let num = poker % 10;

        if (num === 0) {
            return poker === 10 ? 20 : 10;
        }

        //如果大于10
        if (poker > 10) {
            return num;
        }
        //如果小于等于10
        else {
            return 10 + num;
        }
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

let algorithm = new zp_chz_algorithm();
module.exports = algorithm;

//
//
// console.log(algorithm.getCardsData(3,[35,1],[27,27]));
// console.log(algorithm.getAutoDicard(
//     {"type":3,"cards":[4,4,5,5],"minVal":4,"isZhu":false,"isSha":false,"uid":306822,"max":true},
// [6,6,7,7,8,8,37,34,13,24,21,20,11],
//     3,
// ));


// console.log(algorithm.getSortHolds([15, 2, 13, 2, 6, 21, 15, 7, 14, 19, 5, 20, 10, 14, 13, 6, 17, 9, 18, 11]));



//console.log(algorithm.getAlltype([11, 11, 12, 14, 14, 17, 17, 17, 18, 18, 2, 20, 4, 5, 6, 7, 9]));
// console.log(algorithm.getbanbian(algorithm.getEveryPokerCounts([11, 11, 12, 14, 14, 17, 17, 17, 18, 18, 2, 20, 4, 5, 6, 7, 9])));
// console.log(algorithm.holdlist);
