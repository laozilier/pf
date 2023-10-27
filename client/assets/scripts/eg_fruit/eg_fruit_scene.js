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
    extends: require('../games/Game_scene'),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._super();

        cc.vv.audioMgr.playBGM("poker/public/bgm.mp3");

        let single = this.node.getChildByName('single');

        this.poolNode = single.getChildByName('poolNode');//奖池
        
        this.noticeNode = single.getChildByName('noticeNode');//通知提示
        this.tipsNode = single.getChildByName('game_tips');//状态提示

        this.roundNode = single.getChildByName('eg_fruit_round'); 
        this.betNode = single.getChildByName('betNode');      
        this.betNode.active = false;
        
        this.resNode = single.getChildByName('resNode'); 
        this.resNode.active = false;

        this._isBackGround = false;
        cc.game.on(cc.game.EVENT_SHOW, this.foreGround, this);
        cc.game.on(cc.game.EVENT_HIDE, this.backGround, this);
    },

    foreGround() {
        this._isBackGround = false;
    },

    backGround() {
        this._isBackGround = true;
    },

    onRoomInfo(data) {
        this._super(data);

        this.sceneNodesReset();
        //this.sitDownBtn.active = false;
        //cc.connect.sitDown();
    },

    //场景重置
    sceneNodesReset() {
        this.tipsNode.getComponent('game_tips').reset();
        this.roundNode.getComponent('eg_fruit_round').hideResProp();
    },

    /**
     * 游戏开始
     * @param data
     */
    gameBegin(data, need) {
        this._super(data, need);

        cc.vv.audioMgr.playSFX("poker/public/kaiju.mp3");
        this.sceneNodesReset();
    },

    /**
     *  断线重连游戏信息
     * @param data
     */
    gameInfo(data) {
        this._super(data);

        this.poolScore(data);
    },

    /**
     * 状态切换
     * @param data
     */
    gameStatus(data) {
        this._gameStatus = data.status;
        
        if (this._gameStatus == cc.game_enum.status.BET) {
            cc.connect.send('bet', [
                {'id':1, 'mul':2}, {'id':2, 'mul':2}, {'id':3, 'mul':2}, {'id':4, 'mul':2},
                {'id':5, 'mul':2}, {'id':6, 'mul':2}, {'id':7, 'mul':2}, {'id':8, 'mul':2}
            ]); 
            this.tipsNode.getComponent('game_tips').openTips('请下注', 20, -44);
        }

        if (this._gameStatus == cc.game_enum.status.GAME) {
            this.tipsNode.getComponent('game_tips').openTips('等待开奖', 10, -44);
        }

        if (this._gameStatus == cc.game_enum.status.SETTLE) {
            this.noticeNode.getComponent('NoticeNode').open('恭喜***获得大奖');
            this.tipsNode.getComponent('game_tips').openTips('结算中', 12, -44);
        }
    },

    /**
     * 奖池
     * @param data
     */
     poolScore (data){
        let score = data.poolScore;
        if (typeof score == 'number') {
            score += 50000000;
            this.poolNode.getComponent(cc.Label).string = '奖池\n'+cc.utils.getScoreStr(score);
        }
    },

    /**
     * 玩家下注
     * @param data
     */
    bet (data){
    },

    /***
     *  游戏中将结果
     * @param data
     */
    reward (data) {
        this.roundNode.getComponent('eg_fruit_round').startRound(data);
    },

    /**
     * 游戏结果
     * @param data
     */
    gameResult(data) {
        this.poolScore(data);
        this._myReady = false;
        if (this.isPlaying()) {
            this.startEndnode(10);
        }
        let allScores = data.allScore;
        let wins = [];
        let loses = [];     //输分玩家
        /**  计算分数 */
        for (let uid in allScores) {
            let score = allScores[uid];
            if (score < 0) {
                loses.push(uid);
            } else if (score > 0) {
                wins.push(uid);
            }

            let p = this.getPlayerByUid(uid);
            if (!!p) {
                this.playerScript(p).gameOver();
            }
        }

        if(allScores[cc.dm.user.uid]) {
            if(allScores[cc.dm.user.uid] >= 0) {
                cc.vv.audioMgr.playSFX("poker/public/win.mp3");
            }else{
                cc.vv.audioMgr.playSFX("poker/public/lose.mp3");
            }
        }else{
            console.log("没有分数！")
        }

        // if (!!this._autoOut && this.isPlaying()) {
        //     setTimeout(()=> {
        //         this.backHall();
        //     }, 2000);
        // }
    },

    onChatBtnPressed () {
        this.roundNode.getComponent('eg_fruit_round').startRound({idx: 0});
    }
});

