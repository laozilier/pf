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

        /**最少局数*/
        inning: {default:null, type: cc.Label},

        /**其它选项*/
        other: {default:null, type: cc.Label}
    },


    // onLoad () {},

    start() {

    },


    init(rule){
        let gameTypeStr = '斗兽棋';
        this.gameType.string = gameTypeStr;
        this.ante.string = cc.utils.getScoreStr(rule.ante);
        this.other.string = `${rule.halfway ? "允许中途加入" : "禁止中途加入"}    ${rule.stopCheatings ? "防作弊" : ""}`;
        this.startNumber.string = rule.startNumber + "人";
        this.inning.string = !!rule.inning ? rule.inning+'局':'不限';
        this.maxNumber.string = rule.max + "人";
    }
// update (dt) {},
});
