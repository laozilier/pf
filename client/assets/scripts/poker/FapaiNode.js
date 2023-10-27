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
        
    },

    start () {

    },

    reset() {
        this.node.removeAllChildren();
    },

    showFapai1(ends, scale, args) {
        let zindex = 100;
        for (let i = 0; i < ends.length; i++) {
            let end = ends[i];
            let p = end.p;
            let v = end.v;
            if (!!args && args.init == undefined && v == args.v) {
                args.init = true;
                zindex = i;
                args.p = p;
                continue;
            }
            let poker = cc.instantiate(this.pokerPrefab);
            p = this.node.convertToNodeSpaceAR(p);
            poker.setPosition(p);
            this.node.addChild(poker, i, 'poker'+i);
            if (typeof v == 'number') {
                poker.getComponent('poker').send_tran_ani({v: v, i: i, startScale: 0.72, endScale: scale});
            } else {
                poker.getComponent('poker').send_ani({i: i, startScale: 0.72, endScale: scale});
            }
        }

        if (typeof ends[0].v == 'number') {
            setTimeout(() => {
                this.reset();
            }, ends.length*80);
        }

        if (!!args) {
            let v = args.v; 
            let p = args.p;
            let s = args.s;
            let poker = cc.instantiate(this.pokerPrefab);
            p = this.node.convertToNodeSpaceAR(p);
            poker.setPosition(cc.p(0, 0));
            this.node.addChild(poker, 100);
            poker.getComponent('poker').show(v);
            poker.runAction(cc.sequence(
                cc.delayTime(ends.length*0.05),
                cc.callFunc(()=> { poker.setLocalZOrder(zindex); }),
                cc.spawn(
                    cc.moveTo(0.3, p),
                    cc.scaleTo(0.3, s)
                )
            ));
        }
    },

    showFapai2(cards, end, scale, args) {
        let len = 0;
        if (Array.isArray(cards)) {
            len = cards.length;
        } else if (typeof cards == 'number') {
            len = cards;
        }
        end = this.node.convertToNodeSpaceAR(end);
        for (let i = 0; i < len; i++) {
            let poker = cc.instantiate(this.pokerPrefab);
            poker.x = end.x;
            poker.y = end.y;
            this.node.addChild(poker, i, 'poker'+i);
            poker.getComponent('poker').send_ani({i: i, startScale: 0.72, endScale: scale});
        }

        if (!!args) {
            let v = args.v; 
            let p = args.p;
            let s = args.s;
            let poker = cc.instantiate(this.pokerPrefab);
            p = this.node.convertToNodeSpaceAR(p);
            poker.setPosition(cc.p(0, 0));
            this.node.addChild(poker, 100);
            poker.getComponent('poker').show(v);
            poker.runAction(cc.sequence(
                cc.delayTime(len*0.05),
                cc.spawn(
                    cc.moveTo(0.3, p),
                    cc.scaleTo(0.3, s)
                )
            ));
        }
    },

    showFapai3(cards, end, scale) {
        let len = 0;
        if (Array.isArray(cards)) {
            len = cards.length;
        } else if (typeof cards == 'number') {
            len = cards;
        }
        end = this.node.convertToNodeSpaceAR(end);
        for (let i = 0; i < len; i++) {
            let poker = cc.instantiate(this.pokerPrefab);
            poker.x = end.x;
            poker.y = end.y;
            this.node.addChild(poker, i, 'poker'+i);
            poker.getComponent('poker').send_ani({i: i, startScale: 0.72, endScale: scale});
        }
    },

    // update (dt) {},
});
