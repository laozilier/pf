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

    },

    // LIFE-CYCLE CALLBACKS:

    /**
     * 父类调用onload后调用
     */
    onLoad() {
        this._super();

        this.kuang_red = this.userNode.getChildByName('kuang_red');
        this.kuang_buluer = this.userNode.getChildByName('kuang_bule');
        this.turnNode = this.userNode.getChildByName('turnNode');
        this.clockNode = this.userNode.getChildByName('clock');
        this.clockFrame = this.clockNode.getComponent(cc.Sprite).spriteFrame;
        this.saoguangAni = this.userNode.getChildByName('saoguangAni').getComponent(sp.Skeleton);
    },

    start() {

    },

    gameBegin() {
        this._super();
        this.setCamp(this._seatId);
    },

    /**
     * 轮转
     * @param turnSeatId
     * @param need
     */
    setTurn(turnUid) {
        this._turn = (turnUid == this._uid);
    },

    //轮转显示闹钟
    set_dsqTurn(turnUid, auto) {
        this._turn = (turnUid == this._uid);
        this.showTurnNode(this._turn, auto);
    },

    showTurnNode(show, auto) {
        if (auto) {
            this._clockTime = auto / 1000;
            // Math.floor(this._clockTime);
            this._clockTime = parseInt(this._clockTime);
        } else {
            this._clockTime = 30;
        }
        this.stopClock();
        if (show) {
            this.turnNode.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
            this.turnNode.active = true;

            this.clockNode.active = true;
            this.schedule(this.clockCountDown, 1);
            this.clockCountDown();
        }
    },

    stopClock() {
        this.unschedule(this.clockCountDown);
        this.clockNode.getComponent(cc.Animation).stop();
        this.clockNode.getComponent(cc.Sprite).spriteFrame = this.clockFrame;
        this.clockNode.active = false;

        this.turnNode.getComponent(sp.Skeleton).clearTracks();
        this.turnNode.active = false;
    },

    hideTurn() {

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
     * 设置游戏数据  断线重连后会进来
     * @param data
     */
    set(data) {
        if (!this.node.active) {
            return;
        }

        this.setCamp(this._seatId);
    },

    /**
     * 重置所有节点
     */
    resetNodes() {
        this._super();

        this.stopClock();
    },

    /**
     * 重置所有状态
     */
    resetStatus() {
    },

    // update (dt) {},

    /**
     * 设置阵营
     */
    setCamp(seatId) {
        if (seatId == 0) {
            //红方
            this.kuang_red.active = true;
            this.kuang_buluer.active = false;
        } else if (seatId == 1) {
            //蓝方
            this.kuang_red.active = false;
            this.kuang_buluer.active = true;
        } else {
            this.kuang_red.active = false;
            this.kuang_buluer.active = false;
        }
    },

});
