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
        bottomToggle: {
            default: null,
            type: cc.Node,
        },

        bottomToggles: {
            default: null,
            type: cc.Node,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._pageIdx = 1;
        this._totalPage = 0;
        this._max = 5;
    },

    start () {

    },

    // update (dt) {},

    resetBottom() {
        this._cb = undefined;
        this._pageIdx = 1;
        this._totalPage = 0;
        this.bottomToggles.children.forEach((el) => {
            el.active = false;
        });

        this.node.active = false;
    },

    checkBottom(totalPage, cb, max) {
        this.bottomToggles.children.forEach((el) => {
            el.active = false;
        });

        !!cb && (this._cb = cb);
        !!totalPage && (this._totalPage = totalPage);
        !!max && (this._max = max);
        
        if (this._totalPage < 1) {
            return;
        }

        //2
        
        this.node.active = true;
        let a = Math.ceil((this._max-1)/2);
        let start = this._pageIdx-a;
        start = Math.max(1, start);
        let end = this._pageIdx+a;
        end = Math.min(end, this._totalPage);

        let c = 0;
        for (let i = start; i <= end; i++) {
            let toggle = this.bottomToggles.getChildByName('toggle'+c);
            if (!toggle) {
                toggle = cc.instantiate(this.bottomToggle);
                this.bottomToggles.addChild(toggle, c, 'toggle'+c);
                console.log('addChild: start = ', start, 'end = ', end);
            }
            toggle.active = true;;
            toggle.tag = i;
            let str = i.toString();
            toggle.getComponent(cc.Toggle).isChecked = (i == this._pageIdx);
            let lab1 = toggle.getChildByName('Background').getChildByName('Label');
            lab1.getComponent(cc.Label).string = str;
            lab1.getChildByName('Label').getComponent(cc.Label).string = str;
            let lab2 = toggle.getChildByName('checkmark').getChildByName('Label');
            lab2.getComponent(cc.Label).string = str;
            lab2.getChildByName('Label').getComponent(cc.Label).string = str;

            toggle.getComponent(cc.Toggle).checkEvents[0].customEventData = str;
            c+=1;
        }
    },

    onLastBtnPressed() {
        if (this._pageIdx <= 1) {
            return;
        }

        this._pageIdx-=1;
        this.checkBottom();
        !!this._cb && this._cb(this._pageIdx);
    },

    pageTogglePressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        let tag = parseInt(data);
        if (this._pageIdx == tag) {
            return;
        }

        this._pageIdx = tag;
        !!this._cb && this._cb(this._pageIdx);
    },

    onNextBtnPressed() {
        if (this._pageIdx >= this._totalPage) {
            return;
        }

        this._pageIdx+=1;
        this.checkBottom();
        !!this._cb && this._cb(this._pageIdx);
    },

    onABtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        if (this._pageIdx <= 1) {
            return;
        }

        this._pageIdx = 1;
        this.checkBottom();
        !!this._cb && this._cb(this._pageIdx);
    },

    onBBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        if (this._pageIdx >= this._totalPage) {
            return;
        }

        this._pageIdx = this._totalPage;
        this.checkBottom();
        !!this._cb && this._cb(this._pageIdx);
    },
});
