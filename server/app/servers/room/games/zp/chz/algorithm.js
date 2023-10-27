const enum_chz = require('./enum');
const InPokerType = enum_chz.inPokerType;
const MingtangType = enum_chz.mingtangType;
const HuType = enum_chz.huType;

class ChzAlgorithm {

    constructor() {
        this.laizi = 21;
        this.mul_mt = [0,1,2,3,4];
        this.mul_ht = [0,1,2,4,8,8,16,16,32];
    }

    setRule(rule) {
        let gameRules = rule.gameRules;
        this.ergunyi = gameRules[0];
        this.redblack = gameRules[1];
    }

    /**
     * 自动出一张牌
     * @param holds
     * @returns {number}
     */
    getAutoDicard(holds) {
        let maps = this.calcPokersCount(holds);
        for (let key in maps) {
            if (key != this.laizi && maps[key] < 3) {
                return parseInt(key);
            }
        }
    }

    /**
     * 是否有一张能出的牌
     * @param holds
     * @returns {boolean}
     */
    hasCanOut(holds) {
        let can = false;
        let maps = this.calcPokersCount(holds);
        for (let key in maps) {
            if (parseInt(key) != this.laizi && maps[key] < 3) {
                can = true;
                break;
            }
        }

        return can;
    }

    /**
     * 检查牌是否能出
     * @param holds
     * @param card
     * @returns {boolean}
     */
    checkCanOut(holds, card) {
        if (isNaN(card) || card < 1 || card > 20) {
            return false;
        }

        if (holds.indexOf(card) < 0) {
            return false;
        }

        let maps = this.calcPokersCount(holds);
        if (maps[card] > 2) {
            return false;
        }

        return true;
    }

    /**
     * 检查倾
     * @param holds
     * @param inPokers
     * @param card
     * @returns {*}
     */
    checkQing(holds, inPokers, card) {
        if (card == this.laizi) {
            return;
        }

        let inPoker = undefined;
        let maps = this.calcPokersCount(holds);
        let c = false;
        /** 找手牌里面有3张一样的 */
        for (let key in maps) {
            if (key == card && maps[key] == 3) {
                let t = InPokerType.qing;
                let vs = [card, -1, -1, -1];
                inPoker = {
                    v: card,
                    vs: vs,
                    t: t,
                    x: false,
                    hu: this.getHuzi(t, vs)
                }
            }

            /** 如果有4张 就是重交 */
            if (maps[key] == 4) {
                c = true;
            }
        }

        if (!!inPoker) {
            /** 如果是倾 手牌里面没有重交 则继续找进牌里面的 */
            if (!c) {
                for (let i = 0; i < inPokers.length; i++) {
                    let obj = inPokers[i];
                    if (obj.t == InPokerType.jiao || obj.t == InPokerType.qing) {
                        c = true;
                        break;
                    }
                }
            }

            inPoker.c = c;
            /** 直接删除手牌里面的牌 并加入进牌 */
            let idx = holds.indexOf(card);
            while (idx > -1) {
                holds.splice(idx, 1);
                idx = holds.indexOf(card);
            }
            inPokers.push(inPoker);
        } else {
            /** 找进牌里面有啸的 此操作自动进行 不需要改变手牌 只需要将进牌里面的改变即可 */
            for (let i = 0; i < inPokers.length; i++) {
                let obj = inPokers[i];
                if (obj.t == InPokerType.jiao || obj.t == InPokerType.qing) {
                    c = true;
                }
                if (obj.v == card && obj.t == InPokerType.xiao) {
                    inPoker = obj;
                }
            }

            if (!!inPoker) {
                inPoker.vs.push(-1);
                inPoker.t = InPokerType.qing;
                inPoker.x = true;
                inPoker.c = c;
                inPoker.hu = this.getHuzi(inPoker.t, inPoker.vs);
            }
        }

        return inPoker;
    }

    /**
     * 检查啸
     * @param holds
     * @param card
     * @returns {undefined}
     */
    checkXiao(holds, card) {
        if (card == this.laizi) {
            return;
        }

        let inPoker = undefined;
        let maps = this.calcPokersCount(holds);
        /** 找手牌里面有3张一样的 */
        for (let key in maps) {
            if (key == card && maps[key] == 2) {
                let t = InPokerType.xiao;
                let vs = [card, -1, -1];
                inPoker = {
                    v: card,
                    vs: vs,
                    t: t,
                    g: false,
                    hu: this.getHuzi(t, vs)
                }
            }
        }

        if (!!inPoker) {
            let idx = holds.indexOf(card);
            while (idx > -1) {
                holds.splice(idx, 1);
                idx = holds.indexOf(card);
            }
        }

        return inPoker;
    }

