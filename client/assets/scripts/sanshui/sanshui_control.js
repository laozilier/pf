cc.Class({
    extends: cc.Component,
    properties: {
        holdsNode: {
            default: null,
            type: cc.Node
        },

        outsNode: {
            default: [],
            type: cc.Node
        },

        pokerPrefab: {
            default: null,
            type: cc.Prefab
        },

        maCardPrefab: {
            default: null,
            type: cc.Prefab
        },

        daoNode: {
            default: [],
            type: cc.Node
        },
        closeNode: {
            default: [],
            type: cc.Node
        },
        maNode: {
            default: null,
            type: cc.Node
        },
        specialNode: {
            default: null,
            type: cc.Node
        },
        clockNode: {
            default: null,
            type: cc.Node
        },
        renshuNode: {
            default: null,
            type: cc.Node
        },
        typeFrame: {
            default: [],
            type: cc.SpriteFrame
        },
        btnNodes: {
            default: [],
            type: cc.Node
        },
        clockFrame: {
            default: null,
            type: cc.SpriteFrame
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.utils.setNodeWinSize(this.node);
        this._holds = null;
        this._holdsNodes = [];
        this.daoType = [-1, -1, -1];
        let algorithm = require('sanshui_algorithm');
        this._algorithm = new algorithm();
        cc.sanshui_enum = require('sanshui_enum');
        this._allType = [cc.sanshui_enum.dtActType.wulong, cc.sanshui_enum.dtActType.duizi, cc.sanshui_enum.dtActType.liangdui, cc.sanshui_enum.dtActType.santiao,
            cc.sanshui_enum.dtActType.shunzi, cc.sanshui_enum.dtActType.tonghua, cc.sanshui_enum.dtActType.hulu, cc.sanshui_enum.dtActType.tonghuashun, cc.sanshui_enum.dtActType.wutong];

        this._txts = [
          'NO', 'AB', 'CA', 'DE', 'FB', 'GH', 'IJ', 'KL', 'GHF', 'MG', 'bD', 'cdIJ', 'DGH', 'PQ', 
          'DFB', 'PAR', 'MADE', 'STDE', 'UVW', 'XQ', 'XY', 'DZef', 'DGHF', 'ghij', 'VEO', 'aO'
        ];

        this.initHolds();
        this.initOuts();

    },

    start() {
        this.holdsNode.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.holdsNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.holdsNode.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.holdsNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        this.startPos = null;
        this.endPos = null;
        this._pokerW = 118;
        this._pokerH = 150;
        this._pokerLeftW = 107;
    },

    showControl(data, maCard) {
        this.node.active = true;
        this._holds = data.holds;
        this._res = [[], [], []];
        this.btnList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.onBtn = null;
        let maList = [43, 48, 39];
        this.maCard = maList[maCard - 1];
        this.resetHolds();
        this.resetDaos();
        this.showMaCard(maCard);
        this.showSpecial(data.hasSpecial);
        this.showTime(data.time);
        this.clockNode.getComponent(cc.Animation).stop();
        this.clockNode.getComponent(cc.Sprite).spriteFrame = this.clockFrame;
        this._algorithm.findValues(this._holds);
        let types = this._algorithm.findValues(this._holds);
        this.showBtn(Object.keys(types));
        this.showRenNum(data.renShu);
        // this.hiddenMa();
    },
    /**
     * 控制按钮的显示
     */
    showBtn(list) {
        for (let i = 0; i < this.btnNodes.length; ++i) {
            this.btnNodes[i].getComponent(cc.Button).interactable = false;
            if (list.indexOf((i + 1).toString()) != -1) {
                this.btnNodes[i].getComponent(cc.Button).interactable = true;
            }
        }
    },

    /**
     * 点击按钮找牌
     */
    findCard(event, data) {
        let datas = parseInt(data);
        cc.vv.audioMgr.playSFX("sanshui/bg/selectCards.mp3");
        for (let i = 0; i < this._holds.length; ++i) {
            this.holdsNode.children[i].setTiqi(false, true);
        }
        let types = this._algorithm.findValues(this._holds, datas);
        if (datas == this.onBtn) {
            this.btnList[datas] += 1;
            if (this.btnList[datas] >= types[datas].length) {
                this.btnList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            }
        } else {
            this.btnList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
        /**
         * 同花  同花顺  返回牌值 其余返回牌面值
         */
        if (datas == 5 || datas == 8) {
            console.log("同花：", types[datas][this.btnList[datas]]);
            for (let i = 0; i < types[datas][this.btnList[datas]].length; ++i) {
                let index = this._holds.indexOf(types[datas][this.btnList[datas]][i]);
                while (this._holdsNodes[index].isTiqi) {
                    index += 1;
                }
                this._holdsNodes[index].setTiqi(true, true);
            }
        } else if (datas == 4) {
            for (let i = 0; i < types[datas][this.btnList[datas]].length; ++i) {
                for (let j = 0; j < this._holds.length; ++j) {
                    if (this._holds[j] % 13 == types[datas][this.btnList[datas]][i]) {
                        this._holdsNodes[j].setTiqi(true, true);
                        break;
                    }
                }
            }
        } else if (datas == 1 || datas == 2) {
            for (let i = 0; i < types[datas][this.btnList[datas]].length; ++i) {
                console.log("i =",i);
                let num = 0;
                for (let j = 0; j < this._holds.length; ++j) {
                    if (this._holds[j] % 13 == types[datas][this.btnList[datas]][i]) {
                        this._holdsNodes[j].setTiqi(true, true);
                        num++;
                        if (num == 2) {
                            break;
                        }
                    }
                }
            }
        } else if (datas == 3) {
            for (let i = 0; i < types[datas][this.btnList[datas]].length; ++i) {
                let num = 0;
                for (let j = 0; j < this._holds.length; ++j) {
                    if (this._holds[j] % 13 == types[datas][this.btnList[datas]][i]) {
                        this._holdsNodes[j].setTiqi(true, true);
                        num++;
                        if (num == 3) {
                            break;
                        }
                    }
                }
            }
        } else if (datas == 6) {
            for (let i = 0; i < types[datas][this.btnList[datas]].length; ++i) {
                let datasNum = 3;
                if(i == 1)
                    datasNum = 2;
                let num = 0;
                for (let j = 0; j < this._holds.length; ++j) {
                    if (this._holds[j] % 13 == types[datas][this.btnList[datas]][i]) {
                        this._holdsNodes[j].setTiqi(true, true);
                        num++;
                        if (num == datasNum) {
                            console.log("num == ",num,datasNum);
                            break;
                        }
                    }
                }
            }
        } else if (datas == 7) {
            for (let i = 0; i < types[datas][this.btnList[datas]].length; ++i) {
                let num = 0;
                for (let j = 0; j < this._holds.length; ++j) {
                    if (this._holds[j] % 13 == types[datas][this.btnList[datas]][i]) {
                        this._holdsNodes[j].setTiqi(true, true);
                        num++;
                        if (num == 4) {
                            break;
                        }
                    }
                }
            }
        } else if (datas == 9) {
            for (let i = 0; i < types[datas][this.btnList[datas]].length; ++i) {
                let num = 0;
                for (let j = 0; j < this._holds.length; ++j) {
                    if (this._holds[j] % 13 == types[datas][this.btnList[datas]][i]) {
                        this._holdsNodes[j].setTiqi(true, true);
                        num++;
                        if (num == 5) {
                            break;
                        }
                    }
                }
            }
        }
        this.onBtn = datas;
    },

    /**
     * 显示马牌
     */
    showMaCard(maCard) {
        let macard = null;
        if (maCard == 0) {
            this.maNode.active = false;
            return;
        } else if (maCard == 1) {
            macard = 43;
        } else if (maCard == 2) {
            macard = 48;
        } else if (maCard == 3) {
            macard = 39;
        }
        let poker = this.maNode.children[0];
        if (poker) {
            poker.getComponent('poker').show(macard);
        }
    },

    /**
     * 显示特殊牌型按钮
     */
    showSpecial(data) {
        if (data) {
            this.specialNode.active = true;
        } else {
            this.specialNode.active = false;
        }
    },

    /**
     * 点击特殊牌型
     */
    onSpecial() {
        cc.vv.audioMgr.playButtonSound();
        let holds = [[]];
        for(let i = 0; i < 3; ++i){
            for(let j = 0; j < this._res[i].length; ++j){
                holds[0].push(this._res[i][j]);
            }
        }
        for(let k = 0; k < this._holds.length; ++k){
            holds[0].push(this._holds[k]);
        }
        this._res = [[],[],[]];
        cc.connect.send("chupai", holds);
    },

    /**
     * 倒计时
     */
    showTime(time) {
        this._clockTime = 60;
        if(time){
            this._clockTime = time;
        }
        this.schedule(this.clockCountDown, 1);
        this.clockCountDown();
    },
    stopClock() {
        this.unschedule(this.clockCountDown);
        this.clockNode.getComponent(cc.Animation).stop();
        this.clockNode.getComponent(cc.Sprite).spriteFrame = this.clockFrame;
    },

    clockCountDown() {
        if (this._clockTime < 0) {
            this.stopClock();
            this.unschedule(this.clockCountDown);
            return;
        }

        if (this._clockTime == 3) {
            cc.vv.audioMgr.playSFX("public/timeup_alarm.mp3");
            this.clockNode.getComponent(cc.Animation).play('naozhong');
        }

        this.clockNode.getChildByName('Label').getComponent(cc.Label).string = this._clockTime;
        this._clockTime -= 1;
    },

    initOuts() {
        for (let i = 0; i < this.outsNode.length; i++) {
            let max = (i == 0) ? 3 : 5;
            let daoNode = this.outsNode[i];
            for (let j = 0; j < max; j++) {
                let poker = daoNode.children[j];
                if (poker) {
                    poker.active = false;
                    poker.scale = 0.6;
                }
            }
        }
        this.hiddenMa();
    },

    initHolds() {
        this.node.getChildByName('btnNode').active = false;
        for (let i = 0; i < 13; i++) {
            let poker = cc.instantiate(this.pokerPrefab);
            if (poker) {
                poker.active = false;
                poker.y = 0;
                poker.scale = 0.6;
                this.holdsNode.addChild(poker);
                this._holdsNodes.push(poker);
            }
        }

        /**   设置选牌变色  */
        this._holdsNodes.forEach((el) => {
            el.setSelected = function (has) {
                if (this.isSelected === has) {
                    return;
                }
                if (has) {
                    this.children[0].color = cc.color(220, 220, 220, 255);
                } else {
                    this.children[0].color = cc.color(255, 255, 255, 255);
                }
                this.isSelected = has;
            };

            el.setTiqi = function (has, need) {
                if (this.isTiqi === has) {
                    return;
                }

                let y = 0;
                if (has) {
                    y = 24;
                }

                this.stopAllActions();
                if (need) {
                    this.runAction(cc.moveTo(0.1, cc.p(this.x, y)));
                } else {
                    this.y = y;
                }
                this.isTiqi = has;
            };
        });

        this.hiddenMa();
    },

    /**    获取选中牌的节点   */
    getTiqiList() {
        let list = [];

        this._holdsNodes.forEach(function (el) {
            if (el.active && el.isTiqi) {
                list.push(el);
            }
        });

        return list;
    },

    compare(a, b) {
        let aa = a % 13;
        let bb = b % 13;
        if (aa == bb) {
            return b - a;
        } else {
            return bb - aa;
        }
    },

    compareHolds(a, b) {
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
    },

    /**
     * 重置手牌
     */
    resetHolds() {
        if (!this._holds) {
            return;
        }

        this._holds.sort(this.compareHolds);
        this.checkHolds();
    },

    /**
     * 重置各道
     */
    resetDaos() {
        for (let i = 0; i < this.outsNode.length; i++) {
            let daoNode = this.outsNode[i];
            for (let j = 0; j < daoNode.children.length; j++) {
                let poker = daoNode.children[j];
                if (poker) {
                    poker.active = false;
                }
            }
            this.closeNode[i].active = false;
            this.daoNode[i].active = false;
        }
    },

    /**
     * 检查手牌
     */
    checkHolds() {
        if (!this._holds) {
            return;
        }

        this._holdsNodes.forEach(function (poker) {
            poker.active = false;
        });

        for (let i = 0; i < this._holds.length; i++) {
            let value = this._holds[i];
            let poker = this._holdsNodes[i];
            poker.active = true;
            poker.scale = 0.6;
            poker.setTiqi(false, false);
            this.pokerScript(poker).show(value);
        }
        this.hiddenMa();
        this.showMaNode(this._holds, 3);
    },

    /**
     * 获取poker脚本
     * @param poker
     * @return {cc.Component | any}
     */
    pokerScript(poker) {
        return poker.getComponent('poker');
    },

    // update (dt) {},

    /**
     * touch相关
     */
    onTouchStart: function (touch) {
        if (!this._holds) {
            return;
        }

        let len = this._holds.length;
        this.startPos = this.holdsNode.convertTouchToNodeSpace(touch);
        this.startPos.x -= this.holdsNode.width / 2;
        this.startPos.y -= this.holdsNode.height / 2;
        this._moved = false;
        this._touchPoker = null;

        for (let i = this._holds.length - 1; i > -1; i--) {
            if (i >= this._holdsNodes) {
                continue;
            }

            let el = this._holdsNodes[i];
            if (!el.active) {
                continue;
            }

            let frame = cc.rect(el.x - this._pokerW / 2, el.y - this._pokerH / 2, this._pokerW, this._pokerH);
            if (frame.contains(this.startPos)) {
                el.setSelected(true);
                this._touchPoker = el;
                break;
            }
        }
    },

    onTouchMove: function (touch) {
        if (!this._holds) {
            return;
        }

        this.endPos = this.holdsNode.convertTouchToNodeSpace(touch);
        this.endPos.x -= this.holdsNode.width / 2;
        this.endPos.y -= this.holdsNode.height / 2;

        if (Math.abs(this.endPos.x - this.startPos.x) > 20) {
            this._moved = true;
        }

        for (let i = this._holds.length - 1; i > -1; i--) {
            if (i >= this._holdsNodes) {
                continue;
            }

            let el = this._holdsNodes[i];
            if (!el.active) {
                continue;
            }

            let frame = null;
            if (i == this._holds.length - 1) {
                frame = cc.rect(el.x - this._pokerW / 2, el.y - this._pokerH / 2, this._pokerW, this._pokerH);
            } else {
                frame = cc.rect(el.x - this._pokerW / 2, el.y - this._pokerH / 2, this._pokerLeftW, this._pokerH);
            }

            if (frame.contains(this.endPos) || frame.contains(this.startPos)) {
                el.setSelected(true);
            } else {
                if (this.endPos.x < this.startPos.x) {
                    if (frame.x < this.startPos.x && frame.x > this.endPos.x) {
                        el.setSelected(true);
                    } else {
                        el.setSelected(false);
                    }
                } else {
                    if (frame.x > this.startPos.x && frame.x < this.endPos.x) {
                        el.setSelected(true);
                    } else {
                        el.setSelected(false);
                    }
                }
            }
        }
    },

    onTouchEnd: function (touch) {
        if (!this._holds) {
            return;
        }

        this.touchEnd();
    },

    touchEnd() {
        this._type = 0;
        this._typeIdx = 0;
        if (this._moved) {
            let tiqis = this.getTiqiList();
            this._holdsNodes.forEach(function (el) {
                if (el.active) {
                    if (el.isSelected) {
                        el.setTiqi(!el.isTiqi, true);
                        el.setSelected(false);
                    }
                }
            });

            if (tiqis.length == 0) {
                tiqis = this.getTiqiList();
                if (tiqis.length > 0) {
                    let values = [];
                    tiqis.forEach(function (el) {
                        values.push(this.pokerScript(el).getValue());
                    }.bind(this));
                }
            }
        } else {
            if (this._touchPoker) {
                this._touchPoker.setTiqi(!this._touchPoker.isTiqi, true);
                this._touchPoker.setSelected(false);
            }
        }

        this._moved = false;
    },

    /**
     * 显示各道
     */
    showthreeDao(event, data) {

        cc.vv.audioMgr.playSFX("sanshui/bg/selectCards.mp3");
        let list = this.getTiqiList();
        if(list.length == 0){
            return;
        }
        let idx = parseInt(data);
        let values = [];
        for (let i = 0; i < list.length; i++) {
            let poker = list[i];
            if (poker) {
                let value = this.pokerScript(poker).getValue();
                values.push(value);
            }
        }

        if (idx == 0) {
            if (list.length > 3 || this._res[0].length + list.length > 3) {
                cc.utils.openWeakTips('头道必须为3张牌');
                return;
            }

            if (this._res[0].length == 3) {
                return
            }
            for (let i = 0; i < values.length; ++i) {
                this._res[0].push(values[i]);
            }
            // this._res[0].sort(this.compareHolds);
        }

        if (idx == 1) {
            if (list.length > 5 || this._res[1].length + list.length > 5) {
                cc.utils.openWeakTips('中道必须为5张牌');
                return;
            }
            if (this._res[1].length == 5) {
                return
            }
            for (let i = 0; i < values.length; ++i) {
                this._res[1].push(values[i]);
            }
            // this._res[1].sort(this.compareHolds);
        }

        if (idx == 2) {
            if (list.length > 5 || this._res[2].length + list.length > 5) {
                cc.utils.openWeakTips('尾道必须为5张牌');
                return;
            }
            if (this._res[2].length == 5) {
                return
            }
            for (let i = 0; i < values.length; ++i) {
                this._res[2].push(values[i]);
            }
            // this._res[2].sort(this.compareHolds);
        }

        this._res[idx].sort(this.compareHolds);
        let daoNode = this.outsNode[idx];
        for (let i = 0; i < this._res[idx].length; i++) {
            let poker = daoNode.children[i];
            let value = this._res[idx][i];
            if (poker) {
                poker.active = true;
                poker.getComponent('poker').show(value);
            }

            let holdIdx = this._holds.indexOf(values[i]);
            if (holdIdx > -1) {
                this._holds.splice(holdIdx, 1);
            }
        }

        let cardType = this.getCardType(this._res[idx]);
        let daoLab = this.daoNode[idx].getComponent(cc.Label);
        daoLab.string = this.getCardTypeStr(idx, cardType);
        daoLab.node.active = true;

        //判断中道不能大于尾道  头道不能大于中道
        this.daoType[idx] = this.getCardType(values);

        this.closeNode[idx].active = true;

        let types = this._algorithm.findValues(this._holds);
        this.showBtn(Object.keys(types));

        //自动将剩余的一手摆上去  当两组牌满了  将剩下的牌放到剩下的那一组
        if (this._res[0].length == 3 && this._res[1].length == 5 || this._res[0].length == 3 && this._res[2].length == 5 || this._res[1].length == 5 && this._res[2].length == 5) {
            let daoNum = this._res[0].length == 3 && this._res[1].length == 5 ? 2 : (this._res[0].length == 3 && this._res[2].length == 5 ? 1 : (this._res[1].length == 5 && this._res[2].length == 5 ? 0 : null))
            let lastCard = this._holds;
            if (daoNum != null) {
                for (let i = 0; i < this._holds.length; ++i) {
                    this._res[daoNum].push(this._holds[i]);
                }
                this._res[daoNum].sort(this.compareHolds);
                for (let i = 0; i < this._res[daoNum].length; i++) {
                    let poker = this.outsNode[daoNum].children[i];
                    let value = this._res[daoNum][i];
                    if (poker) {
                        poker.active = true;
                        poker.getComponent('poker').show(value);
                    }
                }
                this._holds = [];
                this.daoNode[daoNum].getComponent(cc.Label).string = this.getCardTypeStr(daoNum, this.getCardType(lastCard));
                this.daoNode[daoNum].active = true;
                this.closeNode[daoNum].active = true;

                let lastType = this._algorithm.findValues(this._holds);
                this.showBtn(Object.keys(lastType));
            }
        }
        this.resetHolds();
        this.node.getChildByName('btnNode').active = this._holds.length == 0;

        this.hiddenMa();
        let maNum = this.findMa();
        let lists = this.findList(maNum);
        this.showMaNode(lists, maNum);
    },

    getCardTypeStr(idx, cardType) {
        let str = '';
        if (idx == 0 && cardType == 3) {
            str = this._txts[10];
        } else if (idx == 1 && cardType == 6) {
            str = this._txts[11];
        } else {
            str = this._txts[cardType];
        }

        return str;
    },

    /**
     * 删除各道
     */
    closethreeDao(event, data) {
        cc.vv.audioMgr.playSFX("sanshui/bg/selectCards.mp3");
        let tiqiList = this.setKeepTiqi();
        let idx = parseInt(data);
        let values = this._res[idx];
        if (values.length == 0) {
            this.daoNode[data].active = false;
            this.closeNode[idx].active = false;
            return;
        }

        let daoNode = this.outsNode[idx];
        for (let i = 0; i < values.length; i++) {
            let poker = daoNode.children[i];
            if (!!poker) {
                poker.active = false;
            }
            let value = values[i];
            this._holds.push(value);
        }
        this.node.getChildByName('btnNode').active = this._holds.length == 0;
        let types = this._algorithm.findValues(this._holds);
        this.showBtn(Object.keys(types));

        this._res[idx] = [];
        this.resetHolds();
        this.daoType[data] = -1;
        this.daoNode[data].active = false;
        this.closeNode[idx].active = false;

        this.hiddenMa();
        let maNum = this.findMa();
        let list = this.findList(maNum);
        this.showMaNode(list, maNum);
        this.getIndex(tiqiList);
    },

    /**
     * 获取牌的类型
     */
    getCardType(list) {
        let types = this._algorithm.findValues(list);
        let keys = Object.keys(types);
        if (keys.length > 0) {
            keys.sort(function (a, b) {
                return b-a;
            });
            return parseInt(keys[0]);
        } else {
            return 0;
        }
    },

    /**
     * 确定出牌
     */
    onTrue() {
        cc.vv.audioMgr.playButtonSound();
        this.stopClock();
        cc.connect.send('chupai', this._res);
    },

    /**
     * 全部取消
     */
    onCancel() {
        cc.vv.audioMgr.playSFX("sanshui/bg/selectCards.mp3");
        for (let i = 0; i < 3; ++i) {
            for (let j = 0; j < this._res[i].length; j++) {
                let poker = this.outsNode[i].children[j];
                if (!!poker) {
                    poker.active = false;
                }

                let value = this._res[i][j];
                this._holds.push(value);
            }

            this.daoType[i] = -1;
            this.daoNode[i].active = false;
            this.closeNode[i].active = false;
        }

        this._res = [[], [], []];
        this.resetHolds();

        let types = this._algorithm.findValues(this._holds);
        this.showBtn(Object.keys(types));

        this.hiddenMa();
        let maNum = this.findMa();
        let list = this.findList(maNum);
        this.showMaNode(list, maNum);
    },
    onDaoCard(event, data) {
        let tiqiList = this.setKeepTiqi();
        let daoNum = Math.floor(parseInt(data) / 10);
        this._res[daoNum].sort(this.compareHolds);
        let cardNum = data % 10;
        let cardValue = this._res[daoNum][cardNum];
        this._res[daoNum].splice(cardNum, 1);
        this._res[daoNum].sort(this.compareHolds);

        for (let i = 0; i < this.outsNode[daoNum].children.length; ++i) {
            this.outsNode[daoNum].children[i].active = false;
        }
        for (let i = 0; i < this._res[daoNum].length; i++) {
            let poker = this.outsNode[daoNum].children[i];
            let value = this._res[daoNum][i];
            if (poker) {
                poker.active = true;
                poker.getComponent('poker').show(value);
            }
        }

        this._holds.push(cardValue);
        this._holds.sort(this.compareHolds);
        this.resetHolds();
        this.node.getChildByName('btnNode').active = this._holds.length == 0;
        let types = this._algorithm.findValues(this._holds);
        this.showBtn(Object.keys(types));
        let maNum = this.findMa();
        let list = this.findList(maNum);
        this.showMaNode(list, maNum);
        this.getIndex(tiqiList);
    },
    /**
     * 点击桌面  所有牌y值为0  settiqi（false）
     */
    /**  桌面点击事件 **/
    onTable() {
        let time = Date.now();
        if (!!this._onTableTime) {
            if (time - this._onTableTime < 800) {
                this._onTableNum += 1;
            } else {
                this._onTableNum = 0;
                this._onTableTime = 0;
            }
        } else {
            this._onTableTime = time;
            this._onTableNum = 1;
        }

        if (this._onTableNum === 2) {
            for (let i = 0; i < this._holds.length; ++i) {
                this.holdsNode.children[i].setTiqi(false, true);
            }
            this._onTableNum = 0;
            this._onTableTime = 0;
        }
    },

    /**
     * 在牌面上显示马牌
     */
    showMaNode(data, num) {
        data.sort(this.compareHolds);
        let index = data.indexOf(this.maCard);
        if (index != -1) {
            switch (num) {
                case 0:
                case 1:
                case 2: {
                    let maNode = this.outsNode[num].children[index].getChildByName('maNode');
                    if (!maNode) {
                        maNode = cc.instantiate(this.maCardPrefab);
                        this.outsNode[num].children[index].addChild(maNode, 1, "maNode");
                    } else {
                        maNode.active = true;
                    }
                    maNode.scale = 2;
                    maNode.y = -78;
                    maNode.x = -57;
                }
                    break;

                case 3: {
                    let maNode = this.holdsNode.children[index].getChildByName('maNode');
                    if (!maNode) {
                        maNode = cc.instantiate(this.maCardPrefab);
                        this.holdsNode.children[index].addChild(maNode, 1, "maNode");
                    } else {
                        maNode.active = true;
                    }
                    maNode.scale = 2;
                    maNode.y = -78;
                    maNode.x = -57;
                }

                    break;
            }
        }

    },

    /**
     * 隐藏马牌
     */
    hiddenMa() {
        for (let i = 0; i < 3; ++i) {
            let nodeNum = i == 0 ? 3 : 5;
            for (let j = 0; j < nodeNum; ++j) {
                let maNode = this.outsNode[i].children[j].getChildByName('maNode');
                if (maNode) {
                    maNode.active = false;
                }
            }
        }

        for (let k = 0; k < this._holdsNodes.length; ++k) {
            let maNode = this._holdsNodes[k].getChildByName('maNode');
            if (maNode) {
                maNode.active = false;
            }
        }
    },

    /**
     * 找马牌在哪
     */
    findMa() {
        let maKey = -1;
        for (let i = 0; i < 3; ++i) {
            let index = this._res[i].indexOf(this.maCard);
            if (index != -1) {
                maKey = i;
            }
        }
        let indexH = this._holds.indexOf(this.maCard);
        if (indexH != -1) {
            maKey = 3;
        }
        return maKey;
    },

    /**
     * 通过马牌返回数组
     */
    findList(data) {
        let resList = [];
        if (data == -1) {
            return resList;
        }
        if (data != 3) {
            resList = this._res[data];
        } else if (data == 3) {
            resList = this._holds;
        }
        return resList;
    },

    /**
     * 显示玩家人数
     */
    showRenNum(data){
        this.renshuNode.getChildByName('numLabel').getComponent(cc.Label).string = data;
    },

    /**
     *  获取提起节点
     */
    setKeepTiqi(){
      let tiqiList = this.getTiqiList();
      let values = [];
      for (let i = 0; i < tiqiList.length; i++) {
          let poker = tiqiList[i];
          if (poker) {
              let value = this.pokerScript(poker).getValue();
              values.push(value);
          }
      }
      return values;
    },

    getIndex(data){
        for(let i = 0; i < data.length; ++i) {
            let value = data[i];
            for (let j = 0; j < this._holdsNodes.length; j++) {
                let poker = this._holdsNodes[j];
                if (poker.isTiqi) {
                    continue;
                }

                if (poker.getComponent('poker').getValue() == value) {
                    poker.setTiqi(true,false);
                }
            }
        }
    },
});
