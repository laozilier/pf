// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

module.exports = {

    isSelect:false,
    from:[],
    to:[],

    //棋子(默认全部为背面)
    chess: [
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1]
    ],
    //棋盘矩阵
    checkerboard:[
        [0,0],
        [0,1],
        [0,2],
        [0,3],
        [1,0],
        [1,1],
        [1,2],
        [1,3],
        [2,0],
        [2,1],
        [2,2],
        [2,3],
        [3,0],
        [3,1],
        [3,2],
        [3,3]
    ],
    //坐标矩阵
    positionsArr:[
        cc.v2(-292,274),
        cc.v2(-100,274),
        cc.v2(94,274),
        cc.v2(286,274),
        cc.v2(-292,92),
        cc.v2(-100,92),
        cc.v2(94,92),
        cc.v2(286,92),
        cc.v2(-292,-92),
        cc.v2(-100,-92),
        cc.v2(94,-92),
        cc.v2(286,-92),
        cc.v2(-292,-276),
        cc.v2(-100,-276),
        cc.v2(94,-276),
        cc.v2(286,-276),
    ],

   intiChess: function(){

        this.chess = [
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1],
            [-1, -1, -1, -1]
        ]
    }

};

