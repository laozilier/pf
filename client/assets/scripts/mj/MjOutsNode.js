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

        lastTips: {
            default: null,
            type: cc.Prefab
        },

        localSeat: 0
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._idx = 0;
        let posDatas = [
            {startx: 27, starty: 0, marginx: 54, marginy: -68, scale: 0.6, rotation: 0, valuex: 0, valuey: 0, zIndex: 0, marginZIndex: 1}, 
            {startx: 0, starty: 32, marginx: 75, marginy: 48, scale: 0.6, rotation: -90, valuex: 0, valuey: 0, zIndex: 48, marginZIndex: -1}, 
            {startx: 27, starty: 0, marginx: 54, marginy: -68, scale: 0.6, rotation: 0, valuex: 0, valuey: 0, zIndex: 48, marginZIndex: -1}, 
            {startx: 0, starty: 32, marginx: -75, marginy: 48, scale: 0.6, rotation: -90, valuex: 0, valuey: 0, zIndex: 0, marginZIndex: 1}];
        let data = posDatas[this.localSeat];
        let x = data.startx;
        let y = data.starty;
        let marginx = data.marginx;
        let marginy = data.marginy;
        let zIndex = data.zIndex;
        let marginZIndex = data.marginZIndex;

        let nodesx = [-54*3, 0, 54*3, 0];
        let len = 10;
        let max = 30;
        if (cc.gameargs.playersLen == 2) {
            len = 16;
            this.node.x += nodesx[this.localSeat];
            max = 48;
        }
        for (let i = 0; i < max; i++) {
            let mjCard = cc.instantiate(this.mjPrefab);
            this.node.addChild(mjCard, zIndex+(i*marginZIndex), 'mjCard'+i);
            mjCard.getComponent('mj').showOutMjValue(-1, this.localSeat);
            mjCard.x = x;
            mjCard.y = y;
            mjCard.active = false;
            if (this.localSeat%2 == 0) {
                if ((i+1)%len == 0) {
                    x = data.startx;
                    y += marginy;
                } else {
                    x += marginx;
                }
            } else {
                if ((i+1)%len == 0) {
                    y = data.starty;
                    x += marginx;
                } else {
                    y += marginy;
                }
            }
        }
        this._lastTipsNode = cc.instantiate(this.lastTips);
        this.node.addChild(this._lastTipsNode, 99, 'lastTipsNode');
        let tipsTotations = [0, 0, 180, 180];
        this._lastTipsNode.rotation = tipsTotations[this.localSeat];
        this._lastTipsNode.active = false;
        this._tipsMargins = [40, 30, -48, -30];
    },

    start () {

    },

    /**
     * 重置节点
     */
    reset() {
        this._idx = 0;
        this._lastTipsNode.stopAllActions();
        this._lastTipsNode.active = false;
        this.node.children.forEach(el => {
            el.active = false;
        });
    },

    /**
     * 重置数据
     */
    resetDatas(data) {
        this._idx = 0;
        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                let v = data[i];
                let mjCard = this.node.getChildByName('mjCard'+this._idx);
                mjCard.active = true;
                mjCard.getComponent('mj').showOutMjValue(v, this.localSeat);
                this._idx+=1;
            }
        }
    },

    /**
     * 增加一张弃牌
     */
    checkData(v) {
        let mjCard = this.node.getChildByName('mjCard'+this._idx);
        mjCard.active = true;
        mjCard.getComponent('mj').showOutMjValue(v, this.localSeat);
        mjCard.stopAllActions();
        mjCard.opacity = 8;
        mjCard.runAction(cc.sequence(
            cc.delayTime(0.2),
            cc.callFunc(()=> {
                mjCard.opacity = 255;
            })
            //cc.fadeTo(0.1, 255)
        ));
        this._idx+=1;
        let end = mjCard.getNodeToWorldTransformAR();
        end = cc.p(end.tx, end.ty);
        return end;
    },

    lastQiPoker(show) {
        this._lastTipsNode.stopAllActions();
        if (!!show) {
            this._lastTipsNode.active = true;
            let mjCard = this.node.getChildByName('mjCard'+(this._idx-1));
            let x = 0; 
            let y = 0;
            if (!!mjCard) {
                x = mjCard.x;
                y = mjCard.y;
            }
            y+=this._tipsMargins[this.localSeat];
            this._lastTipsNode.x = x;
            this._lastTipsNode.y = y;
            this._lastTipsNode.runAction(cc.repeatForever(
                    cc.sequence(
                        cc.moveBy(0.6, cc.p(0, 6)),
                        cc.moveTo(0.6, cc.p(x, y)),
                    )
                )
            );
        } else {
            this._lastTipsNode.active = false;
        }
    },

    // update (dt) {},
});
