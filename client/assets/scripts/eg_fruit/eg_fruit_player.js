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
    extends: require('../games/Game_player'),

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._super();

    },

    /**
     * 设置游戏数据  断线重连后
     * @param data
     */
    set(data) {
        if (!this.node.active ) {
            return;
        }
        
    },

    gameBegin() {
        this._super();
    },

    /**
     * 重置所有节点
     */
    resetNodes() {
        if (!this.node.active) {
            return;
        }

        this._super();
        this.resetStatus();
    },

    resetStatus() {
    },


    /**
     * 播放声音
     * @param type
     * @param values
     */
    playSound(data, value) {
        
    },

    gameOver() {

    },
});
