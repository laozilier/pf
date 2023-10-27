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
    extends: require('../games/History_Player'),

    properties: {
        pokerPrefab: {
            default: null,
            type: cc.Prefab
        },

        outsPrefab: {
            default: null,
            type: cc.Prefab
        },

        localSeat: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._super();

        this._widthMargin = cc.find("Canvas").width-1334;
        this._holds = undefined;
        this._holdsNodes = [];

        this.holdsNode = this.node.getChildByName('holds');
        let outNodesPos = [cc.p(0, 320), cc.p(-380, -120), cc.p(380, -120)];
        let outsNode = cc.instantiate(this.outsPrefab);
        outsNode.setPosition(outNodesPos[this.localSeat]);
        this.node.addChild(outsNode, 0, 'outsNode');
        this.outsNode = outsNode;

        this.bankerNode = this.userNode.getChildByName('banker');  //庄家标签
        this.bankerNode.active = false;

        this.initHolds();
    },

    initHolds() {
        for (let i = 0; i < 16; i++) {
            let poker = cc.instantiate(this.pokerPrefab);
            if (poker) {
                this.holdsNode.addChild(poker);
                this._holdsNodes.push(poker);
                poker.active = false;
            }
        }
    },

    /**
     * 重置所有节点
     */
    resetNodes() {
        if (!this.node.active) {
            return;
        }

        this._holds = undefined;
        this._holdsNodes.forEach((poker)=>{
            poker.active = false;
        });

        this.outsNode.getComponent('outCards').reset();
        this.bankerNode.active = false;
    },

    compare(a, b) {
        let aa = a % 13;
        if (a % 13 === 0) {
            aa = 100;
        } else if (a % 13 === 1) {
            aa = 200;
        }
        let bb = b % 13;
        if (b % 13 === 0) {
            bb = 100;
        } else if (b % 13 === 1) {
            bb = 200;
        }
        return bb - aa;
    },

    /**
     * 重置手牌
     * @param holds
     */
    resetHolds(holds) {
        this._holds = holds;
        if (!this._holds) {
            return;
        }

        if (Array.isArray(this._holds)) {
            this._holds.sort(this.compare);
        }

        this.checkHolds();
    },

    /**
     * 检查手牌
     */
    checkHolds() {
        if (!this._holds) {
            return;
        }

        if (this._holdsNodes.length == 0) {
            return;
        }

        this._holdsNodes.forEach(function (poker) {
            poker.active = false;
        });

        if (typeof this._holds == 'number') {
            if (this._holds > 0 && this.localSeat == 0) {
                let spacingX = Math.min(-130, Math.ceil(this._widthMargin/this._holds)+(16-this._holds)*4-160);
                this.holdsNode.getComponent(cc.Layout).spacingX = spacingX;
            }

            for (let i = 0; i < this._holds; i++) {
                let poker = this._holdsNodes[i];
                let poker_scr = this.pokerScript(poker);
                poker_scr.show();
            }
        } else if (Array.isArray(this._holds)) {
            if (this._holds.length > 0 && this.localSeat == 0) {
                let spacingX = Math.min(-130, Math.ceil(this._widthMargin/this._holds.length)+(16-this._holds.length)*4-160);
                this.holdsNode.getComponent(cc.Layout).spacingX = spacingX;
            }
            for (let i = 0; i < this._holds.length; i++) {
                let value = this._holds[i];
                let poker = this._holdsNodes[i];
                let poker_scr = this.pokerScript(poker);
                poker_scr.show(value);
            }
        }
    },

    // update (dt) {},

    setPlayerBanker(isBanker) {
        this.bankerNode.active = isBanker;
        if (isBanker) {
            this.bankerNode.getComponent(cc.Animation).play();
        }
    },

    /**
     * 出牌成功
     * @param {*} cardsData 
     * @param {*} disconnect 
     */
    discard(cardsData, disconnect) {
        this.clearOutCards();
        let cards = cardsData.cards;
        let type = cardsData.type;
        let startp = this.holdsNode.getNodeToWorldTransformAR();
        startp = cc.p(startp.tx, startp.ty);
        this.outsNode.getComponent('outCards').openOutCards(cardsData, startp);
        if (!disconnect && Array.isArray(this._holds)) {
            cards.forEach(v=> {
                let idx = this._holds.indexOf(v);
                if (idx > -1) {
                    this._holds.splice(idx, 1);
                }
            });
        }
        this.checkHolds();
        this.playSound(type, cards);
    },

    /**
     * 不要
     */
    pass() {
        let num = Math.floor(Math.random()*4)+1;
        cc.vv.audioMgr.playSFX("poker/"+this._sex+"/buyao"+num+".mp3");
        this.outsNode.getComponent('outCards').openOutCards({type: 0, cards: []});
    },

    /**
     * 清除出的牌
     */
    clearOutCards() {
        if (!this.node.active) {
            return;
        }

        this.outsNode.stopAllActions();
        this.outsNode.getComponent('outCards').reset();
    },

    /**
     * 播放声音
     * @param type
     * @param cards
     */
    playSound(type, cards) {
        if (!!type) {
            let card = cards[0];
            let a = card % 13 + 1;
            switch (type) {
                /** 出单 **/
                case cc.game_enum.cardsType.A: {
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/"+a+".mp3");
                }
                    break;
                /** 出双 **/
                case cc.game_enum.cardsType.AA: {
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/dui"+a+".mp3");
                }
                    break;
                case cc.game_enum.cardsType.AAABB: /** 三个 **/
                    if (cards.length === 5) {
                        cc.vv.audioMgr.playSFX("poker/"+this._sex+"/sandaier.mp3");
                    } else if (cards.length === 4) {
                        cc.vv.audioMgr.playSFX("poker/"+this._sex+"/sandaiyige.mp3");
                    } else {
                        cc.vv.audioMgr.playSFX("poker/"+this._sex+"/sange.mp3");
                        setTimeout(() => {
                            cc.vv.audioMgr.playSFX("poker/"+this._sex+"/"+a+".mp3");
                        }, 200);
                    }
                    break;
                case cc.game_enum.cardsType.AAAA: /** 炸弹 **/
                    cc.vv.audioMgr.playSFX("poker/public/zhadan.mp3");
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/zhadan.mp3");
                    break;
                case cc.game_enum.cardsType.AABB: /** 连对 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/liandui.mp3");
                    break;
                case cc.game_enum.cardsType.ABC: /** 顺子 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/shunzi.mp3");
                    break;
                case cc.game_enum.cardsType.AAAABB: /** 四带二 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/sidaier.mp3");
                    break;
                case cc.game_enum.cardsType.AAABBB: /** 飞机 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/feiji.mp3");
                    break;
                case cc.game_enum.cardsType.AAAABBB: /** 四带三 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/sidaier.mp3");
                    break;
            }
        } else {
            let num = Math.floor(Math.random()*4)+1;
            cc.vv.audioMgr.playSFX("poker/"+this._sex+"/buyao"+num+".mp3");
        }
    },
});
