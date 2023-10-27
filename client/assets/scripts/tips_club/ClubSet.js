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
        btnEditname: {
            default: null,
            type:cc.Node
        },

        btnMembers: {
            default: null,
            type:cc.Node
        },

        btnDismiss: {
            default: null,
            type:cc.Node
        },

        btnExit: {
            default: null,
            type:cc.Node
        },

        btnSetrooms: {
            default: null,
            type:cc.Node
        },

        btnDismissTable: {
            default: null,
            type:cc.Node
        },

        btnReport: {
            default: null,
            type:cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);

    },

    start () {

    },

    open () {
        this._cid = cc.dm.clubInfo.cid;
        this._clubName = cc.dm.clubInfo.name;
        this._isCreator = (cc.dm.clubInfo.role == 2);
        this._isManager = (cc.dm.clubInfo.role == 1);
        this.btnEditname.active = (this._isCreator || this._isManager);
        this.btnMembers.active = (this._isCreator || this._isManager);
        this.btnDismiss.active = false;//this._isCreator;
        this.btnExit.active = false;//!this._isCreator;
        this.btnSetrooms.active = (this._isCreator || this._isManager);
        this.btnDismissTable.active = (this._isCreator || this._isManager);
        this.btnReport.active = this._isCreator;
    },

    // update (dt) {},
    onCreateRulePressed() {
        cc.vv.audioMgr.playButtonSound();
        let createRule = this.node.getChildByName('createRule');
        if (createRule) {
            createRule.active = true;
            createRule.getComponent('CreateRule').open(cc.dm.clubInfo.privateRooms);
        } else {
            cc.utils.loadPrefabNode('tips_club/createRule', (createRule) => {
                this.node.addChild(createRule, 1, 'createRule');
                createRule.getComponent('CreateRule').open(cc.dm.clubInfo.privateRooms);
            });
        }
    },

    onMembersPressed() {
        let self = this;
        let members = this.node.getChildByName('members');
        if (members) {
            members.active = true;
            members.getComponent('Members').open();
        } else {
            cc.utils.loadPrefabNode('tips_club/members', function (members) {
                self.node.addChild(members, 1, 'members');
                members.getComponent('Members').open();
            });
        }
    },

    onEditnamePressed() {
        cc.vv.audioMgr.playButtonSound();

        let editName = this.node.getChildByName('editName');
        if (editName) {
            editName.active = true;
            editName.getComponent('EditName').open();
        } else {
            cc.utils.loadPrefabNode('tips_club/editName', function (editName) {
                this.node.addChild(editName, 1, 'editName');
                editName.getComponent('EditName').open();
            }.bind(this));
        }
    },

    onDismissPressed() {
        cc.vv.audioMgr.playButtonSound();
        cc.utils.openTips('确定解散亲友群?', function () {
            cc.connect.dismissClub('dismiss', {cid: this._cid}, (res) => {
                cc.director.loadScene('login');
            });
        });
    },

    /***
     * 订单
     */
    onOrderPressed:function () {
        cc.vv.audioMgr.playButtonSound();
        let hallOrder = this.node.getChildByName('hallOrder');
        if (hallOrder) {
            hallOrder.getComponent('Order').open();
        } else {
            cc.utils.loadPrefabNode('tips_hall/order', function (hallOrder) {
                this.node.addChild(hallOrder, 1, 'hallOrder');
                hallOrder.getComponent('Order').open();
            }.bind(this));
        }
    },

    /***
     * 转出记录
     */
    onWithdrawListPressed:function () {
        cc.vv.audioMgr.playButtonSound();
        let withdrawList = this.node.getChildByName('withdrawList');
        if (withdrawList) {
            withdrawList.getComponent('WithdrawList').openWithdrawList();
        } else {
            cc.utils.loadPrefabNode('tips_club/withdrawList', function (withdrawList) {
                this.node.addChild(withdrawList, 1, 'withdrawList');
                withdrawList.getComponent('WithdrawList').openWithdrawList();
            }.bind(this));
        }
    },

    /***
     * 赠送记录
     */
    onGiveBtnPressed:function () {
        cc.vv.audioMgr.playButtonSound();
        let giftList = this.node.getChildByName('giftList');
        if (giftList) {
            giftList.getComponent('GiftList').openGiftList();
        } else {
            cc.utils.loadPrefabNode('tips_club/giftList', function (giftList) {
                this.node.addChild(giftList, 1, 'giftList');
                giftList.getComponent('GiftList').openGiftList();
            }.bind(this));
        }
    },

    onSearchUserPressed:function () {
        cc.vv.audioMgr.playButtonSound();
        let query = this.node.getChildByName('query');
        if (query) {
            query.active = true;
            query.getComponent('Query').open();
        } else {
            cc.utils.loadPrefabNode('tips_hall/query', function (query) {
                this.node.addChild(query, 1, 'query');
                query.getComponent('Query').open();
            }.bind(this));
        }
    },

    /***
     * 转出
     */
    onTxBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        // if (cc.dm.checkWechat()) {} else {
        //     cc.connect.bindWithdrawWechat((url) => {
        //         cc.utils.openWeakTips('请先绑定微信零钱');
        //         this.nextBindWX(url);
        //     });
        //     return;
        // }

        if (!!cc.dm.user.paymentUrl) {
            let isAli = (cc.dm.user.paymentUrl.indexOf('HTTPS://QR.ALIPAY.COM/') > -1 || cc.dm.user.paymentUrl.indexOf('https://qr.alipay.com/') > -1);
            let isWx = (cc.dm.user.paymentUrl.indexOf('wxp://') > -1 || cc.dm.user.paymentUrl.indexOf('payapp.weixin.qq.com') > -1);
            if (!isAli && !isWx) {
                cc.utils.openWeakTips('请先上传正确的二维码');
                cc.utils.openUpPayQRCode(cc.dm.user.paymentUrl, cc.dm.user.paymentName, () => {
                });
                return;
            }
        } else {
            cc.utils.openWeakTips('请先上传正确的二维码');
            cc.utils.openUpPayQRCode(cc.dm.user.paymentUrl, cc.dm.user.paymentName, () => {
            });
            return;
        }

        let txNode = this.node.getChildByName('txNode');
        if (txNode) {
            txNode.active = true;
            txNode.getComponent('TxNode').open();
        } else {
            cc.utils.loadPrefabNode('tips_hall/txNode', function (txNode) {
                this.node.addChild(txNode, 1, 'txNode');
                txNode.getComponent('TxNode').open();
            }.bind(this));
        }
    },

    nextBindWX (url) {
        let bindWXNode = this.node.getChildByName('bindWXNode');
        if (bindWXNode) {
            bindWXNode.getComponent('BindWXNode').openBindWX(url);
        } else {
            cc.utils.loadPrefabNode('tips_hall/bindWXNode', function (bindWXNode) {
                this.node.addChild(bindWXNode, 1, 'bindWXNode');
                bindWXNode.getComponent('BindWXNode').openBindWX(url);
            }.bind(this));
        }        
    },

    /***
     * 设置
     */
    onSettingPressed: function () {
        cc.vv.audioMgr.playButtonSound();
        cc.utils.showSetting ();
    },

    /***
     * 分享二维码
     */
    onQrcodePressed: function (event) {
        if (!!event) {
            cc.vv.audioMgr.playButtonSound();
        }

        cc.utils.openQCodeShare();
    },

    /***
     * 代理
     */
    onDealerPressed: function() {
        cc.vv.audioMgr.playButtonSound();
        if (cc.dm.user.profitRatio > 0) {
            let dealerBackend = this.node.getChildByName('dealerBackend');
            if (dealerBackend) {
                dealerBackend.getComponent('DealerBackend').openDealerBackend();
            } else {
                cc.utils.loadPrefabNode('tips_club/dealerBackend', function (dealerBackend) {
                    this.node.addChild(dealerBackend, 1, 'dealerBackend');
                    dealerBackend.getComponent('DealerBackend').openDealerBackend();
                }.bind(this));
            }
        } else {
            cc.utils.openDealerTips();
        }
    },

    /***
     * 信息
     */
    onMessagePressed:function () {
        cc.vv.audioMgr.playButtonSound();
        let message = this.node.getChildByName('message');
        if (message) {
            message.active = true;
        } else {
            cc.utils.loadPrefabNode('tips_hall/message', function (message) {
                this.node.addChild(message, 1, 'message');
            }.bind(this));
        }
    },

    /***
     * 玩法
     */
    onPlayrulePressed:function () {
        cc.vv.audioMgr.playButtonSound();
        let playrule = this.node.getChildByName('playrule');
        if (playrule) {
            playrule.active = true;
        } else {
            cc.utils.loadPrefabNode('tips_hall/playrule', function (playrule) {
                this.node.addChild(playrule, 1, 'playrule');
            }.bind(this));
        }
    },

    /***
     * 解散桌子
     */
    onDissmissTableBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        let dismissTable = this.node.getChildByName('dismissTable');
        if (dismissTable) {
            dismissTable.active = true;
            dismissTable.getComponent('DismissTable').openDismissTable();
        } else {
            cc.utils.loadPrefabNode('tips_club/dismissTable', function (dismissTable) {
                this.node.addChild(dismissTable, 1, 'dismissTable');
                dismissTable.getComponent('DismissTable').openDismissTable();
            }.bind(this));
        }
    },

    /***
     * 亲友群统计
     */
    onReportBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        let report = this.node.getChildByName('report');
        if (report) {
            report.getComponent('Report').openReport();
        } else {
            cc.utils.loadPrefabNode('tips_club/report', function (report) {
                this.node.addChild(report, 1, 'report');
                report.getComponent('Report').openReport();
            }.bind(this));
        }
    },

    onClosePressed() {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    }
});
