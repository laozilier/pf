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

        resFrames: {
            default: [],
            type: cc.SpriteFrame
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let fourx = 106;
        let foury = 14;
        let startx = 35;
        let starty = 0;
        let marginx = 71;
        let marginy = 0;
        this.playerNodes = [];
        for (let i = 0; i < 4; i++) {
            let playerNode = this.node.getChildByName('player_'+i);
            if (!!playerNode) {
                this.playerNodes.push(playerNode);
                let groupNode = playerNode.getChildByName('groupNode');
                let inPokersNode = groupNode.getChildByName('inPokers');
                for (let j = 0; j < 4; j++) {
                    let inPokerNode = inPokersNode.getChildByName('inPoker'+j);
                    for (let k = 0; k < 4; k++) {
                        let mjCard = cc.instantiate(this.mjPrefab);
                        inPokerNode.addChild(mjCard, k, 'mjCard'+k);
                        if (k == 3) {
                            mjCard.x = fourx;
                            mjCard.y = foury;
                        } else {
                            mjCard.x = startx+(k*marginx);
                            mjCard.y = starty+(k*marginy);
                        }
                    }
                }
                let holdsNode = groupNode.getChildByName('holds');
                for (let k = 0; k < 13; k++) {
                    let mjCard = cc.instantiate(this.mjPrefab);
                    holdsNode.addChild(mjCard, k, 'mjCard'+k);
                }

                let huNode = groupNode.getChildByName('huNode');
                let mjCard = cc.instantiate(this.mjPrefab);
                huNode.addChild(mjCard, -1, 'mjCard');

                let resNode = playerNode.getChildByName('resNode');
                let zhaniaoNode = resNode.getChildByName('niao');
                let niaoLayout = zhaniaoNode.getChildByName('layout');
                for (let j = 0; j < 6; j++) {
                    let mjCard = cc.instantiate(this.mjPrefab);
                    niaoLayout.addChild(mjCard, j, 'mjCard'+j);
                }
            }
        }

        let bottomNode = this.node.getChildByName('bottomNode');
        for (let i = 0; i < 60; i++) {
            let mjCard = cc.instantiate(this.mjPrefab);
            bottomNode.addChild(mjCard, i, 'mjCard'+i);
        }
    },

    start () {

    },

    openRelustNode(userInfos, bottomCards, leftCards) {
        this.node.active = true;
        for (let i = 0; i < this.playerNodes.length; i++) {
            let playerNode = this.playerNodes[i];
            let headNode = playerNode.getChildByName('headNode');
            let nameNode = playerNode.getChildByName('name');
            let bankNode = playerNode.getChildByName('bank');
            let resNode = playerNode.getChildByName('resNode');
            let resScoreNode = resNode.getChildByName('resScore');
            let halfScoreNode = resNode.getChildByName('halfScore');
            let zhaniaoNode = resNode.getChildByName('niao');
            let niaoLayout = zhaniaoNode.getChildByName('layout');

            let groupNode = playerNode.getChildByName('groupNode');
            let inPokersNode = groupNode.getChildByName('inPokers');
            let holdsNode = groupNode.getChildByName('holds');
            let huNode = groupNode.getChildByName('huNode');

            let holds = [];
            if (i < userInfos.length) {
                let obj = userInfos[i];
                holds = obj.holds;
                headNode.active = true;
                headNode.getComponent('HeadNode').updateData(obj.pic, obj.sex);
                nameNode.active = true;

                let namestr = cc.utils.fromBase64(obj.name, 8);
                nameNode.getComponent(cc.Label).string = namestr;
                nameNode.getChildByName('Label').getComponent(cc.Label).string = namestr;
                
                resNode.active = true;
                resScoreNode.getComponent('resScore').showScore(obj.score);
                halfScoreNode.getComponent('resScore').showScore(obj.halfwayScore);
                if (Array.isArray(obj.zhaniao) && obj.zhaniao.length > 0) {
                    zhaniaoNode.active = true;
                    for (let j = 0; j < 6; j++) {
                        let niao = niaoLayout.getChildByName('mjCard'+j);
                        if (!niao) {
                            continue;
                        }
                        if (j < obj.zhaniao.length) {
                            niao.active = true;
                            let v = obj.zhaniao[j].card;
                            niao.getComponent('mj').showOutMjValue(v);
                        } else {
                            niao.active = false;
                        }
                    }
                } else {
                    zhaniaoNode.active = false;
                }
                bankNode.active = true;
                bankNode.active = !!obj.isBanker;
                let inPokers = obj.inPokers;
                inPokersNode.active = inPokers.length > 0;
                for (let j = 0; j < 4; j++) {
                    let inPokerNode = inPokersNode.getChildByName('inPoker'+j);
                    if (j < inPokers.length) {
                        inPokerNode.active = true;
                        let inPoker = inPokers[j];
                        let vs = inPoker.vs;
                        for (let k = 0; k < 4; k++) {
                            let mjCard = inPokerNode.getChildByName('mjCard'+k);
                            if (k < vs.length) {
                                mjCard.getComponent('mj').showInPokerMjValue(vs[k]);
                                if (k == 3) {
                                    if (inPoker.gt == cc.game_enum.gangType.dian) {
                                        mjCard.color = cc.color(200,200,200,255);
                                    } else {
                                        mjCard.color = cc.Color.WHITE;
                                    }
                                }
                            } else {
                                mjCard.active = false;
                            }
                        }
                    } else {
                        inPokerNode.active = false;
                    }
                }

                if (obj.isZimo || obj.isPao || obj.isHu) {
                    huNode.active = true;
                    let mjCard = huNode.getChildByName('mjCard');
                    mjCard.getComponent('mj').showInPokerMjValue(obj.huCard);

                    let huPao = huNode.getChildByName('hu');
                    huPao.active = false;
                    let zimo = huNode.getChildByName('zimo');
                    zimo.active = false;
                    let fangpao = huNode.getChildByName('fangpao');
                    fangpao.active = false;
                    if (obj.isZimo || obj.isPao) {
                        mjCard.opacity = 255;
                        mjCard.color = cc.hexToColor('#FFBBBB');
                        if (obj.isZimo) {
                            zimo.active = true;
                        } else {
                            fangpao.active = true;
                        }
                    } else {
                        mjCard.opacity = 120;
                        huPao.active = true;
                    }
                } else {
                    huNode.active = false;
                }
            } else {
                headNode.active = false;
                nameNode.active = false;
                bankNode.active = false;
                resNode.active = false;
                inPokersNode.active = false;
                holds = leftCards[i-userInfos.length];
                huNode.active = false;
            }

            this.sortHolds(holds);
            for (let k = 0; k < 13; k++) {
                let mjCard = holdsNode.getChildByName('mjCard'+k);
                if (k < holds.length) {
                    mjCard.getComponent('mj').showInPokerMjValue(holds[k]);
                } else {
                    mjCard.active = false;
                }
            }
        }

        let bottomNode = this.node.getChildByName('bottomNode');
        for (let i = 0; i < 60; i++) {
            let mjCard = bottomNode.getChildByName('mjCard'+i);
            if (i < bottomCards.length) {
                mjCard.getComponent('mj').showInPokerMjValue(bottomCards[i]);
            } else {
                mjCard.active = false;
            }
        }
    },

    sortHolds(holds) {
        holds.sort((a, b) => {
            if (a == 35 && b != 35) {
                return -1;
            }

            if (a != 35 && b == 35) {
                return 1;
            }

            return a-b;
        });
    },

    // update (dt) {},
});
