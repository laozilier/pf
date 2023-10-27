// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

class sanshui_algorithm {

    constructor () {
        super.constructor();

    };

    /**
     * 获取可以出的牌的数组
     * @param oricards
     * @param type
     */
    findValues(oricards, type) {
        let holds = oricards.concat();
        holds = holds.sort(this.compare);
        let types = {};
        let counts = this.getEveryPokerCounts(holds);
        let colors = this.getEveryPokerColors(holds);
        if (type > 0) {
            if (type == cc.sanshui_enum.dtActType.duizi) {
                let list = this.getDuizi(counts);
                if (list.length > 0) {
                    types[cc.sanshui_enum.dtActType.duizi.toString()] = list;
                }
            }

            if (type == cc.sanshui_enum.dtActType.liangdui) {
                let list = this.getLiangDui(counts);
                if (list.length > 0) {
                    types[cc.sanshui_enum.dtActType.liangdui.toString()] = list;
                }
            }

            if (type == cc.sanshui_enum.dtActType.santiao) {
                let list = this.getSantiaos(counts);
                if (list.length > 0) {
                    types[cc.sanshui_enum.dtActType.santiao.toString()] = list;
                }
            }

            if (type == cc.sanshui_enum.dtActType.shunzi) {
                let list = this.getShunzis(counts, holds);
                if (list.length > 0) {
                    types[cc.sanshui_enum.dtActType.shunzi.toString()] = list;
                }
            }

            if (type == cc.sanshui_enum.dtActType.tonghua) {
                let list = this.getTonghuas(holds, colors);
                if (list.length > 0) {
                    types[cc.sanshui_enum.dtActType.tonghua.toString()] = list;
                }
            }

            if (type == cc.sanshui_enum.dtActType.hulu) {
                let list = this.getHulus(counts);
                if (list.length > 0) {
                    types[cc.sanshui_enum.dtActType.hulu.toString()] = list;
                }
            }

            if (type == cc.sanshui_enum.dtActType.tiezhi) {
                let list = this.getTiezhis(counts);
                if (list.length > 0) {
                    types[cc.sanshui_enum.dtActType.tiezhi.toString()] = list;
                }
            }

            if (type == cc.sanshui_enum.dtActType.tonghuashun) {
                let list = this.getTonghuashuns(holds);
                if (list.length > 0) {
                    types[cc.sanshui_enum.dtActType.tonghuashun.toString()] = list;
                }
            }

            if (type == cc.sanshui_enum.dtActType.wutong) {
                let list = this.getWutongs(counts);
                if (list.length > 0) {
                    types[cc.sanshui_enum.dtActType.wutong.toString()] = list;
                }
            }
        } else {
            let list = this.getDuizi(counts);
            if (list.length > 0) {
                types[cc.sanshui_enum.dtActType.duizi.toString()] = list;
            }

            list = this.getLiangDui(counts);
            if (list.length > 0) {
                types[cc.sanshui_enum.dtActType.liangdui.toString()] = list;
            }

            list = this.getSantiaos(counts);
            if (list.length > 0) {
                types[cc.sanshui_enum.dtActType.santiao.toString()] = list;
            }

            list = this.getShunzis(counts, holds);
            if (list.length > 0) {
                types[cc.sanshui_enum.dtActType.shunzi.toString()] = list;
            }

            list = this.getTonghuas(holds, colors);
            if (list.length > 0) {
                types[cc.sanshui_enum.dtActType.tonghua.toString()] = list;
            }

            list = this.getHulus(counts);
            if (list.length > 0) {
                types[cc.sanshui_enum.dtActType.hulu.toString()] = list;
            }

            list = this.getTiezhis(counts);
            if (list.length > 0) {
                types[cc.sanshui_enum.dtActType.tiezhi.toString()] = list;
            }

            list = this.getTonghuashuns(holds);
            if (list.length > 0) {
                types[cc.sanshui_enum.dtActType.tonghuashun.toString()] = list;
            }

            list = this.getWutongs(counts);
            if (list.length > 0) {
                types[cc.sanshui_enum.dtActType.wutong.toString()] = list;
            }
        }

        return types;
    }

    getMinPokerIdx (lastCard) {
        let cards = lastCard.cards;
        let value = 0;
        let list = [];
        if (!!cards) {
            list = cards.concat();
            value = cards[0];
            while (typeof (value) != 'number') {
                list = value.concat();
                value = value[0];
            }
        }

        list.sort(this.compare);

        return this.valueToIdx(list[0]);
    }

