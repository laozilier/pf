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
        editBox: {
            default: null,
            type: cc.EditBox
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    openChangeScore(uid, type) {
        this.node.active = true;
        this._type = type;
        this._uid = uid;
        let bg = this.node.getChildByName('bg');
        let tipsTitle = bg.getChildByName('tipsTitle');
        let titlestr = type == 0 ? '加  分' : '减  分';
        let lab = tipsTitle.getChildByName('Label');
        lab.getComponent(cc.Label).string = titlestr;
        lab.children.forEach((el) => {
            el.getComponent(cc.Label).string = titlestr;
        }); 
    },

    start () {

    },

    // update (dt) {},

    onOkBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        let score = this.editBox.string;
        if (!!score) {
            let self = this;
            score = parseInt(score)*10000;
            let tipsstr = this._type == 0 ? '确定为用户\n'+this._uid+'\n增加'+cc.utils.getScoreStr(score)+'分?' : '确定扣除用户\n'+this._uid+'\n'+cc.utils.getScoreStr(score)+'分?';
            cc.utils.openTips(tipsstr, function () {
                if (self._type > 0) {
                    cc.connect.decreaseScore(self._uid, cc.dm.clubInfo.cid, score, (msg) => {
                        /*
                        cc.dm.user.score += score;
                        if (cc.sceneName == 'club' && !!cc.sceneSrc) {
                            cc.sceneSrc.scoreChanged();
                        }
                        */
                        self.node.active = false;
                    });
                } else {
                    cc.connect.addScore(self._uid, cc.dm.clubInfo.cid, score, (msg) => {
                        self.node.active = false;
                    });
                }
            }, function () {
    
            });
        } else {
            cc.utils.openTips('请输入分数');
        }
    },
    

    onCloseBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    }
});
