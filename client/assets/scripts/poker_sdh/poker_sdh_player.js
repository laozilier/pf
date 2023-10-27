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
    extends: require('../games/Game_player'),

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
        
        this.turnNode = this.userNode.getChildByName('turnNode');

        this.clockNode = this.userNode.getChildByName('clock');
        if(!this.clockNode) {
            this.clockNode = this.node.getChildByName('clock');
        }

        this.clockFrame = this.clockNode.getComponent(cc.Sprite).spriteFrame;

        this.bankerNode = this.userNode.getChildByName('banker');  //庄家标签
        this.bankerNode.active = false;

        this.jiaofenNode = this.userNode.getChildByName('jiaofen');                            //喊分显示
        this.jiaofenNode.active = false;

        this.baofu_liushou = this.userNode.getChildByName('baofu_liushou');                    //报副 留守
        this.replyNode = this.userNode.getChildByName('reply');

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

    /**    获取选中牌的节点   */
    getTiqiList() {
        let list = this.getTiqiNodes();
        let values = [];
        list.forEach(function (el) {
            values.push(this.pokerScript(el).getValue());
        }.bind(this));

        return values;
    },

    /**    获取选中牌的节点   */
    getTiqiNodes() {
        let list = [];
        this._holdsNodes.forEach((el)=> {
            if (el.active && this.pokerScript(el).isTiqi) {
                list.push(el);
            }
        });

        return list;
    },

    start() {
        if (this.localSeat == 0 ) {
            console.log(" 注册触摸事件！！！！ ");
            this.holdsNode.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.holdsNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.holdsNode.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.holdsNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
            this.startPos = null;
            this.endPos = null;
        }
    },

    /**
     * 设置游戏数据  断线重连后
     * @param data
     */
    set(data) {
        if (!this.node.active ) {
            return;
        }
        let holds = data.holds;
        if(cc.dm.user.uid  == data.uid && cc.dm.user.uid == this._uid ) {
            this.resetHolds(holds);
        }

        this.replySurrender(data.reply);
        let jiaofenIdx = data.jiaofenIdx;
        this.jiaofen(jiaofenIdx);
        this.baofu_liushou.getComponent('baofu_liushou').checkData(data);
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

        this.setTurn();

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

    gameBegin() {
        this._super();
    },

    /**
     * 重置所有节点
     */
    resetNodes() {
        if (!this.node.active) {
            return;
        }

        this._super();
        this._holds = undefined;
        this.outsNode.getComponent('outCards').reset();

        this._holdsNodes.forEach((poker)=>{
            poker.active = false;
        });

        this.stopClock();
        this.setTurn(-1);
        this.setPlayerBanker(false);
        this.jiaofenNode.active = false;
        this.replySurrender();
        this.baofu_liushou.getComponent('baofu_liushou').reset();
        
        this.resetStatus();
    },

    resetStatus() {
        this._touchPoker = null;
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

        this.setTurn();
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
    checkHolds(need, cards) {
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
            if (need) {
                poker.opacity = 1;
                setTimeout(() => {
                    poker.opacity = 255;
                }, this._holds.length*85);
            } else {
                poker.opacity = 255;
            }

            if (Array.isArray(cards)) {
                let idx = cards.indexOf(value);
                if (idx > -1) {
                    cards.splice(idx, 1);
                    poker_scr.setTiqi(true, true);
                }
            }
        }
    },

    getHoldsPositons(cards) {
        if (!this.node.active) {
            return;
        }

        let ends = [];
        for (let i = 0; i < this._holdsNodes.length; i++) {
            let poker = this._holdsNodes[i];
            if (!poker.active) {
                break;
            }

            let v = this.pokerScript(poker).getValue();
            if (Array.isArray(cards)) {
                let idx = cards.indexOf(v);
                if (idx < 0) {
                    continue;
                }

                cards.splice(idx, 1);
            }

            let end = poker.getNodeToWorldTransformAR();
            end = cc.p(end.tx, end.ty);
            ends.push({p: end, v: v});
        }

        return ends;
    },

    addBottmCards(cards, cb) {
        if (Array.isArray(this._holds) && Array.isArray(cards)) {
            this._holds = this._holds.concat(cards);
            this.checkHolds(false, [].concat(cards));
            setTimeout(() => {
                let ends = this.getHoldsPositons(cards);
                !!cb && cb(ends);
            }, 100);
        } else {
            let end = this.userNode.getNodeToWorldTransformAR();
            end = cc.p(end.tx, end.ty);
            !!cb && cb(end);
        }
    },

    removeBottomCards(cards) {
        if (Array.isArray(this._holds) && Array.isArray(cards)) {
            cards.forEach(el=> {
                let idx = this._holds.indexOf(el);
                if (idx > -1) {
                    this._holds.splice(idx, 1);
                }
            });
            let starts = this.getHoldsPositons(cards);
            this.checkHolds();
            return starts;
        } else {
            let start = this.userNode.getNodeToWorldTransformAR();
            start = cc.p(start.tx, start.ty);
            return start;
        }
    },

    /**
     * 轮转
     * @param turnSeatId
     */
    setTurn(turnUid, time) {
        if (!this.node.active) {
            return;
        }

        this._clockTime = time || 30;
        this._turn = (turnUid == this._uid);
        this.showTurnNode(this._turn);
        if (this.localSeat == 0 && this._turn) {
            this._holdsNodes.forEach((el)=> {
                if (el.active) {
                    this.pokerScript(el).setCanThrow(true);
                }
            });
        }
    },

    showTurnNode(show) {
        this.stopClock();
        if (show && this.turnNode) {
            this.turnNode.active = true;
            this.turnNode.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
            this.clockNode.active = true;
            this.schedule(this.clockCountDown, 1);
            this.clockCountDown();
        }
    },

    stopClock() {
        if(!!this.turnNode) {
            this.unschedule(this.clockCountDown);
            this.clockNode.getComponent(cc.Animation).stop();
            this.clockNode.getComponent(cc.Sprite).spriteFrame = this.clockFrame;
            this.clockNode.active = false;

            this.turnNode.getComponent(sp.Skeleton).clearTracks();
            this.turnNode.active = false;
        }

    },

    clockCountDown() {
        if (this._clockTime < 0) {
            this.unschedule(this.clockCountDown);
            return;
        }

        if (this._clockTime == 3) {
            //播放时间不够声音
            this.clockNode.getComponent(cc.Animation).play('naozhong');
            cc.vv.audioMgr.playSFX("public/timeup_alarm.mp3");
        }

        this.clockNode.getChildByName('Label').getComponent(cc.Label).string = this._clockTime;
        this._clockTime -= 1;
    },

    replySurrender(reply) {
        if (!this.node.active) {
            return;
        }

        if (reply == undefined) {
            this.replyNode.active = false;
            return;
        }

        this.replyNode.active = true;
        let agreeNode = this.replyNode.getChildByName('agree');
        let refuseNode = this.replyNode.getChildByName('refuse');
        if (reply == 1) {
            agreeNode.active = true;
            refuseNode.active = false;
        } else {
            agreeNode.active = false;
            refuseNode.active = true;
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

    /**
     * touch相关
     */
    onTouchStart: function (touch) {
        if (!Array.isArray(this._holds)) {
            return;
        }

        this.startPos = this.holdsNode.convertTouchToNodeSpaceAR(touch);
        this._moved = false;
        this._touchPoker = null;

        for (let i = this._holds.length - 1; i > -1; i--) {
            if (i >= this._holdsNodes) {
                continue;
            }

            let el = this._holdsNodes[i];
            if (!el.active) {
                continue;
            }

            if (el.getBoundingBox().contains(this.startPos)) {
                if (this.pokerScript(el).canThrow) {
                    this.pokerScript(el).setSelected(true);
                }
                this._touchPoker = el;
                break;
            }
        }
    },

    onTouchMove: function (touch) {
        if (!Array.isArray(this._holds)) {
            return;
        }

        this.endPos = this.holdsNode.convertTouchToNodeSpaceAR(touch);
        if (Math.abs(this.endPos.x - this.startPos.x) < 20) {
            return;
        }

        this._lastPoker = this._touchPoker;
        this._moved = true;
        let boundx = !!this._touchPoker ? this._touchPoker.getBoundingBox().x : this.startPos.x;
        for (let i = this._holds.length - 1; i > -1; i--) {
            if (i >= this._holdsNodes.length) {
                continue;
            }

            let el = this._holdsNodes[i];
            if (!el.active) {
                continue;
            }

            if (!this.pokerScript(el).canThrow) {
                continue;
            }

            if (el == this._touchPoker) {
                continue;
            }

            let bound = el.getBoundingBox();
            if (this.endPos.x > this.startPos.x) {
                if (bound.x < this.endPos.x && bound.x > boundx) {
                    this.pokerScript(el).setSelected(true);
                } else {
                    this.pokerScript(el).setSelected(false);
                }
            } else {
                if ((bound.x > this.endPos.x && bound.x < boundx) || bound.contains(this.endPos)) {
                    if (!!this._lastPoker && this._lastPoker.getBoundingBox().contains(this.endPos)) {
                        this.pokerScript(el).setSelected(false);
                    } else {
                        this.pokerScript(el).setSelected(true);
                        this._lastPoker = el;
                    }
                } else {
                    this.pokerScript(el).setSelected(false);
                }
            }
        }
    },

    onTouchEnd: function (touch) {
        if (!Array.isArray(this._holds)) {
            return;
        }
        this.touchEnd();
    },

    touchEnd() {
        if (!Array.isArray(this._holds)) {
            return;
        }

        if (this._moved) {
            let values = this.getTiqiList();

            this._holdsNodes.forEach((el)=> {
                if (el.active && this.pokerScript(el).canThrow) {
                    if (this.pokerScript(el).isSelected) {
                        this.pokerScript(el).setTiqi(!this.pokerScript(el).isTiqi, true);
                        this.pokerScript(el).setSelected(false);
                    }
                }
            });
            /** 如果没有提起的牌 */
            if (this._turn && values.length == 0) {
                this.getMaxLenCanOut();
            }
        } else {
            if (this._touchPoker && this.pokerScript(this._touchPoker).canThrow) {
                this.pokerScript(this._touchPoker).setTiqi(!this.pokerScript(this._touchPoker).isTiqi, true);
                this.pokerScript(this._touchPoker).setSelected(false);
            }
        }

        this._moved = false;
    },

    getMaxLenCanOut() {
        let values = this.getTiqiList();
        if (values.length < 2) {
            return;
        }

        let list = this.getTiqiNodes();
        let cards = this._algorithm.getMaxLenCanOut(values);
        if (!!cards && cards.length > 0) {
            list.forEach(el=> {
                let scr = this.pokerScript(el);
                if (!el.active || !scr.canThrow) {
                    return;
                }
                
                let v = scr.getValue();
                if (cards.includes(v)) {
                    scr.setTiqi(true);
                } else {
                    scr.setTiqi(false);
                }
            });
        }
    },

    /**
     * 出牌  每次出牌客户端会做检查
     * @return {boolean}
     */
    chupai() {
        let list = this.getTiqiList();
        if (list.length > 0) {
            let can = this._algorithm.checkCanOut(list, this._holds);
            if (!!can  && can.type != undefined) {
                let values = can.cards;
                if (can.type == cc.game_enum.cardsType.SHUAIZHU) {
                    cc.utils.openTips('确定甩牌?\n如不能甩牌将强制出小', function () {
                        cc.connect.send("discard", values);
                    }, function () {
            
                    });
                } else {
                    cc.connect.send("discard", values);
                }
                
                return true;
            }else {
                return false;
            }
        }

        return false;
    },

    //玩家是否需要提牌
    checktishi(first) {
        this._tishiIdx = 0;
        /** 找到所有能提起的牌 */
        this._tishiCards = this._algorithm.getAutoDicard(this._holds);

        //有提起的牌 不进行操作
        let list = this.getTiqiList();
        if (list.length > 0) {    
            return;
        }

        this.tishi(first);
    },

    tishi(first) {
        if (!this._tishiCards) {
            this._tishiIdx = 0;
            /** 找到所有能提起的牌 */
            this._tishiCards = this._algorithm.getAutoDicard(this._holds);
        }

        if (!this._tishiCards) {
            return;
        }

        let all = this._tishiCards.all;
        if (all.length == 0) {
            return;
        }

        
        this._holdsNodes.forEach((el) => {
            if (el.active) {
                this.pokerScript(el).setTiqi(false);
                if (all.indexOf(this.pokerScript(el).getValue()) < 0) {
                    this.pokerScript(el).setCanThrow(false);
                } else {
                    this.pokerScript(el).setCanThrow(true);
                }
            }
        });

        if (!!first && this._tishiCards.cans.length > 1) {
            return;
        }
        
        let cans = [].concat(this._tishiCards.cans[this._tishiIdx] || []);
        let musts = [].concat(this._tishiCards.musts);
        this._holdsNodes.forEach((el) => {
            if (el.active && this.pokerScript(el).canThrow) {
                let v = this.pokerScript(el).getValue();
                let idx = musts.indexOf(v);
                if (idx > -1) {
                    this.pokerScript(el).setTiqi(true);
                    musts.splice(idx, 1);
                } else {
                    idx = cans.indexOf(v);
                    if (idx > -1) {
                        this.pokerScript(el).setTiqi(true);
                        cans.splice(idx, 1);
                    }
                }
            }
        });

        this._tishiIdx+=1;
        if (this._tishiIdx >= this._tishiCards.cans.length) {
            this._tishiIdx = 0;
        }
    },

    gameOver() {
        if (!this.node.active) {
            return;
        }

        this.stopClock();
        this.clearOutsNode();
    },

    onTable() {
        if (!this.node.active) {
            return;
        }

        if (this._uid == cc.dm.user.uid) {
            this._holdsNodes.forEach((el)=> {
                if (el.active) {
                    this.pokerScript(el).setTiqi(false, true);
                }
            });
        }
    },

    /**停止定时器 **/
    onDisable() {
        if(this.turnNode.active) {
            this.stopClock();
        }
    },
});
