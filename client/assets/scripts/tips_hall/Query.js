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
        editBox:{
            default:null,
            type:cc.EditBox,
            displayName:"查询昵称"
        },

        resNode: {
            default: null,
            type: cc.Node
        },

        nodataLab: {
            default:null,
            type:cc.Label
        },

        resultName:{
            default:null,
            type:cc.Label,
            displayName:"目标昵称"
        },
        ID:{
            default:null,
            type:cc.Label,
        },

        bindID:{
            default:null,
            type:cc.Label,
            displayName:"推荐人ID"
        },

        bindName:{
            default:null,
            type:cc.Label,
            displayName:"推荐人昵称"
        },

        gamesCount:{
            default:null,
            type:cc.Label,
            displayName:"游戏局数"
        },

        createTime: {
            default:null,
            type:cc.Label,
        },

        ratioNode: {
            default: null,
            type: cc.Node
        },

        ratioLab: {
            default: null,
            type: cc.Node
        },

        ratioTips: {
            default: null,
            type: cc.Node
        },

        ratioToggle: {
            default: null,
            type: cc.Node
        },

        ratioMore: {
            default: null,
            type: cc.Node
        },

        ratioFrames: {
            default: [],
            type: cc.SpriteFrame
        },

        pListBtn: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    onEnable () {
        this.resNode.active = false;
        this.nodataLab.node.active  = false;

        this.resultName.string = '';
        this.ID.string = '';

        this.bindID.string = '';
        this.bindName.string = '';
        this.gamesCount.string = '';
        this.createTime.string = '';
    },

    open(cb) {
        this._cb = cb;
        this._cid = cc.dm.clubInfo.cid;

        if (!!cc.dm.user.permission && cc.dm.user.permission.dealer) {
            this.ratioNode.active = true;
            this.pListBtn.active = true;
        } else {
            this.ratioNode.active = false;
            this.pListBtn.active = false;
        }
    },

    /**
     * 查询玩家信息
     */
    onQueryPlayer:function (){
        cc.vv.audioMgr.playButtonSound();
        let uid = this.editBox.string;
        if (uid && uid.length == 6) {
            this._uid = parseInt(uid);
            this.nextQuery();
        } else {
            cc.utils.openTips('请输入6位用户id');
        }
    },

    nextQuery() {
        cc.connect.searchUser(this._uid, (user) => {
            this.resNode.active = true;
            this.nodataLab.node.active  = false;

            let headNode = this.resNode.getChildByName('headNode');
            headNode.getComponent('HeadNode').updateData(user.headimg, user.sex);

            this.resultName.string = cc.utils.fromBase64(user.name);
            this.ID.string = user.uid;
            
            this.bindID.string = user.invite_code || '未绑定代理';
            let parents = user.parents;
            parents = (typeof parents == 'string') ? JSON.parse(parents) : parents;
            this._parents = parents;
            let super_name = (parents[0] && parents[0].name);
            this.bindName.string = super_name ? cc.utils.fromBase64(super_name, 6) : '未绑定代理';
            this.gamesCount.string = user.total_inning;

            this.checkRatioLab(user.profit_ratio);
        }, (errmsg) => {
            this.resNode.active = false;
            this.nodataLab.node.active  = true;
            this.nodataLab.string = errmsg;
        });
    },

    onSearchTxtChanged() {
        let uid = this.editBox.string;
        if (uid && uid.length == 6) {
            this.editBox.setFocus(false);
            this._uid = parseInt(uid);
            this.nextQuery();
        }
    },

    onListBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        let bindList = this.node.getChildByName('bindList');
        if (bindList) {
            bindList.getComponent('BindList').openBindList(this._parents);
        } else {
            cc.utils.loadPrefabNode('tips_hall/bindList', function (bindList) {
                this.node.addChild(bindList, 1, 'bindList');
                bindList.getComponent('BindList').openBindList(this._parents);
            }.bind(this));
        }
    },

    onSetRadioPressed() {
        cc.vv.audioMgr.playButtonSound();
        if (this._ratios) {
            this.ratioTips.active = !this.ratioTips.active;
            this.ratioMore.getComponent(cc.Sprite).spriteFrame = this.ratioFrames[this.ratioTips.active ? 1 : 0];
            this.ratioTips.children.forEach((el, idx) => {
                el.getComponent(cc.Toggle).isChecked = (idx == this._ratios.indexOf(this._profit_ratio));
            });
        } else {
            cc.connect.ratios((msg) => {
                this._ratios = (typeof msg == 'string') ? JSON.parse(msg) : msg;
                this.ratioToggle.getComponent(cc.Toggle).checkEvents[0].customEventData = 0;
                for (let i = 1; i < this._ratios.length; i++) {
                    let toggle = cc.instantiate(this.ratioToggle);
                    this.ratioTips.addChild(toggle, i, 'toggle'+i);
                    toggle.getComponent(cc.Toggle).checkEvents[0].customEventData = i;
                    let lab = toggle.getChildByName('Label');
                    if (!!lab) {
                        lab.getComponent(cc.Label).string = Math.ceil(this._ratios[i]*100)+'%';
                    }
    
                    if (i == this._ratios.length-1) {
                        let line = toggle.getChildByName('img_line');
                        if (!!line) {
                            line.active = false;
                        }
                    }
                }
    
                this.ratioTips.active = !this.ratioTips.active;
                this.ratioMore.getComponent(cc.Sprite).spriteFrame = this.ratioFrames[this.ratioTips.active ? 1 : 0];
                this.ratioTips.children.forEach((el, idx) => {
                    el.getComponent(cc.Toggle).isChecked = (idx == this._ratios.indexOf(this._profit_ratio));
                });
            });
        }
    },

    onRatioTogglePressed(event, idx) {
        this.resetRatioTips();
        let ratio = this._ratios[idx];
        /** 设置分润等级 */
        cc.connect.setProfitRatio(this._cid, this._uid, idx, (msg) => {
            this.checkRatioLab(ratio);
        });
    },

    checkRatioLab(ratio) {
        this._profit_ratio = ratio;
        let profit_ratio = ratio*100;
        let ratiostr = '';
        if (profit_ratio > 0) {
            ratiostr = profit_ratio+'%';
        } else {
            ratiostr = '无';
        }

        this.ratioLab.getComponent(cc.Label).string = ratiostr;
        this.ratioLab.getChildByName('Label').getComponent(cc.Label).string = ratiostr;
    },

    resetRatioTips() {
        this.ratioTips.active = false;
        this.ratioMore.getComponent(cc.Sprite).spriteFrame = this.ratioFrames[0];
    },

    onClose:function () {
        cc.vv.audioMgr.playButtonSound();
        this.resetRatioTips();
        this.node.active = false;
    },

    // update (dt) {},
});
