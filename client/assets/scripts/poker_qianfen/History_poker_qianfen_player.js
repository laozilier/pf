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
        singleHoldsPrefab: {
            default: null,
            type: cc.Prefab
        },

        outsPrefab: {
            default: null,
            type: cc.Prefab
        },

        rankFrames: {
            default: [],
            type: cc.SpriteFrame
        },

        localSeat: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._super();

        this._holds = undefined;
        this._holdsNodes = [];

        this.holdsNode = this.node.getChildByName('holds');
        let outNodesPos = [cc.p(0, 360), cc.p(-420, -70), cc.p(420, -70)];
        let outsNode = cc.instantiate(this.outsPrefab);
        outsNode.setPosition(outNodesPos[this.localSeat]);
        this.node.addChild(outsNode, -1, 'outsNode');
        this.outsNode = outsNode;

        this.bankerNode = this.userNode.getChildByName('banker');  //庄家标签
        this.bankerNode.active = false;
        this.rankNode =  this.userNode.getChildByName('rank');    //上中下游
        this.rankPositions = [cc.p(150, 8),cc.p(-108, 0),cc.p(108, 0)];

        let gameScoreNode = this.userNode.getChildByName('gameScore');          //所有积分控制节点
        this.roundScoreNode =  gameScoreNode.getChildByName('roundScore');      //回合积分
        this.totalScoreNode =  gameScoreNode.getChildByName('totalScore');      //总积分
        this.xiScoreNode =  gameScoreNode.getChildByName('xiScore');            //喜分
        this.totalXiScoreNode =  gameScoreNode.getChildByName('totalXiScore');  //总喜分
        this.initHolds();
    },

    initHolds() {
        for (let i = 0; i < 11; i++) {
            let el = cc.instantiate(this.singleHoldsPrefab);
            this.holdsNode.addChild(el, i, 'singleHolds'+i);
            el.getComponent('singleHolds').reset();
            this._holdsNodes.push(el);
        }
    },

    start() {

    },

    /**
     * 设置玩家积分数据  断线重连后
     * @param data
     */
    setPlayerScore(data) {
        if (!this.node.active) {
            return;
        }

        this.totalScoreNode.getComponent(cc.Label).string = data.totalScore;
        this.roundScoreNode.getComponent(cc.Label).string = data.roundScore;
        this.totalXiScoreNode.getComponent(cc.Label).string = data.totalXiScore;
        this.xiScoreNode.getComponent(cc.Label).string = data.xiScore;
    },

    /**
     * 设置玩家庄 断线重连后
     * @param isBanker
     */
    setPlayerBanker(isBanker) {
        if (!this.node.active ) {
            return;
        }

        this.bankerNode.active = isBanker;
        if (isBanker) {
            this.bankerNode.getComponent(cc.Animation).play();
        }
    },

    /**
     * 设置玩家上中下游戏 断线重连后
     * @param rank
     */
    setRank(rank) {
        if (!this.node.active ) {
            return;
        }

        this.rankNode.stopAllActions();
        if (typeof rank == 'number') {
            this.rankNode.active = true;
            this.rankNode.getComponent(cc.Sprite).spriteFrame = this.rankFrames[rank];
            let p = this.outsNode.getNodeToWorldTransformAR();
            p = cc.p(p.tx, p.ty);
            p = this.userNode.convertToNodeSpaceAR(p);
            this.rankNode.setPosition(p);
            this.rankNode.opacity = 80;
            this.rankNode.scale = 2;
            this.rankNode.runAction(cc.sequence(
                cc.spawn(cc.scaleTo(0.2, 0.9), cc.fadeTo(0.2, 255)),
                cc.scaleTo(0.1, 1.1),
                cc.scaleTo(0.05, 1),
                cc.moveTo(0.3, this.rankPositions[this.localSeat])
            ));
        } else {
            this.rankNode.active = false;
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
        this.outsNode.getComponent('outCards').reset();

        this._holdsNodes.forEach((el)=>{
            el.getComponent('singleHolds').reset();
        });

        this.setPlayerBanker(false);
        this.setRank();
    },

    /**
     * 重置手牌
     * @param holds
     */
    resetHolds(holds, need) {
        this._holds = holds;
        this.checkHolds(need);
    },

    /**
     * 检查手牌
     */
    checkHolds(need) {
        if (!Array.isArray(this._holds)) {
            return;
        }

        let sortCards = this.getSortCards();
        for (let i = 0; i < this._holdsNodes.length; i++) {
            let singleHolds = this._holdsNodes[i];
            if (i < sortCards.length) {
                singleHolds.active = true;
                let cards = sortCards[i];
                singleHolds.getComponent('singleHolds').checkSingleHolds(cards, !!need ? (this._holds.length-1) : undefined);
            } else {
                singleHolds.active = false;
            }
        }
    },

    getSortCards() {
        if (!Array.isArray(this._holds)) {
            return [];
        }

        let sortCards = [];
        let cardsMap = this._algorithm.getCardsMap(this._holds);
        let keys = Object.keys(cardsMap);
        this._algorithm.sortDown(keys);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let cards = cardsMap[key];
            sortCards.push(cards);
        }

        return sortCards;
    },

    /**
     * 出牌成功
     * @param {*} cardsData 
     */
    discard(cardsData) {
        cc.vv.audioMgr.playSFX("public/shuaipai.wav");
        this.clearOutCards();
        let cards = cardsData.cards;
        let type = cardsData.type;
        let startp = this.holdsNode.getNodeToWorldTransformAR();
        startp = cc.p(startp.tx, startp.ty);
        this.outsNode.getComponent('outCards').openOutCards(cardsData, startp);
        if (Array.isArray(this._holds)) {
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
                    if (cards.length > 4) {
                        cc.vv.audioMgr.playSFX("poker/qianfen/"+this._sex+"/poker_14_"+cards.length+".mp3");
                    } else {
                        cc.vv.audioMgr.playSFX("poker/"+this._sex+"/zhadan.mp3");
                    }
                    
                    break;
                case cc.game_enum.cardsType.AABB: /** 连对 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/liandui.mp3");
                    break;
                case cc.game_enum.cardsType.ABC: /** 顺子 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/shunzi.mp3");
                    break;
                case cc.game_enum.cardsType.AAABBB: /** 飞机 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/feiji.mp3");
                    break;
            }
        } else {
            let num = Math.floor(Math.random()*4)+1;
            cc.vv.audioMgr.playSFX("poker/"+this._sex+"/buyao"+num+".mp3");
        }
    },
});
