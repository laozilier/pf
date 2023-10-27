/// <reference path="../../../creator.d.ts" />

cc.Class({
    extends: cc.Component,

    properties: {
        image:{
            default:null,
            type:cc.SpriteFrame
        },

        bg:{
            default:null,
            type:cc.Node
        },
        startP:cc.Vec2,
        _list:[], //节点列表
    },

    // use this for initialization
    onLoad: function () {

    },

    bgNode: function () {
        let bgnode = this.node.getChildByName('bgnode');
        if (bgnode) {
            return bgnode;
        }

        bgnode = new cc.Node('Sprite');
        let sp = bgnode.addComponent(cc.Sprite);
        sp.spriteFrame = this.bg;
        this.node.addChild(bgnode, -1, 'bgnode');
        sp.type = cc.Sprite.Type.SLICED;
        bgnode.width = 105;
        bgnode.height = 38;
        return bgnode;
    },

    setValue: function (score) {
        this.bgNode().active = true;
        this.node.getChildByName('label').getComponent(cc.Label).string = cc.utils.getScoreStr(score);
    },

    show:function(score, cb){
        this.bgNode().active = false;
        this.node.active = true;
        this.node.getChildByName('label').getComponent(cc.Label).string = "";
        this.play(score, cb);
    },
    hide:function(){
        this.node.active = false;
    },

    addSprite:function(){
        let node = new cc.Node('Sprite');
        let sp = node.addComponent(cc.Sprite);
        sp.spriteFrame = this.image;
        this.node.addChild(node, 0);
        return node;
    },

    clearAnimation: function () {
        if(this._list && this._list.length > 0){
            this._list.forEach( el => {el.destroy()});
            this._list = [];
            this.unscheduleAllCallbacks();
        }
    },

    /**
     * 开始动画
     */
    play:function(score, cb){

        let count = parseInt(score / 1000);
        if(count > 8){
            count = 10;
        } else if(count === 0){
            count = 1;
        }

        let self = this;
        let finished = cc.callFunc(() => {
            self._list.forEach(function(el) {
                el.destroy();
            }, this);
            self._list = [];
            self.bgNode().active = true;
            self.node.getChildByName('label').getComponent(cc.Label).string = cc.utils.getScoreStr(score);
            cb && cb();
        });

        for(let i = 0; i < count; ++i){
            let node = self.addSprite();
            node.x = self.startP.x;
            node.y = self.startP.y;
            self._list.push(node);
            self.scheduleOnce(()=>{
                let ac = cc.moveTo(0.25, cc.p(-28, 0));
                ac.easing(cc.easeIn(1.0));
                if(i === count-1){
                    ac = cc.sequence(ac, finished);
                }
                node.runAction(ac);
            }, 0.05*i);
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
