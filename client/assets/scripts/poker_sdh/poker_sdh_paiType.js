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

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.oriy = this.node.y;
        this.tuolaji = this.node.getChildByName('tuolaji');
        this.shuaipai = this.node.getChildByName('shuaipai');
    },

    start () {

    },

    // update (dt) {},

    reset() {
        if (this.tuolaji) { this.tuolaji.active = false; this.tuolaji.getComponent(cc.Animation).stop() };
        if (this.shuaipai) { this.shuaipai.active = false; this.shuaipai.getComponent(cc.Animation).stop() };
        this.node.active = false;
    },

    checkType(type) {
        this.reset();
        if (type != 3 && type != 4) { return; }
        this.node.active = true;
        if (type == 3) {
            this.tuolaji.active = true;
            this.tuolaji.getComponent(cc.Animation).play("tuolaji");
        } else {
            cc.vv.audioMgr.playSFX("public/shuaipai.wav");
            this.shuaipai.active = true;
            this.shuaipai.getComponent(cc.Animation).play("shuaipai");
        }
    },
});
