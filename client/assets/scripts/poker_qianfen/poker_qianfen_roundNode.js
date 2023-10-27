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
        sspokerPrefab: {
            default: null,
            type: cc.Prefab
        },

        rankFrames: {
            default: [],
            type: cc.SpriteFrame
        }
    },

    onLoad () {
        cc.utils.setNodeWinSize(this.node);

        this.players = [];
        let playersNode = this.node.getChildByName('players');
        for (let i = 0; i < 3; i++) {
            let p = playersNode.getChildByName('player_'+i);
            this.players.push(p);
        }
        
        this.loserCards = this.node.getChildByName('loserCards');
        this.timeLab = this.node.getChildByName('timeLab');
    },

    start () {

    },

    reset(need) {
        this.unscheduleAllCallbacks();
        this.players.forEach(el=> {
            el.active = false;
        });

        this.loserCards.children.forEach(el=> {
            el.active = false;
        });

        if (need) {
            this.node.active = false; 
        }
    },

    //小结算界面开始游戏按钮
    continueBtnPressed () {
        !!this.continueCb && this.continueCb(this._time);
        this.reset(true);
    },

    showRoundNode(playerDatas, time, continueCb) {
        this.reset();
        this.continueCb = continueCb;
        this.node.active = true;
        let keys = Object.keys(playerDatas);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let playerNode = this.players[i];
            if (!playerNode) {
                return;
            }

            playerNode.active = true;
            let playerData = playerDatas[key];
            let bankerNode = playerNode.getChildByName('banker');
            bankerNode.active = playerData.isBanker;
            let headNode = playerNode.getChildByName('headNode');
            headNode.getComponent('HeadNode').updateData(playerData.pic, playerData.sex);
            let nameNode = playerNode.getChildByName('name');
            let namestr = cc.utils.fromBase64(playerData.name, 8);
            nameNode.getComponent(cc.Label).string = namestr;
            nameNode.getChildByName('Label').getComponent(cc.Label).string = namestr;

            let rankNode = playerNode.getChildByName('rankNode');
            if (playerData.rank == keys.length-1) {
                rankNode.getComponent(cc.Sprite).spriteFrame = this.rankFrames[2];
            } else {
                rankNode.getComponent(cc.Sprite).spriteFrame = this.rankFrames[playerData.rank];
            }

            let rankScoreNode = playerNode.getChildByName('rankScore');
            rankScoreNode.getComponent(cc.Label).string = playerData.rankScore;
            let roundScoreNode = playerNode.getChildByName('roundScore');
            roundScoreNode.getComponent(cc.Label).string = playerData.roundScore;
            let xiScoreNode = playerNode.getChildByName('xiScore');
            xiScoreNode.getComponent(cc.Label).string = playerData.xiScore;
            let totalScoreNode = playerNode.getChildByName('totalScore');
            totalScoreNode.getComponent(cc.Label).string = playerData.totalScore;
            let totalXiScoreNode = playerNode.getChildByName('totalXiScore');
            totalXiScoreNode.getComponent(cc.Label).string = playerData.totalXiScore;

            let holds = playerData.holds;
            if (Array.isArray(holds) && holds.length > 0) {
                for (let j = 0; j < holds.length; j++) {
                    let v = holds[j];
                    let poker = this.loserCards.getChildByName('poker'+j);
                    if (!poker) {
                        poker = cc.instantiate(this.sspokerPrefab);
                        this.loserCards.addChild(poker, i, 'poker'+i);
                    }

                    poker.getComponent('poker').show(v);
                }
            }
        }

        this._time = time+1;
        this.countDown();
        this.schedule(this.countDown, 1);
    },

    countDown() {
        this._time -= 1;
        if (this._time < 1) {
            this.continueBtnPressed();
            return;
        }

        this.timeLab.getComponent(cc.Label).string = this._time;
    }
});
