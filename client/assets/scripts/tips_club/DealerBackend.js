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
        leftToggles: {
            default: null,
            type: cc.Node
        },

        contentNodes: {
            default: [],
            type: cc.Node
        },

        idLab: {
            default: null,
            type: cc.Node
        },

        pidLab: {
            default: null,
            type: cc.Node
        },

        headNode: {
            default: null,
            type: cc.Node
        },

        nameLab: {
            default: null,
            type: cc.Node
        },

        ratioLab: {
            default: null,
            type: cc.Node
        },

        qrTips: {
            default: null,
            type: cc.Node
        },

        wxTips: {
            default: null,
            type: cc.Node
        },

        mainScoreLab: {
            default: null,
            type: cc.Node
        },

        mainCanLab: {
            default: null,
            type: cc.Node
        },

        mainTodayLab: {
            default: null,
            type: cc.Node
        },

        mainTotalLab: {
            default: null,
            type: cc.Node
        },

        mainFLab: {
            default: null,
            type: cc.Node
        },

        mainSLab: {
            default: null,
            type: cc.Node
        },

        mainPlayersLab: {
            default: null,
            type: cc.Node
        },

        scoreNodes: {
            default: [],
            type: cc.Node
        },

        scoreEditBox1: {
            default: null,
            type: cc.EditBox
        },

        scoreEditBox2: {
            default: null,
            type: cc.EditBox
        },

        bottomNode: {
            default: null,
            type: cc.Node,
        },
        
        loadingNode: {
            default: null,
            type: cc.Node
        },

        nodataLab: {
            default: null,
            type: cc.Label
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);

        this._txTips = ['微信转存', '转游戏币'];
        this._leftIdx = 0;
        this._teamIdx = 0;
        this._scoreType = 1;
        this._minScore = 100000;
        this._minStr = '10元';
        this.contentNodes.forEach((el, idx) => {
            el.active = (this._leftIdx == idx);
        });

        this.scoreNodes.forEach((el, idx) => {
            el.active = (idx == this._scoreType);
        });
    },

    start () {

    },

    // update (dt) {},

    openDealerBackend() {
        this.node.active = true;

        this.idLab.getComponent(cc.Label).string = cc.dm.user.uid;
        this.idLab.getChildByName('Label').getComponent(cc.Label).string = cc.dm.user.uid;

        this.pidLab.getComponent(cc.Label).string = cc.dm.user.pid;
        this.pidLab.getChildByName('Label').getComponent(cc.Label).string = cc.dm.user.pid;
        
        this.headNode.getComponent('HeadNode').updateData();
        this.nameLab.getComponent(cc.Label).string = cc.dm.user.shortname;

        this.qrTips.active = !!cc.dm.user.paymentUrl;

        if (cc.dm.user.weChat && (!!cc.dm.user.weChat.headimg || !!cc.dm.user.weChat.realname || !!cc.dm.user.weChat.nickname)) {
            this.wxTips.getComponent(cc.Label).string = '已绑定';
            this.wxTips.getChildByName('Label').getComponent(cc.Label).string = '已绑定';
        } else {
            this.wxTips.getComponent(cc.Label).string = '未绑定';
            this.wxTips.getChildByName('Label').getComponent(cc.Label).string = '未绑定';
        }

        if (!!this._ratios) {
            this.getMyInfo();
        } else {
            cc.connect.ratios((msg) => {
                this._ratios = (typeof msg == 'string') ? JSON.parse(msg) : msg;
                this.getMyInfo();
            });
        }

        this._pageIdx = 1;
        if (this._leftIdx == 2) {
            this.getTeamData();
        }
    },

    getMyInfo() {
        cc.connect.myInfo((msg) => {
            this.checkInfo(msg);
        });
    },

    getProfit_ratioStr(profit_ratio) {
        let str = '';
        if (profit_ratio == 0.3) {
            str = '%30';//'三级代理';
        } else if (profit_ratio == 0.33) {
            str = '33%';//'二级代理';
        } else if (profit_ratio == 0.36) {
            str = '36%';//'一级代理';
        } else if (profit_ratio == 0.4) {
            str = '40%';//'总代理';
        } else if (profit_ratio == 0.6) {
            str = '60%';//'合伙人';
        } else if (profit_ratio == 0.8) {
            str = '80%';//'BOSS';
        }

        return str;
    },

    checkInfo(msg) {
        let profit_ratio = msg.profit_ratio;
        let ratioStr = this.getProfit_ratioStr(profit_ratio);//'返佣比例: '+Math.floor(profit_ratio*100)+'%';
        this.ratioLab.getComponent(cc.Label).string = ratioStr;
        this.ratioLab.getChildByName('Label').getComponent(cc.Label).string = ratioStr;
        this._profit = msg.profit;
        this._today_profit = msg.today_profit;
        this.checkScoreLabs();
        let todaystr = cc.utils.getScoreStr(this._today_profit);//(this._today_profit/10000).toFixed(2);
        this.mainTodayLab.getComponent(cc.Label).string = todaystr;

        let subordinateCount = (msg.subordinateCount || 0);
        let subordinateTwoCount = (msg.subordinateTwoCount || 0);
        let playerCount = (msg.playerCount || 0);
        this.mainTotalLab.getComponent(cc.Label).string = subordinateCount+subordinateTwoCount+playerCount;
        this.mainFLab.getComponent(cc.Label).string = subordinateCount;
        this.mainSLab.getComponent(cc.Label).string = subordinateTwoCount;
        this.mainPlayersLab.getComponent(cc.Label).string = playerCount;
        let teamNode = this.node.getChildByName('teamNode');
        let topToggles = teamNode.getChildByName('topToggles');
        let counts = [msg.subordinateCount, msg.subordinateTwoCount, msg.playerCount];
        for (let i = 0; i < counts.length; i++) {
            let c = counts[i];
            let item = topToggles.getChildByName('item'+i);
            let numLab = item.getChildByName('numLab');
            numLab.getComponent(cc.Label).string = c;
            numLab.getChildByName('Label').getComponent(cc.Label).string = c;
        }
        let scoreNode = this.node.getChildByName('scoreNode');
        let content = scoreNode.getChildByName('content');
        let leftNode = content.getChildByName('leftNode');
        let todayLab = leftNode.getChildByName('todayLab');
        todayLab.getComponent(cc.Label).string = '不可转积分: '+todaystr;
        todayLab.getChildByName('Label').getComponent(cc.Label).string = '不可转积分: '+todaystr;

        let wechatNode = content.getChildByName('wechatNode');
        let noTips = wechatNode.getChildByName('noTips');
        let infoNode = wechatNode.getChildByName('infoNode');

        if (cc.dm.user.weChat && (!!cc.dm.user.weChat.headimg || !!cc.dm.user.weChat.realname || !!cc.dm.user.weChat.nickname)) {
            noTips.active = false;
            infoNode.active = true;

            let headNode = infoNode.getChildByName('headNode');
            headNode.getComponent('HeadNode').updateData(cc.dm.user.weChat.headimg);
            let nicknameLab = infoNode.getChildByName('nicknameLab');
            nicknameLab.getComponent(cc.Label).string = cc.dm.user.weChat.nickname;
            nicknameLab.getChildByName('Label').getComponent(cc.Label).string = cc.dm.user.weChat.nickname;
            let realnameLab = infoNode.getChildByName('realnameLab');
            realnameLab.getComponent(cc.Label).string = cc.dm.user.weChat.realname;
            realnameLab.getChildByName('Label').getComponent(cc.Label).string = cc.dm.user.weChat.realname;
        } else {
            noTips.active = true;
            infoNode.active = false;
        }
    },

    checkScoreLabs() {
        let mainScoreStr = cc.utils.getScoreStr(this._profit);
        mainScoreStr = mainScoreStr.replace('万', 'B');
        this.mainScoreLab.getComponent(cc.Label).string = mainScoreStr;//(this._profit/10000).toFixed(2);
        let canScore = this._profit-this._today_profit;
        let canscorestr = cc.utils.getScoreStr(canScore);;//(canScore/10000).toFixed(2);
        this.mainCanLab.getComponent(cc.Label).string = canscorestr;

        let scoreNode = this.node.getChildByName('scoreNode');
        let content = scoreNode.getChildByName('content');
        let leftNode = content.getChildByName('leftNode');
        let scoreLab = leftNode.getChildByName('scoreLab');
        scoreLab.getComponent(cc.Label).string = canscorestr;
        scoreLab.getChildByName('Label').getComponent(cc.Label).string = canscorestr;
    },

    onMainScoreNodePressed() {
        cc.vv.audioMgr.playButtonSound();
        this._leftIdx = 1;
        this.leftToggles.children.forEach((el, idx) => {
            el.getComponent(cc.Toggle).isChecked = (idx == this._leftIdx);
        });
        this.nextCheckData();
    },

    onMainTeamNodePressed() {
        cc.vv.audioMgr.playButtonSound();
        this._leftIdx = 2;
        this.leftToggles.children.forEach((el, idx) => {
            el.getComponent(cc.Toggle).isChecked = (idx == this._leftIdx);
        });
        this.nextCheckData();
    },

    onLeftTogglesPressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        this._leftIdx = data;
        this.nextCheckData();
    },

    nextCheckData() {
        this.contentNodes.forEach((el, idx) => {
            el.active = (idx == this._leftIdx);
        });

        if (this._leftIdx == 2) {
            this.bottomNode.getComponent('Bottom').resetBottom();
            this.getTeamData();
        } else {
            this.getMyInfo();
        }
    },

    onQRBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        cc.utils.openUpPayQRCode(cc.dm.user.paymentUrl, cc.dm.user.paymentName, () => {
            this.qrTips.active = true;
        });
    },

    onBindWechatPressed () {
        cc.vv.audioMgr.playButtonSound();
        cc.utils.openWeakTips('敬请期待');
        // cc.connect.bindWithdrawWechat((url) => {
        //     this.nextBindWX(url);
        // });
    },
    
    /***
     * 修改绑定微信第二步
     */
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

    onScoreNodeTopTogglePressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        this._scoreType = parseInt(data);
        let scoreNode = this.contentNodes[this._leftIdx];
        let content = scoreNode.getChildByName('content');
        let typeLab = content.getChildByName('typeLab');
        typeLab.getComponent(cc.Label).string = this._txTips[this._scoreType];

        this.scoreNodes.forEach((el, idx) => {
            el.active = (idx == this._scoreType);
        });
    },

    onTeamNodeTopTogglePressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        this._teamIdx = parseInt(data);
        this.bottomNode.getComponent('Bottom').resetBottom();
        this.getTeamData();
    },

    getTeamData() {
        let teamNode = this.contentNodes[this._leftIdx];
        let content = teamNode.getChildByName('content');

        content.children.forEach((el) => { 
            el.active = false; 
        });
        //回到顶部
        this.loadingNode.active = true;
        this.loadingNode.runAction(cc.repeatForever(cc.rotateBy(0.8, 360)));
        this.nodataLab.node.active = false;
        cc.connect.subordinateList(this._teamIdx, this._pageIdx, (msg) => {
            this.loadingNode.stopAllActions();
            this.loadingNode.active = false;
            if (!msg || msg.length === 0) {
                this.nodataTips();
                return;
            }

            let obj = msg[0];
            let topToggles = teamNode.getChildByName('topToggles');
            let item = topToggles.getChildByName('item'+this._teamIdx);
            let numLab = item.getChildByName('numLab');
            numLab.getComponent(cc.Label).string = obj.count;
            numLab.getChildByName('Label').getComponent(cc.Label).string = obj.count;
            this.checkBottom(obj.totalPage);
            this._teamList = msg;
            this.checkTeamList();
        }, (errmsg) => {
            this.loadingNode.stopAllActions();
            this.loadingNode.active = false;
            this.nodataLab.node.active = true;
            this.nodataLab.string = errmsg;
        });
    },

    nodataTips () {
        this.nodataLab.node.active = true;
        this.nodataLab.string = '没有数据';
    },

    checkTeamList() {
        let teamNode = this.node.getChildByName('teamNode');
        let content = teamNode.getChildByName('content');
        for (let i = 0; i < this._teamList.length; i++) {
            let obj = this._teamList[i];
            let item = content.getChildByName('item'+i);
            item.active = true;

            let headNode = item.getChildByName('headNode');
            headNode.getComponent('HeadNode').updateData(obj.headimg);
            let nameLab = item.getChildByName('name');
            nameLab.getComponent(cc.Label).string = cc.utils.fromBase64(obj.name, 6);
            let idLab = item.getChildByName('ID');
            idLab.getComponent(cc.Label).string = 'ID: '+obj.uid;
            let inningNode = item.getChildByName('inningNode');
            let profitNode = item.getChildByName('profitNode');
            if (this._teamIdx < 2) {
                inningNode.active = false;
                profitNode.active = true;
                let profitLab = profitNode.getChildByName('profitLab');
                let profitstr = cc.utils.getScoreStr(obj.today_profit);
                profitLab.getComponent(cc.Label).string = profitstr;
                profitLab.getChildByName('Label').getComponent(cc.Label).string = profitstr;
            } else {
                inningNode.active = true;
                profitNode.active = false;
                let inningLab = inningNode.getChildByName('inningLab');
                let inningstr = obj.inning+'局';
                inningLab.getComponent(cc.Label).string = inningstr;
                inningLab.getChildByName('Label').getComponent(cc.Label).string = inningstr;
            }
            
            let timeLab = item.getChildByName('time');
            let timsstr = obj.create_time;
            timsstr = timsstr.replace('T', ' ');
            timsstr = timsstr.substr(0, 16);
            timeLab.getComponent(cc.Label).string = timsstr;
        }
    },

    checkBottom(totalPage) {
        this.bottomNode.getComponent('Bottom').checkBottom(totalPage, (pageIdx) => {
            this._pageIdx = pageIdx;
            this.getTeamData();
        });
    },

    onProfitDetailBtnPressed() {
        cc.vv.audioMgr.playButtonSound();

    },

    onTxDetailBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        let dealerWithdrawList = this.node.getChildByName('dealerWithdrawList');
        if (dealerWithdrawList) {
            dealerWithdrawList.getComponent('DealerWithdrawList').openDealerWithdrawList();
        } else {
            cc.utils.loadPrefabNode('tips_club/dealerWithdrawList', function (dealerWithdrawList) {
                this.node.addChild(dealerWithdrawList, 1, 'dealerWithdrawList');
                dealerWithdrawList.getComponent('DealerWithdrawList').openDealerWithdrawList();
            }.bind(this));
        }
    },

    onAllBtn1Pressed() {
        cc.vv.audioMgr.playButtonSound();
        let canScore = this._profit-this._today_profit;
        this.scoreEditBox1.string = Math.floor(0.98*canScore/10000);
    },

    onAllBtn2Pressed() {
        cc.vv.audioMgr.playButtonSound();
        let canScore = this._profit-this._today_profit;
        this.scoreEditBox2.string = Math.floor(canScore/10000);
    },

    onOkBtn1Pressed() {
        cc.vv.audioMgr.playButtonSound();
        cc.utils.openTips('敬请期待\n请转游戏币');
        // let score = this.scoreEditBox1.string;
        // if (!!score) {
        //     score = parseInt(score)*10000;
        //     if (score < this._minScore) {
        //         cc.utils.openWeakTips('积分不能小于'+this._minStr);
        //         return;
        //     }

        //     let canScore = this._profit-this._today_profit;
        //     if (score > (0.98*canScore)) {
        //         cc.utils.openWeakTips('转出积分和手续费不能超过可转出积分');
        //         return;
        //     }

        //     this.withdrawScore(score);
        // } else {
        //     cc.utils.openWeakTips('请输入积分');
        // }
    },

    withdrawScore(score) {
        cc.connect.dealerWithdrawScore(score, (msg) => {
            this._profit = msg.score;
            this.checkScoreLabs();
        });
    },

    onOkBtn2Pressed() {
        cc.vv.audioMgr.playButtonSound();
        let score = this.scoreEditBox2.string;
        if (!!score) {
            score = parseInt(score)*10000;
            if (score < this._minScore) {
                cc.utils.openWeakTips('积分不能小于'+this._minStr);
                return;
            }

            let canScore = this._profit-this._today_profit;
            if (score > canScore) {
                cc.utils.openWeakTips('积分不能超过可转出积分');
                return;
            }

            this.dealerWithdrawScoreToGame(score);
        } else {
            cc.utils.openWeakTips('请输入积分');
        }
    },

    dealerWithdrawScoreToGame(score) {
        cc.connect.dealerWithdrawScoreToGame(score, (msg) => {
            this._profit = msg.profit;
            cc.dm.user.score = msg.score;
            this.checkScoreLabs();
            if (cc.sceneName == 'club' && !!cc.sceneSrc) {
                cc.sceneSrc.scoreChanged();
            }
        });
    },
    
    /***
     * 修改绑定微信第二步
     */
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

    onCloseBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

});
