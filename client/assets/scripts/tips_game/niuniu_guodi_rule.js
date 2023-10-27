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

        /**翻倍规则*/
        multipleRule: {default:null, type: cc.Label},

        /**下注规则*/
        bets: {default:null, type: cc.Label},

        /**收庄局数*/
        shouInning: {default:null, type: cc.Label},

        /**连庄次数*/
        maxCount: {default:null, type: cc.Label},

        /**翻倍规则*/
        multipleRule: {default:null, type: cc.Label},

        /**强制下庄*/
        minBankMul: {default:null, type: cc.Label},

        /**强制收庄*/
        maxBankMul: {default:null, type: cc.Label},

        /**牌型规则*/
        specialType: {default:null, type: cc.Label},

        /**其它选项*/
        other: {default:null, type: cc.Label},

        /**进出限制*/
        limitLab: {default:null, type: cc.Label}
    },


    // onLoad () {},

    start() {

    },


    init(rule){
        let niuType = [];
        rule.isSn && niuType.push(rule.multipleRule > 0 ? "顺子牛(12倍)" : "顺子牛(6倍)");
        rule.isWhn && niuType.push(rule.multipleRule > 0 ? "五花牛(11倍)" : "五花牛(5倍)");
        rule.isThn && niuType.push(rule.multipleRule > 0 ? "同花牛(13倍)" : "同花牛(7倍)");
        rule.isHln && niuType.push(rule.multipleRule > 0 ? "葫芦牛(14倍)" : "葫芦牛(8倍)");
        rule.isZdn && niuType.push(rule.multipleRule > 0 ? "炸弹牛(15倍)" : "炸弹牛(9倍)");
        rule.isWxn && niuType.push(rule.multipleRule > 0 ? "五小牛(16倍)" : "五小牛(10倍)");
        rule.isQdn && niuType.push(rule.multipleRule > 0 ? "全大牛(16倍)" : "全大牛(10倍)");
        rule.isThs && niuType.push(rule.multipleRule > 0 ? "同花顺(16倍)" : "同花顺(10倍)");
        rule.isJpn && niuType.push("金牌牛");
        let gameTypeStr = '锅底牛';
        gameTypeStr += rule.wh ? '(无花)' : '';
        this.gameType.string = gameTypeStr;
        this.ante.string = cc.utils.getScoreStr(rule.ante);
        this.multipleRule.string = rule.multipleRule > 0 ? '牛番：无牛、牛一1倍、牛二2倍...牛九9倍、牛牛10倍' : '牛牛4倍 牛九3倍 牛八牛七2倍';
        this.bets.string = '底注10/5分之一 射门为锅底1/4';
        this.shouInning.string = rule.shouInning+'局';
        let maxCountStrs = ['不能连庄', '1次', '2次'];
        this.maxCount.string = maxCountStrs[rule.maxCount];

        
        let minBankMuls = [0, 0.1, 0.2];
        let minBankMulStrs = ['锅底输光', '小于锅底1/10', '小于锅底1/5'];
        this.minBankMul.string = minBankMulStrs[minBankMuls.indexOf(rule.minBankMul || 0)];
        this.maxBankMul.string = (rule.maxBankMul || 10)+'倍锅底';

        this.specialType.string = (niuType.length === 0 ? "无特殊牌型" : "");
        this.other.string = `${rule.halfway ? "允许中途加入" : "禁止中途加入"}    ${rule.cuopai ? "可搓牌" : "禁止搓牌"}   ${rule.wh ? "无花" : "有花"}   ${rule.isLaizi ? "有赖子" : "无赖子"}   ${rule.mpHolds ? "明牌" : "暗牌"}`;
        this.startNumber.string = rule.startNumber + "人";
        this.maxNumber.string = rule.max + "人";
        niuType.forEach((el, i) => {
            if(i !== 0 && i%3 === 0){
                this.specialType.string += '\n';
            }
            this.specialType.string += el;
            if(i !== niuType.length -1){
                this.specialType.string += "  ";
            }
        });

        this.limitLab.string = '入场：'+cc.utils.getScoreStr(rule.ante*1.2)+'    离场：'+cc.utils.getScoreStr(rule.ante);
    }
// update (dt) {},
});
