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
        items: {
            default: [],
            type: cc.Node
        },

        resProp: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._maxRound = 22;
        this._needEnd = 18;
        this._idx = 0;
        this._time = 0.2;
        this._round = 0;
        this._frameIdxs = [
            '无', '西瓜', '葡萄\nx2', '苹果', '橘子', 
            '777', '铃铛\nx2', '无', '苹果', '葡萄\nx2', 
            '西瓜\nx2', '星星', '铃铛', '葡萄', '苹果', 
            '橘子', 'BAR\nBAR', '星星\nx2', '橘子\nx2', '苹果',
            '葡萄', '铃铛\nx2', 
        ];

        this.resProp.active = false;
    },

    start () {

    },

    hideResProp() {
        let red = this.resProp.getChildByName('red');
        red.stopAllActions();
        red.active = false;
        this.resProp.active = false;
    },

    startRound(data) {
        this.unscheduleAllCallbacks();
        this._endIdx = data.idx;
        this._time = 0.2;
        this._round = 0;
        this._needEndIdx = -1;
        this._needStop = false;
        let red = this.resProp.getChildByName('red');
        red.stopAllActions();
        red.active = false;
        this.resProp.active = false;
        this.nextRound();
    },

    nextRound() {
        if (this._idx >= this.items.length) {
            this._idx = 0;
            this._round += 1;
        }

        let item = this.items[this._idx];
        let redNode = item.getChildByName('red');
        redNode.active = true;
        redNode.stopAllActions();
        redNode.opacity = 255;
        if (this._idx == this._needEndIdx) {
            this._needStop = true;
        }

        if (this._needStop && this._idx == this._endIdx) {
            this.resProp.active = true;
            let resStr = this._frameIdxs[this._endIdx];
            let resLab = this.resProp.getChildByName('tips');
            let red = this.resProp.getChildByName('red');
            resLab.getComponent(cc.Label).string = this._frameIdxs[this._endIdx];
            if (resStr.indexOf('\n')) {
                resLab.getComponent(cc.Label).fontSize = 30;
                resLab.getComponent(cc.Label).lineHeight = 36;
            } else {
                resLab.getComponent(cc.Label).fontSize = 40;
                resLab.getComponent(cc.Label).lineHeight = 48;
            }
            red.active = true;
            red.runAction(cc.repeatForever(
                cc.sequence(
                    cc.fadeTo(0.2, 0),
                    cc.fadeTo(0.2, 255),
                )
            ));
            return;
        }

        redNode.runAction(cc.fadeTo(this._time+0.2, 0));
        if (this._round >= 8 && this._needEndIdx < 0) {
            this._needEndIdx = this._endIdx-this._needEnd;
            if (this._needEndIdx < 0) {
                this._needEndIdx+=this._maxRound;
            }
        }
        this.scheduleOnce(()=> {
            this._idx+=1;
            if (this._needStop) {
                this._time+=0.03;
            } else {
                this._time-=0.01;
                this._time = Math.max(this._time, 0.01);
            }
            
            this.nextRound();
        }, this._time);
    }

    // update (dt) {},
});
