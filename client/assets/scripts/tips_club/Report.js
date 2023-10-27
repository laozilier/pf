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

        onlineLab: {
            default: null,
            type: cc.Node
        },

        tableLab: {
            default: null,
            type: cc.Node
        },

        verifyLab: {
            default: null,
            type: cc.Node
        },

        todayInningLab: {
            default: null,
            type: cc.Node
        },

        todayInningLab: {
            default: null,
            type: cc.Node
        },

        totalInningLab: {
            default: null,
            type: cc.Node
        },

        payerScoreLab: {
            default: null,
            type: cc.Node
        },

        dealerScoreLab: {
            default: null,
            type: cc.Node
        },

        taxLab: {
            default: null,
            type: cc.Node
        },

        profitLab: {
            default: null,
            type: cc.Node
        },

        lastProfitLab: {
            default: null,
            type: cc.Node
        },

        lastProfitLab1: {
            default: null,
            type: cc.Node
        },

        lastProfitLab2: {
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
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    start () {

    },

    openReport() {
        this.node.active = true;
        this.updateData();
    },

    updateData() {
        this.infoNode.active = false;
        this.loadingNode.active = true;
        this.loadingNode.runAction(cc.repeatForever(cc.rotateBy(0.8, 360)));
        this.loadingLab.active = false;
        cc.connect.statistic((res) => {
            this.loadingNode.stopAllActions();
            this.loadingNode.active = false;
            this.infoNode.active = true;
            let userCount = res.userCount;
            this.onlineLab.getComponent(cc.Label).string = userCount;
            this.onlineLab.getChildByName('Label').getComponent(cc.Label).string = userCount;
            let roomCount = res.roomCount;
            this.tableLab.getComponent(cc.Label).string = roomCount;
            this.tableLab.getChildByName('Label').getComponent(cc.Label).string = roomCount;
            let msg = res.statistics;
            let verify = msg.totalRecharge-(msg.payerScore+msg.totalWithdrawal+msg.totalTax+msg.totalPoundage);
            let verifyStr = cc.utils.getScoreStr(verify);
            this.verifyLab.getComponent(cc.Label).string = verifyStr;
            this.verifyLab.getChildByName('Label').getComponent(cc.Label).string = verifyStr;

            let todayInningStr = (msg.inning-msg.lastInning).toString();
            this.todayInningLab.getComponent(cc.Label).string = todayInningStr;
            this.todayInningLab.getChildByName('Label').getComponent(cc.Label).string = todayInningStr;

            let totalInningStr = msg.inning.toString();
            this.totalInningLab.getComponent(cc.Label).string = totalInningStr;
            this.totalInningLab.getChildByName('Label').getComponent(cc.Label).string = totalInningStr;

            let payerScoreStr = (msg.payerScore/10000).toFixed(2);
            this.payerScoreLab.getComponent(cc.Label).string = payerScoreStr;
            this.payerScoreLab.getChildByName('Label').getComponent(cc.Label).string = payerScoreStr;

            let dealerScoreStr = (msg.dealerScore/10000).toFixed(2);
            this.dealerScoreLab.getComponent(cc.Label).string = dealerScoreStr;
            this.dealerScoreLab.getChildByName('Label').getComponent(cc.Label).string = dealerScoreStr;

            let taxStr = ((msg.tax-msg.lastTax)/10000).toFixed(2);
            this.taxLab.getComponent(cc.Label).string = taxStr;
            this.taxLab.getChildByName('Label').getComponent(cc.Label).string = taxStr;

            let profitStr = ((msg.profit-msg.lastProfit)/10000).toFixed(2);
            this.profitLab.getComponent(cc.Label).string = profitStr;
            this.profitLab.getChildByName('Label').getComponent(cc.Label).string = profitStr;

            // let profitStr = ((msg.profit-msg.lastProfit)/10000).toFixed(2);
            // this.profitLab.getComponent(cc.Label).string = profitStr;
            // this.profitLab.getChildByName('Label').getComponent(cc.Label).string = profitStr;
        }, (errmsg) => {
            this.loadingNode.stopAllActions();
            this.loadingNode.active = false;
            this.loadingLab.active = true;
            this.loadingLab.getComponent(cc.Label).string = errmsg;
        });
    },

    // update (dt) {},

    onHistoryPressed() {
        cc.vv.audioMgr.playButtonSound();
        let reportHistory = this.node.getChildByName('reportHistory');
        if (reportHistory) {
            reportHistory.getComponent('ReportHistory').openReportHistory();
        } else {
            cc.utils.loadPrefabNode('tips_club/reportHistory', function (reportHistory) {
                this.node.addChild(reportHistory, 1, 'reportHistory');
                reportHistory.getComponent('ReportHistory').openReportHistory();
            }.bind(this));
        }
    },

    onFreshBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        this.updateData();
    },

    onClosePressed() {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    }
});