    /** 判断是否可碰 */
    checkPeng (holds, card) {
        let count = 0;
        holds.forEach((el) => {
            if (parseInt(el) === parseInt(card)) {
                count++;
            }
        });

        if (count === 2) {
            let t = InPokerType.peng;
            let vs = [card, card, card];
            let inPoker = {
                v: card,
                vs: vs,
                t: t,
                hu: this.getHuzi(t, vs)
            };

            return inPoker;
        }
    }

    /**
     * 检查开交
     * @param holds
     * @param inPokers
     * @param card
     * @param discard
     */
    checkJiao(holds, inPokers, card, discard=false) {
        let inPoker = undefined;
        let maps = this.calcPokersCount(holds);
        let c = false;
        /** 找手牌里面有3张一样的 */
        for (let key in maps) {
            if (parseInt(key) == this.laizi) {
                continue;
            }

            if (key == card && maps[key] == 3) {
                let t = InPokerType.jiao;
                let vs = [card, card, card, card];
                inPoker = {
                    v: card,
                    vs: vs,
                    t: t,
                    x: false,
                    p: false,
                    hu: this.getHuzi(t, vs)
                }
            }

            if (maps[key] == 4) {
                c = true;
            }
        }

        if (!!inPoker) {
            if (!c) {
                for (let i = 0; i < inPokers.length; i++) {
                    let obj = inPokers[i];
                    if (obj.t == InPokerType.jiao || obj.t == InPokerType.qing) {
                        c = true;
                        break;
                    }
                }
            }

            inPoker.c = c;
        } else {
            /** 找进牌里面有啸和碰的 */
            let x = false;
            let p = false;
            for (let i = 0; i < inPokers.length; i++) {
                let obj = inPokers[i];
                if (obj.t == InPokerType.jiao || obj.t == InPokerType.qing) {
                    c = true;
                }

                if (obj.v == card && (obj.t == InPokerType.xiao || (!discard && obj.t == InPokerType.peng))) {
                    inPoker = this.deepCopy(obj);
                    inPoker.idx = i;
                    x = (obj.t == InPokerType.xiao);
                    p = (obj.t == InPokerType.peng);
                }
            }

            if (!!inPoker) {
                inPoker.vs = [card, card, card, card];
                inPoker.t = InPokerType.jiao;
                inPoker.x = x;
                inPoker.c = c;
                inPoker.p = p;
                inPoker.hu = this.getHuzi(inPoker.t, inPoker.vs);
            }
        }

        return inPoker;
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

    //检测手牌是否有起手2提或者4坎，是否重新发牌
    checkIsReDeal (players) {
        let isReDeal = false;

        players.forEach((player) => {
            let kanCount = 0;
            let tiCount = 0;

            let obj = this.calcPokersCount(player.holds);

            for (let p in obj) {
                if (obj[p] === 3) {
                    kanCount++;
                }
                if (obj[p] === 4) {
                    tiCount++;
                }
            }

            if (kanCount >= 4 || tiCount >= 2) {
                isReDeal = true;
            }
        });

        return isReDeal;
    }

    /** 判断是否可吃 */
    checkChi (player_holds, card) {
        let holds = [].concat(player_holds);
        console.log(`checkChi holds = ${holds} card = ${card}`);
        /** 先把手牌里，3个一样的和4个一样的去掉 */
        let obj = this.calcPokersCount(holds);
        for (let p in obj) {
            let v = parseInt(obj[p]);
            if (v > 2) {
                while (holds.indexOf(parseInt(p)) > -1) {
                    holds.splice(holds.indexOf(parseInt(p)), 1);
                }
            }
        }

        /** 加到手牌中 */
        holds.push(card);

        /** 计算可吃牌 */
        let chis = [];
        this.calcCheckChi(holds, card, chis);
        /** 过滤掉不能下火的 */
        let c = this.calcCountInArray(holds, card);
        for (let i = 0; i < chis.length; i++) {
            let a = 0;
            let chi = chis[i];
            let vs = chi.vs;
            vs.forEach((el) => {
                if (el == card) {
                    a+=1;
                }
            });

            if (a == c) {
                continue;
            }

            let xhs1 = chi.xhs;
            for (let j = 0; j < xhs1.length; j++) {
                let a1 = a;
                let xh1 = xhs1[j];
                let vs1 = xh1.vs;
                vs1.forEach((el) => {
                    if (el == card) {
                        a1+=1;
                    }
                });

                if (a1 == c) {
                    continue;
                }

                let xhs2 = xh1.xhs;
                for (let k = 0; k < xhs2.length; k++) {
                    let a2 = a1+a;
                    let xh2 = xhs2[k];
                    let vs2 = xh2.vs;
                    vs2.forEach((el) => {
                        if (el == card) {
                            a2+=1;
                        }
                    });

                    if (a2 < c) {
                        xhs2.splice(k, 1);
                        k-=1;
                    }
                }

                if (xhs2.length == 0) {
                    xhs1.splice(j, 1);
                    j-=1;
                }
            }

            if (xhs1.length == 0) {
                chis.splice(i, 1);
                i-=1;
            }
        }
        return chis.length > 0 ? chis : undefined;
    }

    calcCheckChi (holds, card, chis, xiahuo=false) {
        let arr = this.getChiArrs(card);
        /** 遍历每种情况 */
        for (let i = 0; i < arr.length; i++) {
            let chiArr = arr[i];
            let tempHolds = [].concat(holds);
            let can = true;
            let a = [].concat(tempHolds);
            chiArr.forEach((el) => {
                let idx = a.indexOf(el);
                if (idx < 0) {
                    can = false;
                } else {
                    a.splice(idx, 1);
                }
            });

            if (can) {
                chiArr.forEach((el) => {
                    let idx = tempHolds.indexOf(el);
                    tempHolds.splice(idx, 1);
                });

                let obj = {
                    v: card,
                    vs: chiArr,
                    t: InPokerType.chi,
                    xh: xiahuo,
                    hu: this.getHuzi(InPokerType.chi, chiArr),
                    xhs: [],
                };
                chis.push(obj);

                if (tempHolds.indexOf(card) < 0) {
                    continue;
                }

                this.calcCheckChi(tempHolds, card, obj.xhs, true);
            }
        }
    }

    /**
     * 获取所有吃的样板
     * @param card
     * @returns {Array}
     */
    getChiArrs(card) {
        let arr = [];
        let change = this.changeBigSmall(card);
        /** 如果是1或11 */
        if (card === 1 || card === 11) {
            arr.push([card, card+1, card+2]);
            arr.push([card, card, change]);
            arr.push([card, change, change]);
        }

        /**如果是2或12 */
        else if (card === 2 || card === 12) {
            arr.push([card, card+5, card+8]);
            arr.push([card, card-1, card+1]);
            arr.push([card, card+1, card+2]);
            arr.push([card, card, change]);
            arr.push([card, change, change]);
        }

        /**如果是7或17 */
        else if (card === 7 || card === 17) {
            arr.push([card, card-5, card+3]);
            arr.push([card, card-2, card-1]);
            arr.push([card, card-1, card+1]);
            arr.push([card, card+1, card+2]);
            arr.push([card, card, change]);
            arr.push([card, change, change]);
        }

        /** 如果是9或19 */
        else if (card === 9 || card === 19) {
            arr.push([card, card-2, card-1]);
            arr.push([card, card-1, card+1]);
            arr.push([card, card, change]);
            arr.push([card, change, change]);
        }

        /** 如果是10或20 */
        else if (card === 10 || card === 20) {
            arr.push([card, card-8, card-3]);
            arr.push([card, card-2, card-1]);
            arr.push([card, card, change]);
            arr.push([card, change, change]);
        }

        /** 其他的牌 */
        else {
            arr.push([card, card-2, card-1]);
            arr.push([card, card-1, card+1]);
            arr.push([card, card+1, card+2]);
            arr.push([card, card, change]);
            arr.push([card, change, change]);
        }

        return arr;
    }

    //获取可以听的牌
    checkTing (player_holds, player_inPokers) {
        let arr = [];
        for (let i = 1; i <= 20; i++) {
            let result = this.checkHu(player_holds, player_inPokers, i);
            if (result) {
                arr.push(i);
            }
        }

        return arr;
    }

    /**
     * 检查王炸
     * @param player_holds
     * @param player_inPokers
     * @param card
     * @param xingCard
     * @param xing
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
     * @param xingCard
     * @param xing
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
    checkHu (player_holds, player_inPokers, card, xingCard, xing, minHu=15, huType=1) {
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

                /** 如果没开交 那么则判断是否能用赖子 跟3个 2个 1个 组成倾或龙 */
                if (!isJiao) {
                    this.inPokersCount4(holds, inPokers, all, hasDui, card);
                }

                /** 加入手牌 */
                holds.push(card);
            }
        }

        this.nextCheckHu(holds, inPokers, [], all, isJiao, hasDui, card);
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
            fan = Math.floor((huzi-minHu)/3)+1;
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
                        if (obj.l > 0) {
                            final = obj.l;
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
    inPokersCount4(holds, inPokers, all, hasDui, card) {
        let laiziCount = this.calcCountInArray(holds, this.laizi);
        /** 一个赖子时 跟坎或者啸组成龙或倾 */
        if (laiziCount > 0) {
            let cardMap = this.calcPokersCount(holds);
            for (let key in cardMap) {
                let c = cardMap[key];
                let v = parseInt(key);
                if (c == 3 && v != this.laizi) {
                    /** 开始计算成牌 */
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
                        tempHolds.splice(tempHolds.indexOf(v), 1);
                    }

                    this.nextCheckHu(tempHolds, tempInPokers, finalGroup, all, true, hasDui, card);
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
                    this.nextCheckHu(tempHolds, tempInPokers, finalGroup, all, true, hasDui, card);
                }
            }

            if (laiziCount > 1) {
                for (let key in cardMap) {
                    let c = cardMap[key];
                    let v = parseInt(key);
                    if (c == 2 && v != this.laizi) {
                        /** 开始计算成牌 */
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

                        if (!!card) {
                            tempHolds.push(card);
                        }

                        this.nextCheckHu(tempHolds, tempInPokers, finalGroup, all, true, hasDui, card);
                    }
                }
                if (laiziCount > 2) {
                    for (let key in cardMap) {
                        let c = cardMap[key];
                        let v = parseInt(key);
                        if (c == 1 && v != this.laizi) {
                            /** 开始计算成牌 */
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

                            if (!!card) {
                                tempHolds.push(card);
                            }

                            tempHolds.splice(tempHolds.indexOf(v), 1);
                            this.nextCheckHu(tempHolds, tempInPokers, finalGroup, all, true, hasDui, card);
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
        if (card === 2 || card === 12) {
            arr.push({vs: [card, card+5, card+8], laizi: -1});
            arr.push({vs: [card, this.laizi, card+8], laizi: card+5});
            arr.push({vs: [card, card+5, this.laizi], laizi: card+8});
            arr.push({vs: [card, card+1, card+2], laizi: -1});
            arr.push({vs: [card, card, change], laizi: -1});
            arr.push({vs: [card, change, change], laizi: -1});
            arr.push({vs: [card, this.laizi, card+2], laizi: card+1});
            arr.push({vs: [card, this.laizi, card+1], laizi: card-1});
            arr.push({vs: [card, this.laizi, change], laizi: -1});
        }
        /**如果是7或17 */
        else if (card === 7 || card === 17) {
            arr.push({vs: [card, this.laizi, card+3], laizi: card-5});
            arr.push({vs: [card, card+1, card+2], laizi: -1});
            arr.push({vs: [card, this.laizi, card+2], laizi: card+1});
            arr.push({vs: [card, card+1, this.laizi], laizi: -1});
            arr.push({vs: [card, card, change], laizi: -1});
            arr.push({vs: [card, change, change], laizi: -1});
            arr.push({vs: [card, this.laizi, change], laizi: -1});
        }

        /** 如果是9或19 */
        else if (card === 9 || card === 19) {
            arr.push({vs: [card, this.laizi, card+1], laizi: card-1});
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

module.exports = ChzAlgorithm;

// let alg = new ChzAlgorithm();
// console.log(alg.checkHu(
//     [
//         11,11,11,
//         12,12,12,
//         13,13,13,
//         14,14,14,
//         15,15,15,15,
//         17,17,18,
//         19
//     ], [], 17, 17, 17
// ));
// checkHu (player_holds, player_inPokers, card, xingCard, xing, minHu=15, huType=1) {