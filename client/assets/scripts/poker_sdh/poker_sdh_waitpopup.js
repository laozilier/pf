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
        LatleString: {
            default: null,
            type: cc.Label
        }
    },


    onLoad() {
        this.LableSrting = [];

        for (let i = 0; i<15 ; i++) {
            let  label_str = cc.instantiate(this.LatleString.node);
            label_str.active = false;
            this.node.addChild(label_str);
            this.LableSrting.push(label_str);
        }

        this.intlabeltyoe();
    },


    // : 0,         //游戏开始
    // : 1,         //切牌状态
    // : 2,         //发牌状态
    // : 3,         //叫分状态
    // : 4,         //定主
    // : 5,         //埋底
    // : 6,         //出牌状态
    // : 7,         //结算状态
    // : 8,         //流局状态
    // : 9,

    intlabeltyoe() {
        this.labeltype = {};
        // A:待  B:等  C:底  D:定 E:分 F:家 G:叫 H:局 I:流 J:埋 K:其 L:他 M:玩 N:主 O:庄  .：。
        this.labeltype[3]  = ['B','A','K','L','M','F','G','E','.','.','.'];         //等待其他玩家亮主
        this.labeltype[4]  =  ['B','A','O','F','D','N','.','.','.'];                //等待庄家定主
        this.labeltype[5]  = ['B','A','O','F','J','C','.','.','.'];                 //庄家正在埋底中
        this.labeltype[10]  = ['B','A','K','L','M','F','P','Q','.','.','.'];        //等待玩家操作
        this.labeltype[11]  = ['B','A','M','F','P','Q','.','.','.'];                //等待玩家选择留守
    },


    start () {

    },


    reset() {
        this.LableSrting.forEach((item)=>{
            item.stopAllActions();
            item.setPositionY(0);
            item.active = false;
        });

        this.node.active = false;
    },

    //显示lab
    showlabAction(type) {
        this.reset();
        if(!!this.labeltype[type]) {
            for(let i = 0; i<this.labeltype[type].length;i++) {
                this.LableSrting[i].getComponent(cc.Label).string = this.labeltype[type][i];
                this.LableSrting[i].active = true;
            }

            this.labrunAction(0,this.labeltype[type].length);
            this.node.active = true;
        }
    },

    labrunAction(idx,max) {
        let  label_str =  this.LableSrting[idx];
        let n_idx = idx;
        label_str.runAction(cc.sequence(cc.moveBy(0.1,cc.p(0,24)),cc.moveBy(0.1,cc.p(0,-24)),cc.callFunc(()=>{
            n_idx+=1;
            if(max <= n_idx) {
                n_idx = 0;
            }
            label_str.stopAllActions();
            label_str.y = 0;
            this.labrunAction(n_idx,max);
        })));

    },
});
