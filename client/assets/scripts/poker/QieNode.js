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
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.sprsNode = this.node.getChildByName('sprs');
        this.spr = this.sprsNode.getChildByName('spr');
        cc.utils.addClickEvent(this.spr, this, 'QieNode', 'onQieSprPressed', '0');
        this.sprs = [this.spr];
        this.qieLab = this.node.getChildByName('lab');
    },

    start () {

    },

    openQieNode(uid, str, time, cb, max) {
        this._uid = uid;
        this._max = max || 82;
        this.node.active = true;
        this._cb = cb;
        for (let i = 1; i < this._max; i++) {
            if (i >= this.sprs.length) {
                let spr = cc.instantiate(this.spr);
                this.sprsNode.addChild(spr);
                this.sprs.push(spr);
                spr.getComponent(cc.Button).clickEvents[0].customEventData = i.toString();
            }
        }

        let margin = 160/(this._max-1);
        for (let i = 0; i < this._max; i++) {
            let spr = this.sprs[i];
            spr.active = true;
            spr.rotation = -80;
            spr.zIndex = i;
            let r = -80.0+(i*margin);
            spr.runAction(cc.rotateTo(0.4, r));
        }

        this.qieLab.active = true;
        this._str = str || '';
        this._time = time;
        this.qieCountDown();
        this.schedule(this.qieCountDown, 1);
    },

    /**
     * 切了哪张牌
     * @param value
     */
    qieValue(value, v) {
        cc.vv.audioMgr.playSFX("public/fapai.mp3");
        let self = this;
        for (let i = 0; i <= value; i++) {
            let spr = this.sprs[i];
            if (!!spr) {
                if (i == value && typeof v == 'number' && v >= 0) {
                    let poker = cc.instantiate(this.pokerPrefab);
                    poker.y = 510;
                    poker.scale = 1;
                    spr.addChild(poker);
                    poker.getComponent('poker').show(v);
                    spr.zIndex = 999;
                }

                let r = -80;
                spr.runAction(cc.sequence(cc.rotateTo(0.4, r).easing(cc.easeInOut(3)), cc.callFunc(function () {
                    if (i == value && typeof v == 'number' && v >= 0) {} else {
                        spr.zIndex = i + self._max;
                        if (i != 0) {
                            spr.active = false;
                        }
                    }
                }, this), cc.rotateTo(0.4, 0)));
            }
        }

        for (let i = (value + 1); i < this._max; i++) {
            let spr = this.sprs[i];
            if (!!spr) {
                let r = 80;
                spr.runAction(cc.sequence(cc.rotateTo(0.4, r).easing(cc.easeInOut(3)), cc.callFunc(function () {
                    if (i != self._max-1) {
                        spr.active = false;
                    }
                }, this), cc.rotateTo(0.4, 0)));
            }
        }
        this.scheduleOnce(function () {
            cc.vv.audioMgr.playSFX("public/fapai.mp3");
            
        },0.5);
    },

    closeQieNode() {
        if(this.node.active) {
            this.unscheduleAllCallbacks();
            this.sprs.forEach(el => {
                el.stopAllActions();
                el.removeAllChildren();
                el.active = false;
            });
            this.stopQieCountDown();
            this.node.active = false;
        }
    },

    /**
     * 停止切牌倒计时
     */
    stopQieCountDown() {
        this.qieLab.active = false;
        this.unschedule(this.qieCountDown);
    },

    /**
     * 切牌倒计时
     */
    qieCountDown() {
        if (this._time < 0) {
            this.unschedule(this.qieCountDown);
            return;
        }
        
        let tips = this.qieLab.getComponent(cc.Label);
        tips.string = this._str+this._time;

        this._time -= 1;
    },

    onQieSprPressed(event, data) {
        if (this._uid != cc.dm.user.uid) {
            return;
        }
        let v = parseInt(data);
        if (!!this._cb) {
            this.stopQieCountDown();
            this._cb(v);
        }
    },

    // update (dt) {},
});
