cc.Class({
    extends: cc.Component,

    properties: {
        /**游戏底注*/
        anteLab: {default:null, type: cc.Label},
        /**游戏最少局数*/
        inningLab: {default:null, type: cc.Label},
        /**开桌人数*/
        startNumberLab: {default:null, type: cc.Label},
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
        this.anteLab.string = cc.utils.getScoreStr(rule.ante);
        this.inningLab.string = !!rule.inning ? rule.inning+'局':'不限';
        this.startNumberLab.string = rule.startNumber+'人';
        this.gaojiLab.string = this.gaojiStr(rule);
        this.limitLab.string = '入场：'+cc.utils.getScoreStr(rule.ante*75)+'    离场：'+cc.utils.getScoreStr(rule.ante*75*0.8);
    },

    gaojiStr (rule) {
        let str = '';
        if (rule.halfway) {
            str+='房间开始后可以加入    ';
        } else {
            str+='房间开始后不可加入    ';
        }

        if (rule.stopCheatings) {
            str+='防作弊';
        }

        return str;
    }

    // update (dt) {},
});
