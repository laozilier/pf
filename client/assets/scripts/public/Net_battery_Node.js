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
        batteryBar: {
            default: null,
            type: cc.ProgressBar,
        },

        timeLab: {
            default: null,
            type: cc.Label,
        },

        netSpr: {
            default: null,
            type: cc.Sprite,
        },

        netImgs: {
            default: [],
            type: cc.SpriteFrame,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //this.node.x = cc.winSize.width/2-200;
        //this.node.y = cc.winSize.height/2-80;
    },

    start () {

    },

    onEnable () {
        this.unschedule(this.updateData);
        this.updateData();
        this.schedule(this.updateData, 60);
    },

    onDisable () {
        this.unschedule(this.updateData);
    },

    updateData () {
        let netStatus = nativeApi.getNetworkStatus();
        this.netSpr.getComponent(cc.Sprite).spriteFrame = this.netImgs[netStatus];

        let batteryInfo = nativeApi.getBattery();
        if (batteryInfo) {
            let battery = batteryInfo.battery;
            this.batteryBar.progress = battery;
        }
        let date = new Date();
        let datestr = date.Format('hh:mm');
        this.timeLab.getComponent(cc.Label).string = datestr;
        this.timeLab.node.getChildByName('Label').getComponent(cc.Label).string = datestr;
    },

    // update (dt) {},
});
