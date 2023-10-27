"use strict";
/*
* 麻将算法
* */
Object.defineProperty(exports, "__esModule", { value: true });
var MJAlgorithm = /** @class */ (function () {
    function MJAlgorithm() {
    }
    MJAlgorithm.instance = function () {
        if (this._instance == null) {
            this._instance = new MJAlgorithm();
        }
        return this._instance;
    };
    /**
     * 获取一整副洗好的麻将
     */
    MJAlgorithm.prototype.getCards = function () {
        return null;
    };
    /*
    * 是否能碰
    * @param cardArr: 手上的牌
    */
    MJAlgorithm.prototype.isCanPeng = function (cardArr) {
        return true;
    };
    /*
    * 是否能吃
    * @param cardArr: 手上的牌
    */
    MJAlgorithm.prototype.isCanEat = function (cardArr) {
        return true;
    };
    /*
    * 是否能杠
    * @param cardArr: 手上的牌
    */
    MJAlgorithm.prototype.isCanGang = function (cardArr) {
        return true;
    };
    /*
    * 是否能胡
    * @param cardArr: 手上的牌
    * @param waterArr : 下水牌(已经碰了 或者 杠了的牌)
    */
    MJAlgorithm.prototype.isWinning = function (cardArr, waterArr) {
        return true;
    };
    MJAlgorithm.prototype.onDestory = function () {
        MJAlgorithm._instance = null;
    };
    return MJAlgorithm;
}()); // end class
exports.default = MJAlgorithm;
//# sourceMappingURL=MJAlgorithm.js.map