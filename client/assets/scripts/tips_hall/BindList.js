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
        content: {
            default: null,
            type: cc.Node
        },

        item: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    openBindList(parents) {
        this.node.active = true;
        this.content.children.forEach((el) => { el.active = false; });
        this.check(parents);
    },

    check(list) {
        if (list == undefined || list.length == 0) {
            return;
        }

        for (let i = 0; i < list.length-6; i++) {
            let obj = list[i];
            let item = this.content.getChildByName('item'+i);
            if (!item) {
                item = cc.instantiate(this.item, i, 'item'+i);
                this.content.addChild(item);
            }

            let levLab = item.getChildByName('levLab');
            if (!!levLab) {
                levLab.getComponent(cc.Label).string = (i+1);
            }

            item.active = true;
            let headNode = item.getChildByName('headNode');
            let sex = obj.sex;
            let headimg = obj.headimg;
            headNode.getComponent('HeadNode').updateData(headimg, sex);

            let idLab = item.getChildByName('idLab');
            if (!!idLab) {
                idLab.getComponent(cc.Label).string = obj.uid;
            }

            let nameLab = item.getChildByName('nameLab');
            if (!!nameLab) {
                nameLab.getComponent(cc.Label).string = cc.utils.fromBase64(obj.name);
            }

            let dealerLab = item.getChildByName('dealerLab');
            if (!!dealerLab) {
                let profitRatio = obj.profitRatio || 0;
                dealerLab.getComponent(cc.Label).string = profitRatio > 0 ? Math.floor(profitRatio*100)+'%' : '否';
            }
        }
    },

    start () {

    },

    oncloseBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    }

    // update (dt) {},
});
