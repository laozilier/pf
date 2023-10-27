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
        mjNode: {
            default: null,
            type: cc.Prefab
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
        this._btnNames = ['btn_guo', 'btn_chi', 'btn_peng', 'btn_gang', 'btn_bu', 'btn_hu', 'btn_wangdiao', 'btn_wangchuang'];
        let btnsNode = this.node.getChildByName('btns');
        let btnGang = btnsNode.getChildByName('btn_gang');
        let gangMjNodes = btnGang.getChildByName('mjNodes');
        gangMjNodes.children.forEach(el => {
            let mjNode = cc.instantiate(this.mjNode);
            el.addChild(mjNode, 0, 'mjNode');
        });

        let btnBu = btnsNode.getChildByName('btn_bu');
        let buMjNodes = btnBu.getChildByName('mjNodes');
        buMjNodes.children.forEach(el => {
            let mjNode = cc.instantiate(this.mjNode);
            el.addChild(mjNode, 0, 'mjNode');
        });
    },

    start () {

    },

    // update (dt) {},

    btnChiPressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        let btnsNode = this.node.getChildByName('btns');
        btnsNode.active = false;
        let chipaiNode = this.node.getChildByName('mjChipai');
        chipaiNode.getComponent('MjChipai').openChipai(data, (act)=>{
            cc.connect.send('action', {t: cc.game_enum.actionType.chi, act: act});
            this.node.active = false;
        }, ()=> {
            btnsNode.active = true;
        });
    },

    btnActionPressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        let action = parseInt(data);
        cc.connect.send('action', {t: action});
        this.node.active = false;
    },

    btnGangPressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        let act = parseInt(data);
        cc.connect.send('action', {t: cc.game_enum.actionType.gang, act: act});
        this.node.active = false;
    },

    btnBuPressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        let act = parseInt(data);
        cc.connect.send('action', {t: cc.game_enum.actionType.bu, act: act});
        this.node.active = false;
    },

    openActNode(data) {
        this.node.active = true;
        let btnsNode = this.node.getChildByName('btns');
        btnsNode.active = true;
        btnsNode.children.forEach(el=> {
            el.active = false;
        });

        let btnGang = btnsNode.getChildByName('btn_gang');
        let gangMjNodes = btnGang.getChildByName('mjNodes');
        gangMjNodes.children.forEach(el => {
            el.active = false;
        });

        let btnBu = btnsNode.getChildByName('btn_bu');
        let buMjNodes = btnBu.getChildByName('mjNodes');
        buMjNodes.children.forEach(el => {
            el.active = false;
        });

        let btn_guo = btnsNode.getChildByName('btn_guo');
        btn_guo.active = true;

        let chipaiNode = this.node.getChildByName('mjChipai');
        chipaiNode.active = false;

        data.forEach((el) =>{
            let t = el.t;
            let d = el.data;
            let btn = btnsNode.getChildByName(this._btnNames[t]);
            btn.active = true;
            if (t == cc.game_enum.actionType.chi) {
                btn.getComponent(cc.Button).clickEvents[0].customEventData = d;
            } else if (t == cc.game_enum.actionType.gang) {
                for (let i = 0; i < d.length; i++) {
                    let obj = d[i];
                    let bg = gangMjNodes.getChildByName('bg'+i);
                    if (!bg) {
                        continue;
                    }
                    bg.active = true;
                    let mjNode = bg.getChildByName('mjNode');
                    if (!mjNode) {
                        continue;
                    }
                    mjNode.getComponent('mj').showHoldsMjValue(obj.v);
                }
            } else if (t == cc.game_enum.actionType.bu) {
                for (let i = 0; i < d.length; i++) {
                    let obj = d[i];
                    let bg = buMjNodes.getChildByName('bg'+i);
                    if (!bg) {
                        continue;
                    }
                    bg.active = true;
                    let mjNode = bg.getChildByName('mjNode');
                    if (!mjNode) {
                        continue;
                    }
                    mjNode.getComponent('mj').showHoldsMjValue(obj.v);
                }
            }
        });
    },

    hide() {
        this.node.active = false;
    },

    /**
     * 麻将牌的数据值 0~26
     * <br>0~26，万、条、筒
     * @param v
     * @returns {number}
     */
    parseValue: function (v) {
        return (v & 0b11111111);
    },

    /**
     * 操作类型
     * <br>吃：0x1000
     * <br>碰：0x2000
     * <br>杠：0x3100=明杠，0x3200=暗杠，0x3300=放杠
     * <br>补张：0x4100=明补，0x4200=暗补，0x4300=放补  (长沙麻将)
     * <br>胡：0x9000
     * @param v
     * @returns {number}
     */
    parseCategory: function (v) {
        return v >> 12;
    },

    parseOperatorType: function (v) {
        return  v >> 8 & 0xF
    }
});
