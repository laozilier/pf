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
        this._scoreCards = [];
        this._idx = 0;
        for (let i = 0; i < 28; i++) {
            let poker = cc.instantiate(this.pokerPrefab);
            this.node.addChild(poker, i, 'poker'+i);
            poker.active = false;
        }
    },

    reset() {
        this._scoreCards = [];
        this.node.children.forEach(el=> {
            el.active = false;
        });
        this._idx = 0;
    },

    start () {

    },

    checkScoreCards(data) {
        if (!!data) {
            this.reset();
            this._scoreCards = data;
        }
        
        for (let i = this._idx; i < this._scoreCards.length; i++) {
            const el = this._scoreCards[i];
            if (!el) {
                continue;
            }
            let poker = this.node.getChildByName('poker'+i);
            poker.getComponent('poker').show(el);
        }

        this._idx = this._scoreCards.length;
    },

    addScoreCards(data) {
        this._scoreCards = this._scoreCards.concat(data);
        this.checkScoreCards();
    }

    // update (dt) {},
});
