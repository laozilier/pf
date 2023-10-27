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
        sspokerPrefab: {
            default: null,
            type: cc.Prefab
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let tableScoreLayout = this.node.getChildByName('layout'); 
        this.tableScoreLab = tableScoreLayout.getChildByName('score');          //桌面分数
        this.reset();
    },

    start () {

    },

    reset() {
        this.tableScoreLab.getComponent('scoreAni').showNum(0, true);
    },

    showNum(num, ani) {
        this.tableScoreLab.getComponent('scoreAni').showNum(num, ani);
    },

    // update (dt) {},
});
