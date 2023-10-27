class Psz_model extends require('../games/Game_model') {
    constructor (scene) {
        super(scene);

    }

    /***
     *  游戏开始
     * @param uids
     */
    gameBegin (data) {
        this._uids = data.uids;
        super.gameBegin(data);
    }

    deal (data) {
        this._scene.deal(data);
    }

    turn (data){
        this._scene.turn(data);
    }

    currentAction (data) {
        this._scene.currentAction(data);
    }

    auto (data) {
        this._scene.auto(data);
    }

    xi (data) {
        this._scene.xi(data);
    }

    compare (data) {
        this._scene.compare(data);
    }
}

module.exports = Psz_model;
