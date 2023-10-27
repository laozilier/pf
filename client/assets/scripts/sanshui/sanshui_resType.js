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
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._txts = [
            'NO', 'AB', 'CA', 'DE', 'FB', 'GH', 'IJ', 'KL', 'GHF', 'MG', 'bD', 'cdIJ', 'DGH', 'PQ', 
            'DFB', 'PAR', 'MADE', 'STDE', 'UVW', 'XQ', 'XY', 'DZef', 'DGHF', 'ghij', 'VEO', 'aO'
          ];
    },

    start () {

    },

    // update (dt) {},

    checkType(data) {
        this.node.active = true;
        let winLab = this.node.getChildByName('win');
        let loseLab = this.node.getChildByName('lose');
        let pattern = data.pattern;
        let fen = data.fen;
        if (fen >= 0) {
            winLab.active = true;
            loseLab.active = false;
            winLab.getComponent(cc.Label).string = this._txts[cc.sanshui_enum.cardType[pattern]]+'+'+fen;
        } else {
            winLab.active = false;
            loseLab.active = true;
            loseLab.getComponent(cc.Label).string = this._txts[cc.sanshui_enum.cardType[pattern]]+fen;
        }
    }
});
