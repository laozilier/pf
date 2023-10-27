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

        s_zpPrefab: {
            default: null,
            type: cc.Prefab
        },

        actionNode: {
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
     * @param info 坐标
     * @param data 进牌数据
     * @param action_p 进牌玩家action坐标
     */
    inPoker(info, data, rotated, action_p) {
        let inPoker_v = data.v;
        let nodes = [];
        let starts = info.starts;
        let ends = info.ends;
        let isFromIns = info.isFromIns;
        let isAllFromHolds = info.isAllFromHolds;
        let out_p = info.out_p;
        out_p = cc.p(out_p.tx, out_p.ty);
        let my_out_p = info.my_out_p;
        my_out_p = cc.p(my_out_p.tx, my_out_p.ty);
        if (isFromIns || !isAllFromHolds) {
            let card = cc.instantiate(this.zpPrefab);
            if (rotated) {
                card.rotation = 90;
            }
            card.setPosition(out_p);
            card.getComponent('Zipai').showZPValue(inPoker_v);
            this.node.addChild(card);
            nodes.push(card);
        }

        for (let i = 0; i < starts.length; i++) {
            let obj = starts[i];
            let p = obj.p;
            let v = obj.v;
            let n = cc.instantiate(this.zpPrefab);
            if (isFromIns) {
                n.scale = 0.39;
                n.setPosition(cc.p(p.tx, p.ty-36));
            } else {
                n.setPosition(cc.p(p.tx, p.ty));
            }

            n.getComponent('Zipai').showZPValue(v);
            this.node.addChild(n);
            nodes.push(n);
        }

        for (let i = 0; i < nodes.length; i++) {
            let n = nodes[i];
            let a = undefined;
            if (isFromIns) {
                if (rotated) {
                    a = cc.spawn(cc.rotateTo(0.1, 0), cc.moveTo(0.1, cc.p(out_p.x, out_p.y-60*i)), cc.scaleTo(0.1, 0.6));
                } else {
                    a = cc.spawn(cc.moveTo(0.1, cc.p(out_p.x, out_p.y-60*i)), cc.scaleTo(0.1, 0.6));
                }
            } else {
                if (isAllFromHolds) {
                    a = cc.spawn(cc.moveTo(0.1, cc.p(my_out_p.x, my_out_p.y-60*i)), cc.scaleTo(0.1, 0.6));
                } else {
                    if (rotated) {
                        a = cc.spawn(cc.rotateTo(0.1, 0), cc.moveTo(0.1, cc.p(out_p.x, out_p.y-60*i)), cc.scaleTo(0.1, 0.6));
                    } else {
                        a = cc.spawn(cc.moveTo(0.1, cc.p(out_p.x, out_p.y-60*i)), cc.scaleTo(0.1, 0.6));
                    }
                }
            }
            let p = ends[i];
            let b = cc.spawn(cc.moveTo(0.2, cc.p(p.tx, p.ty - 36)), cc.scaleTo(0.2, 0.39), cc.fadeTo(0.2, 0), cc.callFunc(()=> {
                let paimian = n.getChildByName('paimian');
                paimian.runAction(cc.scaleTo(0.2, 1, 0.36));
                let font_2 = n.getChildByName('font_2');
                font_2.runAction(cc.fadeTo(0.1, 0));
            }));

            n.runAction(cc.sequence(a, cc.delayTime(0.2), b, cc.removeSelf(true)));
        }

        let actionNode = this.node.getChildByName('actionNode');
        if (!actionNode) {
            actionNode = cc.instantiate(this.actionNode);
            this.node.addChild(actionNode, 99, 'actionNode');
        } 
        
        actionNode.getComponent('ZpActionNode').inPoker(action_p, data);
    },

    sishou(p) {
        let actionNode = this.node.getChildByName('actionNode');
        if (!actionNode) {
            actionNode = cc.instantiate(this.actionNode);
            this.node.addChild(actionNode, 99, 'actionNode');
        } 
        
        actionNode.getComponent('ZpActionNode').sishou(p);
    },

    /**
     * 胡牌动画
     * @param {*} res 
     * @param {*} data 
     * @param {*} rotated 
     */
    actionHu(res, data, rotated, action_p) {
        if (!!res) {
            let v = data.v;
            let out_p = res.out_p;
            let nodes = [];
            if (!!v) {
                let card = cc.instantiate(this.zpPrefab);
                if (rotated) {
                    card.rotation = 90;
                }
                card.setPosition(out_p);
                card.getComponent('Zipai').showZPValue(v);
                this.node.addChild(card,10);
                nodes.push(card);
            } else {
                if (!rotated) {
                    nodes.push(0);
                }
            }
            
            let starts = res.starts;
            for (let i = 0; i < starts.length; i++) {
                let obj = starts[i];
                let p = obj.p;
                let n = cc.instantiate(this.zpPrefab);
                n.setPosition(cc.p(p.tx, p.ty));
                n.getComponent('Zipai').showZPValue(obj.v);
                this.node.addChild(n, 11+i);
                nodes.push(n);
            }
    
            for (let i = 0; i < nodes.length; i++) {
                let n = nodes[i];
                if (n == 0) {
                    continue;
                }
                let a = undefined;
                if (rotated && !!v) {
                    a = cc.spawn(cc.rotateTo(0.1, 0), cc.moveTo(0.1, cc.p(out_p.x, out_p.y-60*i)), cc.scaleTo(0.1, 0.6));
                } else {
                    a = cc.spawn(cc.moveTo(0.1, cc.p(out_p.x, out_p.y-60*i)), cc.scaleTo(0.1, 0.6));
                }
                n.runAction(a);
            }
        }

        let actionNode = this.node.getChildByName('actionNode');
        if (!actionNode) {
            actionNode = cc.instantiate(this.actionNode);
            this.node.addChild(actionNode, 99, 'actionNode');
        } 
        
        actionNode.getComponent('ZpActionNode').actionHu(action_p, data);
    },

    /**
     * 弃牌动画
     * @param res
     * @param data
     */
    qiPoker(res, data, rotated) {
        let card = cc.instantiate(this.zpPrefab);
        if (rotated) {
            card.rotation = 90;
        }
        let start = res.start;
        card.setPosition(start);
        card.getComponent('Zipai').showZPValue(data.v);
        this.node.addChild(card);

        let p = res.end;
        let a = undefined;
        if (rotated) {
            a = cc.spawn(cc.rotateTo(0.3, 0), cc.moveTo(0.3, cc.p(p.x, p.y-36)), cc.scaleTo(0.3, 0.39), cc.fadeTo(0.3, 0));
        } else {
            a = cc.spawn(cc.moveTo(0.3, cc.p(p.x, p.y-36)), cc.scaleTo(0.3, 0.39), cc.fadeTo(0.3, 0));
        }
        let paimian = card.getChildByName('paimian');
        paimian.runAction(cc.scaleTo(0.3, 1, 0.36));
        let font_2 = card.getChildByName('font_2');
        font_2.runAction(cc.fadeTo(0.1, 0));
        card.runAction(cc.sequence(a, cc.removeSelf(true)));
    },

    /**
     * 摸牌动画
     * @param start
     * @param end
     */
    drawCard(start, end, v, rotated, hu) {
        let n = cc.instantiate(this.zpPrefab);
        n.getComponent('Zipai').showZPValue(-1);
        n.rotation = 90;
        this.node.addChild(n);
        n.setPosition(start);
        if (v > 0) {
            let a = undefined;
            if (rotated) {
                a = cc.spawn(
                    cc.moveTo(0.3, end),
                    cc.scaleTo(0.3, 0, !!hu ? 0.6 : 1));
            } else {
                a = cc.spawn(
                    cc.moveTo(0.3, end),
                    cc.rotateTo(0.3, 0),
                    cc.scaleTo(0.3, 0, !!hu ? 0.6 : 1));
            }

            let b = cc.callFunc(()=> {
                //发牌音效
                n.getComponent('Zipai').showZPValue(v);
            });
            let c = cc.scaleTo(0.2, !!hu ? 0.6 : 1);
            let seq = cc.sequence(a, b, c, !!hu ? cc.delayTime(1) : cc.removeSelf(true));
            n.runAction(seq);
        } else {
            let a = undefined;
            if (rotated) {
                if (!!hu) {
                    a = cc.spawn(cc.moveTo(0.3, end), cc.scaleTo(0.3, 0.6));
                } else {
                    a = cc.moveTo(0.3, end);
                }
            } else {
                if (!!hu) {
                    a = cc.spawn(cc.moveTo(0.3, end), cc.rotateTo(0.3, 0), cc.scaleTo(0.3, 0.6));
                } else {
                    a = cc.spawn(cc.moveTo(0.3, end), cc.rotateTo(0.3, 0));
                }
            }

            let seq = cc.sequence(a, cc.delayTime(0.2), !!hu ? cc.delayTime(1) : cc.removeSelf(true));
            n.runAction(seq);
        }
    },

    /**
     * 出牌动画
     * @param res {start, end, v, show, rotated}
     */
    discard(res) {
        let start = res.start;
        let end = res.end;
        let v = res.v;
        let show = res.show;
        let rotated = res.rotated;

        let n = cc.instantiate(this.zpPrefab);
        n.getComponent('Zipai').showZPValue(!!show ? v : -1);
        this.node.addChild(n);
        n.getChildByName('paimian').color = cc.color(200,200,200,255);
        n.setPosition(start);
        if (!!show) {
            let a = undefined;
            if (rotated) {
                a = cc.spawn(cc.moveTo(0.3, end), cc.rotateTo(0.3, 90));
            } else {
                a = cc.moveTo(0.3, end);
            }
            let seq = cc.sequence(a, cc.delayTime(0.2), cc.removeSelf(true));
            n.runAction(seq);
        } else {
            n.scale = 0.3;
            let a = undefined;
            if (rotated) {
                a = cc.spawn(
                    cc.moveTo(0.3, end),
                    cc.rotateTo(0.3, 90),
                    cc.scaleTo(0.3, 0, 1));
            } else {
                a = cc.spawn(
                    cc.moveTo(0.3, end),
                    cc.scaleTo(0.3, 0, 1));
            }
            let b = cc.callFunc(()=> {
                //发牌音效
                n.getComponent('Zipai').showZPValue(v);
            });
            let c = cc.scaleTo(0.2, 1);
            let seq = cc.sequence(a, b, c, cc.removeSelf(true));
            n.runAction(seq);
        }
    },

    /**
     * 加入一张手牌动画
     * @param start
     * @param end
     * @param v
     * @param rotated
     */
    addHolds(start, end, v, rotated) {
        let n = cc.instantiate(this.zpPrefab);
        n.getComponent('Zipai').showZPValue(v);
        this.node.addChild(n);
        n.setPosition(start);
        if (rotated) {
            n.rotation = 90;
        }

        let a = undefined;
        if (rotated) {
            a = cc.spawn(cc.moveTo(0.3, end), cc.rotateTo(0.3, 0), cc.fadeTo(0.3, 0));
        } else {
            a = cc.spawn(cc.moveTo(0.3, end), cc.scaleTo(0.3, 0.4));
        }
        let seq = cc.sequence(a, cc.delayTime(0.3), cc.removeSelf(true));
        n.runAction(seq);
    },

    /**
     * 翻醒动画
     * @param {*} p 
     * @param {*} data 
     */
    fanxing(p, data) {
        if (data.t == 3) {
            
        } else {
            let n = cc.instantiate(this.zpPrefab);
            n.getComponent('Zipai').showZPValue(-1);
            this.node.addChild(n);
            n.setPosition(p);
            n.rotation = 90;
    
            let a = cc.scaleTo(0.2, 0, 1);
            let b = cc.callFunc(()=> {
                n.getComponent('Zipai').showZPValue(data.xingCard);
            });
            let c = cc.scaleTo(0.2, 1, 1);
            n.runAction(cc.sequence(a, b, c));
    
            let xingNode = cc.instantiate(this.s_zpPrefab);
            n.addChild(xingNode);
            xingNode.getComponent('Zipai').showZPValue(data.xing);
            xingNode.rotation = -90;
            xingNode.opacity = 0;
            xingNode.runAction(cc.sequence(
                cc.delayTime(0.5),
                cc.spawn(
                    cc.scaleTo(0.2, 0.6),
                    cc.fadeTo(0.2, 255)
                ),            
                cc.scaleTo(0.1, 0.8),
                cc.scaleTo(0.1, 0.7)
            ));
        }

        let actionNode = cc.instantiate(this.actionNode);
        this.node.addChild(actionNode, 99, 'actionNode_fanxing');
        actionNode.getComponent('ZpActionNode').fanxing(p, data);
    },

    bankLastcard(start, to, end, v, rotated) {
        let n = cc.instantiate(this.zpPrefab);
        n.getComponent('Zipai').showZPValue(-1);
        this.node.addChild(n);
        n.setPosition(start);
        n.rotation = 90;

        let a = undefined;
        
        if (rotated) {
            a = cc.spawn(cc.moveTo(0.2, to), cc.scaleTo(0.2, 0, 1));
        } else {
            a = cc.spawn(cc.moveTo(0.2, to), cc.scaleTo(0.2, 0, 1), cc.rotateTo(0.2, 0));
        }

        let b = cc.callFunc(()=> {
            n.getComponent('Zipai').showZPValue(v);
        });

        let c = cc.scaleTo(0.1, 1);
        let d = cc.delayTime(0.3);
        let e = undefined;
        if (rotated) {
            e = cc.spawn(cc.rotateTo(0.2, 0), cc.moveTo(0.2, end), cc.fadeTo(0.2, 0));  
        } else {
            e = cc.spawn(cc.scaleTo(0.2, 0.4), cc.moveTo(0.2, end));
        }
        
        let seq = cc.sequence(a, b, c, d, e, cc.delayTime(0.3), cc.removeSelf(true));
        n.runAction(seq);
    }
});
