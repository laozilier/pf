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

        cardsNode: {
            default: null,
            type: cc.Node
        },

        paiType: {
            default: null,
            type: cc.Node
        },

        pdkTypeFrames: {
            default: [],
            type: cc.SpriteFrame
        },

        localSeat: 0
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.zhadan = this.paiType.getChildByName('zhadan');
        this.liandui = this.paiType.getChildByName('liandui');
        this.shunzi = this.paiType.getChildByName('shunzi');
        this.feiji = this.paiType.getChildByName('feiji');
        this.typeNode = this.paiType.getChildByName('typeNode');
        this.tuolaji = this.paiType.getChildByName('tuolaji');
        this.shuaipai = this.paiType.getChildByName('shuaipai');
        this.oriPos = this.cardsNode.getPosition();
    },

    start () {

    },

    reset() {
        this.resetPaiType();
        this.paiType.active = false;
        this.cardsNode.stopAllActions();
        this.cardsNode.children.forEach(el => {
            el.active = false;
        });
    },

    resetPaiType() {
        if (!!this.zhadan) { this.zhadan.active = false; this.zhadan.getComponent(cc.Animation).stop() };
        if (!!this.liandui) { this.liandui.active = false; this.liandui.getComponent(cc.Animation).stop() };
        if (!!this.shunzi) { this.shunzi.active = false; this.shunzi.getComponent(cc.Animation).stop() };
        if (!!this.feiji) { this.feiji.active = false; this.feiji.getComponent(cc.Animation).stop() };
        if (!!this.tuolaji) { this.tuolaji.active = false; this.tuolaji.getComponent(cc.Animation).stop() };
        if (!!this.shuaipai) { this.shuaipai.active = false; this.shuaipai.getComponent(cc.Animation).stop() };
        if (!!this.typeNode) { this.typeNode.active = false; this.typeNode.stopAllActions() };
    },

    /**
     * 显示打出的牌
     * @param {*} cardsData 
     * @param {*} startp 
     * @param {*} alg
     */
    openOutCards(cardsData, startp, alg) {
        if (!!startp) {
            startp = this.node.convertToNodeSpaceAR(startp);
        }
        let cards = cardsData.cards;
        let type = cardsData.type;
        this.cardsLen = cards.length;
        cards.forEach((v, idx)=> {
            let poker = this.cardsNode.getChildByName('poker'+idx);
            if (!poker) {
                poker = cc.instantiate(this.pokerPrefab);
                poker.scale = 0.5;
                this.cardsNode.addChild(poker, idx, 'poker'+idx);
            }
            let poker_scr = poker.getComponent('poker');
            poker_scr.show(v);

            if (cc.gameName == 'poker_sbf' || cc.gameName == 'poker_sdh') {
                poker_scr.setBig(false);
                poker_scr.setStarter(false);
                if (idx == cards.length-1) {
                    if (!!cardsData.first) {
                        poker_scr.setStarter(true);
                    } else if (!!cardsData.max) {
                        poker_scr.setBig(true);
                    }
                } 
                poker_scr.setZhu(alg.isAllZhu([v]));
            }
        });

        this.outsAni(type, startp);
    },

    /**
     * 出牌出去动画
     */
    outsAni(type, startp) {
        this.cardsNode.stopAllActions();
        if (!startp) {
            this.checkType(type);
            return;
        }
        
        this.cardsNode.position = startp;
        this.cardsNode.runAction(cc.sequence(cc.moveTo(0.1, this.oriPos), cc.callFunc(()=> {
            this.checkType(type);
        })));
    },

    checkType(type) {
        this.resetPaiType();
        switch (cc.gameName) {
            case 'poker_pdk':
                this.pdk_qianfen_next(type);
                break;
            case 'poker_qianfen':
                this.pdk_qianfen_next(type);
                break;
            case 'poker_sbf':
            case 'poker_sdh':
                this.sbf_sdh_next(type);
                break;  
            default:
                break;
        }
    },

    /**
     * 跑得快显示特效
     * @param {*} type 
     */
    pdk_qianfen_next(type) {
        if (type == 1) { return; }
        if (type === cc.game_enum.cardsType.AAAA) {
            this.zhadan.active = true;
            this.zhadan.getComponent(cc.Animation).play("zhadan");
        } else if (type === cc.game_enum.cardsType.AABB) {
            this.liandui.active = true;
            this.liandui.getComponent(cc.Animation).play("liandui");
        } else if (type === cc.game_enum.cardsType.ABC) {
            this.shunzi.active = true;
            this.shunzi.getComponent(cc.Animation).play("shunzi");
        } else if (type === cc.game_enum.cardsType.AAABBB) {
            this.feiji.active = true;
            this.feiji.getComponent(cc.Animation).play("feiji"+this.localSeat);
        } 

        if (!this.typeNode) {
            return;
        }

        this.paiType.active = true;
        this.typeNode.active = true;
        let typeSpr = this.typeNode.getChildByName('typeSpr');
        let bombNum = this.typeNode.getChildByName('bombNum');
        if (type === cc.game_enum.cardsType.AAAA && this.cardsLen > 4) {
            typeSpr.active = false;
            bombNum.active = true;
            bombNum.getComponent(cc.Label).string = this.cardsLen+'I';
        } else {
            bombNum.active = false;
            typeSpr.active = true;
            typeSpr.getComponent(cc.Sprite).spriteFrame = this.pdkTypeFrames[type];
        }

        this.typeNode.stopAllActions();
        this.typeNode.opacity = 0;
        this.typeNode.scale = 1.3;
        if (type == 0) {
            this.typeNode.runAction(cc.sequence(
                cc.spawn(
                    cc.scaleTo(0.3, 0.9),
                    cc.fadeTo(0.3, 255)
                ),
    
                cc.scaleTo(0.15, 1),
                cc.scaleTo(0.15, 0.9),
                cc.fadeTo(1, 0)
                )
            );
        } else {
            let delay = 0;
            if (type === cc.game_enum.cardsType.AAAA 
                || type === cc.game_enum.cardsType.AABB 
                || type === cc.game_enum.cardsType.ABC
                || type === cc.game_enum.cardsType.AAABBB) {
                delay = 1;
            }

            this.typeNode.runAction(cc.sequence(
                cc.delayTime(delay),
                cc.spawn(
                    cc.scaleTo(0.3, 0.9),
                    cc.fadeTo(0.3, 255)
                ),
    
                cc.scaleTo(0.15, 1),
                cc.scaleTo(0.15, 0.9))
            );
        }
    },

    /**
     * 三百分显示特效
     * @param {*} type 
     */
    sbf_sdh_next(type) {
        if (type == cc.game_enum.cardsType.AABB) {
            this.paiType.active = true;
            this.tuolaji.active = true;
            this.tuolaji.getComponent(cc.Animation).play('tuolaji');
        }

        if (type == cc.game_enum.cardsType.SHUAIZHU) {
            this.paiType.active = true;
            this.shuaipai.active = true;
            this.shuaipai.getComponent(cc.Animation).play('shuaipai');
        }
    },

    /**
     * 显示玩家剩下的牌
     * @param {*} cards 
     */
    showLoserCards(cards) {
        this.cardsNode.stopAllActions();
        this.cardsNode.position = cc.p(0,0);
        cards.forEach((v, idx)=> {
            let poker = this.cardsNode.getChildByName('poker'+idx);
            if (!poker) {
                poker = cc.instantiate(this.pokerPrefab);
                poker.scale = 0.5;
                this.cardsNode.addChild(poker, idx, 'poker'+idx);
            }
            let poker_scr = poker.getComponent('poker');
            poker_scr.show(v);
        });
    },

    hideMaxCard() {
        this.cardsNode.children.forEach(el=> {
            let poker_scr = el.getComponent('poker');
            poker_scr.setBig(false);
        });
    },

    getOutScoreCardsPos() {
        let objs = [];
        this.cardsNode.children.forEach(el=> {
            if (el.active) {
                let v = el.getComponent('poker').getValue();
                let score = this.getCardScore(v);
                if (score > 0) {
                    let p = el.getNodeToWorldTransformAR();
                    p = cc.p(p.tx, p.ty);
                    objs.push({p: p, v: v});
                }
            }
        });

        return objs;
    },

    getCardScore(card) {
        let score = 0;
        function getScore(el) {
            if (el == 52) {
                score += 20;
            } else if (el == 53) {
                score += 30;
            } else {
                let cardValue = el%13;
                if (cardValue == 4) {
                    score += 5;
                } else if (cardValue == 9 || cardValue == 12) {
                    score += 10;
                }
            }
        }

        if (Array.isArray(card)) {
            card.forEach(el=> {
                getScore(el);
            })
        } else {
            getScore(card);
        }

        return score;
    }

    // update (dt) {},
});
