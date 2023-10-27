// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

//反主   三级牌抢庄   跳过反主
cc.Class({
    extends: cc.Component,

    properties: {
        pokerPrefab: {
            default: null,
            type: cc.Prefab
        },

        sspokerPrefab: {
            default: null,
            type: cc.Prefab
        },
    },

    onLoad () {
        cc.utils.setNodeWinSize(this.node);

        this.btnGiveUp = this.node.getChildByName('btnGiveUp');

        let bgNode = this.node.getChildByName('bg');
        let itemsNode = bgNode.getChildByName('items');
        let item0 = itemsNode.getChildByName('item0');
        for (let i = 0; i < 2; i++) {
            let poker = cc.instantiate(this.pokerPrefab);
            poker.scale = 0.5;
            item0.addChild(poker, i, 'poker'+i);
        }

        for (let i = 1; i < 5; i++) {
            let item = cc.instantiate(item0);
            itemsNode.addChild(item, i, 'item'+i);
        }
        
        this.itemsNode = itemsNode;
        let tempZhu = bgNode.getChildByName('tempZhu');
        for (let i = 0; i < 2; i++) {
            let poker = cc.instantiate(this.sspokerPrefab);
            tempZhu.addChild(poker, i, 'poker'+i);
        }
        this.tempZhu = tempZhu;
        this.clockNode = bgNode.getChildByName('clock');
        this.clockFrame = this.clockNode.getComponent(cc.Sprite).spriteFrame;
        this.titleLab = bgNode.getChildByName('titleLab');
        this.titleStr = 'UMPFS';
        this.dians = ['...', '..', '.'];
    },

    start () {

    },


    reset() {
        this.tempZhu.children.forEach(el=> {
            el.active = false;
        });

        this.itemsNode.children.forEach(el=> {
            el.active = false;
        });

        this.btnGiveUp.active = false;
        this.stopClock();
        this.unschedule(this.updateLab);
        this.node.active = false;
    },

    openFanzhuNode(tempZhu, fanzhuData, gameStatus, sendCb, giveUpCb) {
        this.node.active = true;
        this._sendCb = sendCb;
        this._giveUpCb = giveUpCb;
        this.upFanzhuData(tempZhu, fanzhuData, gameStatus);
        this.showClock(30);
    },

    upFanzhuData(tempZhu, fanzhuData, gameStatus) {
        this.fanzhuData = fanzhuData;

        this.tempZhu.children.forEach((el, idx) => {
            if (idx < tempZhu.length) {
                el.active = true;
                el.getComponent('poker').show(tempZhu[i]);
            } else {
                el.active = false;
            }
        });

        this.itemsNode.children.forEach((el, idx) => {
            if (idx < fanzhuData.length) {
                el.active = true;
                let vs = fanzhuData[idx];
                for (let i = 0; i < vs.length; i++) {
                    let poker = el.getChildByName('poker'+i);
                    if (!!poker) {
                        poker.getComponent('poker').show(vs[i]);
                    }
                }

                el.getComponent(cc.Button).clickEvents[0].customEventData = idx.toString();
            } else {
                el.active = false;
            }
        });

        this.btnGiveUp.active = (gameStatus == cc.game_enum.status.WAITFANZHU);
    },

    //点击关闭
    onClickClose(event, data){
        this.reset();
    },

    //选择反主类型
    onClickFanzhuType(event, data) {
        let idx = parseInt(data);
        if (idx < this.fanzhuData.length) {
            if (!!this._sendCb) {
                this._sendCb(this.fanzhuData[idx]);
            }
        }

        this.reset();
    },

    //放弃
    onClickgiveup(event,data) {
        if (!!this._giveUpCb) {
            this._giveUpCb();
        }
    },

    //关闭
    closeFanzhu(){
        this.reset();
    },

    //倒计时
    showClock(time) {
        this._clockTime = 10;
        if(typeof time == 'number') {
            this._clockTime = time;
        }
        this.stopClock();
        this.clockNode.active = true;
        this.schedule(this.clockCountDown, 1);
        this.clockCountDown();
    },

    stopClock() {
        this.unschedule(this.clockCountDown);
        this.clockNode.getComponent(cc.Animation).stop();
        this.clockNode.getComponent(cc.Sprite).spriteFrame = this.clockFrame;
        this.clockNode.active = false;
    },

    clockCountDown() {
        this.updateLab();
        if (this._clockTime < 0) {
            this.unschedule(this.clockCountDown);
            return;
        }

        if (this._clockTime == 3) {
            //播放时间不够声音
            this.clockNode.getComponent(cc.Animation).play('naozhong');
            cc.vv.audioMgr.playSFX("public/timeup_alarm.mp3");
        }

        this.clockNode.getChildByName('Label').getComponent(cc.Label).string = this._clockTime;
        this._clockTime -= 1;
    },


    updateLab() {
        this.titleLab.getComponent(cc.Label).string = this.titleStr+this.dians[this._clockTime%3];
    },

});
