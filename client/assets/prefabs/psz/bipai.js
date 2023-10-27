cc.Class({
    extends: cc.Component,

    properties: {
        feiNode: {
            default: null,
            type: cc.Node
        },
    },

    onLoad() {
        cc.utils.setNodeWinSize(this.node);
    },

    reset() {
        this.unscheduleAllCallbacks();
        this.feiNode.children.forEach(function (el) {
            el.stopAllActions();
            el.active = false;
            el.isme = undefined;
            if (el.oriscale != undefined) {
                el.scale = el.oriscale;
            } else {
                el.oriscale = el.scale;
            }

            if (el.orip != undefined) {
                el.setPosition(el.orip);
            } else {
                el.orip = el.getPosition();
            }

            el.children.forEach((poker) => {
                poker.stopAllActions();
                if (poker.orip != undefined) {
                    poker.setPosition(poker.orip);
                } else {
                    poker.orip = poker.getPosition();
                }
            });
        });

        let bipaidi = this.node.getChildByName('bipaidiNode').getComponent(sp.Skeleton);
        bipaidi.node.active = false;
        bipaidi.getComponent(sp.Skeleton).clearTracks();

        let resNode = this.node.getChildByName('bipaiquanNode');
        resNode.getComponent(sp.Skeleton).clearTracks();
        resNode.active = false;

        this.node.getChildByName('xxNode').active = false;
        this.node.getChildByName('xxNode').getComponent(cc.Animation).stop();

        this.node.getChildByName('loseNode').active = false;

        this.node.active = false;
    },

    show(localSeatId, loserLocalSeatId) {
        this.reset();
        this.node.active = true;
        this.node.zIndex = 99;
        this.next(localSeatId, loserLocalSeatId);
    },

    next(localSeatId, loserLocalSeatId) {
        localSeatId.sort();

        let keySelf = localSeatId.indexOf(0);
        let location1 = cc.p(-335, 16);
        let location2 = cc.p(335, 16);

        let leftPokers = undefined;
        let rightPokers = undefined;
        if (keySelf > -1) {
            if (localSeatId[1] < 4) {
                //自己的往左飞  另一个往右
                leftPokers = this.feiNode.children[0];
                rightPokers = this.feiNode.children[localSeatId[1]];
                leftPokers.isme = true;
            } else {
                //自己的往右飞  另一个往左
                leftPokers = this.feiNode.children[localSeatId[1]];
                rightPokers = this.feiNode.children[0];
                rightPokers.isme = true;
            }
        } else {
            leftPokers = this.feiNode.children[localSeatId[1]];
            rightPokers = this.feiNode.children[localSeatId[0]];
        }

        leftPokers.active = true;
        rightPokers.active = true;
        leftPokers.topos = location1;
        rightPokers.topos = location2;

        if (leftPokers.isme) {
            leftPokers.runAction(cc.spawn(cc.moveTo(0.3, leftPokers.topos), cc.scaleTo(0.3, 1)));
            leftPokers.children.forEach((poker, i) => {
                if (i == 0) {
                    poker.x = -77;
                } else if (i == 2) {
                    poker.x = 77;
                }
            });
            rightPokers.runAction(cc.moveTo(0.3, rightPokers.topos));
        } else if (rightPokers.isme) {
            rightPokers.runAction(cc.spawn(cc.moveTo(0.3, rightPokers.topos), cc.scaleTo(0.3, 1)));
            rightPokers.children.forEach((poker, i) => {
                if (i == 0) {
                    poker.x = -77;
                } else if (i == 2) {
                    poker.x = 77;
                }
            });
            leftPokers.runAction(cc.moveTo(0.3, leftPokers.topos));
        } else {
            leftPokers.runAction(cc.moveTo(0.3, leftPokers.topos));
            rightPokers.runAction(cc.moveTo(0.3, rightPokers.topos));
        }

        let bipaidi = this.node.getChildByName('bipaidiNode').getComponent(sp.Skeleton);
        bipaidi.node.active = true;
        bipaidi.setAnimation(0, "newAnimation", false);

        let resNode = this.node.getChildByName('bipaiquanNode');
        resNode.getComponent(sp.Skeleton).clearTracks();
        resNode.active = false;

        this.scheduleOnce(function () {
            cc.vv.audioMgr.playSFX("psz/shandian.mp3");
            let x = this.feiNode.children[loserLocalSeatId].x;
            resNode.getComponent(sp.Skeleton).setAnimation(1, "newAnimation", false);
            let xxNode = this.node.getChildByName('xxNode');
            xxNode.active = false;
            xxNode.getComponent(cc.Animation).stop();
            this.scheduleOnce(function () {
                if (x < 0) {
                    xxNode.getComponent(cc.Animation).play('xxAnimation');
                    xxNode.setPosition(location1);
                    xxNode.active = true;
                } else {
                    xxNode.getComponent(cc.Animation).play('xxAnimation');
                    xxNode.setPosition(location2);
                    xxNode.active = true;
                }
            },0.6);

            this.scheduleOnce(function () {
                resNode.active = true;
            }, 0.1);

            this.scheduleOnce(() => {
                let loseNode = this.node.getChildByName('loseNode');
                if (x < 0) {
                    loseNode.x = location1.x;
                } else {
                    loseNode.x = location2.x;
                }
                loseNode.active = true;
            }, 1.2);
        }, 0.4);

        this.scheduleOnce(function () {
            resNode.active = false;
            this.node.getChildByName('xxNode').active = false;
            this.node.getChildByName('loseNode').active = false;
            if (!!leftPokers.isme) {
                leftPokers.runAction(cc.spawn(cc.moveTo(0.3, leftPokers.orip), cc.scaleTo(0.3, 1.7)));
                leftPokers.children.forEach((poker, i) => {
                    if (i == 0) {
                        poker.x = -106;
                    } else if (i == 2) {
                        poker.x = 106;
                    }
                });
                rightPokers.runAction(cc.moveTo(0.3, rightPokers.orip));
            } else if (!!rightPokers.isme) {
                rightPokers.runAction(cc.spawn(cc.moveTo(0.3, rightPokers.orip), cc.scaleTo(0.3, 1.7)));
                rightPokers.children.forEach((poker, i) => {
                    if (i == 0) {
                        poker.x = -106;
                    } else if (i == 2) {
                        poker.x = 106;
                    }
                });
                leftPokers.runAction(cc.moveTo(0.3, leftPokers.orip));
            } else {
                rightPokers.runAction(cc.moveTo(0.3, rightPokers.orip));
                leftPokers.runAction(cc.moveTo(0.3, leftPokers.orip));
            }
        }, 2.2);

        this.scheduleOnce(function () {
            this.node.active = false;
        }, 2.8);
    }
});
