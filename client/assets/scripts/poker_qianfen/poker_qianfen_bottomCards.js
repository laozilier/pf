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

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.bg = this.node.getChildByName('bg');
        this.numNode = this.bg.getChildByName('num');
        this.pokersNode = this.node.getChildByName('pokersNode');
        for (let i = 0; i < 6; i++) {
            let poker = cc.instantiate(this.pokerPrefab);
            poker.x = -140+i*56;
            poker.y = 0;
            poker.scale = 0.6;
            this.pokersNode.addChild(poker, i, 'poker'+i);
        }



        this.reset();
    },

    start () {

    },

    reset() {
        this.pokersNode.children.forEach(el => {
            el.stopAllActions();
            el.y = 0;
            el.active = false;
        });

        this.numNode.getComponent(cc.Label).string = '0';
        this.bg.active = false;
    },

    openBottomCards(cards, alg) {
        this.numNode.getComponent('scoreAni').showNum(0, true, ()=> {
            this.bg.active = false;
        });

        for (let i = 0; i < cards.length; i++) {
            let v = cards[i];
            let poker = this.pokersNode.getChildByName('poker'+i);
            if (!!poker) {
                poker.getComponent('poker').send_tran_ani({start:this.bg.getPosition(), v: v, i: i});
                if (alg.getCardScore(v) > 0) {
                    setTimeout(() => {
                        poker.stopAllActions();
                        poker.runAction(cc.moveBy(0.3, cc.p(0, 20)));
                    }, 1000);
                }
            }
        }
    },

    showBottomBg() {
        this.bg.active = true;
        this.numNode.getComponent('scoreAni').showNormalNum(6, true);
        let end = this.bg.getNodeToWorldTransformAR();
        end = cc.p(end.tx, end.ty);
        return end;
    }

    // update (dt) {},
});
