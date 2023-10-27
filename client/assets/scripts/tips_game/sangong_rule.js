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
        /**游戏名字*/
        gameType: {default:null, type: cc.Label},

        /**游戏底注*/
        ante: {default:null, type: cc.Label},

        /**开桌人数*/
        startNumber: {default:null, type: cc.Label},

        /**最大人数*/
        maxNumber: {default:null, type: cc.Label},

        /**游戏模式*/
        playMode: {default:null, type: cc.Label},

        /**最少局数*/
        inning: {default:null, type: cc.Label},

        /**抢庄加倍*/
        anteDouble: {default:null, type: cc.Label},

        /**翻倍规则*/
        multipleRule: {default:null, type: cc.Label},

        /**推注*/
        tuizhu: {default:null, type: cc.Label},

        /**最大抢庄倍数*/
        maxMultiple: {default:null, type: cc.Label},

        /**其它选项*/
        other: {default:null, type: cc.Label},

        /**进出限制*/
        limitLab: {default:null, type: cc.Label}
    },


    // onLoad () {},

    start() {

    },


    init(rule){
        let gameTypeStr = '明牌抢庄';
        this.gameType.string = gameTypeStr;
        this.ante.string = rule.ante;
        this.maxMultiple.string = (rule.multiple+1) + "倍";
        this.tuizhu.string = ['无', '5倍', '10倍', '20倍'][rule.tuizhu];
        this.other.string = `${rule.halfway ? "允许中途加入" : "禁止中途加入"}    ${rule.cuopai ? "可搓牌" : "禁止搓牌"}`;
        this.startNumber.string = rule.startNumber + "人";
        this.playMode.string = rule.playMode == 0 ? '经典三公' : '三公比金花';
        this.inning.string = !!rule.inning ? rule.inning+'局':'不限';
        this.maxNumber.string = rule.max + "人";
        this.anteDouble.string = rule.anteDouble ? '加倍' : '不加倍';

        let mul = (rule.multiple+1)*2*8;
        this.limitLab.string = '入场：'+cc.utils.getScoreStr(rule.ante*mul)+'    离场：'+cc.utils.getScoreStr(rule.ante*mul*0.8);
    }
// update (dt) {},
});
