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
        pokerPrefab: {
            default: null,
            type: cc.Prefab
        },
    },

    onLoad() {
        cc.utils.setNodeWinSize(this.node);
        this._chipaiNodes = [];
        let chipaiNode = this.node.getChildByName('chipai');
        let chipai0Node = chipaiNode.getChildByName('chipai0');
        for (let i = 0; i < 6; i++) {
            let item = chipai0Node.getChildByName('item'+i);
            for (let j = 0; j < 3; j++) {
                let card = cc.instantiate(this.pokerPrefab);
                card.scale = 0.72;
                item.addChild(card, j, 'card'+j);
            }
            item.active = false;
        }
        this._chipaiNodes.push(chipai0Node);

        this._chipaiMoreNode = chipaiNode.getChildByName('chipaiMore');

        let chipai1Node = cc.instantiate(chipai0Node);
        chipai1Node.y = 0;
        this._chipaiMoreNode.addChild(chipai1Node, 0, 'chipai1');
        let closeNode = chipai1Node.getChildByName('closeNode');
        closeNode.getChildByName('btn').getComponent(cc.Button).clickEvents[0].customEventData = '1';
        this._chipaiNodes.push(chipai1Node);

        let chipai2Node = cc.instantiate(chipai0Node);
        chipai2Node.y = 0;
        this._chipaiMoreNode.addChild(chipai2Node, 1, 'chipai2');
        closeNode = chipai2Node.getChildByName('closeNode');
        closeNode.getChildByName('btn').getComponent(cc.Button).clickEvents[0].customEventData = '2';
        this._chipaiNodes.push(chipai2Node);

        this._sendData = [-1, -1, -1];
        this._chooseds = [undefined, undefined, undefined];
    },

    start () {
        
    },

    reset(need) {
        this._chipaiNodes.forEach((el, idx)=> {
            for (let i = 0; i < 6; i++) {
                let item = el.getChildByName('item'+i);
                item.getComponent(cc.Button).clickEvents[0].customEventData = idx+'_'+i;
                item.getComponent(cc.Button).interactable = true;
                item.active = false;
            }
            el.active = false;
        });

        this._chipaiMoreNode.active = false;
        this._sendData = [-1, -1, -1];
        this._chooseds = [undefined, undefined, undefined];
        if (!!need) {
            this.node.active = false;
        }
    },


    //吃牌选项
    openChipai(data, cb) {
        this.node.active = true;
        this.reset();
        this._data = data;
        this._cb = cb;

        let chipaiNode = this._chipaiNodes[0];
        chipaiNode.active = true;
        for (let i = 0; i < this._data.length; i++) {
            let obj = this._data[i];
            let vs = obj.vs;
            let v = obj.v;
            let xhs = obj.xhs;
            let item = chipaiNode.getChildByName('item'+i);
            item.active = true;
            item.getComponent(cc.Button).clickEvents[0].customEventData = {'idx': '0_'+i, 'xhs': xhs};
            vs.forEach((el, idx) => {
                let card = item.getChildByName('card'+idx);
                card.getComponent('Zipai').showZPValue(el);
            });
        }
    },

    onItemPressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        let idx = data.idx;
        let idxs = idx.split('_');
        let idx0 = parseInt(idxs[0]);
        let idx1 = parseInt(idxs[1]);
        this._sendData[idx0] = idx1;
        /** 重置选择的Item 并选择相应的Item */
        let choosedItem = this._chooseds[idx0];
        if (!!choosedItem) { choosedItem.getComponent(cc.Button).interactable = true; }
        let target = event.target;
        target.getComponent(cc.Button).interactable = false;
        this._chooseds[idx0] = target;
        /** 重置sendData数据 重置所有后面选项的节点 */
        for (let i = idx0+1; i < 3; i++) {
            this._sendData[i] = -1;
            let chipaiNode = this._chipaiNodes[i];
            for (let j = 0; j < 6; j++) {
                let item = chipaiNode.getChildByName('item'+j);
                item.getComponent(cc.Button).interactable = true;
                item.active = false;
            }
            chipaiNode.active = false;
        }
        this._chipaiMoreNode.active = false;
        /** 显示需要下火的节点 */
        let xhs = data.xhs;
        if (!!xhs && xhs.length > 0) {
            this._chipaiMoreNode.active = true;
            let chipaiNode = this._chipaiNodes[idx0+1];
            chipaiNode.active = true;
            for (let i = 0; i < xhs.length; i++) {
                let obj = xhs[i];
                let vs = obj.vs;
                let v = obj.v;
                let next_xhs = obj.xhs;
                let item = chipaiNode.getChildByName('item'+i);
                item.active = true;
                item.getComponent(cc.Button).clickEvents[0].customEventData = {'idx': (idx0+1)+'_'+i, 'xhs': next_xhs};
                vs.forEach((el, idx) => {
                    let card = item.getChildByName('card'+idx);
                    card.getComponent('Zipai').showZPValue(el);
                });
            }
        } else {
            if (!!this._cb) {
                this._cb(this._sendData);
            }

            this.reset(true);
        }
    }, 

    onClosePressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
         let close_type =  parseInt(data);
         switch (close_type) {
             case 0:
                 this.reset(true);
                 break;
             default:
                 let choosedItem = this._chooseds[close_type-1];
                 if (!!choosedItem) { choosedItem.getComponent(cc.Button).interactable = true; }
                 this._chooseds[close_type-1] = undefined;

                 for (let i = close_type; i < 3; i++) {
                     this._sendData[i] = -1;
                     let chipaiNode = this._chipaiNodes[i];
                     for (let j = 0; j < 6; j++) {
                        let item = chipaiNode.getChildByName('item'+j);
                        item.getComponent(cc.Button).interactable = true;
                        item.active = false;
                    }
                    chipaiNode.active = false;
                 }

                 if (close_type < 2) {
                     this._chipaiMoreNode.active = false;
                 }
                 break;
         }

    },


});
