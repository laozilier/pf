cc.Class({
    extends: cc.Component,

    properties: {
        /**游戏底注*/
        anteLab: {default:null, type: cc.Label},

        /**开桌人数*/
        startNumberLab: {default:null, type: cc.Label},

        /**最大人数*/
        maxNumberLab: {default:null, type: cc.Label},

        /**马牌设置*/
        maCardLab: {default:null, type: cc.Label},

        /**打枪分数*/
        shootScoreLab: {default:null, type: cc.Label},

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
        this.startNumberLab.string = rule.startNumber+'人';
        this.maxNumberLab.string = rule.max+'人';
        this.maCardLab.string = this.maCardStr(rule.maCard);
        this.shootScoreLab.string = this.shootScoreStr(rule.shootScore);
        this.gaojiLab.string = this.gaojiStr(rule);
        this.limitLab.string = '入场：'+cc.utils.getScoreStr(rule.ante*100)+'    离场：'+cc.utils.getScoreStr(rule.ante*100*0.8);
    },

    maCardStr(maCardValue) {
        let str = '';
        switch (maCardValue) {
            case 0:
                str = '无';
                break;
            case 1:
                str = '黑桃5';
                break;
            case 2:
                str = '黑桃10';
                break;
            case 3:
                str = '黑桃A';
                break;
            default:
                break;
        }

        return str;
    },

    shootScoreStr(shootScore) {
        let str = '';
        switch (shootScore) {
            case 0:
                str = '翻倍';
                break;
            case 1:
                str = '加一';
                break;
            default:
                break;
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

        if (rule.withOutSpecial) {
            str+='无特殊牌型    ';
        } else {
            str+='有特殊牌型    ';
        }

        if (rule.hasBanker) {
            str+='有庄模式';
        } else {
            str+='无庄模式';
        }

        return str;
    }

    // update (dt) {},
});
