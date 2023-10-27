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
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        /* 
         * 2 = 2      
         * 3 = 3      
         * 4 = 4         
         * 5 = 5        
         * 6 = 6            
         * 9 = 9           
         * A = x-1    黄色 
         * B = x-2      红色
         * C = 零    
         * D = 一      
         * E = 二      
         * F = 三-1   绿色     
         * G = 四-1   绿色      
         * H = 五      
         * I = 六      
         * J = 七      
         * K = 八      
         * L = 九-1   黄色           
         * M = 点-1   绿色
         * N = 点-2     黄色
         * O = 三-2       红色
         * P = 公       
         * Q = 条    
         * R = 爆          
         * S = 九-2       红色
         * T = 散       
         * U = 牌
         * V = 对    
         * W = 子       
         * X = 顺
         * Y = 金
         * Z = 花          
         * a = 豹
         * b = 子    红色
         * c = 点    灰色
         * d = 顺    黄色   
         */
        this._arr2 = ['TU', 'VW', 'dW', 'YZ', 'YZX', 'ab'];
    },

    start () {

    },

    /**
     * 显示牌型
     * @param {*} type
     * @param {*} needAni 
     */
    checkjhType(type, look, needAni, alpha) {
        if (type < 1) {
            return;
        }

        if (look && type > 1) {
            return;
        }

        this.node.active = true;
        let jhLab = this.node.getChildByName('jhLab');
        jhLab.getComponent(cc.Label).string = this._arr2[type];
        if (needAni) {
            jhLab.getComponent(cc.Animation).play();
            
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

            if (type > 2) {
                niu_yanhuahong.node.active = true;
                niu_yanhuahong.setAnimation(0, "animation", false);
            } else if (type > 0) {
                niu_yanhuahuang.node.active = true;
                niu_yanhuahuang.setAnimation(0, "animation", false);
            }
        }

        if (!!alpha) {
            let bg = this.node.getChildByName('bg');
            !!bg && (bg.active = false);
        }
    }

    // update (dt) {},
});
