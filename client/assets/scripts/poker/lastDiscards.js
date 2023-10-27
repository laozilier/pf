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
        outsPrefab: {
            default: null,
            type: cc.Prefab
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);

        this._outsNodes = [];
        for (let i = 0; i < 4; i++) {
            let outsNode = cc.instantiate(this.outsPrefab);
            this.node.addChild(outsNode);
            outsNode.getComponent('outCards').reset();
            this._outsNodes.push(outsNode);
        }
    },

    start () {

    },

    openLastDiscards(data, alg) {
        this.node.active = true;
        this._outsNodes.forEach(el => {
            el.getComponent('outCards').reset();
        });

        for (let i = 0; i < data.length; i++) {
            let outsNode = this._outsNodes[i];
            if (!outsNode) {
                return;
            }

            let cardsData = data[i];
            let p = cardsData.p;
            p = this.node.convertToNodeSpaceAR(p);
            outsNode.setPosition(p);
            outsNode.getComponent('outCards').openOutCards(cardsData, undefined, alg);
        }
    },

    closeLastDiscards() {
        this.node.active = false;
    }

    // update (dt) {},
});
