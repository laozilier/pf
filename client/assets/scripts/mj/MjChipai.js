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
        mjPrefab: {
            default: null,
            type: cc.Prefab
        },
    },

    onLoad() {
        cc.utils.setNodeWinSize(this.node);
        let itemsNode = this.node.getChildByName('items');
        let ps = [-96, 5,96];
        for (let i = 0; i < 3; i++) {
            let item = itemsNode.getChildByName('item'+i);
            for (let j = 0; j < 3; j++) {
                let mjCard = cc.instantiate(this.mjPrefab);
                item.addChild(mjCard, 0, 'mjCard'+j);
                mjCard.x = ps[j];
            }
        }
    },

    start () {
        
    },

    reset() {
        let itemsNode = this.node.getChildByName('items');
        for (let i = 0; i < 3; i++) {
            let item = itemsNode.getChildByName('item'+i);
            item.active = false;
        }
    },


    //吃牌选项
    openChipai(data, actionCb, closeCb) {
        this.node.active = true;
        this.reset();
        this._data = data;
        this._actionCb = actionCb;
        this._closeCb = closeCb;

        let itemsNode = this.node.getChildByName('items');
        for (let i = 0; i < data.length; i++) {
            let obj = data[i];
            let item = itemsNode.getChildByName('item'+i);
            item.active = true;
            let vs = obj.vs;
            for (let j = 0; j < vs.length; j++) {
                let v = vs[j];
                let mjCard = item.getChildByName('mjCard'+j);
                if (!mjCard) {
                    continue;
                }
                mjCard.getComponent('mj').showHoldsMjValue(v);
            }
        }
    },

    onItemPressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        let idx = parseInt(data);
        if (!!this._actionCb) {
            this._actionCb(idx);
        }
        this.node.active = false;
    }, 

    onClosePressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        if (!!this._closeCb) {
            this._closeCb();
        }
        this.node.active = false;
    },


});
