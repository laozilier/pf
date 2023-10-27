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
        sspokerPrefab: {
            default: null,
            type: cc.Prefab
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let scoreNode = this.node.getChildByName('scoreNode');
        this.scoreLab = scoreNode.getChildByName('scoreLab');
        this.scoreCards = [];
        this.scoreCardsNode = this.node.getChildByName('scoreCards');
        for (let i = 0; i < 24; i++) {
            let poker = cc.instantiate(this.sspokerPrefab);
            this.scoreCardsNode.addChild(poker, i, 'poker'+i);
            this.scoreCards.push(poker);
            poker.active = false;          
        }

        this._score = 0;
        this._cards = [];
    },

    start () {

    },

    reset() {
        this.scoreCards.forEach(el => {
            el.active = false;
        });

        this.scoreLab.getComponent('scoreAni').showNum(0, true);
        this._score = 0;
        this._cards = [];
        this._idx = 0;
    },

    checkData(score, cards) {
        this.reset();

        if (typeof score == 'number') {
            this._score = score;
        }
        
        if (Array.isArray(cards)) {
            this._cards = cards; 
        }
        
        this.scoreLab.getComponent('scoreAni').showNum(this._score, true);
        for (let i = 0; i < this._cards.length; i++) {
            let v = this._cards[i];
            let poker = this.scoreCards[i];
            if (!poker) {
                return;
            }
            poker.getComponent('poker').show(v);
            this._idx+=1;
        }
    },

    addData(score, cards) {
        this._score+=score;
        this.scoreLab.getComponent('scoreAni').showNum(this._score, true);
        this._cards = this._cards.concat(cards);
        for (let i = this._idx; i < this._cards.length; i++) {
            let v = this._cards[i];
            let poker = this.scoreCards[i];
            poker.getComponent('poker').show(v);
            poker.stopAllActions();
            poker.runAction(cc.blink(1.0, 3));
            this._idx+=1;
        }

        let end = this.scoreCardsNode.getNodeToWorldTransformAR();
        end = cc.p(end.tx, end.ty);
        return end;
    }

    // update (dt) {},
});
