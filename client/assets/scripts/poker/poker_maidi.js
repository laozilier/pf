// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        pokerPrefab: {
            default: null,
            type: cc.Prefab
        },

        tipsFrames: {
            default: [],
            type: cc.SpriteFrame
        }
    },

    onLoad() {
        cc.utils.setNodeWinSize(this.node);
        this._widthMargin = this.node.width-1334;

        this._holdsNodes1 = [];
        let holdsNode1 = this.node.getChildByName('holds1');
        for (let i = 0; i < 17; i++) {
            let poker = cc.instantiate(this.pokerPrefab);
            holdsNode1.addChild(poker, i, 'poker'+i);
            this._holdsNodes1.push(poker);
            poker.active = false;
        }
        this.holdsNode1 = holdsNode1;

        this._holdsNodes2 = [];
        let holdsNode2 = this.node.getChildByName('holds2');
        for (let i = 0; i < 17; i++) {
            let poker = cc.instantiate(this.pokerPrefab);
            holdsNode2.addChild(poker, i, 'poker'+i);
            this._holdsNodes2.push(poker);
            poker.active = false;
        }
        this.holdsNode2 = holdsNode2;

        this.tipsNode = this.node.getChildByName('tips');
        this.countLab = this.node.getChildByName('countLab');
        this.zhuLab = this.node.getChildByName('zhuLab');
        this.surrenderBtn = this.node.getChildByName('surrenderBtn');
        this.maidiBtn = this.node.getChildByName('maidiBtn');

        this.clockNode = this.node.getChildByName('clock');
        this.clockFrame = this.clockNode.getComponent(cc.Sprite).spriteFrame;
    },

    reset() {
        this._holdsNodes1.forEach(el=> {
            el.active = false;
        });

        this._holdsNodes2.forEach(el=> {
            el.active = false;
        });

        this.stopClock();

        this.node.active = false;
    },

    compare(a, b) {
        //排序  主牌 排序   副牌排序   黑红梅方排序  3-0
        //大王、小王、主10、副10、主2、副2、主花色。副牌 内部的大小关系AKQJ98765
        let paipos = (value) => {
            let n_value = value;
            if(value == 52) {
                return 800;
            } else if (value == 53){
                return 900;
            }

            let t = Math.floor(value/13);
            if (value%13 == 6){
                if (t == this._algorithm.zhuType) {
                    n_value = 400;
                } else {
                    n_value = 390+t;
                }
            } else if (value%13 == 1) {
                if (t == this._algorithm.zhuType) {
                    n_value = 180;
                }else {
                    n_value = 170+t;
                }
            } else  if(value % 13 == 0){
                n_value += 13;
            }

            if(t == this._algorithm.zhuType) {
                n_value += 100;
            }

            return  n_value;
        };

        let aa =  paipos(a);
        let bb =  paipos(b);

        return bb - aa;
    },

    openMaidiNode(player_holds, alg, diLen, surrendered, maidiCb, surrenderCb) {
        this._algorithm = alg;
        this._diLen = diLen;
        this.surrenderBtn.active = !(!!surrendered);
        this._maidiCb = maidiCb;
        this._surrenderCb = surrenderCb;
        this.countLab.getComponent(cc.Label).string = '0';
        this.maidiBtn.getComponent(cc.Button).interactable = false;
        this.zhuCount = 0;
        let holds = [].concat(player_holds);
        holds.sort(this.compare.bind(this));
        this.node.active = true;
        this.tipsNode.getComponent(cc.Sprite).spriteFrame = this.tipsFrames[diLen == 8 ? 0 : 1];
        let c = Math.floor(holds.length/2);
        if (holds.length%2 > 0) {
            c+=1;
        }
        this._holds1 = holds.splice(0, c);
        this.checkHolds(this._holds1, this._holdsNodes1, this.holdsNode1);

        c = holds.length-c;
        this._holds2 = holds;
        this.checkHolds(this._holds2, this._holdsNodes2, this.holdsNode2);
        this.zhuLab.getComponent(cc.Label).string = this.zhuCount;
    },

    checkHolds(holds, holdsNodes, holdsNode) {
        let spacingX = Math.ceil(this._widthMargin/holds.length)+6*(17-holds.length)-170;
        holdsNode.getComponent(cc.Layout).spacingX = spacingX;

        holdsNodes.forEach(el=> {
            el.active = false;
        });

        for (let i = 0; i < holds.length; i++) {
            let value = holds[i];
            let poker = holdsNodes[i];
            poker.active = true;
            let poker_scr = this.pokerScript(poker);
            poker_scr.show(value);
            poker_scr.setTiqi(false, false);
            poker_scr.setCanThrow(true);
            let isZhu = this._algorithm.isAllZhu([value]);
            poker_scr.setZhu(isZhu);
            if (isZhu) {
                this.zhuCount+=1;
            }
        }
    },

    pokerScript(poker) {
        return poker.getComponent('poker');
    },

    start() {
        this.holdsNode1.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.holdsNode1.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.holdsNode1.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.holdsNode1.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        this.holdsNode2.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.holdsNode2.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.holdsNode2.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.holdsNode2.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        this.startPos = null;
        this.endPos = null;
    },

    /**
     * touch相关
     */
    onTouchStart: function (touch) {
        this._holds = undefined;
        this._holdsNode = undefined;
        this._holdsNodes = undefined;
        let target = touch.target;
        if (target.name == 'holds1') {
            this._holds = this._holds1;
            this.holdsNode = this.holdsNode1;
            this._holdsNodes = this._holdsNodes1;
        } else {
            this._holds = this._holds2;
            this.holdsNode = this.holdsNode2;
            this._holdsNodes = this._holdsNodes2;
        }
        if (!Array.isArray(this._holds)) {
            return;
        }

        this.startPos = this.holdsNode.convertTouchToNodeSpaceAR(touch);
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

            if (el.getBoundingBox().contains(this.startPos)) {
                this.pokerScript(el).setSelected(true);
                this._touchPoker = el;
                break;
            }
        }
    },

    onTouchMove: function (touch) {
        if (!Array.isArray(this._holds)) {
            return;
        }

        this.endPos = this.holdsNode.convertTouchToNodeSpaceAR(touch);
        if (Math.abs(this.endPos.x - this.startPos.x) < 20) {
            return;
        }

        this._lastPoker = this._touchPoker;
        this._moved = true;
        let boundx = !!this._touchPoker ? this._touchPoker.getBoundingBox().x : this.startPos.x;
        for (let i = this._holds.length - 1; i > -1; i--) {
            if (i >= this._holdsNodes.length) {
                continue;
            }

            let el = this._holdsNodes[i];
            if (!el.active) {
                continue;
            }

            if (!this.pokerScript(el).canThrow) {
                continue;
            }

            if (el == this._touchPoker) {
                continue;
            }

            let bound = el.getBoundingBox();
            if (this.endPos.x > this.startPos.x) {
                if (bound.x < this.endPos.x && bound.x > boundx) {
                    this.pokerScript(el).setSelected(true);
                } else {
                    this.pokerScript(el).setSelected(false);
                }
            } else {
                if ((bound.x > this.endPos.x && bound.x < boundx) || bound.contains(this.endPos)) {
                    if (!!this._lastPoker && this._lastPoker.getBoundingBox().contains(this.endPos)) {
                        this.pokerScript(el).setSelected(false);
                    } else {
                        this.pokerScript(el).setSelected(true);
                        this._lastPoker = el;
                    }
                } else {
                    this.pokerScript(el).setSelected(false);
                }
            }
        }
    },

    onTouchEnd: function (touch) {
        if (!Array.isArray(this._holds)) {
            return;
        }

        if (this._moved) {
            this._holdsNodes.forEach((el)=> {
                if (el.active && this.pokerScript(el).canThrow) {
                    if (this.pokerScript(el).isSelected) {
                        this.pokerScript(el).setTiqi(!this.pokerScript(el).isTiqi, true);
                        this.pokerScript(el).setSelected(false);
                    }
                }
            });
        } else {
            if (this._touchPoker && this.pokerScript(this._touchPoker).canThrow) {
                this.pokerScript(this._touchPoker).setTiqi(!this.pokerScript(this._touchPoker).isTiqi, true);
                this.pokerScript(this._touchPoker).setSelected(false);
            }
        }

        this._moved = false;

        let values = this.getTiqiList();
        this.maidiBtn.getComponent(cc.Button).interactable = (values.length == this._diLen);
        this.countLab.getComponent(cc.Label).string = values.length;
    },

    /**    获取选中牌的节点   */
    getTiqiList() {
        let list = [];
        this._holdsNodes1.forEach((el)=> {
            if (el.active && this.pokerScript(el).isTiqi) {
                list.push(el);
            }
        });

        this._holdsNodes2.forEach((el)=> {
            if (el.active && this.pokerScript(el).isTiqi) {
                list.push(el);
            }
        });

        let values = [];
        list.forEach(function (el) {
            values.push(this.pokerScript(el).getValue());
        }.bind(this));


        return values;
    },

    //认输
    surrenderBtnPressed(event, data) {
        cc.utils.openTips('是否确定认输?',  ()=> {
            !!this._surrenderCb && this._surrenderCb();
        }, ()=> {

        });
    },

    //扣底
    maidiBtnPressed(event, data) {
        let values = this.getTiqiList();
        !!this._maidiCb && this._maidiCb(values);
    },

    //倒计时
    showClock(show) {
        this._clockTime = 45;
        if(!!show) {
            this._clockTime = show;
        }
        this.stopClock();
        this.clockNode.active = true;
        this.schedule(this.clockCountDown, 1);
        this.clockCountDown();

    },

    stopClock() {
        this.unschedule(this.clockCountDown);
        this.clockNode.getComponent(cc.Animation).stop();
        this.clockNode.getComponent(cc.Sprite).spriteFrame = this.clockFrame;
        this.clockNode.active = false;
    },

    clockCountDown() {
        if (this._clockTime < 0) {
            this.unschedule(this.clockCountDown);
            return;
        }

        if (this._clockTime == 3) {
            this.clockNode.getComponent(cc.Animation).play('naozhong');
            cc.vv.audioMgr.playSFX("public/timeup_alarm.mp3");
        }

        this.clockNode.getChildByName('Label').getComponent(cc.Label).string = this._clockTime;
        this._clockTime -= 1;
    },
});
