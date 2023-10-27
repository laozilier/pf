cc.Class({
    extends: cc.Component,

    properties: {
        /**游戏最少局数*/
        inningLab: {default:null, type: cc.Label},

        /**游戏底注*/
        anteLab: {default:null, type: cc.Label},

        /**开桌人数*/
        startNumberLab: {default:null, type: cc.Label},

        /**叫主限制*/
        needRed2: {default:null, type: cc.Label},

        /**反主次数*/
        fanCount: {default:null, type: cc.Label},

        /**反主倍数*/
        fanzhuMul: {default:null, type: cc.Label},

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

        this.needRed2.string = rule.needRed2 ? '需带红2' : '不需带红2';
        this.fanCount.string = rule.fanCount ? (rule.fanCount+'次') : '不限制';
        this.fanzhuMul.string = rule.fanzhuMul ? '倍数乘2' : '倍数加1';

        this.gaojiLab.string = this.gaojiStr(rule);
        this.limitLab.string = '入场：'+cc.utils.getScoreStr(rule.ante*12)+'    离场：'+cc.utils.getScoreStr(rule.ante*12*0.8);
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

        if (rule.isNotHas6) {
            str+='除6';
        } else {
            str+='有6';
        }

        return str;
    }

    // update (dt) {},
});
