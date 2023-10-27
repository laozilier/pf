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
        bg:{
            default:null,
            type:cc.Node
        },

        playerItem: {
            default: null,
            type:cc.Node
        }
    },

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    start() {

    },

    initNodes() {
        if (!!this._playerItems) {
            return;
        }

        this._playerItems = [];
        this.playerItem.active = false;
        this._playerItems.push(this.playerItem);
        for (let i = 1; i < 7; i++) {
            let item = cc.instantiate(this.playerItem);
            this.bg.addChild(item);

            this._playerItems.push(item);
        }
    },

    show(data) {
        console.log("战绩数据：", data);
        this.initNodes();

        for (let i = 0; i < this._playerItems.length; i++) {
            let item = this._playerItems[i];
            item.active = false;
        }

        
        let users = data.userinfos;
        let playback = data.playback;
        let uids = playback.uids;
        let scores = data.scores;
        let lastHolds = playback.lastHolds;
        for (let i = 0; i < uids.length; i++) {
            let item = this._playerItems[i];
            let uid = uids[i];
            let user = users[uid];
            let score = scores[uid];
            let lastHold = lastHolds[i];
            item.getComponent('SanshuiDetail').show(uid, user, score, lastHold, playback.zuid == uid);
        }
    },

    close(){
        this.node.active = false;
    }
});
