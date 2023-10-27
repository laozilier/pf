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
        zpPrefab: {
            default: null,
            type: cc.Prefab
        },

        localSeat: 0
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._idx = 0;
        let x = this.localSeat == 1 ? -55 : 55;
        let y = -55;
        for (let i = 0; i < 14; i++) {
            let card = cc.instantiate(this.zpPrefab);
            this.node.addChild(card, i, 'zp'+i);
            card.x = x;
            card.y = y;
            card.active = false;
            if ((i+1)%7 == 0) {
                x = this.localSeat == 1 ? -55 : 55;;
                y -= 102;
            } else {
                x += this.localSeat == 1 ? -102 : 102;
            }
        }
    },

    start () {

    },

    reset() {
        this._idx = 0;
        this.node.children.forEach(el => {
            el.active = false;
        });
    },

    resetDatas(data) {
        this._idx = 0;
        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                let obj = data[i];
                let v = obj.v;
                let card = this.node.getChildByName('zp'+this._idx);
                card.active = true;
                card.getComponent('Zipai').showZPValue(v);
                if (!!obj.d) {
                    card.getChildByName('paimian').color = cc.Color.WHITE;
                } else {
                    card.getChildByName('paimian').color = cc.color(200,200,200,255);
                }
                this._idx+=1;
            }
        }
    },

    checkData(info) {
        //{v: 14, d: false}
        let v = info.v;
        let card = this.node.getChildByName('zp'+this._idx);
        card.active = true;
        card.getComponent('Zipai').showZPValue(v);
        if (!!info.d) {
            card.getChildByName('paimian').color = cc.Color.WHITE;
        } else {
            card.getChildByName('paimian').color = cc.color(200,200,200,255);
        }
        card.stopAllActions();
        card.opacity = 8;
        card.runAction(cc.sequence(
            cc.delayTime(0.3),
            cc.callFunc(()=> {
                card.opacity = 255;
            })
            //cc.fadeTo(0.1, 255)
        ));
        this._idx+=1;
        let p = card.getNodeToWorldTransformAR();
        return cc.p(p.tx, p.ty);
    },

    // update (dt) {},
});
