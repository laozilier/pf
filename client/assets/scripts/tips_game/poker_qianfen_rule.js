cc.Class({
    extends: cc.Component,

    properties: {
        /**游戏最少局数*/
        inningLab: {default:null, type: cc.Label},

        /**游戏底注*/
        anteLab: {default:null, type: cc.Label},

        /**开桌人数*/
        startNumberLab: {default:null, type: cc.Label},

        /**奖分*/
        rewardScore: {default:null, type: cc.Label},

        /**奖分模式*/
        rewardScoreMode: {default:null, type: cc.Label},

        /**喜分模式*/
        xiScoreMode: {default:null, type: cc.Label},

        /**奖惩*/
        rankScore: {default:null, type: cc.Label},

        /**结算分数*/
        settleScore: {default:null, type: cc.Label},

        /**其它选项*/
        gaojiLab: {default:null, type: cc.Label},

        /**进出限制*/
        limitLab: {default:null, type: cc.Label}
    },

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
        this._ruleWins = {};
    },

    start () {

    },

    init (rule) {
        this.inningLab.string = !!rule.inning ? rule.inning+'局':'不限';
        this.anteLab.string = cc.utils.getScoreStr(rule.ante);
        this.startNumberLab.string = rule.startNumber+'人';
        this.rewardScore.string = rule.rewardScore+'分';
        let rewardScoreModeStrs = ['上游得', '最高分得'];
        this.rewardScoreMode.string = rewardScoreModeStrs[rule.rewardScoreMode];
        let xiScoreModeStrs = ['加法', '乘法'];
        this.xiScoreMode.string = xiScoreModeStrs[rule.xiScoreMode];
        if (rule.startNumber == 2) {
            let strs = ['上游奖励60分    下游扣60分', '上游奖励40分    下游扣40分'];
            this.rankScore.string = strs[rule.rankScore_2];
        } else {
            let strs = ['上游奖100分  中游扣40分  下游扣60分', '上游奖100分  中游扣30分  下游扣70分', '上游奖100分  中游扣0分  下游扣100分'];
            this.rankScore.string = strs[rule.rankScore_3];
        }

        this.settleScore.string = !!rule.settleScore ? rule.settleScore+'分' : '1000分';
        this.gaojiLab.string = this.gaojiStr(rule);
        this.limitLab.string = '入场：'+cc.utils.getScoreStr(rule.ante*64)+'    离场：'+cc.utils.getScoreStr(rule.ante*64*0.2);
    },

    gaojiStr (rule) {
        let str = '';
        if (rule.halfway) {
            str+='房间开始后可以加入    ';
        } else {
            str+='房间开始后不可加入    ';
        }

        if (rule.stopCheatings) {
            str+='防作弊    ';
        }

        if (rule.isHas67) {
            str+='不去掉6、7';
        } else {
            str+='去掉6、7';
        }

        return str;
    }

    // update (dt) {},
});
