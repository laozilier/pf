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
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        for (let i = 0; i < 16; i++) {
            let poker = cc.instantiate(this.pokerPrefab);
            poker.scale = 0.5;
            this.node.addChild(poker, i, 'poker'+i);
            poker.active = false;
        }
    },

    start () {

    },

    reset() {
        this.node.children.forEach(el => {
            el.active = false;
        });
    },

    openLeftCards(cards) {
        for (let i = 0; i < cards.length; i++) {
            let card = cards[i];
            let poker = this.node.getChildByName('poker'+i);
            if (!!poker) {
                poker.getComponent('poker').show(card);
            }
        }
    }

    // update (dt) {},
});
