/// <reference path="../../../creator.d.ts" />

cc.Class({
    extends: cc.Component,

    properties: {
        image:{
            default:null,
            type:cc.SpriteFrame,
            displayName:"金币图片资源"
        },

        ball:{
            default:null,
            type:cc.SpriteFrame,
            displayName:"足球图片资源"
        },

        bg:{
            default:null,
            type:cc.Node
        },

        numLab:{
            default:null,
            type:cc.Node
        },

        startP:cc.Vec2,
    },

    // use this for initialization
    onLoad: function () {
        this._score = -1;
        this._ball = false;
    },

    setValue: function (score) {
        this.node.active = true;
        this.bg.active = true;
        let str = cc.utils.getScoreStr(score);
        str = str.replace('千', 'A');
        str = str.replace('万', 'B');
        this.numLab.getComponent(cc.Label).string = str;
    },

    show:function(score, cb, ball) {
        this._ball = (ball == undefined ? false : ball);
        if (this._ball) {
            if (this._ballList == undefined) {
                this._ballList = [];
                for (let i = 0; i < 12; i++) {
                    let node = this.addSprite(true);
                    node.x = this.startP.x;
                    node.y = this.startP.y;
                    node.active = false;
                    this._ballList.push(node);
                }
            }
        } else {
            if (this._goldList == undefined) {
                this._goldList = [];
                for (let i = 0; i < 12; i++) {
                    let node = this.addSprite(false);
                    node.x = this.startP.x;
                    node.y = this.startP.y;
                    node.active = false;
                    this._goldList.push(node);
                }
            }
        }

        if (this._score > 0) {
            this._score += score;
        } else {
            this.bg.active = false;
            this.node.active = true;
            this.numLab.getComponent(cc.Label).string = '';
            this._score = score;
        }
        
        this.play(score, cb);
    },

    reset:function() {
        this.clearAnimation();
        this.bg.active = false;
        this.node.active = false;
        this._score = -1;
        this._ball = false;
        let iconNode = this.bg.getChildByName('iconNode');
        if (!!iconNode) {
            let ballNode = iconNode.getChildByName('ball');
            ballNode.active = false;
        }
    },

    addSprite:function(ball) {
        let node = new cc.Node('Sprite');
        let sp = node.addComponent(cc.Sprite);
        sp.spriteFrame = ball ? this.ball : this.image;
        this.node.addChild(node, 0);
        return node;
    },

    clearAnimation: function () {
        this.unscheduleAllCallbacks();
        !!this._ballList && this._ballList.forEach( el => {
            el.stopAllActions();
            el.active = false;
        });

        !!this._goldList && this._goldList.forEach( el => {
            el.stopAllActions();
            el.active = false;
        });
    },

    /**
     * 开始动画
     */
    play:function(score) {
        let count = parseInt(score / 1000);
        if(count > 8){
            count = 10;
        } else if(count === 0){
            count = 1;
        }

        let self = this;
        let finished = (() => {
            self.bg.active = true;
            if (self._ball) {
                let iconNode = self.bg.getChildByName('iconNode');
                if (!!iconNode) {
                    let ballNode = iconNode.getChildByName('ball');
                    ballNode.active = true;
                }
            }
            
            let str = cc.utils.getScoreStr(score);
            str = str.replace('千', 'A');
            str = str.replace('万', 'B');
            self.numLab.getComponent(cc.Label).string = str;
        });

        for(let i = 0; i < count; ++i) {
            let node = this._ball ? this._ballList[i] : this._goldList[i];
            node.active = true;
            node.opacity = 255;
            node.x = this.startP.x;
            node.y = this.startP.y;
            let delayac = cc.delayTime(0.05*i);
            let ac = cc.moveTo(0.25, cc.p(-28, 0));
            ac.easing(cc.easeIn(1.0));
            let fadeac = cc.fadeTo(0.1, 0);
            node.runAction(cc.sequence(delayac, ac, fadeac));
        }

        this.scheduleOnce(finished, 0.07*count);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
