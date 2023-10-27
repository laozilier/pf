cc.Class({
    extends: cc.Component,

    properties: {
        loadingNode:{
            default:null,
            type:cc.Node,
        },
    },
    
    onLoad: function () {
        cc.utils.setNodeWinSize(this.node);
    },

    /**
     * 显示加载框
     */
    showLayoutWin () {
        this.node.active = true;
        this.loadingNode.runAction(cc.repeatForever(cc.rotateBy(0.8, 360)));
    },

    hideLayoutWin() {
        this.loadingNode.stopAllActions();
        this.node.active = false;
    },
});
