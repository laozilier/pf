class NNEvent extends require('../BaseEvent') {
    constructor() {
        super();
        this.canTuizhu = "canTuizhu";
        this.randomDeclarering = "randomDeclarering";
        this.randomDeclarer = "randomDeclarer";
        this.rob = "rob";
        this.showHolds = "showHolds";
        this.bet = "bet";
        this.customBet = "customBet";
        this.holds4 = "holds4";
        this.holds1 = "holds1";
        this.holds5 = "holds5";
        this.startBet = "startBet";
        this.zhuangJia = "zhuangJia";
        this.deal = "deal";
        this.pleaseRob = "pleaseRob";
        this.robBanker = "robBanker";
        this.bet_holds = "bet_holds";
        this.startCuoPai = "startCuoPai";
        this.setMultiple = "setMultiple";

        this.wait_dangzhuang = "wait_dangzhuang";       //等待当庄
        this.ask_lianzhuang = "ask_lianzhuang";         //询问玩家是否连庄
        this.ask_dangzhuang = "ask_dangzhuang";         //询问玩家是否当庄
        this.res_dangzhuang = "res_dangzhuang";         //是否当庄结果
        this.res_lianzhuang = "res_lianzhuang";         //是否连庄结果
        this.start_guodi = "start_guodi";               //下锅底
        this.ask_shouzhuang = "ask_shouzhuang";         //可以收庄
        this.res_shouzhuang = "res_shouzhuang";         //回复收庄
        this.shouzhuang = "shouzhuang";                 //收庄
        this.xiazhuang = "xiazhuang";                   //下庄
    }
}
module.exports = new NNEvent();