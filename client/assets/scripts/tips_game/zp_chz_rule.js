cc.Class({
    extends: cc.Component,

    properties: {
        /**游戏底注*/
        anteLab: {default:null, type: cc.Label},
        /**游戏最少局数*/
        inningLab: {default:null, type: cc.Label},
        /**开桌人数*/
        startNumberLab: {default:null, type: cc.Label},
        /**王数量*/
        wangNum: {default:null, type: cc.Label},
        /**翻醒*/
        fanxing: {default:null, type: cc.Label},
        /**飘分*/
        piaofen: {default:null, type: cc.Label},
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
        this.anteLab.string = cc.utils.getScoreStr(rule.ante);
        this.inningLab.string = !!rule.inning ? rule.inning+'局':'不限';
        this.startNumberLab.string = rule.startNumber+'人';
        this.wangNum.string = this.checkWangNumLab(rule);
        this.fanxing.string = this.checkFanxingLab(rule);
        this.piaofen.string = this.checkPiaofenLab(rule);
        this.gameRulesLab.string = this.gameRulesStr(rule.gameRules);
        this.gaojiLab.string = this.gaojiStr(rule);
        this.limitLab.string = '入场：'+cc.utils.getScoreStr(rule.ante*40)+'    离场：'+cc.utils.getScoreStr(rule.ante*40*0.8);
    },

    checkWangNumLab(rule) {
        let str = '';
        switch (rule.wangNum) {
            case 0:
                str = '无';
                break;
            case 1:
                str = '一个王';
                break;
            case 2:
                str = '两个王';
                break;
            case 3:
                str = '三个王';
                break;
            case 4:
                str = '四个王';
                break;
            default:
                break;
        }

        return str;
    },

    checkFanxingLab(rule) {
        let str = '';
        switch (rule.fanxing) {
            case 0:
                str = '下醒';
                break;
            case 1:
                str = '本醒';
                break;
            case 2:
                str = '上醒';
                break;
            case 3:
                str = '跟醒';
                break;
            default:
                break;
        }

        return str;
    },

    checkPiaofenLab(rule) {
        let str = '';
        switch (rule.piaofen) {
            case 0:
                str = '不飘分';
                break;
            case 1:
                str = '10倍飘分';
                break;
            case 2:
                str = '20倍飘分';
                break;
            case 3:
                str = '30倍飘分';
                break;
            default:
                break;
        }

        return str;
    },

    gameRulesStr (gameRules) {
        let str = '';
        gameRules.forEach((v, i) => {
            if (i == 0 && !!gameRules[i]) { str += v ? '坐醒    ' : ''; }
            if (i == 1 && !!gameRules[i]) { str += v ? '兴红黑    ' : ''; }
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
