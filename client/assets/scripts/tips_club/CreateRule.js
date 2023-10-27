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
        content: {
            default: null,
            type: cc.Node
        },
        
        item: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
        
        this._items = [];
        this._items.push(this.item);
    },

    start () {

    },

    open(privateRooms) {
        this._privateRooms = privateRooms.concat();
        this.checkItems();
    },

    checkItems() {
        this._items.forEach((el) => { el.active = false; });
        for (let i = 0; i < this._privateRooms.length; i++) {
            let privateRoom = this._privateRooms[i];
            let prid = privateRoom.prid;
            let item = this._items[i];
            if (!item) {
                item = cc.instantiate(this.item);
                this.content.addChild(item, i, prid);
                this._items.push(item);
            }

            this.checkItem(item, privateRoom, i);
        }
    },

    checkItem(item, privateRoom, idx) {
        item.active = true;
        let dleBtn = item.getChildByName('del');
        dleBtn.getComponent(cc.Button).clickEvents[0].customEventData = idx;
        let editBtn = item.getChildByName('edit');
        editBtn.getComponent(cc.Button).clickEvents[0].customEventData = idx;
        let ruleBtn = item.getComponent(cc.Button);
        ruleBtn.clickEvents[0].customEventData = idx;
        let sortLab = item.getChildByName('sortLab');
        sortLab.getComponent(cc.Label).string = (idx+1);
        sortLab.getChildByName('Label').getComponent(cc.Label).string = (idx+1);
        let sortDown = item.getChildByName('sortDown');
        sortDown.getComponent(cc.Button).clickEvents[0].customEventData = idx;
        if (idx == this._privateRooms.length-1) {
            sortDown.active = false;
        } else {
            sortDown.active = true;
        }
        let sortUp = item.getChildByName('sortUp');
        sortUp.getComponent(cc.Button).clickEvents[0].customEventData = idx;
        if (idx == 0) {
            sortUp.active = false;
        } else {
            sortUp.active = true;
        }
        
        sortDown.getComponent(cc.Button).clickEvents[0].customEventData = idx;
        item.getComponent('CreateRuleItem').check(privateRoom);
        
    },

    // update (dt) {},

    onClosePressed() {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    onCreateRulePressed() {
        cc.vv.audioMgr.playButtonSound();
        let cid = cc.dm.clubInfo.cid;
        let self = this;
        let cb = (currule) => {
            cc.connect.createPrivateRoom(cid, currule, (prid) => {
                self._privateRooms.push({prid: prid, name: '', weight: Date.now(), rule: currule});
                self.checkItems();
            });
        };

        let setRule = this.node.getChildByName('setRule');
        if (setRule) {
            setRule.active = true;
            setRule.getComponent('ChooseGame').openWithCid(cid, cb);
        } else {
            cc.utils.loadPrefabNode('tips_club/setRule',  (setRule)=> {
                this.node.addChild(setRule, 1, 'setRule');
                setRule.getComponent('ChooseGame').openWithCid(cid, cb);
            });
        }
    },

    onRuleBtnPressed(event, idx) {
        cc.vv.audioMgr.playButtonSound();
        let privateRoom = this._privateRooms[idx];
        let rule = privateRoom.rule;
        rule = (typeof rule == 'string') ? JSON.parse(rule) : rule;
        let gameName = rule.gameName;
        let game_rule = rule.game_rule;
        let room_rule = rule.room_rule;
        game_rule.startNumber = room_rule.startNumber;
        game_rule.halfway = room_rule.halfway;
        game_rule.inning = room_rule.inningLimit;
        let playerMax = room_rule.playerMax;
        game_rule.max = cc.enum.playerMax[gameName][playerMax];
        let ruleName = gameName+'_rule';
        if (gameName.indexOf('diantuo') > -1) {
            if (game_rule.model == 0) {
                ruleName = 'diantuo_tj_rule';
            }
        }

        if (gameName.indexOf('mj_zz') > -1) {
            ruleName = 'mj_hz_rule';
        }

        cc.utils.showRule(ruleName, game_rule);
    },

    onEditBtnPressed(event, idx) {
        cc.vv.audioMgr.playButtonSound();
        let cid = cc.dm.clubInfo.cid;
        let privateRoom = this._privateRooms[idx];
        let prid = privateRoom.prid;
        let self = this;
        let cb = (currule) => {
            cc.connect.changePrivateRoom(cid, prid, currule, (msg) => {
                let item = self._items[idx];
                privateRoom.rule = currule;
                !!item && self.checkItem(item, privateRoom, idx);
            });
            console.log('onEditBtnPressed currule = ', currule);
        };

        let rule = privateRoom.rule;
        rule = (typeof rule == 'string') ? JSON.parse(rule) : rule;
        let setRule = this.node.getChildByName('setRule');
        if (setRule) {
            setRule.active = true;
            setRule.getComponent('ChooseGame').openWithCid(cid, cb, rule);
        } else {
            cc.utils.loadPrefabNode('tips_club/setRule',  (setRule)=> {
                this.node.addChild(setRule, 1, 'setRule');
                setRule.getComponent('ChooseGame').openWithCid(cid, cb, rule);
            });
        }
    },

    onDelBtnPressed(event, idx) {
        cc.vv.audioMgr.playButtonSound();
        cc.utils.openTips('确定删除包间规则？',  ()=> {
            let privateRoom = this._privateRooms[idx];
            let cid = cc.dm.clubInfo.cid;
            let prid = privateRoom.prid;
            cc.connect.deletePrivateRoom(cid, prid, (msg) => {
                this._privateRooms.splice(idx, 1);
                this.checkItems();
            });
        }, function () {

        });
    },

    onSortUpBtnPressed(event, idx) {
        cc.vv.audioMgr.playButtonSound();
        if (idx == 0) {
            cc.utils.openWeakTips('不能再往前排了');
            return;
        }

        this.moveNext(true, idx, idx-1);
    },

    onSortDownBtnPressed(event, idx) {
        cc.vv.audioMgr.playButtonSound();
        if (idx == this._privateRooms-1) {
            cc.utils.openWeakTips('不能再往后排了');
            return;
        }
        this.moveNext(false, idx, idx+1);
    },

    moveNext(moveUp, idx, nextIdx) {
        let privateRoom = this._privateRooms[idx];
        let cid = cc.dm.clubInfo.cid;
        let prid = privateRoom.prid;
        cc.connect.moveUpWeight(cid, prid, moveUp, (msg) => {
            let weight1 = privateRoom.weight;
            let privateRoom2 = this._privateRooms[nextIdx];
            let weight2 = privateRoom2.weight;
            privateRoom2.weight = weight1;
            privateRoom.weight = weight2;
            this._privateRooms = this.swapArray(this._privateRooms, idx, nextIdx);
            
            let item1 = this._items[idx];
            this.checkItem(item1, privateRoom2, idx);
            let item2 = this._items[nextIdx];
            this.checkItem(item2, privateRoom, nextIdx);     
        });
    },

    swapArray(arr, index1, index2) {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0];
        return arr;
     },

     onEditNameBtnPressed(event, idx) {

     }
});
