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
        frames: {
            default: [],
            type: cc.SpriteFrame
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.zhuType = this.node.getChildByName('zhuType');
        this.zhuType.active = false;
        this.zhuTypePos = this.zhuType.getPosition();
        this.jiao_pai = this.node.getChildByName('jiao_pai');
        this.jiaofen = this.node.getChildByName('jiaofen');
        this.jiaofens = [80,75,70,65,60,55,50,45,40,35,30,25,20,15,10,5];   //叫分
    },

    reset() {
        this.zhuType.active = false;
        this.jiao_pai.getComponent(cc.Label).string = '叫';
        this.jiaofen.active = false;
    },

    checkData(data) {
        this.checkZhuType(data.zhuType);
        this.checkJiaofen(data);
    },

    checkZhuType(zhuType, startpos) {
        if (zhuType == undefined) {
            return;
        }
        
        this.zhuType.active = true;
        if (zhuType < 0) {
            this.zhuType.getComponent(cc.Sprite).spriteFrame = this.frames[4];
        } else {
            this.zhuType.getComponent(cc.Sprite).spriteFrame = this.frames[zhuType];
        }
        this.zhuType.getComponent(cc.Animation).play();
        this.zhuType.stopAllActions();
        if (!!startpos) {
            let p = this.node.convertToNodeSpaceAR(startpos);
            this.zhuType.setPosition(p);
            this.zhuType.runAction(cc.sequence(
                cc.moveTo(0.6, this.zhuTypePos),
                cc.blink(1, 3)
            ));
        } else {
            this.zhuType.setPosition(this.zhuTypePos);
        }
    },

    checkJiaofen(data) {
        let isPai = data.isPai;
        let jiaofenIdx = data.jiaofenIdx;
        if (jiaofenIdx == undefined || jiaofenIdx < 0) {
            return;
        }

        this.jiao_pai.getComponent(cc.Label).string = !!isPai ? '拍' : '叫';
        this.jiaofen.active = true;
        this.jiaofen.getComponent(cc.Label).string = this.jiaofens[jiaofenIdx];
    },

    start () {

    },

    // update (dt) {},
});
