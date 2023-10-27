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
        numberSprite: {
            default:[],
            type: cc.SpriteFrame,
            displayName: "扑克数字图片数组"
        },

        pokerbg: {
            default: null,
            type: cc.SpriteFrame
        },
        pokerMian: {
            default: null,
            type: cc.SpriteFrame,
            tooltip: "牌面"
        },
        pokeroutMian: {
            default: null,
            type: cc.SpriteFrame,
            tooltip: "出牌面"
        },
        paibgNode: {
            default:null,
            type: cc.Sprite
        },
        fontNode_1: {
            default: null,
            type: cc.Sprite
        },
        fontNode_2: {
            default: null,
            type: cc.Sprite
        }

    },

    onLoad () {
        this.endPos = cc.p(this.node.x, this.node.y);
        this.moveSpeed = 0.3;  //移动时间
        this.tranSpeed = 0.15; //翻牌时间
        this.scale = this.node.scale;
        this._idxI = -1;
        this._idxJ = -1;
    },

    start () {
        
    },

    /**
     * 显示牌
     * @param {*} value 值
     * @param {*} idxI 
     * @param {*} idxJ 
     */
    showSortValue (value, idxI, idxJ, totalIdx, idx, ani, disable, pos) {
        this.node.active = true;
        this.node.stopAllActions();
        this._idxI = idxI;
        this._idxJ = idxJ;
        this._idx = idx;
        this._disable = disable;
        if (this._disable) {
            this.node.getChildByName('paimian').color = cc.color(180, 180, 180, 255);
        } else {
            this.node.getChildByName('paimian').color = cc.Color.WHITE;
        }
        let zorder = 4-idxJ;
        this.node.setLocalZOrder(zorder);
        let p = cc.p((idxI-totalIdx/2)*this.node.width+this.node.width/2, idxJ*90-30);
        this._curPos = p;
        this._zorder = zorder;
        if (!!pos) {
            this.showZPValue();
            this.node.setPosition(pos);
            if (value == null || isNaN(value)  || value < 0) {
                this.node.runAction(cc.sequence(cc.delayTime(idx*0.05), cc.moveTo(0.1, p)));
            } else {
                this.node.runAction(cc.sequence(
                    cc.delayTime(idx*0.02), 
                    cc.moveTo(0.1, p), 
                    cc.scaleTo(0.1, 0, 1), 
                    cc.callFunc(()=> {this.showZPValue(value);}), 
                    cc.scaleTo(0.1, 1)));
            }
        } else {
            this.showZPValue(value);
            if (ani) {
                this.node.runAction(cc.moveTo(0.1, p));
            } else {
                this.node.setPosition(p);
            }
        }
    },

    showZPValue(value) {
        this.node.active = true;
        if (value == null || isNaN(value)  || value < 0) {  //如果不是一个值  少于0的值
            this.paibgNode.spriteFrame = this.pokerbg;
            this.fontNode_1.spriteFrame = null;
            this.fontNode_2.spriteFrame = null;
            this._value = undefined;
        } else {
            if (typeof value == 'string') {
                value = parseInt(value);
            }

            this.paibgNode.spriteFrame = this.pokerMian;  //牌面
            this.fontNode_1.spriteFrame = this.numberSprite[value];
            this.fontNode_2.spriteFrame = this.numberSprite[value];
            this._value = value;
        }
    },

    getValue () {
        return this._value;
    },

    hide () {
        this.node.active = false;
    },

    clearAnimation () {
        this.node.setPosition(this.endPos);
        this.node.scale = this.scale;
        this.node.stopAllActions();
    },

    /**
     * 播放发牌翻牌动画
     * @param {*} start 
     * @param {*} value 
     * @param {*} i
     */
    send_tran_ani (start, value, i) {
        if (i == undefined) {
            i = 0;
        }
        
        this.node.stopAllActions(); //暂停所有动作
        //显示扑克背面
        this.show(null, null, true);
        
        this.node.x = start.x;
        this.node.y = start.y;

        //大小设置
        this.node.scale = 0.25;
        //移动到指定位置
        let move = cc.moveTo(this.moveSpeed, this.endPos);
        //放大到正常大小
        let sc = cc.scaleTo(this.moveSpeed, this.scale, this.scale);
        let fun1 = cc.callFunc(()=> {
            //发牌音效
            cc.vv.audioMgr.playSFX("public/fapai.mp3");
        });
        //让上面三个动作同时进行
        let an = cc.spawn(move, sc, fun1);
        let delay = cc.delayTime(i*0.1);
        
        //翻转牌开始
        let tran1 = cc.scaleTo(this.tranSpeed, 0, this.scale);
        //完成上面两动作之后调用此函数
        let fun2 = cc.callFunc((target)=>{
            //显示正面
            this.show(value);
        }, this);
        //翻转牌到正面
        let tran2 = cc.scaleTo(this.tranSpeed, this.scale, this.scale);

        //开始播放动画
        this.node.runAction(
            cc.sequence(delay, an, tran1, fun2, tran2)
        );
    },

    /**
     * 播放发牌动画
     * @param {*} start 
     * @param {*} i 
     */
    send_ani(start, i) {
        if (i == undefined) {
            i = 0;
        }

        this.node.stopAllActions(); //暂停所有动作

        //显示扑克背面
        this.show(null, null, true);
        this.node.x = start.x;
        this.node.y = start.y;
        //大小设置
        this.node.scale = 0.25;
        //移动到指定位置
        let move = cc.moveTo(this.moveSpeed, this.endPos);
        //放大到正常大小
        let sc = cc.scaleTo(this.moveSpeed, this.scale, this.scale);
        let fun1 = cc.callFunc(()=> {
            //发牌音效
            if (i%2 == 0) {
                cc.vv.audioMgr.playSFX("public/fapai.mp3");
            }
        });
        //让上面三个动作同时进行
        let an = cc.spawn(move, sc, fun1);
        let delay = cc.delayTime(i*0.1);
        //开始播放动画
        this.node.runAction(
            cc.sequence(delay, an)
        );
    },

    /**
     * 播放翻牌动画
     * @param {*} value 
     * @param {*} laizi 
     */
    tran_ani(value) {
        //发牌音效
        cc.vv.audioMgr.playSFX("public/fapai.mp3");
        //翻转牌开始
        let tran1 = cc.scaleTo(this.tranSpeed, 0, this.scale);
        //完成上面两动作之后调用此函数
        let fun = cc.callFunc((target)=>{
            //显示正面
            this.showZPValue(value);
        }, this);
        //翻转牌到正面
        let tran2 = cc.scaleTo(this.tranSpeed, this.scale, this.scale);

        //开始播放动画
        this.node.runAction(
            cc.sequence(tran1, fun, tran2)
        );
    },

    showLastState() {
        if (!this.endPos) {
            return;
        }
        
        if (!!this.stateNode) {
            this.stateNode.active = true;
        } else {
            cc.loader.loadRes("stateFrame", cc.SpriteFrame, (err, frame) => {
                this.stateNode = new cc.Node('Sprite');
                let sp = this.stateNode.addComponent(cc.Sprite);
                sp.spriteFrame = frame;
                this.stateNode.x = 86;
                this.stateNode.y = 122;
                this.node.addChild(this.stateNode);
            });
        }

        this.node.y = this.endPos.y+this.scale*36;
    }, 

    hideLastState() {
        if (!this.endPos) {
            return;
        }

        if (!!this.stateNode) {
            this.stateNode.active = false;
        }

        this.node.y = this.endPos.y;
    }, 
});
