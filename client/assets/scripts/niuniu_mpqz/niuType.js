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
        typeLab: {
            default: null,
            type: cc.Label
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        /* 
         * 1 = 金      绿色
         * 2 = 牌      绿色 
         * 3 = 金         黄色 
         * 4 = 牌         黄色
         * 5 = 金            红色  
         * 6 = 牌            红色
         * A = 无 
         * B = 牛-1 灰色
         * C = 牛-2    绿色
         * D = 牛-3       黄色
         * E = 牛-4          红色
         * F = 一      绿色
         * G = 二      绿色
         * H = 三      绿色
         * I = 四      绿色
         * J = 五      绿色
         * K = 六      绿色
         * L = 七         黄色
         * M = 八         黄色
         * N = 九         黄色
         * O = x-1    绿色
         * P = x-2       黄色
         * Q = x-3          红色
         * R = 1-1    绿色
         * S = 1-2          红色
         * T = 2-1    绿色
         * U = 2-2       黄色
         * V = 2-3          红色
         * W = 3-1    绿色
         * X = 3-2       黄色
         * Y = 3-3          红色
         * Z = 4-1    绿色
         * a = 4-2          红色
         * b = 5-1    绿色
         * c = 5-2          红色
         * d = 6-1    绿色
         * e = 6-2          红色
         * f = 7-1       黄色
         * g = 7-2          红色
         * h = 8-1       黄色
         * i = 8-2          红色
         * j = 9-1       黄色
         * k = 9-2          红色
         * l = 0            红色
         * m = 五
         * n = 花
         * o = 顺
         * p = 子
         * q = 同
         * r = 葫
         * s = 芦
         * t = 全
         * u = 大
         * v = 小
         * w = 炸
         * x = 弹
         */
        /** 普通牛数组 */
        this._arr1 = [
            'AB',   //五牛
            'CFOR', //牛一x1
            'CGOR', //牛二x1
            'CHOR', //牛三x1
            'CIOR', //牛四x1
            'CJOR', //牛五x1
            'CKOR', //牛六x1
            'DLPU', //牛七x2
            'DMPU', //牛八x2
            'DNPX', //牛九x3
            'EEQa', //牛牛x4
            'mnEQc',    //五花牛x5
            'opEQe',    //顺子牛x6
            'qnEQg',    //同花牛x7
            'rsEQi',    //葫芦牛x8
            'wxEQk',    //炸弹牛x9
            'tuEQSl',   //全大牛x10
            'mvEQSl',   //五小牛x10
            'qnoQSl'    //同花顺x10
        ];
        /** 金牌普通牛数组 */
        this._arr2 = [
            'AB',       //无牛x1
            '12CFOR',   //金牌牛一x1
            '12CGOR',   //金牌牛二x1
            '12CHOR',   //金牌牛三x1
            '12CIOR',   //金牌牛四x1
            '12CJOR',   //金牌牛五x1
            '12CKOR',   //金牌牛六x1
            '34DLPU',   //金牌牛七x2
            '34DMPU',   //金牌牛八x2
            '34DNPX',   //金牌牛九x3
            '56EEQa',   //金牌牛牛x4
            'mnEQc',    //五花牛x5
            'opEQe',    //顺子牛x6
            'qnEQg',    //同花牛x7
            'rsEQi',    //葫芦牛x8
            'wxEQk',    //炸弹牛x9
            'tuEQSl',   //全大牛x10
            'mvEQSl',   //五小牛x10
            'qnoQSl'    //同花顺x10
        ];
        /** 牛番牛数组 */
        this._arr3 = [
            'AB',       //无牛
            'CFOR',     //牛一x1
            'CGOT',     //牛二x2
            'CHOW',     //牛三x3
            'CIOZ',     //牛四x4
            'CJOb',     //牛五x5
            'CKOd',     //牛六x6
            'DLPf',     //牛七x7
            'DMPh',     //牛八x8
            'DNPj',     //牛九x9
            'EEQSl',    //牛牛x10
            'mnEQSS',   //五花牛x11
            'opEQSV',   //顺子牛x12
            'qnEQSY',   //同花牛x13
            'rsEQSa',   //葫芦牛x14
            'wxEQSc',   //炸弹牛x15
            'tuEQSe',   //全大牛x16
            'mvEQSe',   //五小牛x16
            'qnoQSe'    //同花顺x16
        ];
        /** 金牌牛番牛数组 */
        this._arr4 = [
            'AB',       //无牛
            '12CFOR',   //金牌牛一x1
            '12CGOT',   //金牌牛二x2
            '12CHOW',   //金牌牛三x3
            '12CIOZ',   //金牌牛四x4
            '12CJOb',   //金牌牛五x5
            '12CKOd',   //金牌牛六x6
            '34DLPf',   //金牌牛七x7
            '34DMPh',   //金牌牛八x8
            '34DNPj',   //金牌牛九x9
            '56EEQSl',  //金牌牛牛x10
            'mnEQSS',   //五花牛x11
            'opEQSV',   //顺子牛x12
            'qnEQSY',   //同花牛x13
            'rsEQSa',   //葫芦牛x14
            'wxEQSc',   //炸弹牛x15
            'tuEQSe',   //全大牛x16
            'mvEQSe',   //五小牛x16
            'qnoQSe'    //同花顺x16
        ];
    },

    start () {

    },

    // update (dt) {},

    /**
     * 显示牛型
     * @param {*} type 
     * @param {*} jinpai 
     */
    checkNiuType(type, fan, jinpai, needAni) {
        this.node.active = true;
        if (jinpai) {
            if (fan) {
                this.typeLab.string = this._arr4[type];
            } else {
                this.typeLab.string = this._arr2[type];
            }
        } else {
            if (fan) {
                this.typeLab.string = this._arr3[type];
            } else {
                this.typeLab.string = this._arr1[type];
            }
        }

        if (needAni) {
            let niu_type_animate = this.typeLab.node.getComponent(cc.Animation);
            niu_type_animate.play();
            
            let niu_yanhuahong = this.node.getChildByName("hong").getComponent(sp.Skeleton);
            let niu_yanhuahuang = this.node.getChildByName("huang").getComponent(sp.Skeleton);
            let niu_xinxin = this.node.getChildByName("xinxin").getComponent(sp.Skeleton);
            let niu_meiniuyan = this.node.getChildByName("meiniu").getComponent(sp.Skeleton);

            niu_xinxin.clearTrack(0);
            niu_yanhuahong.clearTrack(0);
            niu_yanhuahuang.clearTrack(0);
            niu_meiniuyan.clearTrack(0);
            niu_xinxin.node.active = false;
            niu_yanhuahong.node.active = false;
            niu_yanhuahuang.node.active = false;
            niu_meiniuyan.node.active = false;

            //播放星星动画
            if (type != 0) {
                niu_xinxin.node.active = true;
                niu_xinxin.setAnimation(0, "animation", true);
            } else {
                niu_meiniuyan.node.active = true;
                niu_meiniuyan.setAnimation(0, "animation", false);
            }

            if (type > 9) {
                niu_yanhuahong.node.active = true;
                niu_yanhuahong.setAnimation(0, "animation", false);
            } else if (type > 6) {
                niu_yanhuahuang.node.active = true;
                niu_yanhuahuang.setAnimation(0, "animation", false);
            }
        }
    }
});
