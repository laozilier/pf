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
        btns: {
            default: [],
            type: cc.Node
        },

        labs: {
            default: [],
            type: cc.Node
        },

        titleFrames: {
            default: [],
            type: cc.SpriteFrame
        }
    },

    onLoad () {
        this.bg = this.node.getChildByName('bg');
        this.nt = this.bg.getChildByName('nt');
        this.surrenderBtn = this.node.getChildByName('surrender');
        this.giveupBtn = this.node.getChildByName('giveup');
        this.titleNode = this.bg.getChildByName('title');
        this.cardsArr = [0, 0, 0, 0, 0];
        this.wangs = [];
        this.zhu_s = [];
        this.zhu = 9;
    },

    start () {

    },

    reset(hide=false) {
        this.cardsArr = [0, 0, 0, 0, 0];
        this.node.active = hide;
    },

    checkHolds(holds) {
        if (!this.node.active) {
            return;
        }

        this.reset(true);

        for (let i = 0; i < holds.length; i++) {
            let t = 0;
            let v = holds[i];
            /** 去掉王 10 2 */
            if (v < 52 && v%13 != 1 && v%13 != this.zhu) {
                t = Math.floor(v/13);
            } else {
                t = 4;
            }
            this.cardsArr[t]+=1;
        }

        
        for (let i = 0; i < this.cardsArr.length; i++) {
            let len = this.cardsArr[i];
            let lab = this.labs[i];
            lab.getComponent(cc.Label).string = len;
        }
    },

    //刷新牌数据
    upCardsCount(v) {
        if (!this.node.active) {
            return;
        }

        if (typeof v == 'number') {
            /** 去掉王 10 2 */
            let t = 0;
            if (v < 52 && v%13 != 1 && v%13 != this.zhu) {
                t = Math.floor(v/13);
            } else {
                t = 4;
            }

            this.cardsArr[t]+=1;
            let len = this.cardsArr[t];
            let lab = this.labs[t];
            lab.getComponent(cc.Label).string = len;
        }
    },

    upSbfBtns(data, cb) {
        this.node.active = true;
        this.bg.width = 800;
        this.nt.active = true;
        this.surrenderBtn.active = false;
        this.giveupBtn.active = false;
        this.wangs = data[1];
        this.zhu_s = data[0];
        this.titleNode.getComponent(cc.Sprite).spriteFrame = this.titleFrames[0];
        this._cb = cb;
        this.btns.forEach(el => {
            el.active = false;
        });

        if (Array.isArray(this.zhu_s) && this.zhu_s.length > 0) {
            for (let i = 0; i < this.zhu_s.length; i++) {
                let v = this.zhu_s[i];
                let t = Math.floor(v/13);
                let btn = this.btns[t];
                !!btn && (btn.active = true);
            }
        }

        if (Array.isArray(this.wangs) && this.wangs.length > 0) {
            let btn = this.btns[4];
            !!btn && (btn.active = true);
        }
    },

    upSdhBtns(surrendered, cb, surrenderCb) {
        this.node.active = true;
        this.bg.width = 800;
        this.nt.active = true;
        this.surrenderBtn.active = !(!!surrendered);
        this.giveupBtn.active = false;
        this.zhu = 6;
        this.titleNode.getComponent(cc.Sprite).spriteFrame = this.titleFrames[1];
        this._cb = cb;
        this._surrenderCb = surrenderCb;
        for (let i = 0; i < this.btns.length; i++) {
            let btn = this.btns[i];
            !!btn && (btn.active = true);
            let lab = this.labs[i];
            !!lab && (lab.active = true);
        }
    },

    upSdhLiushouBtns(zhuType, cb) {
        this.node.active = true;
        this.bg.width = 645;
        this.nt.active = false;
        this.surrenderBtn.active = false;
        this.giveupBtn.active = true;
        this.zhu = 6;
        this.titleNode.getComponent(cc.Sprite).spriteFrame = this.titleFrames[2];
        this._cb = cb;
        this.btns.forEach(el => {
            el.active = false;
        });

        this.labs.forEach(el => {
            el.active = false;
        });

        for (let i = 0; i < 4; i++) {
            let lab = this.labs[i];
            !!lab && (lab.active = true);
            if (i == zhuType) {
                continue;
            }

            let btn = this.btns[i];
            !!btn && (btn.active = true);
        }
    },

    upBashiBtns(zhu_s, cb) {
        this.bg.width = 645;
        this.nt.active = false;
        this.node.active = true;
        this.zhu_s = zhu_s;
        this._cb = cb;
        this.btns.forEach(el => {
            el.active = false;
        });

        this.labs.forEach((el, idx) => {
            el.active = idx < 4;
        });

        if (Array.isArray(this.zhu_s) && this.zhu_s.length > 0) {
            for (let i = 0; i < this.zhu_s.length; i++) {
                let v = this.zhu_s[i];
                let t = Math.floor(v/13);
                let btn = this.btns[t];
                !!btn && (btn.active = true);
            }
        }
    },

    liangzhuBtnPressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        if (!!this._cb) {
            let idx = parseInt(data);
            if (idx < 0) {
                if (this.wangs.length > 0) {
                    this._cb(this.wangs[0]);
                } else {
                    this._cb(-1);
                }
            } else {
                let v = idx*13+this.zhu;
                if (this.zhu_s.includes(v)) {
                    this._cb([v]);
                } else {
                    this._cb(idx);
                }
            }
        }
    },

    surrenderBtnPressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        if (!!this._surrenderCb) {
            this._surrenderCb();
        }
    },

    giveupBtnPressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        if (!!this._cb) {
            this._cb(-1);
        }
    },
});
