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
        daHuaSprite:{
            default:[],
            type: cc.SpriteFrame,
            displayName: "大花色"
        },
        xiaoHuaSprite: {
            default: [],
            type: cc.SpriteFrame,
            displayName: "小花色"
        },
        dawangHuaSprite: {
            default: null,
            type: cc.SpriteFrame,
            displayName: "大王"
        },
        xiaowangHuaSprite: {
            default: null,
            type: cc.SpriteFrame,
            displayName: "小王"
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
        paibgNode: {
            default:null,
            type: cc.Sprite
        },
        dahuaNode: {
            default: null,
            type: cc.Sprite
        },
        xiaoHuaNode: {
            default: null,
            type: cc.Sprite
        },
        fontNode: {
            default: null,
            type: cc.Sprite
        },
        stateNode: {
            default: null,
            type: cc.Node
        },
        // laiziFrame: {
        //     default: null,
        //     type: cc.SpriteFrame
        // },
        // dalaiziFrame: {
        //     default: null,
        //     type: cc.SpriteFrame
        // }
    },

    onLoad () {
        this.endPos = cc.p(this.node.x, this.node.y);
        this.moveSpeed = 0.3;  //移动时间
        this.tranSpeed = 0.15; //翻牌时间
        this.scale = this.node.scale;
        this.starter = this.node.getChildByName('starter');
        this.big = this.node.getChildByName('big');
        this.zhu = this.node.getChildByName('zhu');
        this.canThrow = true;
        this.isTiqi = false;
        this.isSelected = false;
    },

    start () {
        
    },

    // update (dt) {},
    /**
     * 显示牌
     * @param {*} value 值
     * @param {*} laizi 赖子
     * @param {*} notori   是否恢复原始设置
     */
    show (value, laizi) {
        this.node.active = true;
        this.node.opacity = 255;
        this.node.rotation = 0;
        if(value == null || isNaN(value)) {  //如果不是一个值
            this.paibgNode.spriteFrame = this.pokerbg;
            this.fontNode.spriteFrame = null;
            this.xiaoHuaNode.spriteFrame = null;
            this.dahuaNode.spriteFrame = null;
        } else {
            if (typeof value == 'string') {
                value = parseInt(value);
            }

            let number = value%13;  //牌的面值
            let type = parseInt(value/13); //牌的类型
            this.paibgNode.spriteFrame = this.pokerMian;  //牌面
            if(type === 4){
                this.fontNode.spriteFrame = this.numberSprite[number + (2 * 13)];
                //this.fontNode.node.setPosition(cc.v2(-76, 21));
                this.xiaoHuaNode.spriteFrame = null;
                this.dahuaNode.spriteFrame = number === 1 ? this.dawangHuaSprite : this.xiaowangHuaSprite;
                //this.dahuaNode.node.setPosition(cc.v2(26, -18));
            } else {
                this.fontNode.spriteFrame = this.numberSprite[number + (type%2 * 13)];
                //this.fontNode.node.setPosition(cc.v2(-76, 98));
                this.xiaoHuaNode.spriteFrame = this.xiaoHuaSprite[type];
                this.dahuaNode.spriteFrame = this.daHuaSprite[type];
                //this.dahuaNode.node.setPosition(cc.v2(40, -68));
            }
            /*
            if (value == laizi) {
                if (this.laiziFrame) {
                    this.xiaoHuaNode.spriteFrame = this.laiziFrame;
                } else {
                    cc.loader.loadRes("laizi", cc.SpriteFrame, (err, frame) => {
                        this.laiziFrame = frame;
                        this.xiaoHuaNode.spriteFrame = this.laiziFrame;
                    });
                }

                if (this.dalaiziFrame) {
                    this.dahuaNode.spriteFrame = this.dalaiziFrame;
                } else {
                    cc.loader.loadRes("dalaizi", cc.SpriteFrame, (err, frame) => {
                        this.dalaiziFrame = frame;
                        this.dahuaNode.spriteFrame = this.dalaiziFrame;
                    });
                }
            }
            */
        }

        this._value = value;
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
     * @param {*} args
     */
    send_tran_ani (args) {
        //显示扑克背面
        this.show();
        let start = args.start == undefined ? cc.p(0, 0) : args.start;          //开始坐标
        let end = args.end == undefined ? this.endPos : args.end;               //结束坐标
        let v = args.v;                                                         //牌值
        let i = args.i == undefined ? 0 : args.i;                               //idx
        let laizi = args.laizi;                                                 //赖子值
        let startScale = args.startScale == undefined ? 0.25 : this.scale;      //开始缩放比例
        let endScale = args.endScale == undefined ? this.scale : args.endScale; //最后缩放比例
        let hide = args.hide;
        //暂停所有动作
        this.node.stopAllActions(); 
        this.node.setPosition(start);
        //大小设置
        this.node.scale = startScale;
        //移动到指定位置
        let move = cc.moveTo(this.moveSpeed, end);
        //放大到正常大小
        let sc = cc.scaleTo(this.moveSpeed, endScale);
        let fun1 = cc.callFunc(()=> {
            //发牌音效
            if (i%3 == 0) {
                cc.vv.audioMgr.playSFX("public/fapai.mp3");
            }
        });
        //让上面三个动作同时进行
        let an = cc.spawn(move, sc, fun1);
        let delay = cc.delayTime(i*0.05);
        
        //翻转牌开始
        let tran1 = cc.scaleTo(this.tranSpeed, 0, endScale);
        //完成上面两动作之后调用此函数
        let fun2 = cc.callFunc((target)=>{
            //显示正面
            this.show(v, laizi);
        }, this);
        //翻转牌到正面
        let tran2 = cc.scaleTo(this.tranSpeed, endScale);
        //开始播放动画
        if (!!hide) {
            this.node.runAction(
                cc.spawn(cc.sequence(delay, an, tran1, fun2, tran2), cc.fadeTo(1, 0))
            );
        } else {
            this.node.runAction(
                cc.sequence(delay, an, tran1, fun2, tran2)
            );
        }
    },

    /**
     * 播放发牌动画
     * @param {*} args
     */
    send_ani(args) {
        //显示扑克背面
        this.show();
        let start = args.start == undefined ? cc.p(0, 0) : args.start;          //开始坐标
        let end = args.end == undefined ? this.endPos : args.end;               //结束坐标
        let i = args.i == undefined ? 0 : args.i;                               //idx
        let startScale = args.startScale == undefined ? 0.25 : this.scale;      //开始缩放比例
        let endScale = args.endScale == undefined ? this.scale : args.endScale; //最后缩放比例
        //暂停所有动作
        this.node.stopAllActions(); 
        this.node.setPosition(start);
        //大小设置
        this.node.scale = startScale;
        //移动到指定位置
        let move = cc.moveTo(this.moveSpeed, end);
        //放大到正常大小
        let sc = cc.scaleTo(this.moveSpeed, endScale);
        let fun1 = cc.callFunc(()=> {
            //发牌音效
            if (i%3 == 0) {
                cc.vv.audioMgr.playSFX("public/fapai.mp3");
            }
        });
        //让上面三个动作同时进行
        let an = cc.spawn(move, sc, fun1);
        let delay = cc.delayTime(i*0.05);
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
    tran_ani(value, laizi) {
        //发牌音效
        cc.vv.audioMgr.playSFX("public/fapai.mp3");
        
        //翻转牌开始
        let tran1 = cc.scaleTo(this.tranSpeed, 0, this.scale);
        //完成上面两动作之后调用此函数
        let fun = cc.callFunc((target)=>{
            //显示正面
            this.show(value, laizi);
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

    setStarter(show) {
        if (!!this.starter) {
            this.starter.active = show;
        }
    },

    setBig(show) {
        if (!!this.big) {
            this.big.active = show;
        }
    },

    setZhu(show) {
        if (!!this.zhu) {
            this.zhu.active = show;
        }
    },

    setSelected (has) {
        if (this.isSelected === has) {
            return;
        }
        if (has) {
            this.paibgNode.node.color = cc.color(220, 220, 220, 255);
        } else {
            this.paibgNode.node.color = cc.color(255, 255, 255, 255);
        }
        this.isSelected = has;
    },

    setTiqi (has, need) {
        if (this.isTiqi === has) {
            return;
        }

        let y = 0;
        if (has) {
            y = 18;
        }

        this.node.stopAllActions();
        if (need) {
            this.node.runAction(cc.moveTo(0.1, cc.p(this.x, y)));
        } else {
            this.node.y = y;
        }

        this.isTiqi = has;
    },

    setColorTiqi (has) {
        if (this.isTiqi === has) {
            return;
        }

        if (has) {
            this.paibgNode.node.color = cc.hexToColor('#FFBBBB');
        } else {
            this.paibgNode.node.color = cc.Color.WHITE;
        }

        this.isTiqi = has;
    },

    setCanThrow (has) {
        if (this.canThrow === has) {
            return;
        }

        if (!has) {
            this.setTiqi(false, false);
            this.setColorTiqi(false);
            this.paibgNode.node.color = cc.color(150, 150, 150, 255);
        } else {
            this.paibgNode.node.color = cc.color(255, 255, 255, 255);
        }

        this.canThrow = has;
    },
});
