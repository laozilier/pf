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
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._super();

        this._widthMargin = cc.find("Canvas").width-1334;
        this._holds = undefined;
        this._holdsNodes = [];

        this.holdsNode = this.node.getChildByName('holds');
        let outNodesPos = [cc.p(0, 300), cc.p(-352, -126), cc.p(-272, -146), cc.p(352, -126)];
        let outsNode = cc.instantiate(this.outsPrefab);
        outsNode.setPosition(outNodesPos[this.localSeat]);
        this.node.addChild(outsNode, -1, 'outsNode');
        this.outsNode = outsNode;
        
        this.bankerNode = this.userNode.getChildByName('banker');  //庄家标签
        this.bankerNode.active = false;

        this.jiaofenNode = this.userNode.getChildByName('jiaofen');                            //喊分显示
        this.jiaofenNode.active = false;

        this.baofu_liushou = this.userNode.getChildByName('baofu_liushou');                    //报副 留守

        this.jiaofens = [80,75,70,65,60,55,50,45,40,35,30,25,20,15,10,5];   //叫分
        this.initHolds();
    },

    /**
     * @param 初始化手牌长度  最大34
     * @param
     * */
    initHolds() {
        for (let i = 0; i < 34; i++) {
            let poker = cc.instantiate(this.pokerPrefab);
            poker.scale = 0.56;
            poker.active = false;
            poker.y = 0;
            this.holdsNode.addChild(poker);
            this._holdsNodes.push(poker);
        }
    },


    /**
     * 设置玩家庄 断线重连后
     * @param data
     */
    setPlayerBanker(isBanker) {
        this.bankerNode.active = isBanker;
        if (isBanker) {
            this.bankerNode.getComponent(cc.Animation).play();
        }
    },

    /**
     * 玩家叫分显示
     * */
    jiaofen(jiaofenIdx) {
        if (!this.node.active ) {
            return;
        }

        if (jiaofenIdx == undefined) {
            this.jiaofenNode.active = false;
            return;
        }

        this.jiaofenNode.active = true;
        let lab = this.jiaofenNode.getChildByName('lab');
        if (jiaofenIdx < 0) {
            lab.getComponent(cc.Label).string = 'AB';
            let num = Math.floor(Math.random()*2)+1;
            cc.vv.audioMgr.playSFX("poker/sdh/" + this._sex +"/bujiao"+ num + ".mp3");
        } else {
            let jiaofen = this.jiaofens[jiaofenIdx];
            lab.getComponent(cc.Label).string = jiaofen;
            cc.vv.audioMgr.playSFX("poker/sdh/" + this._sex + "/"+ jiaofen +"fen.mp3");
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

        this._holdsNodes.forEach((poker)=>{
            poker.active = false;
        });

        this.setPlayerBanker(false);
        this.jiaofenNode.active = false;
        this.baofu_liushou.getComponent('baofu_liushou').reset();
    },

    //显示报副
    baofu() {
        if (!this.node.active) {
            return;
        }

        this.baofu_liushou.getComponent('baofu_liushou').baofu();
    },
    
    //显示留守
    liushou(type) {
        if (!this.node.active) {
            return;
        }

        if (typeof type!= 'number') {
            return;
        }

        if (type < 0) {
            return;
        }

        this.baofu_liushou.getComponent('baofu_liushou').liushou(type);
    },

    /**
     * 重置手牌
     * @param holds
     */
    resetHolds(holds, need) {
        this._holds = holds;
        if (!Array.isArray(this._holds)) {
            return;
        }

        this.checkHolds(need);
    },

    compare(a, b) {
        //排序  主牌 排序   副牌排序   黑红梅方排序  3-0
        //大王、小王、主10、副10、主2、副2、主花色。副牌 内部的大小关系AKQJ98765
        let paipos = (value) => {
            let n_value = value;
            if(value == 52) {
                return 800;
            } else if (value == 53){
                return 900;
            }

            let t = Math.floor(value/13);
            if (value%13 == 6){
                if (t == this._algorithm.zhuType) {
                    n_value = 400;
                } else {
                    n_value = 390+t;
                }
            } else if (value%13 == 1) {
                if (t == this._algorithm.zhuType) {
                    n_value = 180;
                }else {
                    n_value = 170+t;
                }
            } else  if(value % 13 == 0){
                n_value += 13;
            }

            if(t == this._algorithm.zhuType) {
                n_value += 100;
            }

            return  n_value;
        };

        let aa =  paipos(a);
        let bb =  paipos(b);

        return bb - aa;
    },

    /**
     * 检查手牌
     */
    checkHolds() {
        if (!Array.isArray(this._holds)) {
            return;
        }
        this._holds.sort(this.compare.bind(this));
        if (this._holds.length > 0 && this._uid == cc.dm.user.uid) {
            let spacingX = Math.min(-160, Math.ceil(this._widthMargin/this._holds.length)+1.5*(34-this._holds.length)-200);
            this.holdsNode.getComponent(cc.Layout).spacingX = spacingX;
        }

        this._holdsNodes.forEach(el=> {
            el.active = false;
        });

        for (let i = 0; i < this._holds.length; i++) {
            let value = this._holds[i];
            let poker = this._holdsNodes[i];
            poker.active = true;
            let poker_scr = this.pokerScript(poker);
            poker_scr.show(value);
            poker_scr.setTiqi(false, false);
            poker_scr.setCanThrow(true);
            poker_scr.setZhu(this._algorithm.isAllZhu([value]));
        }
    },

    /**
     * 出牌
     * @param {*} cardsData 
     * @param {*} disconnect 
     */
    discard(cardsData, disconnect) {
        if (!this.node.active) {
            return;
        }

        cc.vv.audioMgr.playSFX("public/shuaipai.wav");
        let startp = this.holdsNode.getNodeToWorldTransformAR();
        startp = cc.p(startp.tx, startp.ty);
        this.outsNode.getComponent('outCards').openOutCards(cardsData, startp, this._algorithm);
        /** 移除手牌 */
        if (!disconnect && Array.isArray(this._holds)) {
            let cards = cardsData.cards;
            cards.forEach(el=> {
                this._holds.splice(this._holds.indexOf(el), 1);
            });

            this.checkHolds();
        }

        this.stopClock();
        this.playSound(cardsData);
    },

    /**
     * 播放声音
     * @param type
     */
    playSound(data) {
        let type = data.type;
        let v = data.cards[0];
        let daSha = data.daSha;
        let isSha = data.isSha;
        let max = data.max;
        let first = data.first;
        let isZhu = data.isZhu;
        //首出
        if (!!first) {
            if (isZhu) {
                cc.vv.audioMgr.playSFX('poker/sdh/'+this._sex+'/diaozhu1.mp3');
            } else {
                cc.vv.audioMgr.playSFX('poker/bashi/'+this._sex+'/color_'+this._algorithm.cardType(v)+'.mp3');
            }
        } else {
            if (!!max) {
                if (!!daSha) {
                    cc.vv.audioMgr.playSFX('poker/bashi/'+this._sex+'/gaibi.mp3');
                } else if (!!isSha) {
                    cc.vv.audioMgr.playSFX('poker/bashi/'+this._sex+'/bile.mp3');
                } else {
                    cc.vv.audioMgr.playSFX('poker/bashi/'+this._sex+'/bigger_1.mp3');
                }
            } else {
                cc.vv.audioMgr.playSFX('poker/'+this._sex+'/dianpai.mp3');
            }
        }

        setTimeout(() => {
            switch (type) {
                case cc.game_enum.cardsType.A: {
                    let a = v%13+1;
                    if (v == 52) {
                        a = 20;
                    } else if (v == 53) {
                        a = 21;
                    }
                    cc.vv.audioMgr.playSFX('poker/'+this._sex+'/'+a+'.mp3');
                }
                    break;
                /** 出双 **/
                case cc.game_enum.cardsType.AA: {
                    let a = v%13+1;
                    if (v == 52) {
                        a = 14;
                    } else if (v == 53) {
                        a = 15;
                    }
                    cc.vv.audioMgr.playSFX('poker/'+this._sex+'/dui'+a+'.mp3');
                }
                    break;
                case cc.game_enum.cardsType.AABB:
                    /** 拖拉机 **/
                    cc.vv.audioMgr.playSFX('poker/sdh/'+this._sex+'/tuolaji1.mp3');
                    break;
    
                case cc.game_enum.cardsType.SHUAIZHU:
                    /** 甩牌 **/
                    cc.vv.audioMgr.playSFX('poker/sdh/'+this._sex+'/shuaipai2.mp3');
                    break;
            }
        }, 300);
    },

    /**
     * 清除出的牌
     */
    clearOutsNode() {
        if (!this.node.active) {
            return;
        }
        this.outsNode.getComponent('outCards').reset();
    },

    /**
     * 隐藏最大牌标记
     */
    hideMaxCard() {
        if (!this.node.active) {
            return;
        }
        this.outsNode.getComponent('outCards').hideMaxCard();
    },

    /**
     * 定主音效
     */
    setZhuTypeSound(zhuType) {
        switch (zhuType) {
            case -1:
                cc.vv.audioMgr.playSFX("poker/sdh/" + this._sex + "/wuzhu1.mp3");
                break;
            case 0:
                cc.vv.audioMgr.playSFX("poker/sdh/" + this._sex + "/fangkuai3.mp3");
                break;
            case 1:
                cc.vv.audioMgr.playSFX("poker/sdh/" + this._sex + "/meihua3.mp3");
                break;
            case 2:
                cc.vv.audioMgr.playSFX("poker/sdh/" + this._sex + "/hongtao3.mp3");
                break;
            case 3:
                cc.vv.audioMgr.playSFX("poker/sdh/" + this._sex + "/heitao3.mp3");
                break;
        }

        this.setTurn();
    },

    /**
     * 玩家得分
     */
    getScore(score, total) {
        if (!this.node.active) {
            return;
        }
        if (typeof score == 'number' && score > 0) {
            this.getScoreAniNode.active = true;
            this.getScoreAniNode.opacity = 255;
            this.getScoreAniNode.getComponent(cc.Label).string = '+'+score+'A';
            this.getScoreAniNode.runAction(cc.sequence(cc.delayTime(1), cc.fadeTo(0.6, 0)));
        }
        this.getScoreNode.getComponent(cc.Label).string = total+'A';
        let end = this.getScoreNode.getNodeToWorldTransformAR();
        end = cc.p(end.tx, end.ty);
        return end;
    },

    getOutScoreCardsPos() {
        if (!this.node.active) {
            return [];
        }

        if (!this.outsNode.active) {
            return [];
        }

        let starts = this.outsNode.getComponent('outCards').getOutScoreCardsPos();
        return starts;
    },
});
