class Sanshui_model extends require('../Games/Game_model') {
    constructor (scene) {
        super(scene);

    }

    /**
     * 请抢庄
     * @param {*} data 
     */
    pleaseRob (data) { 
        this._scene.pleaseRob(data);
    }
    
    /**
     * 玩家抢庄
     * @param {*} data 
     */
    rob (data) { 
        this._scene.rob(data);
    }
    /**
     * 正在抢庄
     * @param {*} data 
     */
    randomDeclarering (data) { 
        this._scene.randomDeclarering(data);
    }

    /**
     * 系统随机生成庄家的信息
     * @param {*} data 
     */
    randomDeclarer (data) { 
        this._decl = data.decl;
        this._scene.randomDeclarer(data);
    }

    /**
     * 下注列表
     * @param {*} data 
     */
    startBet (data) { 
        this._scene.startBet(data);
    }

    /**
     * 玩家下注
     * @param {*} data 
     */
    bet (data) { 
        this._scene.bet(data);
    }

    /***
     *  抓牌
     * @param data
     */
    holdArrays (data) {
        this._scene.holdArrays(data);
    }

    /***
     *  出牌
     * @param data
     */
    chuPai (data) {
        this._scene.chuPai(data);
    }

    /***
     *  比牌
     * @param data
     */
    bipai (data) {
        this.bipaivalue = data;
        this._scene.bipai(data);
    }

    /**
     * 游戏提示
     * @param data
     */
    gameTips(data){
        this._scene.gameTips(data);
    }
    
    /**
     * 牌不能出
     * @param data
     */
    cannotOut(data) {
        this._scene.cannotOut(data);
    }

    /**
     * 游戏状态
     * @param data
     */
    gameStatus(data) {
        this._scene.gameStatus(data);
    }
    /**
     * 抢庄状态
     * @param data
     */
    banker(data) {
        this._scene.banker(data);
    }
    /**
     * 定庄
     * @param data
     */
    zhuangJia(data) {
        this._zuid = data.zuid;
        this._scene.zhuangJia(data);
    }
    /**
     * 下注
     * @param data
     */
    betList(data) {
        this._scene.betList(data);
    }
    /**
     * 确定下注
     * @param data
     */
    setBet(data) {
        this._scene.setBet(data);
    }
    /**
     * 马牌
     * @param data
     */
    maPlayer(data) {
        this._scene.maPlayer(data);
    }
}

module.exports = Sanshui_model;