    compare(a, b) {
        let aa = a % 13;
        let bb = b % 13;
        if (aa == 0) {
            aa = 100;
        }

        if (bb == 0) {
            bb = 100;
        }

        if (aa == bb) {
            return b - a;
        } else {
            return bb - aa;
        }
    }

    getPokersLen (lastCard) {
        let cards = lastCard.cards;
        let len = 0;
        if (!!cards) {
            let value = cards[0];
            if (typeof (value) != 'number') {
                len = value.length;
            } else {
                let type = lastCard.type;
                if (type == cc.diantuo_enum.dtActType.liandui) {
                    len = cards.length/2;
                } else {
                    len = cards.length;
                }
            }
        }

        return len;
    }

    /**
     * 获得对子数组
     * @param counts
     * @return {Array}
     */
    getDuizi(counts) {
        let list = [];
        for (let i = 0; i < counts.length; i++) {
            let a = counts[i];
            if (a > 1) {
                list.push([this.idxToValue(i)]);
            }
        }

        return list;
    }

    /**
     * 获取两对
     * @param counts
     * @returns {Array}
     */
    getLiangDui(counts) {
        let list = [];
        let all = [];
        for (let i = 0; i < counts.length; i++) {
            let a = counts[i];
            if (a > 1) {
                all.push(this.idxToValue(i));
            }
        }

        for (let i = 0; i < all.length-1; i++) {
            for (let j = i+1; j < all.length; j++) {
                let a = all[i];
                let b = all[j];
                list.push([a, b]);
            }
        }

        return list;
    }

    /**
     * 获得三条数组
     * @param counts
     * @return {Array}
     */
    getSantiaos(counts) {
        let list = [];
        let idxs = [];
        for (let i = 0; i < counts.length; i++) {
            let a = counts[i];
            if (a > 2) {
                idxs.push(this.idxToValue(i));
                list.push(idxs.slice());
                idxs.length = 0;
            }
        }

        return list;
    }

    /**
     * 获得顺子数组
     * @param counts
     * @return {Array}
     */
    getShunzis(counts, holds, color) {
        let list = [];
        let idxs = [];
        for (let i = 0; i < (counts.length-3); i++) {
            for (let j = i; j < i+5; j++) {
                let a = 0;
                if (j >= counts.length) {
                    if (holds[holds.length-1]%13 == 1 && holds[0]%13 == 0) {
                        a = counts[0];
                    }
                } else {
                    a = counts[j];
                }

                if (a > 0) {
                    if (j >= counts.length) {
                        idxs.push(this.idxToValue(0, color));
                    } else {
                        idxs.push(this.idxToValue(j, color));
                    }

                    if (idxs.length == 5) {
                        list.push(idxs.slice());
                        idxs.length = 0;
                        break;
                    }
                } else {
                    idxs.length = 0;
                    break;
                }
            }
        }

        return list;
    }

    /**
     * 获取所有同花
     * @param holds
     * @param colors
     * @returns {Array}
     */
    getTonghuas(holds, colors) {
        let list = [];
        let idxs = [];
        for (let i = 0; i < (colors.length-4); i++) {
            idxs.length = 0;
            let lastColor = colors[i];
            idxs.push(holds[i]);
            for (let j = i+1; j < colors.length-3; j++) {
                if (j > i+1) {
                    idxs.length = 1;
                }
                let color = colors[j];
                if (color != lastColor) {
                    continue;
                }
                idxs.push(holds[j]);
                for (let k = j+1; k < colors.length-2; k++) {
                    if (k > j+1) {
                        idxs.length = 2;
                    }
                    let color = colors[k];
                    if (color != lastColor) {
                        continue;
                    }
                    idxs.push(holds[k]);

                    for (let l = k+1; l < colors.length-1; l++) {
                        if (l > k+1) {
                            idxs.length = 3;
                        }
                        let color = colors[l];
                        if (color != lastColor) {
                            continue;
                        }
                        idxs.push(holds[l]);

                        for (let m = l+1; m < colors.length; m++) {
                            let color = colors[m];
                            if (color != lastColor) {
                                continue;
                            }
                            idxs.push(holds[m]);
                            if (idxs.length == 5) {
                                list.push(idxs.slice());
                                idxs.pop();
                            }
                        }
                    }
                }
            }
        }

        return list;
    }

