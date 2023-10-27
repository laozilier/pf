class Sangong_model extends require('../games/Game_model') {
    constructor (scene) {
        super(scene);
        this._bets = [];
        this._liangPaiPlayer = [];
        this._liangpaiData = [];
    }

    randomDeclarering (data) {
        this._scene.randomDeclarering(data);
    }

    randomDeclarer (data) {
        this._decl = data.decl;
        this._scene.randomDeclarer(data);
    }

    canTuizhu (data) {
        this._scene.canTuizhu(data);
    }

    deal (data) {
        this._scene.deal(data);
    }

    startBet (data) {
        this._scene.startBet(data);
    }

    bet (data) {
        this._bets.push(data);
        this._scene.bet(data);
    }

    showHolds (data) {
        this._scene.showHolds(data);
    }

    holds2 (data) {
        this._holds = data;
        this._scene.holds2(data);
    }

    holds1 (data) {
        this._lastCardValue = data.v;
        this._scene.holds1(data);
    }

    rob (data) {

        this._scene.rob(data);
    }

    pleaseRob (data) {
        this._scene.pleaseRob(data);
    }

    startCuoPai (data) {
        this._scene.startCuoPai(data);
    }
}

module.exports = Sangong_model;
