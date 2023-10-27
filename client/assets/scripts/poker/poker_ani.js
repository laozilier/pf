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

    // onLoad () {}, 

    reset() {
        this.node.removeAllChildren();
    },  

    start () {

    },

    //
    getScore(starts, end) {
        let nodes = [];
        let ends = [];
        if (!Array.isArray(end)) {
            end = this.node.convertToNodeSpaceAR(end);
        }
        for (let i = 0; i < starts.length; i++) {
            let obj = starts[i];
            let p = obj.p;
            p = this.node.convertToNodeSpaceAR(p);
            let v = obj.v;
            let poker = cc.instantiate(this.pokerPrefab);
            poker.scale = obj.s == undefined ? 0.5 : obj.s;
            poker.setPosition(p);
            this.node.addChild(poker, i);
            poker.getComponent('poker').show(v);
            nodes.push(poker);
            if (Array.isArray(end)) {
                ends.push(this.node.convertToNodeSpaceAR(end[i]));
            } else {
                ends.push(end);
            }
        }
        
        nodes.forEach((el, idx)=> {
            el.runAction(cc.sequence(
                cc.delayTime(0.2), 
                cc.spawn(cc.moveTo(0.3, ends[idx]), cc.scaleTo(0.3, 0.2)), 
                cc.fadeTo(0.2, 0),
                cc.removeSelf(true))
            )
        });
    }

    // update (dt) {},
});
