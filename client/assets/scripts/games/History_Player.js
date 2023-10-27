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
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.userNode = this.node.getChildByName('user');
        this.headNode = this.userNode.getChildByName('headNode');   /** 头像 */
        this.nameNode = this.userNode.getChildByName('name');     /** 名字 */
        this.scoreNode = this.userNode.getChildByName('score');     /** 分数 */
        this.resScoreNode = this.userNode.getChildByName('resScore');     /** 中途分数 */
    },

    setUserInfo(info, score, uid) {
        if (!info) {
            return;
        }

        this.node.active = true;
        this._sex = info.sex || 2;
        let namestr = cc.utils.fromBase64(info.name, 2);
        this.nameNode.getComponent(cc.Label).string = namestr;
        this.nameNode.getChildByName('Label').getComponent(cc.Label).string = namestr;
        this.setScore(score, false);
        this.headNode.getComponent('HeadNode').updateData(info.headimg, info.sex);

        this._uid = uid;
    },

    pokerScript(poker) {
        return poker.getComponent('poker');
    },

    zpScr(cardNode) {
        return cardNode.getComponent('Zipai');
    }, 

    mjScript(mj) {
        return mj.getComponent('mj');
    },

    /**
     * 设置分数
     * @param {*} score
     * @param {*} ani
     */
    setScore(score, ani) {
        this.scoreNode.getComponent('scoreAni').showNum(score, ani);
    },

    /**
     * 显示这一把的分数
     * @param score
     */
    showScore(score, half) {
        if (!!this.resScoreNode) {
            this.resScoreNode.active = true;
            this.resScoreNode.getComponent('resScore').showScore(score, half);
        }
    },
});
