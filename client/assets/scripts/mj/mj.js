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
        valueNode: {
            default: null,
            type: cc.Node
        },

        holdsBgs: {
            default: [],
            type: cc.SpriteFrame
        },

        outsBgs: {
            default: [],
            type: cc.SpriteFrame
        },

        inPokersBgs0: {
            default: [],
            type: cc.SpriteFrame
        },

        inPokersBgs1: {
            default: [],
            type: cc.SpriteFrame
        },

        tanBgs: {
            default: [],
            type: cc.SpriteFrame
        },

        values: {
            default: [],
            type: cc.SpriteFrame
        },

        laizi: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._holdSortPositions = [[-180, 68], [0, -36], [101, 0], [0, 36]];
        this._holdSortMargins = [[-91, 0], [0, -30], [54, 0], [0, 30]];
        this._holdZIndexs = [[0, 1], [0, 1], [0, 1], [13, -1]];
        this._holdRightZIndexs = [0, -1, 0, 14];

        this._tanSortPositions = [[-180, 68], [0, -36], [101, 0], [0, 36]];
        this._tanSortMargins = [[-91, 0], [0, -30], [54, 0], [0, 30]];

        this._tanZIndexs = [[0, 1], [0, 1], [0, 1], [13, -1]];
        this._tanRightZIndexs = [0, -1, 0, 14];

        this._holdsParams = [
            {scale: 1, rotation: 0, x: 0, y: -10}];

        this._tanParams = [
            {scale: 0.9, rotation: 0, x: 0, y: 10}, 
            {scale: 0.34, rotation: -90, x: 0, y: 4}, 
            {scale: 0.54, rotation: 180, x: 0, y: 4}, 
            {scale: 0.34, rotation: 90, x: 0, y: 4}];

        this._outParams = [
            {scale: 0.54, rotation: 0, x: 0, y: 6}, 
            {scale: 0.54, rotation: -90, x: 0, y: 8}, 
            {scale: 0.54, rotation: 0, x: 0, y: -6}, 
            {scale: 0.54, rotation: -90, x: 0, y: -8}];

        this._inPokerParams = [
            {scale: 0.7, rotation: 0, x: 0, y: 5}, 
            {scale: 0.34, rotation: -90, x: 0, y: 5}, 
            {scale: 0.46, rotation: 180, x: 0, y: 5}, 
            {scale: 0.34, rotation: 90, x: 0, y: 5}];

        this.showTipsting(false);
    },

    start () {

    },

    // update (dt) {},
    /**
     * 显示排序的麻将
     * @param value  需要显示的值
     * @param localSeat  玩家在本地的座位号
     */
    showSortMjValue(value, localSeat=0, idx=0, ani=false) {
        // this.showSortTansMjValue(value, localSeat, idx, ani);
        // return;
        this.showHoldsMjValue(value, localSeat);
        if (idx < 0) {
            this._curPos = this.node.getPosition();
            this._zIndex = this._holdRightZIndexs[localSeat];
            this.node.setLocalZOrder(this._zIndex);
        } else {
            this.node.stopAllActions();
            let zIndex = this._holdZIndexs[localSeat][0];
            let zIndexMargin = this._holdZIndexs[localSeat][1];
            zIndex+=(zIndexMargin*idx);
            this._zIndex = zIndex;
            this.node.setLocalZOrder(this._zIndex);
            let x = this._holdSortPositions[localSeat][0]+idx*this._holdSortMargins[localSeat][0];
            let y = this._holdSortPositions[localSeat][1]+idx*this._holdSortMargins[localSeat][1];
            this._curPos = cc.p(x, y);
            if (!!ani) {
                this.node.runAction(cc.moveTo(0.1, this._curPos));
            } else {
                this.node.x = x;
                this.node.y = y;
            }
        }
        this._idx = idx;
    },

    /**
     * 显示麻将
     * @param value  需要显示的值
     * @param localSeat  玩家在本地的座位号
     */
    showHoldsMjValue(value, localSeat=0) {
        this.node.active = true;
        if (typeof value == 'string') {
            value = parseInt(value);
        }
        this._value = value;
        if (isNaN(value) || value < 0) {
            this.valueNode.active = false;
        } else {
            this.valueNode.active = true;
            this.valueNode.getComponent(cc.Sprite).spriteFrame = this.values[value];
        }

        let params = this._holdsParams[localSeat];
        if (!!params) {
            this.valueNode.x = params.x;
            this.valueNode.y = params.y;
            this.valueNode.rotation = params.rotation;
            this.valueNode.scale = params.scale;
        }

        this.node.getComponent(cc.Sprite).spriteFrame = this.holdsBgs[localSeat];
    },

    /**
     * 显示排序的麻将
     * @param value  需要显示的值
     * @param localSeat  玩家在本地的座位号
     */
    showSortTansMjValue(value, localSeat=0, idx=0, ani=false) {
        this.showTansMjValue(value, localSeat);
        if (idx < 0) {
            this._curPos = this.node.getPosition();
            this._zIndex = this._tanRightZIndexs[localSeat];
            this.node.setLocalZOrder(this._zIndex);
        } else {
            this.node.stopAllActions();
            let zIndex = this._tanZIndexs[localSeat][0];
            let zIndexMargin = this._tanZIndexs[localSeat][1];
            zIndex+=(zIndexMargin*idx);
            this._zIndex = zIndex;
            this.node.setLocalZOrder(this._zIndex);
            let x = this._tanSortPositions[localSeat][0]+idx*this._tanSortMargins[localSeat][0];
            let y = this._tanSortPositions[localSeat][1]+idx*this._tanSortMargins[localSeat][1];
            this._curPos = cc.p(x, y);
            if (!!ani) {
                this.node.runAction(cc.moveTo(0.1, this._curPos));
            } else {
                this.node.x = x;
                this.node.y = y;
            }
        }
        this._idx = idx;
    },

    /**
     * 显示麻将
     * @param value  需要显示的值
     * @param localSeat  玩家在本地的座位号
     */
    showTansMjValue(value, localSeat=0) {
        this.node.active = true;
        if (typeof value == 'string') {
            value = parseInt(value);
        }
        this._value = value;
        if (isNaN(value) || value < 0) {
            this.valueNode.active = false;
        } else {
            this.valueNode.active = true;
            this.valueNode.getComponent(cc.Sprite).spriteFrame = this.values[value];
        }

        let params = this._tanParams[localSeat];
        this.valueNode.x = params.x;
        this.valueNode.y = params.y;
        this.valueNode.rotation = params.rotation;
        this.valueNode.scale = params.scale;
        this.node.getComponent(cc.Sprite).spriteFrame = this.tanBgs[localSeat];
    },

    /**
     * 显示弃牌麻将
     * @param value  需要显示的值
     * @param localSeat  玩家在本地的座位号
     */
    showOutMjValue(value, localSeat=0) {
        this.node.active = true;
        if (typeof value == 'string') {
            value = parseInt(value);
        }
        this._value = value;
        if (isNaN(value) || value < 0) {
            this.valueNode.active = false;
        } else {
            this.valueNode.active = true;
            this.valueNode.getComponent(cc.Sprite).spriteFrame = this.values[value];
        }

        let params = this._outParams[localSeat];
        this.valueNode.x = params.x;
        this.valueNode.y = params.y;
        this.valueNode.rotation = params.rotation;
        this.valueNode.scale = params.scale;
        this.node.getComponent(cc.Sprite).spriteFrame = this.outsBgs[localSeat];
    },

    /**
     * 显示进牌麻将
     * @param value  需要显示的值
     * @param localSeat  玩家在本地的座位号
     */
    showInPokerMjValue(value, localSeat=0) {
        this.node.active = true;
        if (typeof value == 'string') {
            value = parseInt(value);
        }
        this._value = value;
        if (isNaN(value) || value < 0) {
            this.valueNode.active = false;
            this.node.getComponent(cc.Sprite).spriteFrame = this.inPokersBgs1[localSeat];
        } else {
            this.valueNode.active = true;
            this.valueNode.getComponent(cc.Sprite).spriteFrame = this.values[value];
            this.node.getComponent(cc.Sprite).spriteFrame = this.inPokersBgs0[localSeat];
        }

        let params = this._inPokerParams[localSeat];
        this.valueNode.x = params.x;
        this.valueNode.y = params.y;
        this.valueNode.rotation = params.rotation;
        this.valueNode.scale = params.scale;
    },

    /**
     * 获取麻将值
     */
    getMjValue() {
        return this._value;
    },

    /**
     * 重置位置和层级
     */
    resetPositionAndZOrder() {
        this.node.setPosition(this._curPos);
        this.node.setLocalZOrder(this._zIndex);
    },

    /**
     * 选中转台
     * @param {*} select 
     */
    setSelectStatus(select) {
        if (select) {
            this.node.opacity = 220;
            this.node.color = cc.color(200,200,200,255);
        } else {
            this.node.opacity = 255;
            this.node.color = cc.Color.WHITE;
        }
    },

    /**
     * 选中的提起高度
     * @param {*} select 
     */
    setSelectY(select) {
        if (select) {
            this.node.y = this._curPos.y+12;
        } else {
            this.node.y = this._curPos.y;
        }
    },

    /**
     * 选中的颜色状态
     * @param {*} select 
     */
    setColorStatus(select) {
        if (select) {
            this.node.color = cc.color(200,200,200,255);
        } else {
            this.node.color = cc.Color.WHITE;
        }
    },

    /**
     * 提示打这张牌可听的箭头
     * @param {*} show 
     */
    showTipsting(show) {
        let tipstingNode = this.node.getChildByName('tipsting');
        if (!!tipstingNode) {
            tipstingNode.active = show;
        }
    }
});
