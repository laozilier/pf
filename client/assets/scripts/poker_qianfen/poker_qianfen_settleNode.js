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

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
        this.playersNode = this.node.getChildByName('players');
        this.anteLab = this.node.getChildByName('anteLab');
        this.playersLab = this.node.getChildByName('playersLab');
        this.ridLab = this.node.getChildByName('ridLab');
        this.inningLab = this.node.getChildByName('inningLab');
        this.timeLab = this.node.getChildByName('timeLab');
        this.cdLab = this.node.getChildByName('cdLab');
    },

    start () {

    },

    reset() {
        this.unscheduleAllCallbacks();
        this.playersNode.children.forEach(el => {
            el.active = false;
        });
        
        this.node.active = false;
    },

    showSettleNode(data, continueCb, backCb) {
        this.node.active = true;
        this._continueCb = continueCb;
        this._backCb = backCb;

        this.anteLab.getComponent(cc.Label).string = '底分：'+ cc.utils.getScoreStr(data.ante);
        let playerDatas = data.playerDatas;
        let keys = Object.keys(playerDatas);
        this.playersLab.getComponent(cc.Label).string = '人数：'+ keys.length;
        this.ridLab.getComponent(cc.Label).string = '房号：'+ data.rid;

        let marginInning = data.currInning-data.lastInning+1;
        let inningStr = '局数：第'+marginInning+'局';
        this.inningLab.getComponent(cc.Label).string = inningStr;
        let timeStr = new Date().Format("yyyy-MM-dd hh:mm");
        this.timeLab.getComponent(cc.Label).string = '时间：'+timeStr;

        let allScores = data.allScores;
        this.playersNode.children.forEach((el, idx) => {
            if (idx < keys.length) {
                el.active = true;
                let key = keys[idx];
                let playerData = playerDatas[key];

                let headNode = el.getChildByName('headNode');
                headNode.getComponent('HeadNode').updateData(playerData.pic, playerData.sex);
                let nameNode = el.getChildByName('name');
                let namestr = cc.utils.fromBase64(playerData.name, 8);
                nameNode.getComponent(cc.Label).string = namestr;
                nameNode.getChildByName('Label').getComponent(cc.Label).string = namestr;
                let uidNode = el.getChildByName('uid');
                uidNode.getComponent(cc.Label).string = 'ID: '+key;
                uidNode.getChildByName('Label').getComponent(cc.Label).string = 'ID: '+key;

                let xiScoreNode = el.getChildByName('xiScore');
                xiScoreNode.getComponent(cc.Label).string = playerData.totalXiScore;
                xiScoreNode.getChildByName('lable').getComponent(cc.Label).string = playerData.totalXiScore;
                let totalScoreNode = el.getChildByName('totalScore');
                totalScoreNode.getComponent(cc.Label).string = playerData.totalScore;
                totalScoreNode.getChildByName('lable').getComponent(cc.Label).string = playerData.totalScore;
                let finalScoreNode = el.getChildByName('finalScore');
                finalScoreNode.getComponent(cc.Label).string = playerData.finalScore;
                finalScoreNode.getChildByName('lable').getComponent(cc.Label).string = playerData.finalScore;
                let rewardScoreNode = el.getChildByName('rewardScore');
                rewardScoreNode.getComponent(cc.Label).string = playerData.rewardScore;
                rewardScoreNode.getChildByName('lable').getComponent(cc.Label).string = playerData.rewardScore;

                let score = allScores[key];
                let scorestr = cc.utils.getScoreStr(score);
                scorestr = scorestr.replace('万', 'B');
                let scoreNode = el.getChildByName('score');
                scoreNode.getComponent(cc.Label).string = score > 0 ? '+'+scorestr : scorestr;

                let iswinNode = el.getChildByName('iswin');
                if (playerData.win == 1) {
                    iswinNode.active = true;
                } else {
                    iswinNode.active = false;
                }

                let winNode = this.node.getChildByName('win');
                let loserNode = this.node.getChildByName('loser');
                if (cc.dm.user.uid == parseInt(key)) {
                    if (score < 0) {
                        winNode.active = false;
                        loserNode.active = true;
                    } else {
                        winNode.active = true;
                        loserNode.active = false;
                    }
                    el.color = cc.hexToColor('#FFF5D6');
                } else {
                    el.color = cc.Color.WHITE;
                }
            } else {
                el.active = false;
            }
        });

        this._time = (data.timer || 0)+1;
        this.countDown();
        this.schedule(this.countDown, 1);
    },

    countDown() {
        this._time -= 1;
        if (this._time < 1) {
            return;
        }

        this.cdLab.getComponent(cc.Label).string = this._time;
    },

    //按钮
    continueBtnPressed (event, data) {
        let value = parseInt(data);
        if(value == 0) {
            !!this._continueCb && this._continueCb();
        }else {
            !!this._backCb && this._backCb();
        }
        this.reset();
    },
});
