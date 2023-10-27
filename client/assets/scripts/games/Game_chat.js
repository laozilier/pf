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

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    show (str) {
        this.node.active = true;
        this.node.stopAllActions();
        if(str.length > 14) {
            let insertStr = (soure, start, newStr) => {
                return soure.slice(0, start) + newStr + soure.slice(start);
            };

            str = insertStr(str, 14, '\n');
        }

        this.node.getChildByName('Label').getComponent(cc.Label).string = str;

        this.node.runAction(cc.sequence(cc.delayTime(5), cc.callFunc(function () {
            this.node.active = false;
        }.bind(this))));
    }

    // update (dt) {},
});
