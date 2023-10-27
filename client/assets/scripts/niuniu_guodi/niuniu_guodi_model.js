// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


class niuniu_mpqz_model extends require('../games/Game_model') {
    constructor (scene) {
        super(scene);
    }

    ask_lianzhuang(data) {
        this._scene.ask_lianzhuang(data);
    }

    ask_dangzhuang(data) {
        this._scene.ask_dangzhuang(data);
    }

    randomDeclarering (data) {
        this._scene.randomDeclarering(data);
    }

    randomDeclarer (data) {
        this._decl = data.decl;
        this._scene.randomDeclarer(data);
    }

    start_guodi (data) {
        this._guodi = data.score;
        this._scene.start_guodi(data);
    }

    ask_shouzhuang(data) {
        this._scene.ask_shouzhuang(data);
    }

    shouzhuang(data) {
        this._scene.shouzhuang(data);
    }

    xiazhuang(data) {
        this._scene.xiazhuang(data);
    }

    holds5 (data) {
        this._scene.holds5(data);
    }

    holds4 (data) {
        this._holds = data;
        this._scene.holds4(data);
    }

    holds1 (data) {
        this._lastCardValue = data.v;
        this._scene.holds1(data);
    }

    deal (data) {
        this._scene.deal(data);
    }

    startBet (data) {
        this._scene.startBet(data);
    }

    bet (data) {
        this._scene.bet(data);
    }
    
    showHolds (data) {
        this._scene.showHolds(data);
    }

    rob (data) {
        this._scene.rob(data);
    }

    pleaseRob (data) {
        this._scene.pleaseRob(data);
    }

    getLaiziPoker(data) {
        this._scene.getLaiziPoker(data);
    }
}

module.exports = niuniu_mpqz_model;
