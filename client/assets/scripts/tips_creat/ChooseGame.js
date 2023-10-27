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
        typeNodes: {
            default: [],
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    start () {

    },

    openWithCid (cid, cb, data) {
        this._cid = cid;
        this._cb = cb;
        this._data = data;
        this.node.active = true;
    },

    //进入游戏匹配界面
    onJoinGame (event,customEventData) {
        if (this._cid == undefined) {
            cc.utils.openWeakTips('请在亲友圈里创建游戏');
            return;
        }

        //亲友圈
        if (event) {
            cc.vv.audioMgr.playButtonSound();
        }

        let gameName = customEventData;
        let model = 0;
        if (gameName == 'poker_pdk15' || gameName == 'poker_pdk16') {
            if (gameName == 'poker_pdk15') {
                model = 1;
            }

            gameName = 'poker_pdk';
        }
        let gameNode = cc.find('Canvas').getChildByName(gameName);
        let scrName = gameName.replace(gameName[0], gameName[0].toUpperCase());
        if (!!gameNode) {
            gameNode.active = true;
            gameNode.getComponent(scrName).open(this._cid, this._cb, this._data, model);
        } else {
            cc.utils.loadPrefabNode('tips_creat/'+gameName, function (gameNode) {
                cc.find('Canvas').addChild(gameNode, 1, gameName);
                gameNode.getComponent(scrName).open(this._cid, this._cb, this._data, model);
            }.bind(this));
        }

        this.node.active = false;
    },

    onTogglePressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        this.typeNodes.forEach((el, idx) => {
            el.active = (idx == data);
        });
    },

    oncloseBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    // update (dt) {},
});
