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
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    showScore(score, half) {
        this.node.active = true;
        this.node.stopAllActions();
        this.node.opacity = 255;
        let win = this.node.getChildByName('win');
        let lose = this.node.getChildByName('lose');
        if (score < 0) {
            win.active = false;
            lose.active = true;
            lose.getComponent('scoreAni').showResNum(score, false);
        } else {
            win.active = true;
            win.getComponent('scoreAni').showResNum(score, false);
            lose.active = false;
        }

        if (half) {
            this.node.runAction(cc.sequence(cc.delayTime(1), cc.fadeTo(0.5, 0)));
        }
    },

    showSangongScore(score, c) {
        this.node.active = true;
        this.node.stopAllActions();
        this.node.opacity = 255;
        let win = this.node.getChildByName('win');
        let lose = this.node.getChildByName('lose');
        if (c > 0) {
            if (score < 0) {
                let lose2 = this.node.getChildByName('lose2');
                if (!lose2) {
                    lose2 = cc.instantiate(lose);
                    this.node.addChild(lose2, 0, 'lose2');
                }
                lose2.active = true;
                lose2.getComponent('scoreAni').showResNum(score, false);
            } else {
                let win2 = this.node.getChildByName('win2');
                if (!win2) {
                    win2 = cc.instantiate(win);
                    this.node.addChild(win2, 0, 'win2');
                }
                win2.active = true;
                win2.getComponent('scoreAni').showResNum(score, false);
            }
        } else {
            let win2 = this.node.getChildByName('win2');
            !!win2 && (win2.active = false);
            let lose2 = this.node.getChildByName('lose2');
            !!lose2 && (lose2.active = false);
            if (score < 0) {
                win.active = false;
                lose.active = true;
                lose.getComponent('scoreAni').showResNum(score, false);
            } else {
                win.active = true;
                win.getComponent('scoreAni').showResNum(score, false);
                lose.active = false;
            }
        }
    },

});
