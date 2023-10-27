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
        roomInfonode:{
           default:null,
           type:cc.Node
       },

        meditboxstr:{
            default: null,
            type:cc.EditBox
        },

        dissolvebut:{
            default:null,
            type:cc.Button
        },

        loadingNode:{
            default: null,
            type: cc.Sprite,
            displayName: 'loading'
        },

        nodataLab:{
            default: null,
            type: cc.Label,
            displayName: '没有信息提示Lab'
        },
    },

    openDismissTable() {

    },

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
        this._searchKey = undefined;
        this.meditboxstr.string = '';
        this.dissolvebut.interactable = false;
    },

    start () {

    },

    onSearchInfo(){
        cc.vv.audioMgr.playButtonSound();
        if (!!this.meditboxstr.string) {
            this._searchKey = this.meditboxstr.string;
        } else {
            this._searchKey = undefined;
            cc.utils.openTips('请输入有效房间号!');
            return;
        }

        if (this._searchKey.length != 6 ||  this._searchKey.match(/^\d{6}$/) == null) {
            cc.utils.openTips('请输入6位有效房间号!');
            return;
        }

        this.roomInfonode.active = false;
        this.loadingNode.node.active = true;
        this.loadingNode.node.runAction(cc.repeatForever(cc.rotateBy(0.8, 360)));

        this.nodataLab.node.active = true;
        this.nodataLab.string = '正在请求该房间信息!';

        /** 获取房间信息 */
        cc.connect.roomInfo(this._searchKey, (msg) => {
            this.onHeidNodeBack();
            if (!msg || msg.length == 0) {
                this.nodataLab.node.active = true;
                this.nodataLab.string = '暂无该房间信息';
                return;
            }

            this.nodataLab.node.active = false;

            let nRoomInfo = msg;
            this.onUpRoomInfo(nRoomInfo);
        }, (errmsg) => {
            this.onHeidNodeBack();

            this.nodataLab.node.active = true;
            this.nodataLab.string = errmsg;
        });
    },

    onUpRoomInfo(data){
        let n_roomidlabel = this.roomInfonode.getChildByName('label_romid');
        let n_playernumlabel = this.roomInfonode.getChildByName('label_playnum');
        let n_explainlabel = this.roomInfonode.getChildByName('label_explain');
        let n_scorelabel = this.roomInfonode.getChildByName('label_score');

        if (n_roomidlabel) {
            n_roomidlabel.getComponent(cc.Label).string = '房号:'+this._searchKey;
        }
        if (n_playernumlabel) {
            n_playernumlabel.getComponent(cc.Label).string = '人数:'+data.playerCount;
        }
        if (n_explainlabel) {
            n_explainlabel.getComponent(cc.Label).string = '玩法:'+data.gameName;
        }
        if (n_scorelabel) {
            n_scorelabel.getComponent(cc.Label).string =  '底分:'+data.gameRule.ante;
        }

        this.roomInfonode.active = true;
        this.dissolvebut.interactable = true;
    },

    onDissolveRoom(event,data){
        cc.vv.audioMgr.playButtonSound();
        cc.utils.openTips('你真的要解散桌子吗？',  () => {
            /** 解散桌子 */
            cc.connect.clubDismissRoom(this._searchKey, cc.dm.clubInfo.cid, (msg) => {

                this._searchKey =  undefined;
                this.meditboxstr.string = '';
                this.roomInfonode.active = false;
                this.dissolvebut.interactable = false;

                cc.utils.openTips('解散成功！',() => {
                    this.onHeidNodeBack();
                    this.node.active = false;
                });

            }, (errmsg) => {
                this.dissolvebut.enabled = false;
                this.roomInfonode.active = false;
                this.nodataLab.node.active = true;
                this.nodataLab.string = errmsg;
            });
        }, function () {

        });
    },

    onHeidNodeBack(){
        this.loadingNode.node.active = false;
        this.loadingNode.node.stopAllActions();

        this.nodataLab.node.active = true;
        this.nodataLab.string = '请输入6位有效房间号并进行查询！';
    },

    onCloseBtnPressed() {
        cc.vv.audioMgr.playButtonSound();

        this._searchKey =  undefined;
        this.meditboxstr.string = '';
        this.onHeidNodeBack();

        this.node.active = false;
    },
});
