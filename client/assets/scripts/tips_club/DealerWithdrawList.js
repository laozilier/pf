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
        content: {
            default: null,
            type: cc.Node
        },

        statusFrames: {
            default: [],
            type: cc.SpriteFrame
        },

        loadingNode: {
            default: null,
            type: cc.Node,
            displayName: 'loading'
        },

        nodataLab: {
            default: null,
            type: cc.Label,
            displayName: '没有信息提示Lab'
        },

        bottomNode: {
            default: null,
            type: cc.Node,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
        this._colors = ['#FF9600', '#43BE00', '#17A5FF', '#17A5FF'];
        this._statusstrs = ['正在审核', '转出成功', '交易关闭', '已退回'];
        this._typestrs = ['转出至微信', '扣分', '转出至游戏中'];
    },

    start () {

    },

    openDealerWithdrawList() {
        this.node.active = true;
        this.bottomNode.getComponent('Bottom').resetBottom();
        this._pageIdx = 1;
        this.getData();
    },

    getData() {
        this.content.children.forEach((el) => { el.active = false; });
        this.loadingNode.active = true;
        this.nodataLab.node.active = false;
        this.loadingNode.runAction(cc.repeatForever(cc.rotateBy(0.8, 360)));
        cc.connect.withdrawHistory(this._pageIdx, (list) => {
            this.loadingNode.stopAllActions();
            this.loadingNode.active = false;
            if (!list || list.length == 0) {
                this.nodataLab.node.active = true;
                this.nodataLab.string = '暂无数据';
                return;
            }

            this._withdrawList = list;
            let obj = list[0];
            this.checkBottom(obj.totalPage);
            this.checkList();
        }, (errmsg) => {
            this.loadingNode.stopAllActions();
            this.loadingNode.active = false;

            this.nodataLab.node.active = true;
            this.nodataLab.string = errmsg;
        });
    },

    checkList() {
        if (!this._withdrawList || this._withdrawList.length == 0) {
            return;
        }

        for (let i = 0; i < this._withdrawList.length; i++) {
            let info = this._withdrawList[i];
            this.checkInfo(info, i);
        }
    },

    checkInfo(info, idx) {
        let item = this.content.getChildByName('item'+idx);
        if (!item) {
            return;
        }

        item.active = true;
        let leftNode = item.getChildByName('leftNode');
        let idLab = leftNode.getChildByName('idLab');
        let order_sn = info.order_sn;
        idLab.getChildByName('Label').getComponent(cc.Label).string = order_sn;
        let timeLab = leftNode.getChildByName('timeLab');
        let timestr = info.create_time;
        timestr = timestr.replace('T', ' ');
        timestr = timestr.substr(0, 16)
        timeLab.getChildByName('Label').getComponent(cc.Label).string = timestr;

        let remark = info.remark;
        let remarkLab = leftNode.getChildByName('remarkLab');
        if (!!remark) {
            remarkLab.active = true;
            remarkLab.getChildByName('Label').getComponent(cc.Label).string = remark;
        } else {
            remarkLab.active = false;
        }

        let typeLab = item.getChildByName('typeLab');
        typeLab.getComponent(cc.Label).string = this._typestrs[info.type];

        let poundageLab = item.getChildByName('poundageLab');
        let poundage = info.poundage;

        //poundageLab.getComponent(cc.Label).string = poundage > 0 ? '手续费: '+(poundage/10000).toFixed(2)+'元' : '无手续费';
        poundageLab.getComponent(cc.Label).string = poundage > 0 ? '手续币: '+cc.utils.getScoreStr(poundage) : '无手续币';
        
        let scorestr = cc.utils.getScoreStr(info.score);//'￥'+(info.score/10000).toFixed(2)+'元';
        let scoreLab = item.getChildByName('scoreLab');
        scoreLab.getComponent(cc.Label).string = scorestr;
        scoreLab.getChildByName('Label').getComponent(cc.Label).string = scorestr;

        let status = info.status;
        let statusLab = item.getChildByName('statusLab');
        statusLab.getComponent(cc.Label).string = this._statusstrs[status];
        statusLab.color = cc.hexToColor(this._colors[status]);

        let statusSpr = item.getChildByName('statusSpr');
        statusSpr.getComponent(cc.Sprite).spriteFrame = this.statusFrames[status];
    },

    // update (dt) {},

    checkBottom(totalPage) {
        this.bottomNode.getComponent('Bottom').checkBottom(totalPage, (pageIdx) => {
            this._pageIdx = pageIdx;
            this.getData();
        });
    },

    onCloseBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },
});
