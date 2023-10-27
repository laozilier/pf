cc.Class({
    extends: cc.Component,

    properties: {
        /**游戏模式*/
        modelLab: {default:null, type: cc.Label},

        /**游戏最少局数*/
        inningLab: {default:null, type: cc.Label},

        /**游戏底注*/
        anteLab: {default:null, type: cc.Label},

        /**开桌人数*/
        startNumberLab: {default:null, type: cc.Label},

        /**翻倍规则*/
        mulRule: {default:null, type: cc.Label},

        /**认输档*/
        surrenderLev: {default:null, type: cc.Label},

        /**特殊规则*/
        gameRulesLab: {default:null, type: cc.Label},

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
        this.modelLab.string = rule.playModel ? '双进单出':'经典模式';
        this.inningLab.string = !!rule.inning ? rule.inning+'局':'不限';
        this.anteLab.string = cc.utils.getScoreStr(rule.ante);
        this.startNumberLab.string = rule.startNumber+'人';
        this.mulRule.string = rule.mulRule ? '1、2、4倍':'1、2、3倍';
        this.surrenderLev.string = rule.surrenderLev ? '认输三档':'认输两档';
        this.gameRulesLab.string = this.gameRulesStr(rule.gameRules);
        this.gaojiLab.string = this.gaojiStr(rule);
        this.limitLab.string = '入场：'+cc.utils.getScoreStr(rule.ante*40)+'    离场：'+cc.utils.getScoreStr(rule.ante*40*0.8);
    },

    gameRulesStr (gameRules) {
        let str = '';
        gameRules.forEach((v, i) => {
            if (i == 0) { str += v ? '除6    ' : '不除6    '; }
            if (i == 1) { str += v ? '带拍    ' : '不带拍    '; }
            if (i == 2) { str += v ? '报副留守    ' : '不报副留守    '; }
            if (i == 3) { str += v ? '可查牌\n' : '不可查牌\n'; }
            if (i == 4) { str += v ? '投降询问    ' : '投降不询问    '; }
            if (i == 5) { str += v ? '无王牌    ' : '有王牌    '; }
            if (i == 6) { str += v ? '65分起叫' : '80分起叫'; }
        });
        str = (str.length == 0 ? '无' : str);

        return str;
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
