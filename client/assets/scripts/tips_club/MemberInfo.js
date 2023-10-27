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
        infoNode: {
            default: null,
            type: cc.Node
        },

        loadingNode: {
            default: null,
            type: cc.Node
        },

        loadingLab: {
            default: null,
            type: cc.Node
        },

        headNode: {
            default: null,
            type: cc.Node
        },

        nameNode: {
            default: null,
            type: cc.Node
        },

        IDNode: {
            default: null,
            type: cc.Node
        },

        PIDNode: {
            default: null,
            type: cc.Node
        },

        inningNode: {
            default: null,
            type: cc.Node
        },

        scoreLab: {
            default: null,
            type: cc.Node
        },

        totalscoreLab: {
            default: null,
            type: cc.Node
        },

        payLab: {
            default: null,
            type: cc.Node
        },

        withdrawLab: {
            default: null,
            type: cc.Node
        },

        taxLab: {
            default: null,
            type: cc.Node
        },

        dealerTips: {
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

        leftProfitLab: {
            default: null,
            type: cc.Node
        },

        teamCountLab: {
            default: null,
            type: cc.Node
        },

        allProfitLab: {
            default: null,
            type: cc.Node
        },

        todayProfitLab: {
            default: null,
            type: cc.Node
        },

        dealers1Lab: {
            default: null,
            type: cc.Node
        },

        dealers2Lab: {
            default: null,
            type: cc.Node
        },
        
        playersLab: {
            default: null,
            type: cc.Node
        },

        mobileNode: {
            default: null,
            type: cc.Node
        },

        wxNode: {
            default: null,
            type: cc.Node
        },

        codeNode: {
            default: null,
            type: cc.Node
        },

        listNodes: {
            default: [],
            type: cc.Node
        },

        bottomNode: {
            default: null,
            type: cc.Node
        },

        rLoadingNode: {
            default: null,
            type: cc.Node
        },

        rLoadingLab: {
            default: null,
            type: cc.Node
        },

        addBtn: {
            default: null,
            type: cc.Node
        },

        decreaseBtn: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
        this._idx = 0;
        this._pay_channels = {0: '微信H5', 1: '好哒支付', 30: '人工充值', 40: '代理积分兑换'}
    },

    start () {

    },

    showMemberInfo(cid, userinfo) {
        this.node.active = true;
        this._isCreator = (cc.dm.clubInfo.role == 2);
        this.addBtn.active = this._isCreator;
        this.decreaseBtn.active = this._isCreator;
        this._paymenturl = '';
        this.infoNode.active = false;
        this.loadingNode.active = true;
        this.loadingNode.runAction(cc.repeatForever(cc.rotateBy(0.8, 360)));
        this.loadingLab.active = false;
        let uid = userinfo.uid;
        this._uid = uid;
        this._cid = cc.dm.clubInfo.cid;
        this._pageIdx = 1;
        this.bottomNode.getComponent('Bottom').resetBottom();
        cc.connect.detailUserInfo(cid, uid, (info) => {
            this.loadingNode.stopAllActions();
            this.loadingNode.active = false;
            this.checkInfo(info, userinfo);
        }, (errmsg) => {
            this.loadingNode.stopAllActions();
            this.loadingNode.active = false;
            this.loadingLab.active = true;
            this.loadingLab.getComponent(cc.Label).string = errmsg;
        });
    },

    checkInfo(info, userinfo) {
        this.infoNode.active = true;

        this.headNode.getComponent('HeadNode').updateData(userinfo.headimg, userinfo.sex);
        let namestr = cc.utils.fromBase64(info.name, 6);
        this.nameNode.getComponent(cc.Label).string = namestr;
        this.nameNode.getChildByName('Label').getComponent(cc.Label).string = namestr;

        this.IDNode.getComponent(cc.Label).string = 'ID: '+info.uid;
        this.PIDNode.getComponent(cc.Label).string = '上级ID: '+info.invite_code;
        this.inningNode.getComponent(cc.Label).string = '局数: '+info.total_inning+'局';

        let scorestr = cc.utils.getScoreStr(info.score);
        this.scoreLab.getComponent(cc.Label).string = scorestr;
        this.scoreLab.getChildByName('Label').getComponent(cc.Label).string = scorestr;

        let totalscorestr = cc.utils.getScoreStr(info.game_turnover);
        this.totalscoreLab.getComponent(cc.Label).string = totalscorestr;
        this.totalscoreLab.getChildByName('Label').getComponent(cc.Label).string = totalscorestr;

        let paystr = cc.utils.getScoreStr(info.recharge);
        this.payLab.getComponent(cc.Label).string = paystr;
        this.payLab.getChildByName('Label').getComponent(cc.Label).string = paystr;

        let withdrawstr = cc.utils.getScoreStr(info.withdrawal);
        this.withdrawLab.getComponent(cc.Label).string = withdrawstr;
        this.withdrawLab.getChildByName('Label').getComponent(cc.Label).string = withdrawstr;

        let taxstr = cc.utils.getScoreStr(info.tax);
        this.taxLab.getComponent(cc.Label).string = taxstr;
        this.taxLab.getChildByName('Label').getComponent(cc.Label).string = taxstr;
        
        this._profit_ratio = info.profit_ratio;
        this.checkRatioLab(info.profit_ratio);

        let leftProfitstr = cc.utils.getScoreStr(info.profit);
        this.leftProfitLab.getComponent(cc.Label).string = leftProfitstr;
        this.leftProfitLab.getChildByName('Label').getComponent(cc.Label).string = leftProfitstr;

        let subordinateCount = info.subordinateCount || 0;
        let subordinateTwoCount = info.subordinateTwoCount || 0;
        let playerCount = info.playerCount || 0;
        let teamCountstr = (subordinateCount+subordinateTwoCount+playerCount)+'人';
        this.teamCountLab.getComponent(cc.Label).string = teamCountstr;
        this.teamCountLab.getChildByName('Label').getComponent(cc.Label).string = teamCountstr;

        let allProfitstr = cc.utils.getScoreStr(info.total_profit);
        this.allProfitLab.getComponent(cc.Label).string = allProfitstr;
        this.allProfitLab.getChildByName('Label').getComponent(cc.Label).string = allProfitstr;

        let todayProfitstr = cc.utils.getScoreStr(info.today_profit);
        this.todayProfitLab.getComponent(cc.Label).string = todayProfitstr;
        this.todayProfitLab.getChildByName('Label').getComponent(cc.Label).string = todayProfitstr;

        let dealers1str = subordinateCount+'人';
        this.dealers1Lab.getComponent(cc.Label).string = dealers1str;
        this.dealers1Lab.getChildByName('Label').getComponent(cc.Label).string = dealers1str;

        let dealers2str = subordinateTwoCount+'人';
        this.dealers2Lab.getComponent(cc.Label).string = dealers2str;
        this.dealers2Lab.getChildByName('Label').getComponent(cc.Label).string = dealers2str;

        let playersstr = playerCount+'人';
        this.playersLab.getComponent(cc.Label).string = playersstr;
        this.playersLab.getChildByName('Label').getComponent(cc.Label).string = playersstr;

        let mobile = info.mobile;
        let noLab = this.mobileNode.getChildByName('noLab');
        let mobileLab = this.mobileNode.getChildByName('mobileLab');
        if (!!mobile) {
            mobileLab.active = true;
            noLab.active = false;
            mobileLab.string = mobile;
        } else {
            mobileLab.active = false;
            noLab.active = true;
        }

        let wxinfoNode = this.wxNode.getChildByName('infoNode');
        noLab = this.wxNode.getChildByName('noLab');
        let wx_headimg = info.wx_headimg;
        let wx_nickname = info.wx_nickname;
        let wx_realname = info.wx_realname;
        if (!!wx_headimg || !!wx_nickname || wx_realname) {
            wxinfoNode.active = true;
            noLab.active = false;

            let wxHeadNode = wxinfoNode.getChildByName('headNode');
            wxHeadNode.getComponent('HeadNode').updateData(wx_headimg, 0);

            let nicknameLab = wxinfoNode.getChildByName('nicknameLab');
            nicknameLab.getComponent(cc.Label).string = '微信昵称: '+cc.utils.fromBase64(wx_nickname);

            let realnameLab = wxinfoNode.getChildByName('realnameLab');
            realnameLab.getComponent(cc.Label).string = '微信实名: '+cc.utils.fromBase64(wx_realname);
        } else {
            wxinfoNode.active = false;
            noLab.active = true;
        }

        this._paymenturl = info.paymenturl;
        this._paymentname = cc.utils.fromBase64(info.paymentname);
        this.checkCodeNode();

        this._sealUp = info.sealUp != 0 ? true : false;
        this.checkSealUp();
        this.getListData();
    },

    checkSealUp() {
        let disable = this.infoNode.getChildByName('disable');
        let able = this.infoNode.getChildByName('able');
        if (this._sealUp) {
            disable.active = false;
            able.active = true;
        } else {
            disable.active = true;
            able.active = false;
        }
    },

    checkCodeNode() {
        let codeinfoNode = this.codeNode.getChildByName('infoNode');
        let erweimaNode = codeinfoNode.getChildByName('erweima');
        let noLab = this.codeNode.getChildByName('noLab');
        if (!!this._paymenturl) {
            codeinfoNode.active = true;
            noLab.active = false;
            this.checkQR(erweimaNode);

            let nameNode = codeinfoNode.getChildByName('name');
            if (!!nameNode) {
                if (!!this._paymentname) {
                    nameNode.getComponent(cc.Label).string = '实名: '+this._paymentname;
                } else {
                    nameNode.getComponent(cc.Label).string = '实名: 未填写';
                }
            }
        } else {
            codeinfoNode.active = false;
            noLab.active = true;
        }
    },

    checkQR (qrNode) {
        let url = this._paymenturl;
        let isAli = (url.indexOf('HTTPS://QR.ALIPAY.COM/') > -1 || url.indexOf('https://qr.alipay.com/') > -1);
        this.scheduleOnce(function () {
            let qrcode = new QRCode(-1, QRErrorCorrectLevel.M);
            qrcode.addData(url);
            qrcode.make();
            let ctx = qrNode.getComponent(cc.Graphics);
            ctx.clear();
            ctx.fillColor = isAli ? cc.hexToColor('#00A0E9'): cc.hexToColor('#3CAF36');
            // compute tileW/tileH based on node width and height
            let tileW = qrNode.width / qrcode.getModuleCount();
            let tileH = qrNode.height / qrcode.getModuleCount();

            // draw in the Graphics
            for (let row = 0; row < qrcode.getModuleCount(); row++) {
                for (let col = 0; col < qrcode.getModuleCount(); col++) {
                    if (qrcode.isDark(row, col)) {
                        let w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
                        let h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
                        ctx.rect(Math.round(col * tileW), Math.round(row * tileH), w, h);
                        ctx.fill();
                    }
                }
            }
        }, 0.3);
    },

    // update (dt) {},

    onGiveScorePressed() {
        cc.vv.audioMgr.playButtonSound();
        let self = this;
        let gift = this.node.getChildByName('gift');
        if (gift) {
            gift.active = true;
            gift.getComponent('Gift').openGift(self._uid);
        } else {
            cc.utils.loadPrefabNode('tips_club/gift', function (gift) {
                self.node.addChild(gift, 1, 'gift');
                gift.getComponent('Gift').openGift(self._uid);
            });
        }
    },

    onAddScorePressed() {
        cc.vv.audioMgr.playButtonSound();
        let changeScore = this.node.getChildByName('changeScore');
        if (changeScore) {
            changeScore.getComponent('ChangeScore').openChangeScore(this._uid, 0);
        } else {
            cc.utils.loadPrefabNode('tips_club/changeScore', (changeScore) => {
                this.node.addChild(changeScore, 1, 'changeScore');
                changeScore.getComponent('ChangeScore').openChangeScore(this._uid, 0);
            });
        }
    },

    onReduceScorePressed() {
        cc.vv.audioMgr.playButtonSound();
        let changeScore = this.node.getChildByName('changeScore');
        if (changeScore) {
            changeScore.getComponent('ChangeScore').openChangeScore(this._uid, 1);
        } else {
            cc.utils.loadPrefabNode('tips_club/changeScore', (changeScore) => {
                this.node.addChild(changeScore, 1, 'changeScore');
                changeScore.getComponent('ChangeScore').openChangeScore(this._uid, 1);
            });
        }
    },

    onDisableAccountPressed() {
        cc.vv.audioMgr.playButtonSound();
        let self = this;
        cc.utils.openTips('确定封禁此账号?', function () {
            cc.connect.sealUpAccount(self._cid, self._uid, (msg) => {
                self._sealUp = !self._sealUp;
                self.checkSealUp();
            });
        }, function () {

        });
    },

    onBigQrcodePressed() {
        cc.vv.audioMgr.playButtonSound();
        let self = this;
        let bigQrcode = this.node.getChildByName('bigQrcode');
        if (bigQrcode) {
            bigQrcode.getComponent('BigQRCode').openBigQRCode(this._uid, this._paymenturl, this._paymentname, (url, name) => {
                self._paymenturl = url;
                self._paymentname = name;
                self.checkCodeNode();
            });
        } else {
            cc.utils.loadPrefabNode('tips_club/bigQrcode', (bigQrcode) => {
                this.node.addChild(bigQrcode, 1, 'bigQrcode');
                bigQrcode.getComponent('BigQRCode').openBigQRCode(this._uid, this._paymenturl, this._paymentname, (url, name) => {
                    self._paymenturl = url;
                    self._paymentname = name;
                    self.checkCodeNode();
                });
            });
        }
    },

    onSetRadioPressed() {
        cc.vv.audioMgr.playButtonSound();
        if (!!cc.dm.user.permission.dealer) {} else {
            cc.utils.openWeakTips('你没有权限');
            return;
        }

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
            this._profit_ratio = ratio;
            this.checkRatioLab(ratio);
        });
    },

    checkRatioLab(ratio) {
        let profit_ratio = ratio*100;
        let ratiostr = '';
        if (profit_ratio > 0) {
            this.dealerTips.active = true;
            ratiostr = profit_ratio+'%';
        } else {
            this.dealerTips.active = false;
            ratiostr = '无';
        }

        this.ratioLab.getComponent(cc.Label).string = ratiostr;
        this.ratioLab.getChildByName('Label').getComponent(cc.Label).string = ratiostr;
    },

    resetRatioTips() {
        this.ratioTips.active = false;
        this.ratioMore.getComponent(cc.Sprite).spriteFrame = this.ratioFrames[0];
    },

    onListTogglePressed(event, data) {
        if (event) {
            cc.vv.audioMgr.playButtonSound();
        }

        this._idx = data;
        this._pageIdx = 1;
        this.bottomNode.getComponent('Bottom').resetBottom();
        this.getListData();
    },

    getListData() {
        this.rLoadingLab.active = false;
        this.rLoadingNode.active = true;
        this.rLoadingNode.runAction(cc.repeatForever(cc.rotateBy(0.8, 360)));
        this.listNodes.forEach((el, idx) => {
            el.active = (idx == this._idx);
        });
        let content = this.listNodes[this._idx].getChildByName('content');
        content.children.forEach((el) => { el.active = false; });
        if (this._idx == 0) {
            cc.connect.clubMemberRechargeHistory(this._uid, this._cid, this._pageIdx, (list) => {
                this.checkLoadingData(list);
                this.checkRechargerList(list);
            }, (errmsg) => {
                this.checkLoadingErr(errmsg);
            });
        } else if (this._idx == 1) {
            cc.connect.clubMemberWithdrawHistory(this._uid, this._cid, this._pageIdx, (list) => {
                this.checkLoadingData(list);
                this.checkWithdrawList(list);
            }, (errmsg) => {
                this.checkLoadingErr(errmsg);
            });
        } else if (this._idx == 2) {
            cc.connect.clubMemberGiveScoreHistory(this._uid, this._cid, this._pageIdx, (list) => {
                this.checkLoadingData(list);
                this.checkGiveScoreList(list);
            }, (errmsg) => {
                this.checkLoadingErr(errmsg);
            });
        }
    },

    checkLoadingData(list) {
        this.rLoadingNode.stopAllActions();
        this.rLoadingNode.active = false;
        if (!list || list.length == 0) {
            this.rLoadingLab.active = true;
            this.rLoadingLab.getComponent(cc.Label).string = '暂无数据';
        }
    },

    checkLoadingErr(errmsg) {
        this.rLoadingNode.stopAllActions();
        this.rLoadingNode.active = false;
        this.rLoadingLab.active = true;
        this.rLoadingLab.getComponent(cc.Label).string = errmsg;
    },

    checkRechargerList(list) {
        if (!list || list.length == 0) {
            return;
        }
        this.checkFirstObj(list);
        let content = this.listNodes[this._idx].getChildByName('content');
        for (let i = 0; i < list.length; i++) {
            let obj = list[i];
            let item = content.getChildByName('item'+i);
            item.active = true;

            let numstr = cc.utils.getScoreStr(obj.buy_number);
            let numLab = item.getChildByName('num');
            numLab.getComponent(cc.Label).string = numstr;
            numLab.getChildByName('Label').getComponent(cc.Label).string = numstr;

            let status = obj.pay_status;
            let statusLab = item.getChildByName('status');
            statusLab.getComponent(cc.Label).string = status == 0 ? '待处理' : '已完成';

            let timestr = obj.create_time.replace('T', ' ');
            timestr = timestr.substr(0, 16);
            let timeLab = item.getChildByName('time');
            timeLab.getComponent(cc.Label).string = '时间: '+timestr;

            let order_sn = obj.order_sn;
            let idLab = item.getChildByName('ID');
            idLab.getComponent(cc.Label).string = '单号: '+order_sn;

            let pay_channel = obj.pay_channel;
            let typeLab = item.getChildByName('type');
            typeLab.getComponent(cc.Label).string = this._pay_channels[pay_channel];
        }
    },

    checkWithdrawList(list) {
        if (!list || list.length == 0) {
            return;
        }

        this.checkFirstObj(list);
        let content = this.listNodes[this._idx].getChildByName('content');
        for (let i = 0; i < list.length; i++) {
            let obj = list[i];
            let item = content.getChildByName('item'+i);
            item.active = true;

            let numstr = cc.utils.getScoreStr(obj.score);
            let num = item.getChildByName('num');
            num.getComponent(cc.Label).string = numstr;
            num.getChildByName('Label').getComponent(cc.Label).string = numstr;

            let poundage = item.getChildByName('poundage');
            poundage.getComponent(cc.Label).string = cc.utils.getScoreStr(obj.poundage);

            let status = item.getChildByName('status');
            let statusStrs = ['待处理', '已同意', '已拒绝'];
            status.getComponent(cc.Label).string = statusStrs[obj.status];

            let time = item.getChildByName('time');
            let timestr = obj.create_time.replace('T', ' ');
            timestr = timestr.substr(0, 16);
            time.getComponent(cc.Label).string = timestr;
        }
    },

    checkGiveScoreList(list) {
        if (!list || list.length == 0) {
            return;
        }

        this.checkFirstObj(list);
        let content = this.listNodes[this._idx].getChildByName('content');
        for (let i = 0; i < list.length; i++) {
            let obj = list[i];
            let item = content.getChildByName('item'+i);
            item.active = true;

            let uidLab = item.getChildByName('uid');
            let give_uid = obj.give_uid;;
            let accept_uid = obj.accept_uid;
            let isReduce = false;
            if (give_uid == this._uid) {
                uidLab.getComponent(cc.Label).string = accept_uid;
                isReduce = true;
            } else {
                uidLab.getComponent(cc.Label).string = give_uid;
            }
            
            let numstr = (isReduce ? '-' : '+')+cc.utils.getScoreStr(obj.score);
            let num = item.getChildByName('num');
            num.getComponent(cc.Label).string = numstr;
            num.getChildByName('Label').getComponent(cc.Label).string = numstr;
            let time = item.getChildByName('time');
            let timestr = obj.create_time.replace('T', ' ');
            timestr = timestr.substr(0, 16);
            time.getComponent(cc.Label).string = timestr;
        }
    },

    checkFirstObj(list) {
        let firstobj = list[0];
        this.checkBottom(firstobj.totalPage);
    },

    checkBottom(totalPage) {
        this.bottomNode.getComponent('Bottom').checkBottom(totalPage, (pageIdx) => {
            this._pageIdx = pageIdx;
            this.getListData();
        }, 3);
    },

    onClosePressed() {
        cc.vv.audioMgr.playButtonSound();
        this.resetRatioTips();
        this.node.active = false;
    },
});
