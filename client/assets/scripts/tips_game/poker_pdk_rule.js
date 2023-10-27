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

        /**首局先出*/
        throwCardsLab: {default:null, type: cc.Label},

        /**是否显示牌数*/
        isVisiblesLab: {default:null, type: cc.Label},

        /**特殊玩法*/
        playTypeLab: {default:null, type: cc.Label},

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
        this.modelLab.string = rule.model == 0 ? '16张':'15张';
        this.inningLab.string = !!rule.inning ? rule.inning+'局':'不限';
        this.anteLab.string = cc.utils.getScoreStr(rule.ante);
        this.startNumberLab.string = rule.startNumber+'人';
        this.throwCardsLab.string = rule.first == 1 ? '首局随机玩家先出':'首局黑桃三先出';
        this.isVisiblesLab.string = rule.isVisibles ? '显示':'不显示';
        this.playTypeLab.string = this.playTypeStr(rule.playTypes);
        this.gameRulesLab.string = this.gameRulesStr(rule.gameRules);
        this.gaojiLab.string = this.gaojiStr(rule);
        this.limitLab.string = '入场：'+cc.utils.getScoreStr(rule.ante*64)+'    离场：'+cc.utils.getScoreStr(rule.ante*64*0.2);
    },


    playTypeStr (playTypes) {
        let str = '';

        if (playTypes[0] > 0) {
            str += '三张可少带出完    ';
        }

        if (playTypes[1] > 0) {
            str += '三张可少带接完    ';
        }

        if (playTypes[2] > 0) {
            str += '飞机可少带出完    ';
        }

        if (playTypes[3] > 0) {
            str += '飞机可少带接完    ';
        }

        if (playTypes[4] > 0) {
            str += '小通机制    ';
        }

        if (playTypes[5] > 0) {
            str += '双报    ';
        }

        return str;
    },

    gameRulesStr (gameRules) {
        let str = '';
        if (gameRules[0] > 0) {
            str += '炸弹不可拆    ';
        }

        if (gameRules[1] > 0) {
            str += '允许4带2    ';
        }

        if (gameRules[2] > 0) {
            str += '允许4带3    ';
        }

        if (gameRules[3] > 0) {
            str += '红桃10扎鸟    ';
        }

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
