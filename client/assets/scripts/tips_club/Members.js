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
        membersLab: {
            default: null,
            type: cc.Label
        },

        memberContent: {
            default: null,
            type: cc.Node,
            displayName: '成员节点content'
        },

        membersItem: {
            default: null,
            type: cc.Node,
            displayName: '成员节点item'
        },

        membersTypes: {
            default: [],
            type: cc.SpriteFrame
        },

        loadingNode: {
            default: null,
            type: cc.Sprite,
            displayName: 'loading'
        },

        nodataLab: {
            default: null,
            type: cc.Label,
            displayName: '没有信息提示Lab'
        },

        bottomNode: {
            default: null,
            type: cc.Node,
        },

        searchBox: {
            default: null,
            type: cc.EditBox,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
        this.membersItem.active = false;
        this._items = [this.membersItem];
        for (let i = 1; i < 12; i++) {
            let item = cc.instantiate(this.membersItem);
            this.memberContent.addChild(item);
            this._items.push(item);
        }
    },

    start () {

    },

    onDisable () {

    },

    open () {
        this.searchBox.string = '';
        this._isCreator = (cc.dm.clubInfo.role == 2);
        this._isManager = (cc.dm.clubInfo.role == 1);

        this.bottomNode.getComponent('Bottom').resetBottom();
        this._pageIdx = 1;
        this.checkClubInfo();
        this.updateMemberList();
    },

    checkClubInfo() {
        this._cid = cc.dm.clubInfo.cid;
    },

    updateMemberList () {
        this._items.forEach((el) => { el.active = false; });
        this.loadingNode.node.active = true;
        this.nodataLab.node.active = false;
        this.loadingNode.node.runAction(cc.repeatForever(cc.rotateBy(0.8, 360)));

        let searchUid = 0;
        if (!!this.searchBox.string && this.searchBox.string.length == 6) {
            searchUid = parseInt(this.searchBox.string);
        }
        cc.connect.members(this._cid, this._pageIdx, searchUid, (list) => {
            this.loadingNode.node.stopAllActions();
            this.loadingNode.node.active = false;
            if (!list || list.length == 0) {
                this.nodataLab.node.active = true;
                this.nodataLab.string = '暂无数据';
                return;
            }

            this._memberList = list;
            let obj = list[0];
            this.checkBottom(obj.totalPage);
            this.checkList();
            this.updateMembers(obj.count);
        }, (errmsg) => {
            this.loadingNode.node.stopAllActions();
            this.loadingNode.node.active = false;

            this.nodataLab.node.active = true;
            this.nodataLab.string = errmsg;
        });
    },

    checkList() {
        if (!this._memberList || this._memberList.length == 0) {
            return;
        }

        for (let i = 0; i < this._memberList.length; i++) {
            let info = this._memberList[i];
            this.checkInfo(info, i);
        }
    },

    checkInfo (info, idx) {
        let membersItem = this._items[idx];
        if (!membersItem) {
            return;
        }

        membersItem.active = true;
        let type = info.type;
        let name = cc.utils.fromBase64(info.name, 4);
        let pic = info.headimg;
        let uid = info.uid;
        membersItem.getComponent(cc.Button).clickEvents[0].customEventData = uid;

        if (cc.dm.user.uid == uid) {
            membersItem.color = cc.hexToColor('#562C2C');
        } else {
            membersItem.color = cc.hexToColor('#FFFFFF');
        }

        let nameLab = membersItem.getChildByName('name');
        if (nameLab) {
            nameLab.getComponent(cc.Label).string = name;
        }

        let idLab = membersItem.getChildByName('ID');
        if (idLab) {
            idLab.getComponent(cc.Label).string = 'ID: '+uid;
        }

        let totalLab = membersItem.getChildByName('total');
        if (totalLab) {
            if (this._isManager || this._isCreator) {
                totalLab.active = true;
                totalLab.getComponent(cc.Label).string = '局数: '+info.total_inning+'局';
            } else {
                totalLab.getComponent(cc.Label).string = '局数: '+'???局';
            }
        }

        let todayLab = membersItem.getChildByName('today');
        if (todayLab) {
            if (this._isManager || this._isCreator) {
                todayLab.getComponent(cc.Label).string = '局数: '+info.today_inning+'局';
            } else {
                todayLab.getComponent(cc.Label).string = '局数: '+'???局';
            }
        }

        let headNode = membersItem.getChildByName('headNode');
        if (headNode) {
            headNode.getComponent('HeadNode').updateData(pic);
        }

        let dealerTips = membersItem.getChildByName('dealerTips');
        if (dealerTips) {
            let profit_ratio = info.profit_ratio;
            if (profit_ratio > 0) {
                dealerTips.active = true;
            } else {
                dealerTips.active = false;
            }
        }

        let typeNode = membersItem.getChildByName('type');
        if (typeNode) {
            typeNode.getComponent(cc.Sprite).spriteFrame = this.membersTypes[type];
        }

        let setBtn = membersItem.getChildByName('setBtn');
        let cancelBtn = membersItem.getChildByName('cancelBtn');
        let blackBtn = membersItem.getChildByName('blackBtn');
        let blackedBtn = membersItem.getChildByName('blackedBtn');
        setBtn.active = false;
        cancelBtn.active = false;
        blackBtn.active = false;
        blackedBtn.active = false;
        let blacklist = info.blacklist;
        
        if (this._isCreator && uid != cc.dm.user.uid) {
            if (type == 0) {
                setBtn.active = true;
            } else {
                cancelBtn.active = true;
            }
        }

        if ((this._isCreator || this._isManager) && uid != cc.dm.user.uid) {
            if (blacklist > 0) {
                blackedBtn.active = true;
            } else {
                blackBtn.active = true;
            }
        }

        setBtn.getComponent(cc.Button).clickEvents[0].customEventData = {uid: uid, name: name, type: 1, idx: idx};
        cancelBtn.getComponent(cc.Button).clickEvents[0].customEventData = {uid: uid, name: name, type: 0, idx: idx};

        blackBtn.getComponent(cc.Button).clickEvents[0].customEventData = {uid: uid, name: name, blacklist: 1, idx: idx};
        blackedBtn.getComponent(cc.Button).clickEvents[0].customEventData = {uid: uid, name: name, blacklist: 0, idx: idx};

        membersItem.getComponent(cc.Button).clickEvents[0].customEventData = info;
    },

    /**
     * 成员里面的item里面的设置管理员按钮点击事件
     * @param event
     * @param data
     */
    membersItemSetBtnPressed (event, data) {
        let name = data.name;
        let uid = data.uid;
        let type = data.type;
        let self = this;
        let idx = data.idx;
        let str = type == 1 ? '确定设置'+name+'为管理员?' : '确定取消'+name+'的管理员权限?';
        cc.utils.openTips(str, function () {
            cc.connect.setAdmin(self._cid, uid, (msg) => {
                let info = self._memberList[idx];
                info.type = type;
                self.updateSetBtn(idx ,type);
            });
        }, function () {

        });
    },

    updateSetBtn(idx, type) {
        let item = this._items[idx];
        if (!item) {
            return;
        }

        let setBtn = item.getChildByName('setBtn');
        let cancelBtn = item.getChildByName('cancelBtn');
        setBtn.active = false;
        cancelBtn.active = false;
        if (type == 0) {
            setBtn.active = true;
        } else {
            cancelBtn.active = true;
        }

        let typeNode = item.getChildByName('type');
        if (typeNode) {
            typeNode.getComponent(cc.Sprite).spriteFrame = this.membersTypes[type];
        }
    },


    /**
     * 成员里面的item里面的踢出按钮点击事件
     * @param event
     * @param data
     */
    membersItemBlackBtnPressed (event, data) {
        let name = data.name;
        let uid = data.uid;
        let self = this;
        let blacklist = data.blacklist;
        let idx = data.idx;
        let str = blacklist > 0 ? '确定拉黑用户'+name+'?' : '确定取消拉黑用户'+name+'?';
        cc.utils.openTips(str, function () {
            cc.connect.blacklist(self._cid, uid, blacklist, (msg) => {
                let info = self._memberList[idx];
                info.blacklist = blacklist;
                self.updateBlackBtn(idx ,blacklist);
            });
        }, function () {

        });
    },

    updateBlackBtn(idx, blacklist) {
        let item = this._items[idx];
        if (!item) {
            return;
        }

        let blackBtn = item.getChildByName('blackBtn');
        let blackedBtn = item.getChildByName('blackedBtn');
        blackBtn.active = false;
        blackedBtn.active = false;
        if (blacklist == 0) {
            blackBtn.active = true;
        } else {
            blackedBtn.active = true;
        }
    },

    updateMembers(count) {
        let membersstr = count+'人';;
        this.membersLab.string = membersstr;
    },

    membersItemBtnPressed (event, info) {
        let memberInfo = this.node.getChildByName('memberInfo');
        if (memberInfo) {
            memberInfo.getComponent('MemberInfo').showMemberInfo(this._cid, info);
        } else {
            cc.utils.loadPrefabNode('tips_club/memberInfo', function (memberInfo) {
                this.node.addChild(memberInfo, 1, 'memberInfo');
                memberInfo.getComponent('MemberInfo').showMemberInfo(this._cid, info);
            }.bind(this));
        }
        
        cc.vv.audioMgr.playButtonSound();
    },

    onSearchTxtChanged() {
        if (!this.searchBox.string || (!!this.searchBox.string && this.searchBox.string.length == 6)) {
            this.searchBox.setFocus(false);
            this.bottomNode.getComponent('Bottom').resetBottom();
            this._pageIdx = 1;
            this.updateMemberList();
        }
    },

    searchBoxReturn() {
        this.bottomNode.getComponent('Bottom').resetBottom();
        this._pageIdx = 1;
        this.updateMemberList();
    },

    // update (dt) {},
    checkBottom(totalPage) {
        this.bottomNode.getComponent('Bottom').checkBottom(totalPage, (pageIdx) => {
            this._pageIdx = pageIdx;
            this.updateMemberList();
        });
    },

    onCloseBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

});
