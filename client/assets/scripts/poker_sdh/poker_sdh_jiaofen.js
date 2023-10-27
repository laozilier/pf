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

    },

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
        this.btns = [];
        let bgNode = this.node.getChildByName('bg');
        let btnsNode = bgNode.getChildByName('btns');
        for (let i = 0; i< 16; i++) {
            let btn = btnsNode.getChildByName('btn'+i);
            this.btns.push(btn);
        }

        this.btnPai = btnsNode.getChildByName('btn_pai');
        this.togglePai = this.btnPai.getChildByName('toggle');

        this.clockNode = bgNode.getChildByName('clock');
        this.clockFrame = this.clockNode.getComponent(cc.Sprite).spriteFrame;
    },

    start () {

    },

    reset() {
        this.stopClock();
        this.node.active = false;
    },

    showJiaofenNode(data, callCb) {
        this.node.active = true;
        this._callCb  = callCb;

        let jiaofenIdx = data.jiaofenIdx;
        this.jiaofenIdx = jiaofenIdx;
        this.upBtns();

        this.btnPai.getComponent(cc.Button).interactable = false;
        this.btnPai.getChildByName('pai1').active = true;
        this.btnPai.getChildByName('pai2').active = false;
        this.togglePai.getComponent(cc.Toggle).isChecked = false;
        this.togglePai.getComponent(cc.Toggle).interactable = false;
        if (!!data.isPai) {
            this.togglePai.getComponent(cc.Toggle).isChecked = true;
        } else {
            if (data.daiPai) {
                this.btnPai.getComponent(cc.Button).interactable = true;
                this.togglePai.getComponent(cc.Toggle).interactable = true;
                this.btnPai.getChildByName('pai1').active = false;
                this.btnPai.getChildByName('pai2').active = true;
            }
        }

        this.startClock();
    },

    jiaofenBtnPressed(event, data) {
        let idx = parseInt(data);
        let isPai = this.togglePai.getComponent(cc.Toggle).isChecked;
        !!this._callCb && this._callCb(idx, isPai);
    },

    paiTogglePressed(event, data) {
        let isPai = this.togglePai.getComponent(cc.Toggle).isChecked;
        this.upBtns(isPai);
    },

    upBtns(isPai) {
        let jiaofenIdx = this.jiaofenIdx;
        if (!!isPai) {
            jiaofenIdx = Math.max(jiaofenIdx, 5);
        }

        for (let i = 0; i < this.btns.length; i++) {
            let btn = this.btns[i];
            let eable = i > jiaofenIdx;
            if (eable) {
                btn.getComponent(cc.Button).interactable = true;
                btn.getChildByName('lab1').active = false;
                btn.getChildByName('lab2').active = true;
            } else {
                btn.getComponent(cc.Button).interactable = false;
                btn.getChildByName('lab1').active = true;
                btn.getChildByName('lab2').active = false;
            }
        }
    },

    startClock() {
        this._clockTime = 30;
        this.stopClock();
        this.clockNode.active = true;
        this.schedule(this.clockCountDown, 1);
        this.clockCountDown();
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
});
