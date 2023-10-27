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

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    /**
     * 父类调用onload后调用
     */
    onLoad() {
        this._super();

        this.jhType = this.node.getChildByName('jhType');

        this.betNode = this.node.getChildByName('bet');
        this.resultNode = this.node.getChildByName('result');
        this.holdNodes = this.node.getChildByName('holds').children;

        this.turnNode = this.userNode.getChildByName('turnAnimation').getComponent(sp.Skeleton);
        this.saoguangAni = this.userNode.getChildByName('saoguangAni').getComponent(sp.Skeleton);
        this.bankNode = this.userNode.getChildByName('bank');

        this.kanpaiNode = this.node.getChildByName("yikanpai");
        this.qipaiNode = this.node.getChildByName("yiqipai");
        this.bipaiNode = this.node.getChildByName("bipaiNode");
        this.clockNode = this.userNode.getChildByName("clock");
        this.clockFrame = this.clockNode.getComponent(cc.Sprite).spriteFrame;
        this.bipailoseNode = this.node.getChildByName("bipaiLoser");

        this._xiazhuNum = 0;
        this._always = false;
    },

    /**
     * 重置所有节点
     */
    resetNodes() {
        this._super();

        this.betNode.getComponent('bet').reset();
        this.stopTurn();

        this.resultNode.active = false;
        this.jhType.active = false;

        this.holdNodes.forEach(el => {
            el.getChildByName('paimian').color = cc.color(255, 255, 255);
            el.active = false;
        });
        this.bankNode.active = false;
        
        this.kanpaiNode.active = false;
        this.qipaiNode.active = false;
        this.bipaiNode.active = false;
        this.bipailoseNode.active = false;

        this.resetStatus();
    },

    /**
     * 重置所有状态(清空当前已保存的牌局相关数据)
     */
    resetStatus() {
        this._type = undefined;
        this.holdsData = undefined;
        this.betData = undefined;
        this.statusData = undefined;
        this.finalScoreData = undefined;
        this._fanLastPaiData = undefined;
    },

    start() {
        
    },

    gameBegin() {
        this._super();
    },

    setGameState(state) {
        this.statusData = state;
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
        this.betData = data.bet;
        this.statusData = data.status;
    },

    // update (dt) {},

    /**
    * 设置分数
    * @param score
    */
   setScore (score, ani) {
       this._score = score;
       this.scoreNode.getComponent('scoreAni').showNum(score, ani);
   },

    setTempScore(value) {
        if (!this._score) {
            return;
        }
        let tempScore = this._score - value;
        this._score = tempScore;
        this.scoreNode.getComponent('scoreAni').showNum(tempScore, true);
    },

    setBank (value) {
       if (!this.node.active) {
           return;
       }

       if (!!this.bankNode) {
           this.bankNode.active = value;
           if (value) {
               this.bankNode.getComponent(cc.Animation).play();
               //let lab = this.bankNode.getChildByName('Label');
               //lab.getComponent(cc.Label).string = 'N';
           }
       }
   },

    /**
     * 轮转
     * @param turnSeatId
     */
    setTurn(turnUid, need) {
        this._turn = (this._uid === turnUid);
    },

    showTurnNode(time) {
        this._clockTime = !!time ? Math.floor(time / 1000) : 20;
        this.stopClock();
        if (this._turn) {
            this.turnNode.setAnimation(0, "animation", true);
            this.turnNode.node.active = true;
            this.clockNode.active = true;
            this.schedule(this.clockCountDown, 1);
            this.clockCountDown();
        } else {
            this.stopTurn();
        }
    },

    stopTurn() {
        this.turnNode.clearTracks();
        this.turnNode.node.active = false;
        this.stopClock();
    },

    stopClock() {
        this.unschedule(this.clockCountDown);
        this.clockNode.getComponent(cc.Animation).stop();
        this.clockNode.getComponent(cc.Sprite).spriteFrame = this.clockFrame;
        this.clockNode.active = false;
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

    /**
     * 看牌
     */
    kanPai: function (value, type) {
        let tranSpeed = 0.15;
        let scale = 0.54;
        for (let i = 0; i < 3; ++i) {
            let poker = this.holdNodes[i];
            poker.getComponent("poker").tran_ani(value[i]);
        }
        this.scheduleOnce(function () {
            this.showCardType(type, 1, 1);
        }, 0.5);

        let num = parseInt(Math.random() * 100) % 2;
        if (this._sex === 1)
            cc.vv.audioMgr.playSFX("psz/1_kanpai_" + num + ".mp3");
        else
            cc.vv.audioMgr.playSFX("psz/2_kanpai_" + num + ".mp3");
    },

    showCardType(data, num, look) {
        let types = [0, 1, 2, 3, 4, 3, 2, 2, 2, 4, 4, 4, 5];
        let type = types[data];
        if (type == undefined) {
            return;
        }
        
        this.jhType.getComponent('jhType').checkjhType(type, look, true);

        if (num) {
            let soundstr = "sangong/" + 2 + "/" + this._sex + "_" + type + ".mp3";
            cc.vv.audioMgr.playSFX(soundstr);
        }
    },

    setKanpai() {
        this.kanpaiNode.active = true;
        this.kanpaiNode.getComponent(cc.Animation).play();
        this.jhType.active = false;
    },

    setQipai() {
        this.qipaiNode.active = true;
        this.bipaiNode.active = false;
        this.kanpaiNode.active = false;
        this.jhType.active = false;
        for (let i = 0; i < 3; ++i) {
            this.holdNodes[i].getChildByName('paimian').color = cc.color(180, 180, 180);
        }
        this.turnNode.clearTracks();
        this.turnNode.node.active = false;
        let num = parseInt(Math.random() * 100) % 2;
        if (this._sex === 1)
            cc.vv.audioMgr.playSFX("psz/1_qipai_" + num + ".mp3");
        else
            cc.vv.audioMgr.playSFX("psz/2_qipai_" + num + ".mp3");
    },

    setBipaiOk(data) {
        this.bipaiNode.active = data;
    },

    setSelfNum(data) {
        this.betData = data;
        this.betNode.getComponent("bet").show(parseInt(data));
    },

    showCards(data) {
        for (let i = 0; i < 3; ++i) {
            let poker = this.holdNodes[i];
            poker.getComponent("poker").show(data[i]);
            poker.getChildByName('paimian').color = cc.color(255, 255, 255);
        }
    },

    /**
     * 发3张牌
     */
    deal3: function () {
        for (let i = 0; i < 3; ++i) {
            let poker = this.holdNodes[i];
            let p1 = this.node.parent.convertToWorldSpaceAR(cc.v2(0, 0));
            let p2 = this.node.getChildByName("holds").convertToNodeSpaceAR(p1);
            poker.getComponent("poker").send_ani({start: p2, i: i});
        }
    },

    setBipaiLose() {
        this.bipailoseNode.active = true;
        this.qipaiNode.active = false;
        this.kanpaiNode.active = false;
        this.jhType.active = false;
        this.turnNode.clearTracks();
        this.turnNode.node.active = false;
        for (let i = 0; i < 3; ++i) {
            this.holdNodes[i].getChildByName('paimian').color = cc.color(180, 180, 180);
        }
    },

    //清理节点
    setResetNodes() {
        this.kanpaiNode.active = false;
        this.bipailoseNode.active = false;
        this.qipaiNode.active = false;
    },
    
    playBipaiSound() {
        if (this._sex === 1)
            cc.vv.audioMgr.playSFX("psz/1_bipai.mp3");
        else
            cc.vv.audioMgr.playSFX("psz/2_bipai.mp3");
    },

    playGenzhuSound() {
        let num = parseInt(Math.random() * 100) % 2;
        if (this._sex === 1)
            cc.vv.audioMgr.playSFX("psz/1_genzhu_" + num + ".mp3");
        else
            cc.vv.audioMgr.playSFX("psz/2_genzhu_" + num + ".mp3");
    },
    playJiazhuSound() {
        let num = parseInt(Math.random() * 100) % 2;
        if (this._sex === 1)
            cc.vv.audioMgr.playSFX("psz/1_jiazhu_" + num + ".mp3");
        else
            cc.vv.audioMgr.playSFX("psz/2_jiazhu_" + num + ".mp3");
    },
    playAllinSound() {
        let num = parseInt(Math.random() * 100) % 2;
        if (this._sex === 1)
            cc.vv.audioMgr.playSFX("psz/1_allin_" + num + ".mp3");
        else
            cc.vv.audioMgr.playSFX("psz/2_allin_" + num + ".mp3");
    },


});
