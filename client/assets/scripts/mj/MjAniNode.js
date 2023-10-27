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

        actionNode: {
            default: null,
            type: cc.Prefab
        },

        zhaniaoNode: {
            default: null,
            type: cc.Prefab
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    reset() {
        this.node.removeAllChildren(true);
    },

    // update (dt) {},
    /**
     * 进牌动画
     * @param res 动画数据
     * @param info 进牌数据
     */
    inPoker(res, info) {
        console.log('麻将动画 inPoker res = ', res, ' info = ', info);
        let out_p = res.out_p;
        let action_p = res.action_p;
        let localSeat = res.localSeat;
        let starts = res.starts;
        let ends = res.ends;
        let vs = info.vs;
        let idx = 0;
        let nodes = [];
        if (!!out_p) {
            let mjCard = cc.instantiate(this.mjPrefab);
            mjCard.setPosition(out_p);
            this.node.addChild(mjCard);
            mjCard.getComponent('mj').showInPokerMjValue(vs[idx], localSeat);
            nodes.push(mjCard);
            idx+=1;
        }

        for (let i = 0; i < starts.length; i++) {
            let pos = starts[i];
            let mjCard = cc.instantiate(this.mjPrefab);
            mjCard.setPosition(pos);
            this.node.addChild(mjCard);
            mjCard.getComponent('mj').showInPokerMjValue(vs[idx], localSeat);
            nodes.push(mjCard);
            idx+=1;
        }

        let middlex = action_p.x;
        let middley = action_p.y;
        let allPostions = [
            [cc.p(middlex-71, middley-48), cc.p(middlex, middley-48), cc.p(middlex+71, middley-48), cc.p(middlex, middley+14-48)],
            [cc.p(middlex+60, middley-30), cc.p(middlex+60, middley), cc.p(middlex+60, middley+30), cc.p(middlex+60, middley+10)],
            [cc.p(middlex+50, middley+60), cc.p(middlex, middley+60), cc.p(middlex-50, middley+60), cc.p(middlex, middley+10+60)],
            [cc.p(middlex-60, middley+30), cc.p(middlex-60, middley), cc.p(middlex-60, middley-30), cc.p(middlex-60, middley+10)]
        ];

        let positions = allPostions[localSeat];
        for (let i = 0; i < nodes.length; i++) {
            let mjCard = nodes[i];
            if (localSeat == 1) {
                if (i == 3) {
                    mjCard.setLocalZOrder(3);
                } else {
                    mjCard.setLocalZOrder(nodes.length-i);
                }
            }
            mjCard.runAction(cc.sequence(cc.moveTo(0.2, starts.length == 1 ? positions[1] : positions[i]), 
            cc.delayTime(0.6), 
            cc.moveTo(0.2, ends[i]), 
            cc.removeSelf()));
        }

        let actionNode = this.node.getChildByName('actionNode');
        if (!actionNode) {
            actionNode = cc.instantiate(this.actionNode);
            this.node.addChild(actionNode, 99, 'actionNode');
        } 
        
        actionNode.getComponent('MjActionNode').inPoker(action_p, info, localSeat);
    },
    /**
     * 胡牌动画
     * @param {*} action_p
     * @param {*} huType
     */
    actionHu(action_p, huType) {
        let actionNode = cc.instantiate(this.actionNode);
        this.node.addChild(actionNode, 99, 'actionHu');
        actionNode.getComponent('MjActionNode').actionHu(action_p, huType);
    },

    /**
     * 弃牌动画
     * @param res {start, end, v, localSeat}
     */
    qiPoker(res) {
        let start = res.start;
        let end = res.end;
        let localSeat = res.localSeat;
        let v = res.v;
        let mjCard = cc.instantiate(this.mjPrefab);
        mjCard.setPosition(start);
        this.node.addChild(mjCard);
        mjCard.getComponent('mj').showTansMjValue(v, localSeat);
        mjCard.runAction(cc.sequence(
                cc.moveTo(0.2, end),
                cc.removeSelf()
            )
        );
    },

    /**
     * 摸牌动画
     * @param res {start, end, v, localSeat}
     */
    drawCard(res) {
        let end = res.end;
        let localSeat = res.localSeat;
        let mjCard = cc.instantiate(this.mjPrefab);
        mjCard.setPosition(end);
        this.node.addChild(mjCard);
        if (localSeat == 0) {
            mjCard.scale = 1.3;
        }
        mjCard.getComponent('mj').showInPokerMjValue(-1, localSeat);
        mjCard.runAction(cc.sequence(
                cc.delayTime(0.3),
                cc.removeSelf()
            )
        );
    },

    /**
     * 出牌动画
     * @param res
     */
    disCard(res) {
        let start = res.start;
        let end = res.end;
        //let localSeat = res.localSeat;
        let v = res.v;
        let mjCard = cc.instantiate(this.mjPrefab);
        mjCard.setPosition(start);
        this.node.addChild(mjCard);
        mjCard.getComponent('mj').showTansMjValue(v, 0);
        mjCard.runAction(cc.sequence(
                cc.moveTo(0.2, end),
                cc.removeSelf()
            )
        );
    },

    /**
     * 扎鸟动画
     * @param res
     */
    zhaniao(res) {
        let start = res.start;
        let middle = res.middle;
        let ends = res.ends;
        let niaos = [];
        let margin = 90;
        let w = margin*(ends.length-1);
        let startx = -w/2+(ends.length%2 == 0 ? margin/2 : 0);
        for (let i = 0; i < ends.length; i++) {
            let end = ends[i];
            let v = end.v;
            let mjCard = cc.instantiate(this.mjPrefab);
            this.node.addChild(mjCard);
            mjCard.setPosition(start);
            mjCard.getComponent('mj').showInPokerMjValue(-1, 0);
            mjCard.scale = 0.5;
            mjCard.runAction(cc.sequence(
                cc.spawn(cc.moveTo(0.2, cc.p(middle.x+startx, middle.y)),cc.scaleTo(0.2, 1.3)),
                cc.delayTime(0.5),
                cc.callFunc(()=> {
                    mjCard.getComponent('mj').showTansMjValue(v, 0);
                    mjCard.scale = 1;
                }),
                cc.delayTime(3),
                cc.removeSelf()
            ));
            let zhaniaoNode = cc.instantiate(this.zhaniaoNode);
            zhaniaoNode.y = middle.y;
            zhaniaoNode.x = middle.x+startx;
            this.node.addChild(zhaniaoNode, 99);
            zhaniaoNode.opacity = 0;
            niaos.push(zhaniaoNode);
            
            startx+=margin;
        }

        this.flyNiaos(niaos, ends);
    },

    flyNiaos(niaos, ends) {
        setTimeout(() => {
            niaos.forEach((el, idx) => {
                let end = ends[idx];
                if (!end) {
                    return;
                }

                let start = el.getPosition();
                let p = end.p;
                let d = Math.pow(Math.abs(start.x-p.x), 2)+Math.pow(Math.abs(start.y-p.y), 2);
                d = Math.pow(d, 0.5);
                let t = d/500;
                el.opacity = 255;
                el.scale = 0.72;
                if (start.x < p.x) {
                    el.scaleX = -0.72;
                }
                el.getComponent(cc.Animation).play();
                el.runAction(cc.sequence(
                    cc.delayTime(0.5),
                    cc.moveTo(t, p),
                    cc.fadeTo(0.1, 0),
                    cc.removeSelf()
                ));
            }); 
        }, 800);
    }
});
