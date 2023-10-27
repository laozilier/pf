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
        this._curNum = 0;
        this._stop = true;
        this._res = false;
        //创建一个空节点，用来创建移动曲线
        this._aniNode = new cc.Node('AniNode');
        this._aniNode.parent = this.node;
        this._aniNode.x = 0;
    },

    start () {

    },

    showNum(num, ani, cb) {
        this.node.active = true;
        if (!this._aniNode) {
            return;
        }
        this._cb = cb;
        this._stop = false;
        this._aniNode.stopAllActions();
        this._aniNode.x = this._curNum;
        this.showStr(this._curNum);
        this._res = false;
        this._curNum = num;
        if (ani) {
            this.setNodeAni();
        } else {
            this._stop = true;
            this.showStr(this._curNum);
        }
    },

    showResNum(num, ani) {
        this.node.active = true;
        if (!this._aniNode) {
            return;
        }
        this._stop = false;
        this._aniNode.stopAllActions();
        this._aniNode.x = 0;
        this.showStr(0);
        this._res = true;
        this._curNum = num;
        if (ani) {
            this.setNodeAni();
        } else {
            this._stop = true;
            this.showStr(this._curNum);
        }
    },

    showNormalNum(num, ani) {
        this.node.active = true;
        if (!this._aniNode) {
            return;
        }
        this._stop = false;
        this._aniNode.stopAllActions();
        this._aniNode.x = 0;
        this.showStr(0);
        this._curNum = num;
        if (ani) {
            this.setNodeAni();
        } else {
            this._stop = true;
            this.showStr(this._curNum);
        }
    },

    setNodeAni() {
        let astr = cc.utils.getScoreStr(this._curNum);
        let bstr = cc.utils.getScoreStr(this._aniNode.x);
        if (astr.indexOf('.') > -1 || bstr.indexOf('.') > -1) {
            this._hasFix = true;
        } else {
            this._hasFix = false;
        }

        let margin = Math.abs(this._curNum-this._aniNode.x);
        if (margin > 100000000) {
            margin = margin/100000000;
        } else if (margin > 10000) {
            margin = margin/10000;
        } else {
            margin = margin/1000;
        }

        let time = margin*0.1;
        time = Math.min(2, time);
        time = Math.max(0.3, time);
        let move = cc.moveTo(time, cc.p(this._curNum, 0));
        move.easing(cc.easeInOut(time+1));
        this._aniNode.runAction(cc.sequence(move, cc.callFunc(() => {
            this._stop = true;
            this.showStr(this._curNum);
        }, this)));
    },

    update (dt) {
        if (this._stop) {
            return;
        }

        if (!this._aniNode) {
            return;
        }

        let a = Math.floor(this._aniNode.x);
        if (!this._hasFix && a > 10000) {
            a -= a%10000;
        }

        this.showStr(a);
    },

    showStr(num) {
        let str = cc.utils.getScoreStr(num);
        str = str.replace('千', 'A');
        str = str.replace('万', 'B');
        str = str.replace('亿', 'C');
        if (this._res) {
            str = (num >= 0 ? '+' : '')+str;
        } 

        if (this.node.getChildByName('Label')) {
            this.node.getChildByName('Label').getComponent(cc.Label).string = str;
        }

        if (this.node.getComponent(cc.Label)) {
            this.node.getComponent(cc.Label).string = str;
        }

        if (!!this._stop && !!this._cb) {
            this._cb();
            this._cb = undefined;
        }
    }
});
