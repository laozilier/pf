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
        item: {
            default: null,
            type: cc.Node
        },

        content: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.timeNodes = [];
        cc.utils.setNodeWinSize(this.node);
        let topNode = this.node.getChildByName('topNode');
        for (let i = 0; i < 7; i++) {
            let timeNode = topNode.getChildByName('top'+i);
            this.timeNodes.push(timeNode);
        }
        
        this.itemNodes = [];
        for (let i = 0; i < 7; i++) {
            let items = [];
            for (let j = 0; j < 9; j++) {
                if (i == 0 && j == 0) {
                    items.push(this.item);
                    continue;
                }
                let itemNode = cc.instantiate(this.item);
                this.content.addChild(itemNode, i*8+j);
                items.push(itemNode);
            }
            this.itemNodes.push(items);
        }
    },

    start () {

    },

    openReportHistory() {
        this.node.active = true;
        this.timeNodes.forEach(el => {
            el.active = false;
        });

        this.itemNodes.forEach(items => {
            items.forEach(el => {
                el.active = false;
            });
        });

        cc.connect.statisticHistory((list) => {
            for (let i = 0; i < list.length; i++) {
                let obj = list[i];
                let timeNode = this.timeNodes[i];
                timeNode.active = true;
                let timestr = obj.create_time.replace('T', ' ');
                timestr = timestr.substr(5, 5);
                let timeLab = timeNode.getChildByName('timeLab');
                timeLab.getComponent(cc.Label).string = timestr;
                timeLab.getChildByName('Label').getComponent(cc.Label).string = timestr;

                let items = this.itemNodes[i];
                let objLast = list[i+1];
                let datas = [];
                let tax = obj.tax || 0;  //抽水
                let recharge = obj.recharge || 0; //玩家充值
                let profitRecharge = obj.profitRecharge || 0;   //代理充值
                let dealerProfit = obj.dealerProfit || 0;       //代理返佣
                let poundageProfit = (obj.uwPoundage || 0)+(obj.dwPoundage || 0);    //转出利润
                let withdraw = obj.withdraw || 0;    //玩家下分
                //代理转出

                let dealerWithdraw = (obj.dealerProfit || 0)-(obj.dealerScore || 0)-(obj.dwPoundage || 0);
                let totalUsers = obj.totalUsers || 0;//新增用户
                let creatorProfit = obj.creatorProfit || 0;//群主收益
                if (!!objLast) {
                    tax-=(objLast.tax || 0);
                    recharge-=(objLast.recharge || 0);
                    profitRecharge-=(objLast.profitRecharge || 0);
                    dealerProfit-=(objLast.dealerProfit || 0);
                    //poundageProfit-=((objLast.uwPoundage || 0)+(objLast.dwPoundage || 0));
                    withdraw-=(objLast.withdraw || 0);
                    dealerWithdraw-=((objLast.dealerProfit || 0)-(objLast.dealerScore || 0)-(objLast.dwPoundage || 0));
                    totalUsers-=(objLast.totalUsers || 0);
                    creatorProfit-=(objLast.creatorProfit || 0);
                }


                datas = [
                    cc.utils.getScoreStr(tax),
                    cc.utils.getScoreStr(recharge),
                    ((tax-dealerProfit)/10000).toFixed(2)+'万',
                    cc.utils.getScoreStr(poundageProfit),
                    cc.utils.getScoreStr(dealerProfit),
                    cc.utils.getScoreStr(withdraw),
                    cc.utils.getScoreStr(dealerWithdraw),
                    totalUsers,
                    cc.utils.getScoreStr(creatorProfit),
                    0//obj.activeUsers,
                ];
                
                items.forEach((el, idx) => {
                    el.active = true;
                    let lab = el.getChildByName('lab');
                    lab.getComponent(cc.Label).string = datas[idx];
                    lab.getChildByName('Label').getComponent(cc.Label).string = datas[idx];
                });
            }
        });
    },

    // update (dt) {},

    onClosePressed() {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    }
});
