cc.Class({
    extends: cc.Component,

    properties: {
        image:{
            default:null,
            type:cc.SpriteFrame,
            displayName:"金币图片资源"
        }, 

        ball: {
            default:null,
            type:cc.SpriteFrame,
        }
    },

    // use this for initialization
    onLoad: function () {
        
        
    },

    addSprite:function(isball) {
        let node = new cc.Node('Sprite');
        let sp = node.addComponent(cc.Sprite);
        sp.spriteFrame = isball ? this.ball : this.image;
        node.parent = this.node;
        return node;
    },

    flyGolds(sp, ep, back, cb, isball) {
        if (!back) {
            let self = this;
            for(let k = 0; k < 2; ++k){
                for(let i = 0; i < 15; ++i) {
                    let node = this.addSprite(isball);
                    node.scale =  0.5;
                    node.x = self.getRandom(sp.x - 20, sp.x + 20);
                    node.y = self.getRandom(sp.y - 20, sp.y + 20);
                    node.opacity = 0;
                    let delayac = cc.delayTime(0.02*i);
                    let opacityac = cc.fadeTo(0.1, 255);
                    let ac = cc.moveTo(self.getRandom(2, 4) / 10, cc.p(
                        self.getRandom(ep.x - 20, ep.x + 20),
                        self.getRandom(ep.y - 20, ep.y + 20)));
                    ac.easing(cc.easeIn(1.0));
                    let spawn = cc.spawn(opacityac, ac);
                    ac = cc.sequence(delayac, spawn, cc.removeSelf());
                    node.runAction(ac);
                }
            }
            
            if (!!cb) {
                this.scheduleOnce(cb, 0.6);
            }
        } else {
            !!cb && cb();
        }

        cc.vv.audioMgr.playSFX("public/chipfly.mp3");
    },

    /**
     * 随机一个数字
     * @param min 从min开始
     * @param max 到max结束，不包括max
     * @returns {*}
     */
    getRandom : function(min, max) {
        if(isNaN(min) || isNaN(max))return 0;
        if(min >= max) return min;
        return parseInt(Math.random() * (max-min) + min);

    },

    /**
     * 清除动画
     */
    clearAnimation: function () {
        this.unscheduleAllCallbacks();
        this.node.children.forEach( el => {
            el.stopAllActions();
            el.removeFromParent();
        });
    }



    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
