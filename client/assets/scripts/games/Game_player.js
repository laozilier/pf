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

    properties: {},

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.userNode = this.node.getChildByName('user');
        cc.utils.addClickEvent(this.userNode, this, 'Game_player', 'onGameUserInfoPressed', this.localSeat);

        this.chatNode = this.userNode.getChildByName('chat');   /** 聊天泡泡 */
        this.emojiNode = this.userNode.getChildByName('emoji'); /** emoji表情 */
        this.readyNode = this.userNode.getChildByName('ready'); /** 准备标志 */
        this.voiceNode = this.userNode.getChildByName('voice'); /** 语音泡泡 */

        this.headNode = this.userNode.getChildByName('headNode');   /** 头像 */
        this.nameNode = this.userNode.getChildByName('name');     /** 名字 */
        this.scoreNode = this.userNode.getChildByName('score');     /** 分数 */
        this.resScoreNode = this.userNode.getChildByName('resScore');     /** 输赢分数 */

        this.autoNode = this.userNode.getChildByName('auto'); /** 托管标志 需判断是否存在 */
        this.netNode = this.userNode.getChildByName('net');   /** 断线标志 */

        this.saoguangAni = this.userNode.getChildByName('saoguangAni').getComponent(sp.Skeleton);

        this.resetData();
    },

    /**
     * 重置player节点  恢复至预设状态
     */
    reset() {
        if (!this.node.active) {
            return;
        }

        this.resetData();
        this.resetNodes();
        this.node.active = false;
    },

    resetNodes() {
        this.unscheduleAllCallbacks();

        this.resScoreNode.active = false;
        //清空动画
        this.saoguangAni.clearTracks();
        this.saoguangAni.node.active = false;
        this.readyNode.active = false;
        this.readyNode.getComponent(cc.Animation).stop();

        if (this.readyNode) this.readyNode.active = false;
        if (this.chatNode) this.chatNode.active = false;
        if (this.emojiNode) this.emojiNode.active = false;
        if (this.voiceNode) this.voiceNode.active = false;
    },

    resetData() {
        this._seatId = -100;
        this._uid = -100;
        this._turn = false;
        this._zhuang = false;
        this._sex = 0;
    },

    gameBegin() {
        this.resetNodes();
    },

    start () {

    },

    setUserInfo(info) {
        if (!info) {
            return;
        }

        this._info = info;
        this.node.active = true;
        /**
         * 基础属性 必须保留赋值
         */
        this._uid = info.uid;
        this._seatId = info.seatId;
        this._sex = info.sex || 2;

        let namestr = cc.utils.fromBase64(info.name, 2);
        this.nameNode.getComponent(cc.Label).string = namestr;
        this.nameNode.getChildByName('Label').getComponent(cc.Label).string = namestr;
        let score = info.score;
        this.setScore(score, false);
        this.setAuto(info.isTrusteeship);
        this.setOnline(info.isOnline);
        
        this.headNode.getComponent('HeadNode').updateData(info.pic, info.sex);
        this.setReady(info.ready);
    },

    /**
     * 轮转
     * @param turn
     * @param need
     */
    setTurn (turnUid, need) {
        if (!this.node.active) {
            return;
        }
        this._turn = (this._uid == turnUid);
    },

    // update (dt) {},

    showCWord(arr, str, idx, soundFile) {
        let chatNode = this.chatNode;
        if (chatNode) {
            chatNode.getComponent('Game_chat').show(str);
            if (idx < arr.length) {
                let sex = (this._sex  === 2 ? 1 : 0);
                cc.vv.audioMgr.playSFX(soundFile+'/chat_' + sex + '_' + idx + '.mp3');

            }
        }
    },

    showEmoji(id) {
        let arr = cc.enum.Emojis;
        if (!!arr) {
            let emojiNode = this.emojiNode;
            if (emojiNode) {
                emojiNode.active = true;
                let emojiAnimation = emojiNode.getComponent(cc.Animation);
                emojiAnimation.stop();
                emojiAnimation.play(arr[id]);
                setTimeout(()=> {
                    emojiAnimation.stop();
                    emojiNode.active = false;
                }, 4000);
            }
        }
    },

    showVoice (voiceFile, time) {
        let voiceNode = this.voiceNode;
        if (voiceNode) {
            voiceNode.getComponent('voiceBubble').show(voiceFile, time);
        }
    },

    /**
     * 设置分数
     * @param {*} score 
     * @param {*} ani 
     */
    setScore(score, ani) {
        this.scoreNode.getComponent('scoreAni').showNum(score, ani);
    },

    /**
	 * 用户信息按钮
	 * @param event
	 * @param data
	 */
	onGameUserInfoPressed (event, data) {
		cc.vv.audioMgr.playButtonSound();
		if (!!this._info) {
			cc.utils.showUserInfo(this._info, true);
		}
    },
    
    /**
     * 设置断线
     * @param has
     */
    setOnline: function (has) {
        if (!this.node.active) {
            return;
        }
        !!this.netNode && (this.netNode.active = !has);
    },

    /**
     * 设置托管
     * @param auto
     */
    setAuto (auto) {
        if (!this.node.active) {
            return;
        }
        this._auto = auto;
        !!this.autoNode && (this.autoNode.active = auto);
    },

    /**
     * 获取poker脚本
     * @param poker
     * @return {cc.Component | any}
     */
    pokerScript(poker) {
        return poker.getComponent('poker');
    },

    /**
     * 准备
     * @param {*} ready 
     */
    setReady(ready) {
        if (!this.node.active) {
            return;
        }

        this.readyNode.active = ready;
        if(ready) {
            this.readyNode.getComponent(cc.Animation).play();
        }
    },

    /**
     * 显示这一把的分数
     * @param score
     */
    showScore(score, half) {
        if (!this.node.active) {
            return;
        }

        this.resScoreNode.active = true;
        this.resScoreNode.getComponent('resScore').showScore(score, half);
    },

    /**
     * 进钱后的光效动画
     */
    playSaoGuang() {
        if (!this.node.active) {
            return;
        }

        this.saoguangAni.node.active = true;
        this.saoguangAni.setAnimation(0, "animation", false);
    },

});