    /**
     * 获得葫芦数组
     * @param counts
     * @returns {Array}
     */
    getHulus(counts) {
        let list = [];
        let san = [];
        let liang = [];
        for (let i = 0; i < counts.length; i++) {
            let a = counts[i];
            if (a > 2) {
                san.push(this.idxToValue(i));
                liang.push(this.idxToValue(i));
            } else if (a > 1) {
                liang.push(this.idxToValue(i));
            }
        }

        for (let i = 0; i < san.length; i++) {
            let idxs = [];
            idxs.push(san[i]);
            for (let j = 0; j < liang.length; j++) {
                if (idxs.indexOf(liang[j]) > -1) {
                    continue;
                }

                idxs.push(liang[j]);
                list.push(idxs.slice());
                idxs.pop();
            }
        }

        return list;
    }

    /**
     * 获得铁支数组
     * @param counts
     * @returns {Array}
     */
    getTiezhis(counts) {
        let list = [];
        let idxs = [];
        counts.forEach(function (a, idx) {
            if (a > 3) {
                idxs.push(this.idxToValue(idx));
                list.push(idxs.slice());
                idxs.length = 0;
            }
        }.bind(this));

        return list;
    }

    /**
     * 获取所有同花顺
     * @param holds
     * @returns {Array}
     */
    getTonghuashuns(holds) {
        let list = [];
        let colors = [[], [], [], []];
        for (let i = 0; i < holds.length; i++) {
            let color = this.valueToColor(holds[i]);
            if (colors[color].indexOf(holds[i]) < 0) {
                colors[color].push(holds[i]);
            }
        }

        for (let i = 0; i < colors.length; i++) {
            let colorHolds = colors[i];
            let counts = this.getEveryPokerCounts(colorHolds);
            let shunlist = this.getShunzis(counts, colorHolds, i);
            if (shunlist.length > 0) {
                list = list.concat(shunlist);
            }
        }

        return list;
    }

    /**
     * 获得五同数组
     * @param counts
     * @returns {Array}
     */
    getWutongs(counts) {
        let list = [];
        let idxs = [];
        counts.forEach(function (a, idx) {
            if (a > 4) {
                idxs.push(this.idxToValue(idx));
                list.push(idxs.slice());
                idxs.length = 0;
            }
        }.bind(this));

        return list;
    }

    /**
     * 比较两道牌的大小
     * 第一道大 返回 1 相等 返回 0 第二道大 返回 -1
     */
    compareTwoDao(dao1, dao2) {
        let types1 = this.findValues(dao1);
        let types2 = this.findValues(dao2);
        let keys1 = Object.keys(types1);
        let keys2 = Object.keys(types2);
        let type1 = 0;
        let type2 = 0;
        if (keys1.length > 0) {
            keys1.sort(function (a, b) {
                return b-a;
            });
            type1 = parseInt(keys1[0]);
        }

        if (keys2.length > 0) {
            keys2.sort(function (a, b) {
                return b-a;
            });
            type2 = parseInt(keys2[0]);
        }

        if (type1 > type2) {
            return 1;
        }

        if (type1 < type2) {
            return -1;
        }

        types1['0'] = [dao1];
        types2['0'] = [dao2];
        let list1 = types1[type1.toString()][0];
        let list2 = types2[type2.toString()][0];
        for (let i = 0; i < list1.length; i++) {
            let idx1 = this.valueToIdx(list1[i]);
            let idx2 = this.valueToIdx(list2[i]);
            if (idx1 < idx2) {
                return 1;
            }

            if (idx1 > idx2) {
                return -1;
            }
        }

        return 0;
    }

    /**
     * 牌值转idx
     * @param value
     * @return {number}
     */
    valueToIdx(value) {
        let idx = 13-value%13;
        if (idx == 13) {
            idx = 0;
        }
        return idx;
    }


    /**
     * idx转牌面值
     * @param idx
     * @return {number}
     */
    idxToValue(idx, color) {
        let value = 13-idx;
        if (value == 13) {
            value = 0;
        }
        if (color != undefined) {
            value+=(13*color);
        }

        return value;
    }

    /**
     * 牌花色
     * @param value
     * @returns {number}
     */
    valueToColor(value) {
        let color = Math.floor(value/13);
        return color;
    }

    /**
     * 获取每种牌的张数
     * @param holds
     * @return {number[]}
     */
    getEveryPokerCounts(holds) {
        let list = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        holds.forEach(function (value) {
            let idx = this.valueToIdx(value);
            list[idx]+=1;
        }.bind(this));
        return list;
    }

    /**
     * 获取每张牌的花色
     * @param holds
     * @return {number[]}
     */
    getEveryPokerColors(holds) {
        let list = [];
        for (let i = 0; i < holds.length; i++) {
            let value = holds[i];
            let color = this.valueToColor(value);
            list[i] = color;
        }

        return list;
    }
}

module.exports = sanshui_algorithm;