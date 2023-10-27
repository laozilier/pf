// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
/**
 * 排序
 */
function sort(cards) {
    let arr = cards.slice(0);
    arr.sort(function (a, b) {
        return compareSizes(a, b) ? -1 : 1;
    });
    return arr;
}

/**
 * 比较单张牌的大小，(如果面值相周，则比较花色，黑红梅方)
 * 如果 if(left > right)  return true; 反之false
 * @param left
 * @param right
 */
function compareSizes(left, right) {
    return cardWeight(left) > cardWeight(right);
}

/**
 * 计算牌的权重
 * @param card 牌
 * @return {number} 返回权重
 */
function cardWeight(card) {
    return (card % 13 + 1) * 4 - (4 - parseInt(card / 13));
}

cc.Class({
    extends: require('../games/Game_player'),

    properties: {},

    // LIFE-CYCLE CALLBACKS:

    /**
     * 父类调用onload后调用
     */
    onLoad () {
        this._super();

        this.sangongType = this.node.getChildByName('sangongType');
        this.betNode = this.node.getChildByName('bet');
        this.resultNode = this.node.getChildByName('result');
        this.holdNodes = this.node.getChildByName('holds').children;

        this.robNode = this.userNode.getChildByName('rob');
        this.robAni = this.userNode.getChildByName('robAni').getComponent(sp.Skeleton);
        this.ketuizhuNode = this.userNode.getChildByName('ketuizhu');
        this.saoguangAni = this.userNode.getChildByName('saoguangAni').getComponent(sp.Skeleton);
        this.bankNode = this.userNode.getChildByName('bank');
    },

    /**
     * 重置所有节点
     */
    resetNodes () {
        this._super();

        this.robNode.getComponent('rob').reset();
        this.betNode.getComponent('bet').reset();
        this.robAni.clearTracks();
        this.robAni.node.active = false;

        this.resultNode.active = false;
        this.sangongType.active = false;

        this.ketuizhuNode.active = false;
        this.holdNodes.forEach(el => {
            el.stopAllActions();
            el.active = false}
        );
        this.bankNode.active = false;
        
        this.resetStatus();
    },

    /**
     * 重置所有状态(清空当前已保存的牌局相关数据)
     */
    resetStatus () {
        this.holdsData = undefined;
        this.robData = undefined; //抢庄倍数
        this.betData = undefined;
        this.betsData = undefined;
        this.holdsValueData = undefined;
        this.finalScoreData = undefined;
        this.isFanpai = false;
    },

    gameBegin() {
        this._super();
    },

    /**
     * 设置游戏数据  断线重连后会进来
     * @param data
     */
    set(data) {
        if (!this.node.active) {
            return;
        }
        this.holdsData = data.holds;
        this.robData = data.rob;
        this.betData = data.bet;
        this.betsData = data.bets;
        this.typeData = data.type;
        this.updatePlayerData();
    },

    updatePlayerData(){
        switch(cc.gameargs.status) {
            case cc.game_enum.status.BEGIN:
                this.showHolds();
                break;
            case cc.game_enum.status.WAIT_ROBS_OPEN:
                this.setRob(this.robData);
                this.showHolds();
                break;
            case cc.game_enum.status.WAIT_BETS:
                this.showHolds();
                this.updateXiaZhu();
                break;
            case cc.game_enum.status.CUOPAI_ONE:
                this.showHolds();
                this.updateXiaZhu();
                this.updateResult(this.holdsData, this.typeData);
                break;
        }
    },

    // update (dt) {},

   /**
    * 设置可推注图标的可见性
    */
   setKeTuiZhu (isVisiable){
       if (!this.node.active) {
           return;
       }

       this.ketuizhuNode.active = isVisiable;
   },


   setBank (value) {
       if (!this.node.active) {
           return;
       }

       if (!!this.bankNode) {
           this.bankNode.active = value;
           if (value) {
               this.bankNode.getComponent(cc.Animation).play();
               let lab = this.bankNode.getChildByName('Label');
               lab.getComponent(cc.Label).string = `N${Math.max(this.robData, 1)}M`;
           }
       }
   },

    deal2:function(){
        if (!this.node.active) {
            return;
        }

        let cards = this.holdsData;
        if (Array.isArray(cards)) {
            cards.forEach((value, i) => {
                let poker = this.holdNodes[i];
                let p1 = this.node.parent.convertToWorldSpaceAR(cc.v2(0, 0));
                let p2 = this.node.getChildByName("holds").convertToNodeSpaceAR(p1);
                poker.getComponent("poker").send_tran_ani({start: p2, v: value, i: i, laizi: cc.gameargs.laizi});
            });
        } else {
            for (let i = 0; i < 2; ++i) {
                let poker = this.holdNodes[i];
                let p1 = this.node.parent.convertToWorldSpaceAR(cc.v2(0, 0));
                let p2 = this.node.getChildByName("holds").convertToNodeSpaceAR(p1);
                poker.getComponent("poker").send_ani({start: p2, i: i});
            }
        }
    },

    deal1:function(){
        if (!this.node.active) {
            return;
        }

        let poker = this.holdNodes[2];
        let p1 = this.node.parent.convertToWorldSpaceAR(cc.v2(0, 0));
        let p2 = this.node.getChildByName("holds").convertToNodeSpaceAR(p1);
        poker.getComponent("poker").send_ani({start: p2});

        this.setKeTuiZhu(false);
    },


    showHolds() {
        if (!this.node.active) {
            return;
        }

        if (!!this.holdsValueData) {
            return;
        }

        if (Array.isArray(this.holdsData)) {
            this.holdsData.forEach((el, i) => {
                let poker = this.holdNodes[i];
                poker.active = true;
                if (this.isFanpai) { 
                    poker.getComponent("poker").show(el, cc.gameargs.laizi);
                } else {
                    if (i === 2) {
                        poker.getComponent("poker").show();
                    } else {
                        poker.getComponent("poker").show(el, cc.gameargs.laizi);
                    }
                }
            }, this);
        } else if (this.holdsData !== undefined) {
            for (let i = 0; i < this.holdsData; ++i) {
                let poker = this.holdNodes[i];
                poker.getComponent("poker").show();
            }
        } else {
            let max = 0;
            switch(cc.gameargs.status) {
                case cc.game_enum.status.BEGIN:
                    max = 2;
                    break;
                case cc.game_enum.status.WAIT_ROBS_OPEN:
                    max = 2;
                    break;
                case cc.game_enum.status.WAIT_BETS:
                    max = 2;
                    break;
                case cc.game_enum.status.CUOPAI_ONE:
                    max = 3;
                    break;
            }

            for (let i = 0; i < max; ++i) {
                let poker = this.holdNodes[i];
                poker.getComponent("poker").show();
            }
        }
    },

    /**
     * 翻牌
     */
    fanPai () {
        this.isFanpai = true;
        let poker = this.holdNodes[2];
        let value = this.holdsData[2];
        poker.getComponent("poker").tran_ani(value, cc.gameargs.laizi);
    },


    setRob(rob) {
        if (!this.node.active) {
            return;
        }

        if(rob === undefined) {
            return;
        }

        //保存该玩家得抢庄倍数
        this.robData = rob; 
        //当庄家标记已经出现,则不再显示抢庄的相关信息
        if(this.bankNode.active) {
            return;
        }
        
        this.robNode.getComponent('rob').startRob(rob);
    },

    /**
     * 播放抢庄动画
     */
    playRobAni (id) {
        if (!this.node.active) {
            return;
        }

        let names = ["animation", "animation2"];
        this.robAni.node.active = true;
        this.robAni.clearTracks();
        if (id === 0) {
            this.robAni.setAnimation(id, names[id], true);
        } else {
            this.robAni.setAnimation(id, names[id], false);
        }
    },
    /**
     * 暂停抢庄动画
     */
    stopRobAni () {
        if (!this.node.active) {
            return;
        }

        this.robAni.clearTracks();
        this.robAni.node.active = false;
    },
    /**
     * 清除抢庄的元素
     */
    clearRobView () {
        if (!this.node.active) {
            return;
        }

        this.robNode.getComponent('rob').reset();
    },

    /**
     * 下注
     * @param score
     */
    setBet (score) {
        if (!this.node.active) {
            return;
        }

        this.betData = score;
        this.betNode.active = true;
        this.betNode.setLocalZOrder(1);
        this.betNode.getComponent("bet").show(parseInt(score));
    },

    /**直接显示下注*/
    updateXiaZhu(){
        if (!this.node.active) {
            return;
        }

        if(!!this.betData) {
            this.betNode.active = true;
            this.betNode.setLocalZOrder(1);
            this.betNode.getComponent("bet").clearAnimation();
            this.betNode.getComponent("bet").setValue(parseInt(this.betData));
        }
    },

    /**
     * 显示这一把的输与赢的分数
     * @param score
     */
    showScore (score, c) {
        if (!this.node.active) {
            return;
        }

        this.resScoreNode.active = true;
        this.resScoreNode.getComponent('resScore').showSangongScore(score, c);
    },

    /**
     * 移动分数
     * @param score 移动多少分
     */
    showFinalScore () {
        if (!this.node.active) {
            return;
        }

        if (this.finalScoreData !== undefined) {
            this.setScore(this.finalScoreData, true);
        }
    },

    /**
     * 刷新亮牌结果
     */
    updateResult (holds, typeObj, c) {
        if (!this.node.active) {
            return;
        }

        if (!holds || !typeObj) {
            return;
        }

        this.holdsData = holds;
        //隐藏牌
        this.holdNodes.forEach(el => {
            el.active = false;
        });
        this.typeData = typeObj;
        this.resultNode.active = true;
        for (let j = 0; j < holds.length; j++) {
            let v = holds[j];
            let n = this.resultNode.children[j];
            let ps = this.pokerScript(n);
            ps.show(v, cc.gameargs.laizi);
            if (j == holds.length-1) {
                ps.showLastState();
            } else {
                ps.hideLastState();
            }
        }

        this.sangongType.getComponent('SangongType').checkSangongType(typeObj, c, true);
        //播放音效
        let sex = this._sex == 1 ? this._sex : 2;
        if (c != undefined) {
            // let type = typeObj[c];
            // let soundstr = "sangong/"+ (c+1) +"/" + sex + "_" + type + ".mp3";
            // cc.vv.audioMgr.playSFX(soundstr);
        } else {
            if (typeObj.length > 1) {
                let soundstr1 = "sangong/"+ 1 +"/" + sex + "_" + typeObj[0] + ".mp3";
                cc.vv.audioMgr.playSFX(soundstr1);

                setTimeout(()=> {
                    let soundstr2 = "sangong/"+ 2 +"/" + sex + "_" + typeObj[1] + ".mp3";
                    cc.vv.audioMgr.playSFX(soundstr2);
                }, 800);
            } else {
                let soundstr = "sangong/"+ 1 +"/" + sex + "_" + typeObj[0] + ".mp3";
                cc.vv.audioMgr.playSFX(soundstr);
            }
        }
    },
});
