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

        loadingNode: {
            default: null,
            type: cc.Node
        },

        loadingLab: {
            default: null,
            type: cc.Label
        },

        bottomNode: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    start () {

    },

    openGiftList() {
        this.node.active = true;
        this.bottomNode.getComponent('Bottom').resetBottom();
        this._pageIdx = 1;
        this.getData();
    },

    getData() {
        this.content.children.forEach((el) => { el.active = false; });
        this.loadingNode.active = true;
        this.loadingLab.node.active = false;
        this.loadingNode.runAction(cc.repeatForever(cc.rotateBy(0.8, 360)));
        cc.connect.giveHistory(this._pageIdx, (list) => {
            this.loadingNode.stopAllActions();
            this.loadingNode.active = false;
            if (!list || list.length == 0) {
                this.loadingLab.node.active = true;
                this.loadingLab.string = '暂无数据';
                return;
            }

            let obj = list[0];
            this.checkBottom(obj.totalPage);
            this.checkList(list);
        }, (errmsg) => {
            this.loadingNode.stopAllActions();
            this.loadingNode.active = false;

            this.loadingLab.node.active = true;
            this.loadingLab.string = errmsg;
        });
    },

    checkList(list) {
        if (!list || list.length == 0) {
            return;
        }

        for (let i = 0; i < list.length; i++) {
            let obj = list[i];
            let item = this.content.getChildByName('item'+i);
            item.active = true;

            let headNode = item.getChildByName('headNode');
            headNode.getComponent('HeadNode').updateData(obj.headimg || '', obj.sex);

            let uidLab = item.getChildByName('uid');
            let give_uid = obj.give_uid;;
            let accept_uid = obj.accept_uid;
            let isReduce = false;
            if (give_uid == cc.dm.user.uid) {
                uidLab.getComponent(cc.Label).string = accept_uid;
                isReduce = true;
            } else {
                uidLab.getComponent(cc.Label).string = give_uid;
            }
            
            let nameLab = item.getChildByName('name');
            nameLab.getComponent(cc.Label).string = cc.utils.fromBase64(obj.name);

            let numstr = (isReduce ? '-' : '+')+cc.utils.getScoreStr(obj.score);
            let num = item.getChildByName('num');
            num.getComponent(cc.Label).string = numstr;
            num.getChildByName('Label').getComponent(cc.Label).string = numstr;
            let time = item.getChildByName('time');
            let timestr = obj.create_time.replace('T', ' ');
            timestr = timestr.substr(0, 16);
            time.getComponent(cc.Label).string = timestr;
        }
    },

    // update (dt) {},
    checkBottom(totalPage) {
        this.bottomNode.getComponent('Bottom').checkBottom(totalPage, (pageIdx) => {
            this._pageIdx = pageIdx;
            this.getData();
        });
    },

    onClosePressed() {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    }
});
