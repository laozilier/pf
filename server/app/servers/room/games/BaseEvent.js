/**
 * 游戏中一些公用的事件名
 *  创建者： THB
 *  日期：2020/1/7
 */

class BaseEvent {
    constructor() {
        this.gameBegin = "gameBegin";    //游戏开始
        this.holds = "holds";            //发送手牌
        this.deal = "deal";              //通知发牌
        this.turn = 'turn';              //转换操作对象
        this.gameInfo = "gameInfo";      //客户端需要的所有游戏数据
        this.gameResult = "gameResult";  //游戏结果
        this.toast = "toast";
        this.gameStatus = "gameStatus";
        this.tuoGuang = "tuoGuang";

    }
}

module.exports = BaseEvent;