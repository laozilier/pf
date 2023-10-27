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

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
        this._btnNames = ['btn_guo', 'btn_chi', 'btn_peng', 'btn_hu', 'btn_wangdiao', 'btn_wangchuang', 'btn_wangzha'];
    },

    start () {

    },

    openActNode(data) {
        this.node.active = true;
        let btnsNode = this.node.getChildByName('btns');
        btnsNode.children.forEach(el=> {
            el.active = false;
        });
        let btn_guo = btnsNode.getChildByName('btn_guo');
        btn_guo.active = true;

        let chipaiNode = this.node.getChildByName('zpChipai');
        chipaiNode.active = false;

        data.forEach((el) =>{
            let t = el.t;
            let d = el.data;
            let btn = btnsNode.getChildByName(this._btnNames[t]);
            btn.active = true;
            if (t == cc.zp_chz_enum.actionType.chi) {
                btn.getComponent(cc.Button).clickEvents[0].customEventData = d;
            }
        });
    },

    /*------------------按钮操作------------------------*/
    onChiPressed (event, data) {
        cc.vv.audioMgr.playButtonSound();
        let self = this;
        let chipaiNode = this.node.getChildByName('zpChipai');
        chipaiNode.getComponent('ZpChipai').openChipai(data, (res)=>{
            cc.connect.send('action', {t: 1, acts: res});
            self.node.active = false;
        });
    },

    //碰
    onPengPressed (event) {
        cc.vv.audioMgr.playButtonSound();
        cc.connect.send('action', {t: 2});
        this.node.active = false;
    },

    onHuPressed(event) {
        cc.vv.audioMgr.playButtonSound();
        cc.connect.send('action', {t: 3});
        this.node.active = false;
    },

    onGuoPressed (event) {
        cc.vv.audioMgr.playButtonSound();
        cc.connect.send('action', {t: 0});
        this.node.active = false;
    },

    onWangdiaoPressed (event) {
        cc.vv.audioMgr.playButtonSound();
        cc.connect.send('action', {t: 4});
        this.node.active = false;
    },

    onWangchuangPressed (event) {
        cc.vv.audioMgr.playButtonSound();
        cc.connect.send('action', {t: 5});
        this.node.active = false;
    },

    onWangzhaPressed (event) {
        cc.vv.audioMgr.playButtonSound();
        cc.connect.send('action', {t: 6});
        this.node.active = false;
    },

    // update (dt) {},
});
